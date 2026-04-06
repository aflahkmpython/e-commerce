from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from products.models import Product, Category
from .models import SiteConfig, Banner, FeaturedProduct

User = get_user_model()

class CMSTests(APITestCase):
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
        # Create 10 products
        self.products = [
            Product.objects.create(
                name=f'Product {i}', slug=f'product-{i}', category=self.category, price=100
            ) for i in range(10)
        ]

    def test_site_config_singleton_enforcement(self):
        # Initial config
        config1 = SiteConfig.objects.create(site_name='Store A')
        self.assertEqual(SiteConfig.objects.count(), 1)
        
        # Second creation should update the first
        config2 = SiteConfig(site_name='Store B')
        config2.save()
        
        self.assertEqual(SiteConfig.objects.count(), 1)
        self.assertEqual(SiteConfig.objects.first().site_name, 'Store B')

    def test_banner_reorder_atomicity(self):
        self.client.force_authenticate(user=self.admin)
        b1 = Banner.objects.create(title='B1', image=SimpleUploadedFile('b1.jpg', b'content'), display_order=0)
        b2 = Banner.objects.create(title='B2', image=SimpleUploadedFile('b2.jpg', b'content'), display_order=1)
        
        url = reverse('admin-banner-reorder')
        response = self.client.post(url, {'banner_ids': [b2.id, b1.id]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        b1.refresh_from_db()
        b2.refresh_from_db()
        self.assertEqual(b1.display_order, 1)
        self.assertEqual(b2.display_order, 0)

    def test_featured_product_limit_enforcement(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-featured-list')
        
        # Add 8 products
        for i in range(8):
            FeaturedProduct.objects.create(product=self.products[i], display_order=i)
        
        # Try to add 9th
        response = self.client.post(url, {'product': self.products[8].id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Storefront Capacity Reached', str(response.data))

    def test_public_init_endpoint_no_auth(self):
        # Ensure SiteConfig exists
        SiteConfig.objects.get_or_create(id=1, site_name='Public Store')
        
        url = reverse('public-site-init')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['config']['site_name'], 'Public Store')

    def test_admin_permission_protection(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse('admin-site-config')
        
        # Customer should NOT be able to PATCH config
        response = self.client.patch(url, {'site_name': 'Hacked Store'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
