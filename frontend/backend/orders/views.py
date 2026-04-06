from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import stripe
import razorpay
import json

from .models import Cart, CartItem, Order, OrderItem, ShippingAddress
from .serializers import (
    CartSerializer, 
    CartItemSerializer, 
    OrderSerializer, 
    OrderItemSerializer, 
    ShippingAddressSerializer
)
from products.models import Product

stripe.api_key = settings.STRIPE_SECRET_KEY
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_SECRET_KEY))

class ShippingAddressViewSet(viewsets.ModelViewSet):
    serializer_class = ShippingAddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ShippingAddress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [permissions.AllowAny]

    def get_cart(self):
        if self.request.user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=self.request.user)
        else:
            session_key = self.request.session.session_key
            if not session_key:
                self.request.session.create()
                session_key = self.request.session.session_key
            cart, created = Cart.objects.get_or_create(session_key=session_key, user__isnull=True)
        return cart

    def list(self, request, *args, **kwargs):
        cart = self.get_cart()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart = self.get_cart()
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        if product.stock < quantity:
            return Response({"error": "Not enough stock"}, status=status.HTTP_400_BAD_REQUEST)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            if product.stock < (cart_item.quantity + quantity):
                 return Response({"error": "Not enough stock"}, status=status.HTTP_400_BAD_REQUEST)
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        cart_item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def update_quantity(self, request):
        cart = self.get_cart()
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity'))

        try:
            cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
            if cart_item.product.stock < quantity:
                return Response({"error": "Not enough stock"}, status=status.HTTP_400_BAD_REQUEST)
            cart_item.quantity = quantity
            cart_item.save()
        except CartItem.DoesNotExist:
            return Response({"error": "Item not in cart"}, status=status.HTTP_404_NOT_FOUND)

        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        cart = self.get_cart()
        product_id = request.data.get('product_id')
        CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        return Response(CartSerializer(cart).data)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        user = request.user
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        if not cart.items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        address_id = request.data.get('address_id')
        address_data = request.data.get('shipping_address')
        payment_method = request.data.get('payment_method', 'stripe')
        payment_id = request.data.get('payment_id', '')

        if address_id:
            try:
                address = ShippingAddress.objects.get(id=address_id, user=user)
            except ShippingAddress.DoesNotExist:
                return Response({"error": "Invalid shipping address"}, status=status.HTTP_400_BAD_REQUEST)
        elif address_data:
            # Create or update address from data
            address, _ = ShippingAddress.objects.get_or_create(
                user=user,
                full_name=address_data.get('full_name'),
                address_line1=address_data.get('address_line_1'),
                city=address_data.get('city'),
                state=address_data.get('state'),
                pincode=address_data.get('postal_code'),
                country=address_data.get('country', 'United States')
            )
        else:
            return Response({"error": "Shipping address is required"}, status=status.HTTP_400_BAD_REQUEST)

        promo_id = request.data.get('promo_id')
        promo = None
        discount_amount = 0
        total_amount = cart.total_price

        if promo_id:
            from site_config.models import PromoCode, UserPromoUsage
            from site_config.utils import PromoCodeValidator
            from django.db.models import F
            try:
                promo = PromoCode.objects.get(id=promo_id)
                validator = PromoCodeValidator(promo)
                validator.validate_all(user, total_amount)
            except PromoCode.DoesNotExist:
                return Response({"error": "Invalid promo code"}, status=status.HTTP_400_BAD_REQUEST)
            except ValueError as e:
                transaction.set_rollback(True)
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            if promo.discount_type == 'percentage':
                discount_amount = (total_amount * promo.discount_value) / 100
            else:
                discount_amount = promo.discount_value
            discount_amount = min(discount_amount, total_amount)
            total_amount -= discount_amount

            # Atomically increment used_count
            PromoCode.objects.filter(id=promo.id).update(used_count=F('used_count') + 1)

        # Create Order
        order = Order.objects.create(
            user=user,
            shipping_address=address,
            total_amount=total_amount,
            status='confirmed' if payment_id else 'pending',
            payment_status='paid' if payment_id else 'unpaid',
            payment_id=payment_id,
            promo_code=promo,
            discount_amount=discount_amount
        )

        if promo:
            from site_config.models import UserPromoUsage
            UserPromoUsage.objects.create(
                user=user,
                promo_code=promo,
                order=order
            )

        # Create OrderItems and update stock
        for item in cart.items.all():
            # Lock the product row for update to prevent race conditions
            product = Product.objects.select_for_update().get(id=item.product.id)
            
            if product.stock < item.quantity:
                # Rolling back the entire transaction if any item is out of stock
                transaction.set_rollback(True)
                return Response({"error": f"Not enough stock for {product.name}"}, status=status.HTTP_400_BAD_REQUEST)

            OrderItem.objects.create(
                order=order,
                product=product,
                unit_price=product.price,
                quantity=item.quantity
            )
            # Stock decrement handled by post_save signal on OrderItem

        # Clear Cart
        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

class ApplyPromoCodeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        if not code:
            return Response({"error": "Code is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        from site_config.models import PromoCode
        from site_config.utils import PromoCodeValidator
        try:
            promo = PromoCode.objects.get(code=code)
        except PromoCode.DoesNotExist:
            return Response({"error": "Invalid promo code."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = cart.total_price
        
        validator = PromoCodeValidator(promo)
        try:
            validator.validate_all(request.user, subtotal)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if promo.discount_type == 'percentage':
            discount_amount = (subtotal * promo.discount_value) / 100
        else:
            discount_amount = promo.discount_value
        
        discount_amount = min(discount_amount, subtotal)
        new_total = subtotal - discount_amount

        return Response({
            "promo_id": promo.id,
            "code": promo.code,
            "discount_amount": discount_amount,
            "new_total": new_total
        }, status=status.HTTP_200_OK)

# --- Payment Views ---

class CreatePaymentIntentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
            amount = cart.total_price
            
            promo_id = request.data.get('promo_id')
            if promo_id:
                from site_config.models import PromoCode
                from site_config.utils import PromoCodeValidator
                try:
                    promo = PromoCode.objects.get(id=promo_id)
                    validator = PromoCodeValidator(promo)
                    validator.validate_all(request.user, amount)
                    if promo.discount_type == 'percentage':
                        discount = (amount * promo.discount_value) / 100
                    else:
                        discount = promo.discount_value
                    discount = min(discount, amount)
                    amount -= discount
                except Exception:
                    pass # Best effort discount evaluation; order creation will strictly validate again

            stripe_amount = int(amount * 100) # Cents

            intent = stripe.PaymentIntent.create(
                amount=stripe_amount,
                currency='usd',
                metadata={'user_id': request.user.id}
            )
            return Response({'clientSecret': intent.client_secret})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=400)

        if event['type'] == 'payment_intent.succeeded':
            pass

        return Response(status=200)

class RazorpayOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
            amount = cart.total_price
            
            promo_id = request.data.get('promo_id')
            if promo_id:
                from site_config.models import PromoCode
                from site_config.utils import PromoCodeValidator
                try:
                    promo = PromoCode.objects.get(id=promo_id)
                    validator = PromoCodeValidator(promo)
                    validator.validate_all(request.user, amount)
                    if promo.discount_type == 'percentage':
                        discount = (amount * promo.discount_value) / 100
                    else:
                        discount = promo.discount_value
                    discount = min(discount, amount)
                    amount -= discount
                except Exception:
                    pass

            razorpay_amount = int(amount * 100) # Paise

            data = {
                "amount": razorpay_amount,
                "currency": "INR",
                "receipt": f"receipt_{request.user.id}",
            }
            razorpay_order = razorpay_client.order.create(data=data)
            return Response(razorpay_order)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class RazorpayVerifyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            razorpay_payment_id = request.data.get('razorpay_payment_id')
            razorpay_order_id = request.data.get('razorpay_order_id')
            razorpay_signature = request.data.get('razorpay_signature')

            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }

            razorpay_client.utility.verify_payment_signature(params_dict)
            return Response({'status': 'Payment verified successfully'})
        except Exception as e:
            return Response({'error': 'Payment verification failed'}, status=400)
