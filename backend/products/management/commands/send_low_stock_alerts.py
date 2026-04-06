import os
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from products.models import Product, InventoryAlert
from accounts.models import CustomUser

class Command(BaseCommand):
    help = 'Sends low-stock email alerts to administrators'

    def handle(self, *args, **options):
        low_stock_products = Product.objects.filter(stock__lt=10, is_active=True)
        
        if not low_stock_products.exists():
            self.stdout.write(self.style.SUCCESS('No low-stock products found.'))
            return

        # Create/Update InventoryAlert records
        for product in low_stock_products:
            InventoryAlert.objects.get_or_create(
                product=product,
                stock_at_alert=product.stock,
                is_resolved=False
            )

        # Get all admins
        admin_emails = CustomUser.objects.filter(role__in=['admin', 'superadmin']).values_list('email', flat=True)
        
        if not admin_emails:
            self.stdout.write(self.style.WARNING('No administrators found to notify.'))
            return

        context = {
            'products': low_stock_products,
            'admin_url': f"{settings.FRONTEND_URL}/admin/inventory"
        }
        
        html_message = render_to_string('emails/low_stock_alert.html', context)
        
        send_mail(
            subject='[CRITICAL] Low Stock Inventory Alert',
            message='',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=list(admin_emails),
            html_message=html_message,
            fail_silently=True
        )

        self.stdout.write(self.style.SUCCESS(f'Alerts sent for {low_stock_products.count()} products.'))
