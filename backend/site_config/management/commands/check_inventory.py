from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from products.models import Product
from accounts.models import CustomUser

class Command(BaseCommand):
    help = 'Checks for products with low stock (less than 10 units) and sends email alerts to admins.'

    def handle(self, *args, **options):
        low_stock_products = Product.objects.filter(stock__lt=10, is_active=True)
        
        if low_stock_products.exists():
            admin_emails = CustomUser.objects.filter(
                role__in=['admin', 'superadmin']
            ).values_list('email', flat=True)
            
            if admin_emails:
                product_list = "\n".join([f"- {p.name}: {p.stock} units" for p in low_stock_products])
                subject = "Daily Low Stock Alert"
                message = f"The following products are running low on stock (less than 10 units):\n\n{product_list}"
                
                try:
                    send_mail(
                        subject,
                        message,
                        settings.DEFAULT_FROM_EMAIL or 'admin@ecommerce.com',
                        list(admin_emails),
                        fail_silently=False
                    )
                    self.stdout.write(self.style.SUCCESS(f'Successfully sent low stock alert to {len(admin_emails)} admins.'))
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f'Error sending inventory alert: {e}'))
            else:
                self.stdout.write(self.style.WARNING('No admin users found to send alerts to.'))
        else:
            self.stdout.write(self.style.SUCCESS('All products have sufficient stock.'))
