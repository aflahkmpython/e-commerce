from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from products.models import Product, Category
from .models import Cart, CartItem, ShippingAddress, Order

User = get_user_model()

class OrderTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='customer@example.com',
            password='password123',
            first_name='Customer',
            last_name='One'
        )
        self.client.force_authenticate(user=self.user)
        
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.product = Product.objects.create(
            category=self.category,
            name='Laptop',
            slug='laptop',
            price=1000.00,
            stock=5
        )
        self.address = ShippingAddress.objects.create(
            user=self.user,
            full_name='Customer One',
            address_line1='123 Main St',
            city='New York',
            state='NY',
            pincode='10001'
        )

    def test_add_to_cart(self):
        url = reverse('cart-add-item')
        data = {'product_id': self.product.id, 'quantity': 1}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(CartItem.objects.count(), 1)
        self.assertEqual(CartItem.objects.first().quantity, 1)

    def test_stock_deduction_on_order(self):
        # Setup cart
        cart, _ = Cart.objects.get_or_create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)
        
        url = reverse('order-list')
        data = {'address_id': self.address.id}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify stock deduction
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3) # 5 - 2 = 3
        
        # Verify cart cleared
        self.assertEqual(CartItem.objects.filter(cart=cart).count(), 0)

    def test_order_history_access(self):
        # Create an order
        Order.objects.create(user=self.user, total_amount=100, status='paid')
        
        url = reverse('order-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_update_cart_quantity(self):
        cart, _ = Cart.objects.get_or_create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        url = reverse('cart-update-quantity')
        response = self.client.post(url, {'product_id': self.product.id, 'quantity': 3})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item = CartItem.objects.get(cart=cart, product=self.product)
        self.assertEqual(item.quantity, 3)

    def test_order_out_of_stock(self):
        # Request more than available stock
        cart, _ = Cart.objects.get_or_create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=10)
        
        url = reverse('order-list')
        response = self.client.post(url, {'address_id': self.address.id})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('stock', str(response.data))
