import csv
import io
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.core import mail
from admin_api.models import AdminAuditLog
from orders.models import Order, ShippingAddress
from decimal import Decimal

User = get_user_model()

class AdminUserTests(APITestCase):
    def setUp(self):
        # SuperAdmin User
        self.superadmin = User.objects.create_user(
            email='superadmin@example.com',
            password='password123',
            role='superadmin',
            is_staff=True,
            first_name='Super',
            last_name='Admin'
        )
        # Standard Admin
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='password123',
            role='admin',
            is_staff=True,
            first_name='Regular',
            last_name='Admin'
        )
        # Regular Customer
        self.customer = User.objects.create_user(
            email='customer@example.com',
            password='password123',
            role='customer',
            first_name='John',
            last_name='Doe',
            phone_number='9876543210'
        )
        
        # Create an Order for the customer
        Order.objects.create(
            user=self.customer,
            total_amount=Decimal('1500.00'),
            status='delivered',
            payment_status='paid'
        )

    def test_list_users_search_and_filter(self):
        self.client.force_authenticate(user=self.superadmin)
        url = reverse('admin-user-list')
        
        # Search by phone
        response = self.client.get(url, {'search': '9876543210'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['email'], 'customer@example.com')
        
        # Filter by role
        response = self.client.get(url, {'role': 'admin'})
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['role'], 'admin')

    def test_list_users_ordering_by_total_orders(self):
        self.client.force_authenticate(user=self.superadmin)
        url = reverse('admin-user-list')
        
        response = self.client.get(url, {'ordering': '-total_orders'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # John Doe should be first because he has 1 order, others have 0
        self.assertEqual(response.data['results'][0]['full_name'], 'John Doe')
        self.assertEqual(response.data['results'][0]['total_orders'], 1)

    def test_user_detail_aggregations(self):
        self.client.force_authenticate(user=self.superadmin)
        url = reverse('admin-user-detail', args=[self.customer.id])
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['lifetime_spend'], 1500.00)
        self.assertEqual(len(response.data['recent_orders']), 1)

    def test_self_role_change_protection(self):
        self.client.force_authenticate(user=self.superadmin)
        url = reverse('admin-user-role-update', args=[self.superadmin.id])
        
        response = self.client.patch(url, {'role': 'customer'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cannot change your own role', response.data['error'])

    def test_role_update_and_audit_log(self):
        self.client.force_authenticate(user=self.superadmin)
        url = reverse('admin-user-role-update', args=[self.customer.id])
        
        response = self.client.patch(url, {'role': 'admin'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.role, 'admin')
        
        # Check Audit Log
        self.assertTrue(AdminAuditLog.objects.filter(target_user=self.customer, action='ROLE_CHANGE').exists())

    def test_deactivation_toggle_and_email(self):
        self.client.force_authenticate(user=self.superadmin)
        url = reverse('admin-user-deactivate', args=[self.customer.id])
        
        # Deactivate
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'DEACTIVATE')
        
        self.customer.refresh_from_db()
        self.assertFalse(self.customer.is_active)
        
        # Check Email
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Inactive', mail.outbox[0].subject)

    def test_unauthorized_admin_access(self):
        # Regular admin should NOT have access if views are set to IsSuperAdmin
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-user-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_order_history_pagination(self):
        self.client.force_authenticate(user=self.superadmin)
        url = reverse('admin-user-order-history', args=[self.customer.id])
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 1)
