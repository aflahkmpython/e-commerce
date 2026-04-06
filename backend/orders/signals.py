from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import F
from .models import OrderItem
from products.models import Product

@receiver(post_save, sender=OrderItem)
def decrement_stock_on_order(sender, instance, created, **kwargs):
    """
    Atomically decrement product stock when a new OrderItem is created.
    Uses F() expression to prevent race conditions at the database level.
    """
    if created:
        Product.objects.filter(id=instance.product_id).update(
            stock=F('stock') - instance.quantity
        )
