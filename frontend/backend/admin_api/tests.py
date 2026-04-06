from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from products.models import Product, Category
from orders.models import Order, ShippingAddress
from site_config.models import PromoCode, Banner

User = get_user_model()

class AdminApiTests(APITestCase):
    def setUp(self):
        # Create Users
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='password123',
            first_name='Admin',
            last_name='User',
            role='admin',
            is_staff=True
        )
        self.customer = User.objects.create_user(
            email='customer@example.com',
            password='password123',
            first_name='Customer',
            last_name='User',
            role='customer'
        )
        
        # Create Sample Data
        self.category = Category.objects.create(name='Gadgets', slug='gadgets')
        self.product = Product.objects.create(
            category=self.category,
            name='Drone',
            slug='drone',
            price=1000.00,
            stock=5,
            is_active=True
        )
        
        self.address = ShippingAddress.objects.create(
            user=self.customer,
            full_name='Test Cust',
            address_line1='123 St',
            city='Test City',
            state='TS',
            pincode='123456'
        )
        
        self.order = Order.objects.create(
            user=self.customer,
            shipping_address=self.address,
            total_amount=1000.00,
            status='pending',
            payment_status='paid'
        )

    def test_dashboard_stats_permission(self):
        url = reverse('admin-dashboard')
        
        # Unauthorized
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Customer (Forbidden)
        self.client.force_authenticate(user=self.customer)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Admin (Success)
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # New structure check
        self.assertEqual(response.data['revenue']['value'], 1000.00)
        self.assertEqual(response.data['products']['value'], 1)

    def test_dashboard_revenue_view(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-dashboard-revenue')
        response = self.client.get(url, {'days': 7})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)
        self.assertEqual(float(response.data[0]['revenue']), 1000.00)

    def test_top_products_view(self):
        # Create OrderItem for aggregation
        from orders.models import OrderItem
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=2,
            unit_price=1000.00
        )
        
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-dashboard-top-products')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['product__id'], self.product.id)
        self.assertEqual(response.data[0]['units_sold'], 2)

    def test_recent_orders_view(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-dashboard-recent-orders')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.order.id)

    def test_admin_product_crud(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-product-list')
        
        # Create
        data = {
            'name': 'New Product',
            'slug': 'new-product',
            'price': 500.00,
            'stock': 20,
            'category': self.category.id,
            'description': 'Test desc'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 2)

        # Update
        detail_url = reverse('admin-product-detail', args=[self.product.id])
        response = self.client.patch(detail_url, {'price': 1200.00})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.price, 1200.00)

    def test_order_status_update_and_email(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-order-detail', args=[self.order.id])
        
        response = self.client.patch(url, {'status': 'shipped'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'shipped')
        # Check if email is "sent" (Django test outbox)
        from django.core import mail
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Order #', mail.outbox[0].subject)

    def test_promo_code_validation(self):
        promo = PromoCode.objects.create(
            code='SAVE20',
            discount_type='percentage',
            discount_value=20.00,
            min_order_value=500.00,
            expiry_date=timezone.now() + timedelta(days=7),
            is_active=True
        )
        
        url = reverse('apply-promo')
        self.client.force_authenticate(user=self.customer)
        
        # Valid case
        response = self.client.post(url, {'code': 'SAVE20', 'order_value': 1000.00})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(float(response.data['discount_total']), 200.00)
        
        # Min order value not met
        response = self.client.post(url, {'code': 'SAVE20', 'order_value': 100.00})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Minimum order value', response.data['error'])

        # Expired
    def test_superadmin_user_management(self):
        # Create a Superadmin
        superadmin = User.objects.create_user(
            email='super@example.com',
            password='pass',
            first_name='Super',
            last_name='User',
            role='superadmin',
            is_staff=True,
            is_superuser=True
        )
        new_user = User.objects.create_user(email='new@example.com', password='pass', first_name='New', last_name='User')
        
        # Superadmin trying to promote user (should succeed)
        self.client.force_authenticate(user=superadmin)
        url = reverse('admin-user-change-role', args=[new_user.id])
        response = self.client.patch(url, {'role': 'admin'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.get(id=new_user.id).role, 'admin')

        # Normal Admin trying to promote user (should fail)
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(url, {'role': 'superadmin'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_category_nested_management(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-category-list')
        data = {'name': 'Laptops', 'slug': 'laptops', 'parent': self.category.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Category.objects.get(slug='laptops').parent, self.category)
