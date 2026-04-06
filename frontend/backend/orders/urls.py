from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CartViewSet, 
    OrderViewSet, 
    ShippingAddressViewSet, 
    CreatePaymentIntentView, 
    StripeWebhookView,
    RazorpayOrderView,
    RazorpayVerifyView,
    ApplyPromoCodeView
)

router = DefaultRouter()
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'addresses', ShippingAddressViewSet, basename='address')

urlpatterns = [
    path('cart/apply-promo/', ApplyPromoCodeView.as_view(), name='apply-promo'),
    path('', include(router.urls)),
    path('payments/create-payment-intent/', CreatePaymentIntentView.as_view(), name='create-payment-intent',),
    path('payments/webhook/stripe/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('payments/razorpay/order/', RazorpayOrderView.as_view(), name='razorpay-order'),
    path('payments/razorpay/verify/', RazorpayVerifyView.as_view(), name='razorpay-verify'),
]
