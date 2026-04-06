from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Category, Product, Review, Tag
from django.contrib.auth import get_user_model

User = get_user_model()

class CatalogTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='password123',
            first_name='Test',
            last_name='User'
        )
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.tag = Tag.objects.create(name='Sale', slug='sale')
        self.product = Product.objects.create(
            category=self.category,
            name='Smartphone',
            slug='smartphone',
            description='A great phone',
            price=500.00,
            stock=10
        )
        self.product.tags.add(self.tag)

    def test_product_list(self):
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check pagination
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 1)

    def test_product_filter_by_category(self):
        url = reverse('product-list')
        response = self.client.get(url, {'category': 'electronics'})
        self.assertEqual(len(response.data['results']), 1)
        
        response = self.client.get(url, {'category': 'non-existent'})
        self.assertEqual(len(response.data['results']), 0)

    def test_nested_category_api(self):
        subclass = Category.objects.create(
            name='Phones', 
            slug='phones', 
            parent=self.category
        )
        url = reverse('category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check recursive nesting
        self.assertEqual(len(response.data[0]['children']), 1)
        self.assertEqual(response.data[0]['children'][0]['name'], 'Phones')

    def test_review_uniqueness(self):
        Review.objects.create(
            product=self.product,
            user=self.user,
            rating=5,
            comment='Great!'
        )
        url = reverse('review-list')
        self.client.force_authenticate(user=self.user)
        response = self.client.post(url, {
            'product': self.product.id,
            'rating': 4,
            'comment': 'Duplicate review'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Verify the custom message from serializer validator
        self.assertIn('already reviewed', str(response.data))

    def test_product_search(self):
        Product.objects.create(
            category=self.category,
            name='Laptop Pro',
            slug='laptop-pro',
            price=2000.00,
            stock=5
        )
        url = reverse('product-list')
        response = self.client.get(url, {'search': 'pro'})
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Laptop Pro')
