from rest_framework import serializers
from .models import Category, Product, Tag, ProductImage, Review

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'parent', 'children']

    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True).data
        return []

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary']

class ReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'user_email', 'rating', 'comment', 'created_at']
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=Review.objects.all(),
                fields=['user', 'product'],
                message="You have already reviewed this product."
            )
        ]

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    reviews = ReviewSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_name', 'name', 'slug', 
            'description', 'price', 'discount_price', 'current_price',
            'stock', 'is_active', 'created_at', 'updated_at', 
            'tags', 'images', 'primary_image', 'reviews', 'average_rating'
        ]

    def get_primary_image(self, obj):
        # Prefer the primary image if designated
        primary = obj.images.filter(is_primary=True).first()
        if not primary:
            # Fall back to the first available image
            primary = obj.images.all().first()
        
        if primary:
            # Return relative or absolute URL (request context ensures absolute in serializer)
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary.image.url)
            return primary.image.url
        return None

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews.exists():
            return sum(r.rating for r in reviews) / reviews.count()
        return 0

class WishlistSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        from .models import Wishlist
        model = Wishlist
        fields = ['id', 'user', 'products', 'updated_at']
