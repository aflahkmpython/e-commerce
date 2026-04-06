from django.urls import path
from .views import (
    DashboardStatsView, DailyRevenueView, TopProductsView, RecentOrdersView,
    AdminProductListView, AdminProductCreateView, AdminProductUpdateView,
    AdminProductDeleteView, StockUpdateView,
    AdminCategoryListCreateView, AdminCategoryDetailView, AdminCategoryDeleteView,
    AdminOrderListView, AdminOrderDetailView, AdminOrderStatusUpdateView, OrderExportView,
    AdminUserListView, AdminUserDetailView, AdminUserRoleUpdateView, AdminUserDeactivateView, AdminUserOrderHistoryView,
    LowStockView, BulkStockUpdateView, StockHistoryView, StockUpdateView,
    AdminPromoCodeListCreateView, AdminPromoCodeDetailView, PromoCodeUsageListView, BulkDeactivatePromoView, CheckPromoCodeView
)

urlpatterns = [
    # Dashboard
    path('dashboard/', DashboardStatsView.as_view(), name='admin-dashboard'),
    path('dashboard/revenue/', DailyRevenueView.as_view(), name='admin-dashboard-revenue'),
    path('dashboard/top-products/', TopProductsView.as_view(), name='admin-dashboard-top-products'),
    path('dashboard/recent-orders/', RecentOrdersView.as_view(), name='admin-dashboard-recent-orders'),

    # Category Management
    path('categories/', AdminCategoryListCreateView.as_view(), name='admin-category-list'),
    path('categories/<int:pk>/', AdminCategoryDetailView.as_view(), name='admin-category-detail'),
    path('categories/<int:pk>/delete/', AdminCategoryDeleteView.as_view(), name='admin-category-delete'),

    # Order Management
    path('orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('orders/export/', OrderExportView.as_view(), name='admin-order-export'),
    path('orders/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('orders/<int:pk>/status/', AdminOrderStatusUpdateView.as_view(), name='admin-order-status-update'),

    # User Management
    path('users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('users/<int:pk>/role/', AdminUserRoleUpdateView.as_view(), name='admin-user-role-update'),
    path('users/<int:pk>/deactivate/', AdminUserDeactivateView.as_view(), name='admin-user-deactivate'),
    path('users/<int:pk>/orders/', AdminUserOrderHistoryView.as_view(), name='admin-user-order-history'),

    # Inventory Management
    path('inventory/low-stock/', LowStockView.as_view(), name='admin-low-stock'),
    path('inventory/bulk-stock/', BulkStockUpdateView.as_view(), name='admin-bulk-stock'),
    path('products/<int:pk>/stock-history/', StockHistoryView.as_view(), name='admin-product-stock-history'),
    path('products/<int:pk>/stock/', StockUpdateView.as_view(), name='admin-product-stock'),

    # Product Management
    path('products/', AdminProductListView.as_view(), name='admin-product-list'),
    path('products/create/', AdminProductCreateView.as_view(), name='admin-product-create'),
    path('products/<int:pk>/', AdminProductUpdateView.as_view(), name='admin-product-detail'),
    path('products/<int:pk>/delete/', AdminProductDeleteView.as_view(), name='admin-product-delete'),

    # Promo Code Management
    path('promos/', AdminPromoCodeListCreateView.as_view(), name='admin-promo-list'),
    path('promos/check-code/', CheckPromoCodeView.as_view(), name='admin-promo-check'),
    path('promos/bulk-deactivate/', BulkDeactivatePromoView.as_view(), name='admin-promo-bulk-deactivate'),
    path('promos/<int:pk>/', AdminPromoCodeDetailView.as_view(), name='admin-promo-detail'),
    path('promos/<int:pk>/usage/', PromoCodeUsageListView.as_view(), name='admin-promo-usage'),
]
