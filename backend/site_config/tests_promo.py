from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import concurrent.futures
from django.db import connection

from products.models import Product, Category
from orders.models import Cart, CartItem, Order
from site_config.models import PromoCode, UserPromoUsage

User = get_user_model()

class PromoCodeTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(email='admin@example.com', password='password@123', role='superadmin', is_staff=True)
        self.customer = User.objects.create_user(email='user@example.com', password='password@123', role='customer')
        self.category = Category.objects.create(name="Tech", slug="tech")
        self.product = Product.objects.create(name="Laptop", category=self.category, price=1000, stock=50)

    def test_promo_creation_auto_uppercasing(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-promo-list')
        data = {
            'code': 'save20',
            'discount_type': 'percentage',
            'discount_value': 20,
            'min_order_value': 0,
            'valid_from': timezone.now().isoformat(),
            'expiry_date': (timezone.now() + timedelta(days=10)).isoformat()
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['code'], 'SAVE20')

    def test_percentage_discount_capped_validation(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-promo-list')
        data = {
            'code': 'OVER100',
            'discount_type': 'percentage',
            'discount_value': 150, # Invalid
            'min_order_value': 0,
            'valid_from': timezone.now().isoformat(),
            'expiry_date': (timezone.now() + timedelta(days=10)).isoformat()
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('discount_value', str(response.data))

    def test_expiry_date_after_valid_from(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-promo-list')
        data = {
            'code': 'TIMETRAVEL',
            'discount_type': 'flat',
            'discount_value': 50,
            'min_order_value': 0,
            'valid_from': timezone.now().isoformat(),
            'expiry_date': (timezone.now() - timedelta(days=10)).isoformat() # Expiry in past compared to valid_from
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('expiry_date', str(response.data))

    def test_minimum_order_value_rejection(self):
        promo = PromoCode.objects.create(
            code='MIN500', discount_type='flat', discount_value=100, min_order_value=500,
            valid_from=timezone.now() - timedelta(days=1), expiry_date=timezone.now() + timedelta(days=10)
        )
        
        self.client.force_authenticate(user=self.customer)
        # Create a cart worth 200
        cart = Cart.objects.create(user=self.customer)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1) # Need to set product unit price so subtotal matches
        self.product.price = 200 # overriding for this test
        self.product.save()

        url = reverse('apply-promo')
        response = self.client.post(url, {'code': 'MIN500'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Minimum order value', str(response.data['error']))

    def test_bulk_deactivation(self):
        self.client.force_authenticate(user=self.admin)
        p1 = PromoCode.objects.create(code='P1', discount_type='flat', discount_value=10, valid_from=timezone.now(), expiry_date=timezone.now() + timedelta(days=1))
        p2 = PromoCode.objects.create(code='P2', discount_type='flat', discount_value=10, valid_from=timezone.now(), expiry_date=timezone.now() + timedelta(days=1))
        
        url = reverse('admin-promo-bulk-deactivate')
        response = self.client.post(url, {'ids': [p1.id, p2.id]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        p1.refresh_from_db()
        p2.refresh_from_db()
        self.assertFalse(p1.is_active)
        self.assertFalse(p2.is_active)

    def test_non_admin_rejection(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse('admin-promo-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
