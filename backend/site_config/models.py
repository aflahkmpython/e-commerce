from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from products.models import Product

class SiteConfig(models.Model):
    site_name = models.CharField(max_length=100, default='Ecommerce Store')
    site_logo = models.ImageField(upload_to='site/', null=True, blank=True)
    favicon = models.ImageField(upload_to='site/', null=True, blank=True)
    
    primary_color = models.CharField(max_length=10, default='#111827') # Grayscale 900
    secondary_color = models.CharField(max_length=10, default='#4b5563') # Gray 600
    
    announcement_text = models.CharField(max_length=120, blank=True)
    announcement_is_active = models.BooleanField(default=False)
    announcement_bg_color = models.CharField(max_length=10, default='#111827')
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.site_name
    
    def save(self, *args, **kwargs):
        # Ensure only one SiteConfig exists: if it's new and one already exists, update the first one.
        if not self.pk and SiteConfig.objects.exists():
            # This logic updates the existing lone instance instead of creating a second.
            existing = SiteConfig.objects.first()
            self.pk = existing.pk
        super().save(*args, **kwargs)

class FeaturedProduct(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='featured_info')
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return f"Featured: {self.product.name}"

class PromoCode(models.Model):
    DISCOUNT_TYPES = (
        ('percentage', 'Percentage'),
        ('flat', 'Flat Amount'),
    )
    
    code = models.CharField(max_length=20, unique=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    used_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField()
    expiry_date = models.DateTimeField()
    created_by = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True, related_name='created_promos')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code

    def clean(self):
        from django.core.exceptions import ValidationError
        errors = {}
        
        if self.discount_value <= 0:
            errors['discount_value'] = "Discount value must be greater than zero."
            
        if self.discount_type == 'percentage' and self.discount_value > 100:
            errors['discount_value'] = "Percentage discount cannot exceed 100%."
            
        if self.valid_from and self.expiry_date and self.expiry_date <= self.valid_from:
            errors['expiry_date'] = "Expiry date must be after the valid from date."
            
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.clean()
        if self.code:
            self.code = self.code.upper()
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        from django.utils import timezone
        if not self.is_active:
            return False
        now = timezone.now()
        if now < self.valid_from or now > self.expiry_date:
            return False
        if self.usage_limit and self.used_count >= self.usage_limit:
            return False
        return True

class UserPromoUsage(models.Model):
    user = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, related_name='promo_usages')
    promo_code = models.ForeignKey(PromoCode, on_delete=models.CASCADE, related_name='usages')
    order = models.ForeignKey('orders.Order', on_delete=models.SET_NULL, null=True, related_name='promo_usage')
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'promo_code')

    def __str__(self):
        return f"{self.user.email} - {self.promo_code.code}"

class HeroSlide(models.Model):
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=400, blank=True)
    button_text = models.CharField(max_length=50, default='Explore Shop')
    button_link = models.CharField(max_length=255, default='/products')
    image = models.ImageField(upload_to='hero/')
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title
