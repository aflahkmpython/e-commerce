from rest_framework import serializers
from products.models import Product, Category, ProductImage, Tag
from accounts.models import CustomUser
from orders.models import Order, OrderItem, OrderStatusAuditLog
from .models import AdminAuditLog

class AdminProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary']

class AdminCategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'parent', 'children', 'product_count', 'created_at']
        read_only_fields = ['slug', 'created_at']

    def get_children(self, obj):
        # We recursively call this serializer for child categories
        children = obj.children.all()
        return AdminCategorySerializer(children, many=True).data

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()

    def validate(self, attrs):
        # Circular reference check
        parent = attrs.get('parent')
        if parent and self.instance:
            if parent.id == self.instance.id:
                raise serializers.ValidationError("A category cannot be its own parent.")
            
            # Check ancestors
            curr = parent
            while curr is not None:
                if curr.id == self.instance.id:
                    raise serializers.ValidationError("Circular reference detected: Parent cannot be a descendant.")
                curr = curr.parent
        return attrs

class AdminProductSerializer(serializers.ModelSerializer):
    images = AdminProductImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    delete_images = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        tags_data = validated_data.pop('tags', None)
        product = Product.objects.create(**validated_data)
        
        if tags_data:
            product.tags.set(tags_data)

        for idx, image in enumerate(uploaded_images):
            # Mark the first uploaded image as primary by default
            ProductImage.objects.create(
                product=product,
                image=image,
                is_primary=(idx == 0)
            )
        return product

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        delete_images = validated_data.pop('delete_images', [])
        
        # Handle image deletion
        if delete_images:
            ProductImage.objects.filter(id__in=delete_images, product=instance).delete()
            # If primary image was deleted, assign a new one
            if not ProductImage.objects.filter(product=instance, is_primary=True).exists():
                new_primary = ProductImage.objects.filter(product=instance).first()
                if new_primary:
                    new_primary.is_primary = True
                    new_primary.save()

        # Handle new image uploads
        for image in uploaded_images:
            # Check if this is the first image for the product
            is_first = not ProductImage.objects.filter(product=instance).exists()
            ProductImage.objects.create(
                product=instance,
                image=image,
                is_primary=is_first
            )

        return super().update(instance, validated_data)

class AdminOrderStatusAuditLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True)
    
    class Meta:
        model = OrderStatusAuditLog
        fields = ['id', 'status', 'notes', 'changed_by_name', 'created_at']

class AdminOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_thumbnail = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'product_thumbnail', 'unit_price', 'quantity', 'subtotal']

    def get_product_thumbnail(self, obj):
        if obj.product:
            primary_image = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
            return primary_image.image.url if primary_image else None
        return None

class AdminOrderListSerializer(serializers.ModelSerializer):
    user_full_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    item_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'user_full_name', 'user_email', 'total_amount', 
            'status', 'payment_status', 'item_count', 'created_at'
        ]

    def get_item_count(self, obj):
        return obj.items.count()

class AdminOrderDetailSerializer(serializers.ModelSerializer):
    user_full_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_phone = serializers.CharField(source='user.phone_number', read_only=True)
    shipping_address = serializers.SerializerMethodField()
    items = AdminOrderItemSerializer(many=True, read_only=True)
    audit_logs = AdminOrderStatusAuditLogSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'

    def get_shipping_address(self, obj):
        if obj.shipping_address:
            addr = obj.shipping_address
            return {
                'full_name': addr.full_name,
                'phone': addr.phone,
                'address_line1': addr.address_line1,
                'address_line2': addr.address_line2,
                'city': addr.city,
                'state': addr.state,
                'pincode': addr.pincode,
                'country': addr.country
            }
        return None

class AdminAuditLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.full_name', read_only=True)
    
    class Meta:
        model = AdminAuditLog
        fields = ['id', 'action', 'notes', 'performed_by_name', 'timestamp']

class AdminUserListSerializer(serializers.ModelSerializer):
    total_orders = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'full_name', 'email', 'role', 'phone_number', 
            'is_active', 'date_joined', 'last_login', 'total_orders'
        ]

class AdminUserDetailSerializer(serializers.ModelSerializer):
    shipping_addresses = serializers.SerializerMethodField()
    recent_orders = serializers.SerializerMethodField()
    lifetime_spend = serializers.SerializerMethodField()
    activity_logs = AdminAuditLogSerializer(many=True, read_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 
            'phone_number', 'role', 'is_active', 'date_joined', 
            'last_login', 'shipping_addresses', 'recent_orders', 
            'lifetime_spend', 'activity_logs'
        ]

    def get_shipping_addresses(self, obj):
        from orders.models import ShippingAddress
        from orders.serializers import ShippingAddressSerializer
        addresses = ShippingAddress.objects.filter(user=obj)
        return ShippingAddressSerializer(addresses, many=True).data

    def get_recent_orders(self, obj):
        from orders.models import Order
        recent = Order.objects.filter(user=obj).order_by('-created_at')[:5]
        return [{
            'id': o.id,
            'created_at': o.created_at,
            'total_amount': o.total_amount,
            'status': o.status,
            'item_count': o.items.count()
        } for o in recent]

    def get_lifetime_spend(self, obj):
        from django.db.models import Sum
        from orders.models import Order
        total = Order.objects.filter(user=obj, payment_status='paid').aggregate(Sum('total_amount'))['total_amount__sum']
        return total or 0

# ─── Dashboard Serializers ────────────────────────────────────────────────────

class DashboardOrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='user.full_name', read_only=True)
    customer_email = serializers.EmailField(source='user.email', read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'customer_name', 'customer_email',
            'total_amount', 'status', 'payment_status',
            'item_count', 'created_at',
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class TopProductDashboardSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    image = serializers.URLField(allow_null=True)
    units_sold = serializers.IntegerField()
    revenue = serializers.FloatField()
    margin_pct = serializers.FloatField()


class CustomerInsightSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    email = serializers.EmailField()
    total_spent = serializers.FloatField()
    order_count = serializers.IntegerField()


from site_config.models import PromoCode, UserPromoUsage

class AdminPromoCodeSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    usage_stats = serializers.SerializerMethodField()

    class Meta:
        model = PromoCode
        fields = '__all__'
        read_only_fields = ['used_count', 'created_by']

    def validate_code(self, value):
        return value.upper()

    def validate(self, attrs):
        # We can instantiate a temp instance to run model clean
        instance = PromoCode(**attrs)
        try:
            instance.clean()
        except Exception as e:
            from rest_framework.exceptions import ValidationError
            if hasattr(e, 'message_dict'):
                raise ValidationError(e.message_dict)
            raise ValidationError(str(e))
        return attrs
        
    def get_usage_stats(self, obj):
        stats = {
            'used_count': obj.used_count,
            'usage_limit': obj.usage_limit,
            'usage_percentage': 0
        }
        if obj.usage_limit:
            stats['usage_percentage'] = (obj.used_count / obj.usage_limit) * 100
        return stats

class AdminUserPromoUsageSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='user.full_name', read_only=True)
    customer_email = serializers.EmailField(source='user.email', read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    order_total = serializers.DecimalField(source='order.total_amount', max_digits=10, decimal_places=2, read_only=True)
    discount_applied = serializers.DecimalField(source='order.discount_amount', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = UserPromoUsage
        fields = [
            'id', 'customer_name', 'customer_email', 'order_id', 
            'order_total', 'discount_applied', 'used_at'
        ]
