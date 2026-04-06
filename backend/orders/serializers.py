from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem, ShippingAddress
from products.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal']

    def validate_quantity(self, value):
        product_id = self.initial_data.get('product_id')
        try:
            from products.models import Product
            product = Product.objects.get(id=product_id)
            if value > product.stock:
                raise serializers.ValidationError(f"Only {product.stock} units available in stock.")
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found.")
        return value

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'session_key', 'items', 'total_price']

class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = '__all__'
        read_only_fields = ['user']

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'unit_price', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address = ShippingAddressSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'shipping_address', 'total_amount', 'status', 'payment_status', 'payment_id', 'items', 'created_at']
        read_only_fields = ['total_amount', 'status', 'payment_id', 'created_at']
