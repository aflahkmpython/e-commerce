from django.utils import timezone
from site_config.models import PromoCode, UserPromoUsage

class PromoCodeValidator:
    def __init__(self, promo_code):
        self.promo = promo_code

    def check_is_active(self):
        if not self.promo.is_active:
            raise ValueError("This promo code is no longer active.")

    def check_valid_dates(self):
        now = timezone.now()
        if now < self.promo.valid_from:
            raise ValueError("This promo code is not yet valid.")
        if now > self.promo.expiry_date:
            raise ValueError("This promo code has expired.")

    def check_usage_limit(self):
        if self.promo.usage_limit is not None and self.promo.used_count >= self.promo.usage_limit:
            raise ValueError("This promo code has reached its usage limit.")

    def check_min_order_value(self, order_total):
        if order_total < self.promo.min_order_value:
            raise ValueError(f"Minimum order value of \u20b9{self.promo.min_order_value} required to use this promo code.")

    def check_user_redemption(self, user):
        if UserPromoUsage.objects.filter(user=user, promo_code=self.promo).exists():
            raise ValueError("You have already used this promo code.")

    def validate_all(self, user, order_total):
        self.check_is_active()
        self.check_valid_dates()
        self.check_usage_limit()
        self.check_min_order_value(order_total)
        self.check_user_redemption(user)
