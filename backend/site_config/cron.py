from django_cron import CronJobBase, Schedule
from django.core.mail import send_mail
from django.conf import settings
from products.models import Product
from accounts.models import CustomUser

class InventoryAlertCronJob(CronJobBase):
    RUN_EVERY_MINS = 1440 # 24 hours

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'site_config.inventory_alert_cron_job'

    def do(self):
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
                        settings.DEFAULT_FROM_EMAIL,
                        list(admin_emails),
                        fail_silently=False
                    )
                except Exception as e:
                    print(f"Error sending inventory alert: {e}")
