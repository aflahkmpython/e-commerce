from django_cron import CronJobBase, Schedule
from django.core.management import call_command

class LowStockAlertCronJob(CronJobBase):
    RUN_AT_TIMES = ['08:00']
    schedule = Schedule(run_at_times=RUN_AT_TIMES)
    code = 'products.low_stock_alert_cron_job'

    def do(self):
        call_command('send_low_stock_alerts')
