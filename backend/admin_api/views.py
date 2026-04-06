from rest_framework import views, status, viewsets, generics, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, BasePermission
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
import django_filters
from rest_framework.parsers import MultiPartParser, FormParser
import csv
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.db.models.functions import TruncDate, TruncDay
from django.db.models import Sum, Count, Avg, F
from rest_framework.pagination import PageNumberPagination
from django.db import transaction

from orders.models import Order, OrderItem, OrderStatusAuditLog
from products.models import Product, Category, Tag, ProductImage
from accounts.models import CustomUser
from .models import AdminAuditLog
from .serializers import (
    AdminProductSerializer, AdminCategorySerializer, 
    AdminOrderListSerializer, AdminOrderDetailSerializer,
    AdminUserListSerializer, AdminUserDetailSerializer, AdminAuditLogSerializer
)

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == 'superadmin')

# --- DASHBOARD VIEWS ---

class DashboardStatsView(views.APIView):
    permission_classes = [IsAdminUser]

    def get_comparison_data(self, queryset, field, current_range, last_range, date_field='created_at'):
        filter_current = {f"{date_field}__range": current_range}
        filter_last = {f"{date_field}__range": last_range}
        
        current_val = queryset.filter(**filter_current).aggregate(total=Sum(field) if field != 'id' else Count(field))['total'] or 0
        last_val = queryset.filter(**filter_last).aggregate(total=Sum(field) if field != 'id' else Count(field))['total'] or 0
        
        change = 0
        if last_val > 0:
            change = ((current_val - last_val) / last_val) * 100
            
        return current_val, round(change, 1)

    def get(self, request):
        now = timezone.now()
        first_day_current = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_day_last_month = first_day_current - timedelta(days=1)
        first_day_last_month = last_day_last_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        current_range = (first_day_current, now)
        last_range = (first_day_last_month, last_day_last_month)

        paid_orders = Order.objects.filter(payment_status='paid')
        total_revenue, rev_change = self.get_comparison_data(paid_orders, 'total_amount', current_range, last_range)
        total_orders, order_change = self.get_comparison_data(Order.objects.all(), 'id', current_range, last_range)
        total_users, user_change = self.get_comparison_data(
            CustomUser.objects.filter(role='customer'), 
            'id', current_range, last_range, date_field='date_joined'
        )
        total_active_products = Product.objects.filter(stock__gt=0).count()
        status_counts = Order.objects.values('status').annotate(count=Count('id'))
        
        return Response({
            'revenue': {'value': total_revenue, 'change': rev_change},
            'orders': {'value': total_orders, 'change': order_change},
            'users': {'value': total_users, 'change': user_change},
            'products': {'value': total_active_products, 'change': 0},
            'status_breakdown': status_counts,
        })

class DailyRevenueView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        revenue_data = Order.objects.filter(
            payment_status='paid', created_at__gte=start_date
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            revenue=Sum('total_amount')
        ).order_by('date')
        return Response(revenue_data)

class TopProductsView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        top_products = OrderItem.objects.values(
            'product__id', 'product__name'
        ).annotate(
            units_sold=Sum('quantity'),
            revenue=Sum(F('quantity') * F('unit_price')),
        ).order_by('-units_sold')[:5]
        
        results = []
        for item in top_products:
            product = Product.objects.get(id=item['product__id'])
            primary_image = product.images.filter(is_primary=True).first() or product.images.first()
            item['image'] = primary_image.image.url if primary_image else None
            results.append(item)
        return Response(results)

class RecentOrdersView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        recent_orders = Order.objects.select_related('user').order_by('-created_at')[:10]
        serializer = AdminOrderListSerializer(recent_orders, many=True)
        return Response(serializer.data)

# --- PRODUCT VIEWS ---

class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')

    class Meta:
        model = Product
        fields = ['category', 'is_active']

    def filter_in_stock(self, queryset, name, value):
        return queryset.filter(stock__gt=0) if value else queryset.filter(stock=0)

class AdminProductListView(generics.ListAPIView):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'stock']

class AdminProductCreateView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

class AdminProductUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]
    http_method_names = ['get', 'patch']

class StockUpdateView(views.APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        product = generics.get_object_or_404(Product, pk=pk)
        new_stock = request.data.get('stock')
        
        if new_stock is None or not isinstance(new_stock, int) or new_stock < 0:
            return Response({'error': 'Valid non-negative integer stock required'}, status=status.HTTP_400_BAD_REQUEST)

        old_stock = product.stock
        product.stock = new_stock
        product.save()

        AdminAuditLog.objects.create(
            action='STOCK_UPDATE',
            target_model='Product',
            target_id=product.id,
            old_value=str(old_stock),
            new_value=str(new_stock),
            performed_by=request.user,
            notes=f"Manual stock update for {product.name}"
        )

        return Response(AdminProductSerializer(product).data)

class BulkStockUpdateView(views.APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def patch(self, request):
        updates = request.data.get('updates', [])
        if not isinstance(updates, list):
            return Response({'error': 'List of updates required'}, status=status.HTTP_400_BAD_REQUEST)

        results = []
        for update in updates:
            p_id = update.get('product_id')
            new_stock = update.get('new_stock')
            
            if new_stock is None or new_stock < 0:
                transaction.set_rollback(True)
                return Response({'error': f'Invalid stock for product {p_id}'}, status=status.HTTP_400_BAD_REQUEST)
            
            product = generics.get_object_or_404(Product, pk=p_id)
            old_stock = product.stock
            product.stock = new_stock
            product.save()

            AdminAuditLog.objects.create(
                action='STOCK_UPDATE',
                target_model='Product',
                target_id=product.id,
                old_value=str(old_stock),
                new_value=str(new_stock),
                performed_by=request.user
            )
            results.append(AdminProductSerializer(product).data)

        return Response(results)

class LowStockView(generics.ListAPIView):
    serializer_class = AdminProductSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Product.objects.filter(stock__lt=10).order_by('stock')

class StockHistoryView(generics.ListAPIView):
    serializer_class = AdminAuditLogSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        product_id = self.kwargs.get('pk')
        return AdminAuditLog.objects.filter(
            target_model='Product',
            target_id=product_id,
            action='STOCK_UPDATE'
        ).order_by('-timestamp')

class AdminProductDeleteView(generics.DestroyAPIView):
    queryset = Product.objects.all()
    permission_classes = [IsAdminUser]
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

# --- CATEGORY VIEWS ---

class AdminCategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdminUser]
    def get_queryset(self):
        return Category.objects.filter(parent=None).prefetch_related('children__children')

class AdminCategoryDetailView(generics.RetrieveUpdateAPIView):
    queryset = Category.objects.all()
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdminUser]
    http_method_names = ['get', 'patch']

class AdminCategoryDeleteView(generics.DestroyAPIView):
    queryset = Category.objects.all()
    permission_classes = [IsAdminUser]
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.products.exists():
            return Response({'error': 'Reassign or delete products first.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)

# --- ORDER VIEWS ---

class OrderFilter(django_filters.FilterSet):
    created_at_after = django_filters.DateFilter(field_name="created_at", lookup_expr='date__gte')
    created_at_before = django_filters.DateFilter(field_name="created_at", lookup_expr='date__lte')
    class Meta:
        model = Order
        fields = ['status', 'payment_status']

class AdminOrderPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'

class AdminOrderListView(generics.ListAPIView):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = AdminOrderListSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = OrderFilter
    search_fields = ['id', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['created_at', 'total_amount']
    pagination_class = AdminOrderPagination

class AdminOrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = AdminOrderDetailSerializer
    permission_classes = [IsAdminUser]

class AdminOrderStatusUpdateView(views.APIView):
    permission_classes = [IsAdminUser]
    def patch(self, request, pk):
        order = generics.get_object_or_404(Order, pk=pk)
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        valid_transitions = {
            'pending': ['confirmed', 'cancelled'], 'confirmed': ['shipped', 'cancelled'],
            'shipped': ['delivered', 'cancelled'], 'delivered': [], 'cancelled': []
        }
        if new_status not in [c[0] for c in Order.STATUS_CHOICES]:
                return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        if new_status not in valid_transitions.get(order.status, []):
            return Response({'error': 'Invalid transition'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = new_status
        order.save()
        OrderStatusAuditLog.objects.create(order=order, status=new_status, notes=notes, changed_by=request.user)
        self.send_notification_email(order)
        return Response(AdminOrderDetailSerializer(order).data)

    def send_notification_email(self, order):
        context = {'order_id': order.id, 'status': order.status, 'status_display': order.get_status_display(), 'tracking_url': f"{settings.FRONTEND_URL}/orders/{order.id}"}
        html_message = render_to_string('emails/order_status_update.html', context)
        send_mail(subject=f"Order #{order.id} Status: {order.get_status_display()}", message='', from_email=settings.DEFAULT_FROM_EMAIL, recipient_list=[order.user.email], html_message=html_message, fail_silently=True)

class OrderExportView(views.APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        queryset = OrderFilter(request.GET, queryset=Order.objects.all()).qs
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="orders_export.csv"'
        writer = csv.writer(response)
        writer.writerow(['Order ID', 'Customer', 'Email', 'Total', 'Status', 'Date'])
        for o in queryset:
            writer.writerow([o.id, o.user.full_name, o.user.email, o.total_amount, o.status, o.created_at.strftime('%Y-%m-%d')])
        return response

# --- USER MANAGEMENT VIEWS (SUPERADMIN ONLY) ---

class UserFilter(django_filters.FilterSet):
    joined_after = django_filters.DateFilter(field_name="date_joined", lookup_expr='date__gte')
    class Meta:
        model = CustomUser
        fields = ['role', 'is_active']

class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserListSerializer
    permission_classes = [IsSuperAdmin]
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = UserFilter
    search_fields = ['email', 'first_name', 'last_name', 'phone_number']
    ordering_fields = ['date_joined', 'last_login', 'total_orders']
    ordering = ['-date_joined']
    pagination_class = AdminOrderPagination
    def get_queryset(self):
        return CustomUser.objects.annotate(total_orders=Count('orders', distinct=True)).all()

class AdminUserDetailView(generics.RetrieveAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = AdminUserDetailSerializer
    permission_classes = [IsSuperAdmin]

class AdminUserRoleUpdateView(views.APIView):
    permission_classes = [IsSuperAdmin]
    def patch(self, request, pk):
        user = generics.get_object_or_404(CustomUser, pk=pk)
        new_role = request.data.get('role')
        if user.id == request.user.id:
            return Response({'error': 'You cannot change your own role.'}, status=status.HTTP_400_BAD_REQUEST)
        if new_role not in ['customer', 'admin', 'superadmin']:
            return Response({'error': 'Invalid role choice'}, status=status.HTTP_400_BAD_REQUEST)
        old_role = user.role
        user.role = new_role
        user.save()
        AdminAuditLog.objects.create(action='ROLE_CHANGE', target_user=user, performed_by=request.user, notes=f"Changed role from {old_role} to {new_role}")
        return Response(AdminUserDetailSerializer(user).data)

class AdminUserDeactivateView(views.APIView):
    permission_classes = [IsSuperAdmin]
    def patch(self, request, pk):
        user = generics.get_object_or_404(CustomUser, pk=pk)
        if user.id == request.user.id:
            return Response({'error': 'You cannot deactivate your own account.'}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = not user.is_active
        user.save()
        action = 'DEACTIVATE' if not user.is_active else 'REACTIVATE'
        AdminAuditLog.objects.create(action=action, target_user=user, performed_by=request.user, notes=f"Account {'deactivated' if not user.is_active else 'reactivated'}")
        self.send_status_email(user)
        return Response({'status': action, 'is_active': user.is_active})

    def send_status_email(self, user):
        context = {'user_name': user.first_name, 'is_active': user.is_active, 'status_text': 'Active' if user.is_active else 'Inactive', 'status_class': 'active' if user.is_active else 'inactive', 'status_description': 'Your account has been reactivated.' if user.is_active else 'Your account has been deactivated by an administrator.', 'login_url': f"{settings.FRONTEND_URL}/login"}
        html_message = render_to_string('emails/account_status.html', context)
        send_mail(subject=f"Account Status Update - {context['status_text']}", message='', from_email=settings.DEFAULT_FROM_EMAIL, recipient_list=[user.email], html_message=html_message, fail_silently=True)

class AdminUserOrderHistoryView(generics.ListAPIView):
    serializer_class = AdminOrderListSerializer
    permission_classes = [IsSuperAdmin]
    pagination_class = AdminOrderPagination
    def get_queryset(self):
        user_id = self.kwargs.get('pk')
        return Order.objects.filter(user_id=user_id).order_by('-created_at')

# --- PROMO CODE VIEWS (ADMIN) ---

from site_config.models import PromoCode, UserPromoUsage
from .serializers import AdminPromoCodeSerializer, AdminUserPromoUsageSerializer

class AdminPromoCodeListCreateView(generics.ListCreateAPIView):
    serializer_class = AdminPromoCodeSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        expired = self.request.query_params.get('expired')
        qs = PromoCode.objects.all().order_by('-created_at')
        if expired == 'true':
            qs = qs.filter(expiry_date__lt=timezone.now())
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class AdminPromoCodeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PromoCode.objects.all()
    serializer_class = AdminPromoCodeSerializer
    permission_classes = [IsAdminUser]
    http_method_names = ['get', 'patch', 'delete']

class PromoCodeUsageListView(generics.ListAPIView):
    serializer_class = AdminUserPromoUsageSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        promo_id = self.kwargs.get('pk')
        return UserPromoUsage.objects.filter(promo_code_id=promo_id).order_by('-used_at')

class BulkDeactivatePromoView(views.APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        ids = request.data.get('ids', [])
        if not ids:
             return Response({'error': 'List of IDs required'}, status=status.HTTP_400_BAD_REQUEST)
        PromoCode.objects.filter(id__in=ids).update(is_active=False)
        return Response({'status': 'success'}, status=status.HTTP_200_OK)

class CheckPromoCodeView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        code = request.query_params.get('code', '').strip().upper()
        if not code:
            return Response({'available': False})
        
        # Available if it doesn't exist
        exists = PromoCode.objects.filter(code=code).exists()
        return Response({'available': not exists})
