from rest_framework import serializers
from .models import SiteConfig, FeaturedProduct, HeroSlide
from products.models import Product
import cloudinary.uploader

class SiteConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfig
        fields = '__all__'

    def update(self, instance, validated_data):
        # Cloudinary Asset Cleanup: Delete old logo/favicon if a new one is uploaded
        site_logo = validated_data.get('site_logo')
        favicon = validated_data.get('favicon')

        if site_logo and instance.site_logo:
            try:
                public_id = instance.site_logo.name.split('.')[0]
                cloudinary.uploader.destroy(public_id)
            except Exception:
                pass

        if favicon and instance.favicon:
            try:
                public_id = instance.favicon.name.split('.')[0]
                cloudinary.uploader.destroy(public_id)
            except Exception:
                pass

        return super().update(instance, validated_data)

class FeaturedProductSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_image = serializers.SerializerMethodField()
    product_price = serializers.ReadOnlyField(source='product.price')

    class Meta:
        model = FeaturedProduct
        fields = ['id', 'product', 'product_name', 'product_image', 'product_price', 'display_order']

    def get_product_image(self, obj):
        if obj.product.images.exists():
            return obj.product.images.first().image.url
        return None

    def validate(self, data):
        # Max 8 featured products enforcement
        if not self.instance and FeaturedProduct.objects.count() >= 8:
            raise serializers.ValidationError("Storefront Capacity Reached: A maximum of 8 featured products is permitted to maintain homepage performance.")
        return data

class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = ['id', 'title', 'subtitle', 'button_text', 'button_link', 'image', 'is_active', 'order']
