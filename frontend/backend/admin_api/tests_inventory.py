from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.core import mail
from django.core.management import call_command
from products.models import Product, Category, InventoryAlert
from admin_api.models import AdminAuditLog
from orders.models import Order, OrderItem, ShippingAddress, Cart, CartItem
from decimal import Decimal

User = get_user_model()

class InventoryTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='password123',
            role='admin',
            is_staff=True
        )
        self.customer = User.objects.create_user(
            email='customer@example.com',
            password='password123',
            role='customer'
        )
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.product = Product.objects.create(
            name='Smartphone',
            slug='smartphone',
            category=self.category,
            price=Decimal('500.00'),
            stock=15
        )
        self.address = ShippingAddress.objects.create(
            user=self.customer,
            full_name='John Doe',
            address_line1='123 Main St',
            city='New York',
            pincode='10001',
            country='USA'
        )

    def test_atomic_stock_decrement_on_order(self):
        self.client.force_authenticate(user=self.customer)
        # Setup Cart
        cart = Cart.objects.create(user=self.customer)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)
        
        url = reverse('order-list')
        data = {
            'address_id': self.address.id,
            'payment_method': 'stripe',
            'payment_id': 'pi_test_123'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify stock decreased via signal
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 13)

    def test_insufficient_stock_rollback(self):
        self.client.force_authenticate(user=self.customer)
        # Setup Cart with more quantity than stock
        cart = Cart.objects.create(user=self.customer)
        CartItem.objects.create(cart=cart, product=self.product, quantity=20)
        
        url = reverse('order-list')
        data = {
            'address_id': self.address.id,
            'payment_method': 'stripe',
            'payment_id': 'pi_test_123'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify stock did NOT change
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 15)
        # Verify no order items created
        self.assertEqual(OrderItem.objects.count(), 0)

    def test_bulk_stock_update_atomicity(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-bulk-stock')
        
        p2 = Product.objects.create(
            name='Tablet', slug='tablet', category=self.category, price=100, stock=10
        )
        
        # One valid, one invalid (negative)
        data = {
            'updates': [
                {'product_id': self.product.id, 'new_stock': 50},
                {'product_id': p2.id, 'new_stock': -5}
            ]
        }
        
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify NEITHER stock changed due to transaction.atomic
        self.product.refresh_from_db()
        p2.refresh_from_db()
        self.assertEqual(self.product.stock, 15)
        self.assertEqual(p2.stock, 10)

    def test_low_stock_query_boundary(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-low-stock')
        
        # Product with 10 stock should NOT be in low stock (lt=10)
        p10 = Product.objects.create(
            name='p10', slug='p10', category=self.category, price=10, stock=10
        )
        # Product with 9 stock SHOULD be in low stock
        p9 = Product.objects.create(
            name='p9', slug='p9', category=self.category, price=10, stock=9
        )
        
        response = self.client.get(url)
        # Only p9 should be returned
        product_names = [p['name'] for p in response.data]
        self.assertIn('p9', product_names)
        self.assertNotIn('p10', product_names)

    def test_management_command_alerts(self):
        # Set product to low stock
        self.product.stock = 5
        self.product.save()
        
        # Create an admin to receive mail
        User.objects.create_user(email='alert-admin@example.com', password='pw', role='admin')
        
        call_command('send_low_stock_alerts')
        
        # Check email sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Smartphone', mail.outbox[0].body or mail.outbox[0].message().as_string())
        
        # Check InventoryAlert record
        self.assertTrue(InventoryAlert.objects.filter(product=self.product).exists())

    def test_stock_update_audit_log(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-product-stock', args=[self.product.id])
        
        response = self.client.patch(url, {'stock': 100}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check Audit Log
        log = AdminAuditLog.objects.filter(target_model='Product', target_id=self.product.id).first()
        self.assertIsNotNone(log)
        self.assertEqual(log.old_value, '15')
        self.assertEqual(log.new_value, '100')
        self.assertEqual(log.action, 'STOCK_UPDATE')
