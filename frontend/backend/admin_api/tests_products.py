import os
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from products.models import Product, Category, ProductImage
from decimal import Decimal

User = get_user_model()

class AdminProductTests(APITestCase):
    def setUp(self):
        # Admin User
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='password123',
            first_name='Admin',
            last_name='User',
            role='admin',
            is_staff=True
        )
        # Regular Customer
        self.customer = User.objects.create_user(
            email='customer@example.com',
            password='password123',
            first_name='Customer',
            last_name='User',
            role='customer'
        )
        
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.product = Product.objects.create(
            category=self.category,
            name='Test Product',
            slug='test-product',
            price=Decimal('100.00'),
            stock=10,
            is_active=True
        )

    def test_list_products_filtering(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-product-list')
        
        # Test Category filter
        response = self.client.get(url, {'category': self.category.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        if isinstance(response.data, dict):
            data = response.data.get('results', [])
        else:
            data = response.data
        self.assertEqual(len(data), 1)
        
        # Test Active filter
        response = self.client.get(url, {'is_active': False})
        if isinstance(response.data, dict):
            data = response.data.get('results', [])
        else:
            data = response.data
        self.assertEqual(len(data), 0)

    def test_create_product_with_images(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-product-create')
        
        # Create a small dummy image
        image_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
        image1 = SimpleUploadedFile('test1.png', image_content, content_type='image/png')
        image2 = SimpleUploadedFile('test2.png', image_content, content_type='image/png')
        
        data = {
            'name': 'New Product',
            'slug': 'new-product',
            'description': 'A very detailed product description for Zod validation.',
            'price': 500.00,
            'stock': 50,
            'category': self.category.id,
            'uploaded_images': [image1, image2]
        }
        
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        product = Product.objects.get(slug='new-product')
        self.assertEqual(product.images.count(), 2)
        self.assertTrue(product.images.filter(is_primary=True).exists())

    def test_partial_update_product(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-product-detail', args=[self.product.id])
        
        data = {'price': '150.00'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.price, Decimal('150.00'))

    def test_stock_update_endpoint(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-product-stock', args=[self.product.id])
        
        response = self.client.patch(url, {'stock': 99})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 99)

    def test_soft_delete_product(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-product-delete', args=[self.product.id])
        
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.product.refresh_from_db()
        self.assertFalse(self.product.is_active)
        self.assertTrue(Product.objects.filter(id=self.product.id).exists())

    def test_permission_denial(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse('admin-product-list')
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
