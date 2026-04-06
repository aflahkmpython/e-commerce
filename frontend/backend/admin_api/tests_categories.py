from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from products.models import Category, Product
from decimal import Decimal

User = get_user_model()

class AdminCategoryTests(APITestCase):
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
            role='customer'
        )

        # Root Categories
        self.electronics = Category.objects.create(name='Electronics', slug='electronics')
        self.clothing = Category.objects.create(name='Clothing', slug='clothing')

        # Subcategories
        self.phones = Category.objects.create(name='Phones', slug='phones', parent=self.electronics)
        self.smartphones = Category.objects.create(name='Smartphones', slug='smartphones', parent=self.phones)

    def test_root_category_auto_slug(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-category-list')
        data = {'name': 'Home Appliances'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['slug'], 'home-appliances')

    def test_nested_serialization(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that 'Electronics' has children 'Phones' which has children 'Smartphones'
        electronics_data = next(c for c in response.data if c['name'] == 'Electronics')
        phones_data = electronics_data['children'][0]
        self.assertEqual(phones_data['name'], 'Phones')
        self.assertEqual(phones_data['children'][0]['name'], 'Smartphones')

    def test_circular_reference_rejection(self):
        self.client.force_authenticate(user=self.admin)
        # Try to make Electronics a child of Smartphones (Circular!)
        url = reverse('admin-category-detail', args=[self.electronics.id])
        data = {'parent': self.smartphones.id}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Circular reference detected', str(response.data))

    def test_delete_blocked_by_products(self):
        # Create a product in Clothing
        Product.objects.create(
            category=self.clothing,
            name='T-Shirt',
            slug='t-shirt',
            price=Decimal('10.00'),
            stock=10
        )
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-category-delete', args=[self.clothing.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Reassign or delete products', response.data['error'])

    def test_product_count_accuracy(self):
        self.client.force_authenticate(user=self.admin)
        # Create 2 active products in Phones
        Product.objects.create(category=self.phones, name='P1', slug='p1', price=10, stock=5, is_active=True)
        Product.objects.create(category=self.phones, name='P2', slug='p2', price=10, stock=5, is_active=True)
        # Create 1 inactive product (should not be counted)
        Product.objects.create(category=self.phones, name='P3', slug='p3', price=10, stock=5, is_active=False)

        url = reverse('admin-category-list')
        response = self.client.get(url)
        electronics = next(c for c in response.data if c['name'] == 'Electronics')
        phones = electronics['children'][0]
        self.assertEqual(phones['product_count'], 2)

    def test_unauthorized_access(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse('admin-category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
