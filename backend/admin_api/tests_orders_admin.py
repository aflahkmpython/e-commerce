import csv
import io
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.core import mail
from orders.models import Order, OrderItem, ShippingAddress, OrderStatusAuditLog
from products.models import Product, Category
from decimal import Decimal

User = get_user_model()

class AdminOrderTests(APITestCase):
    def setUp(self):
        # Admin User
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='password123',
            role='admin',
            is_staff=True
        )
        # Regular Customer
        self.customer = User.objects.create_user(
            email='customer@example.com',
            password='password123',
            first_name='John',
            last_name='Doe',
            role='customer'
        )
        
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.product = Product.objects.create(
            category=self.category,
            name='Test Product',
            slug='test-product',
            price=Decimal('100.00'),
            stock=10
        )
        
        self.address = ShippingAddress.objects.create(
            user=self.customer,
            full_name='John Doe',
            address_line1='123 Test St',
            city='Test City',
            state='TS',
            pincode='123456'
        )
        
        # Create an Order
        self.order = Order.objects.create(
            user=self.customer,
            shipping_address=self.address,
            total_amount=Decimal('200.00'),
            status='pending',
            payment_status='paid'
        )
        OrderItem.objects.create(order=self.order, product=self.product, unit_price=100, quantity=2)

    def test_list_orders_filtering(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-order-list')
        
        # Test Status filter
        response = self.client.get(url, {'status': 'pending'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data.get('results', response.data)
        self.assertEqual(len(data), 1)
        
        # Test Payment status filter
        response = self.client.get(url, {'payment_status': 'unpaid'})
        data = response.data.get('results', response.data)
        self.assertEqual(len(data), 0)

    def test_search_by_customer_email(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-order-list')
        
        response = self.client.get(url, {'search': 'customer@example.com'})
        data = response.data.get('results', response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['user_email'], 'customer@example.com')

    def test_status_transition_and_audit_log(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-order-status-update', args=[self.order.id])
        
        # Transition: pending -> confirmed (Valid)
        response = self.client.patch(url, {'status': 'confirmed', 'notes': 'Processing started'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'confirmed')
        
        # Check Audit Log
        self.assertTrue(OrderStatusAuditLog.objects.filter(order=self.order, status='confirmed').exists())
        log = OrderStatusAuditLog.objects.get(order=self.order, status='confirmed')
        self.assertEqual(log.notes, 'Processing started')
        self.assertEqual(log.changed_by, self.admin)

    def test_invalid_status_transition(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-order-status-update', args=[self.order.id])
        
        # Transition: pending -> delivered (Invalid: must go through confirmed/shipped)
        response = self.client.patch(url, {'status': 'delivered'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid transition', response.data['error'])

    def test_email_trigger_on_status_change(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-order-status-update', args=[self.order.id])
        
        # Trigger transition
        self.client.patch(url, {'status': 'confirmed'})
        
        # Check outbox
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, f"Order #{self.order.id} Status Update: Confirmed")
        # Check HTML alternative
        self.assertIn('confirmed', mail.outbox[0].alternatives[0][0].lower())

    def test_csv_export(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-order-export')
        
        response = self.client.get(url, {'status': 'pending'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
        
        content = response.content.decode('utf-8')
        cvs_reader = csv.reader(io.StringIO(content))
        rows = list(cvs_reader)
        
        self.assertEqual(rows[0], ['Order ID', 'Customer', 'Email', 'Total Amount', 'Status', 'Payment Status', 'Created At'])
        self.assertEqual(rows[1][4], 'pending')

    def test_unauthorized_access(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse('admin-order-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
