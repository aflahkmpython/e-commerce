from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify

from django.utils import timezone

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='children'
    )
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        full_path = [self.name]
        k = self.parent
        while k is not None:
            full_path.insert(0, k.name)
            k = k.parent
        return ' -> '.join(full_path)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Tag(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=60, unique=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tags = models.ManyToManyField(Tag, blank=True, related_name='products')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def current_price(self):
        if self.discount_price:
            return self.discount_price
        return self.price

class InventoryAlert(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory_alerts')
    stock_at_alert = models.IntegerField()
    alerted_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ['-alerted_at']

    def __str__(self):
        return f"Alert for {self.product.name} at stock {self.stock_at_alert}"

    @property
    def current_price(self):
        if self.discount_price:
            return self.discount_price
        return self.price

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.product.name}"

    def save(self, *args, **kwargs):
        if self.is_primary:
            # Set all other images for this product as not primary
            ProductImage.objects.filter(product=self.product, is_primary=True).update(is_primary=False)
        elif not ProductImage.objects.filter(product=self.product, is_primary=True).exists():
            # If no primary image exists, make this one the primary
            self.is_primary = True
        super().save(*args, **kwargs)

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.user.email} on {self.product.name}"

class Wishlist(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    products = models.ManyToManyField(Product, related_name='wishlisted_by', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wishlist for {self.user.email}"
