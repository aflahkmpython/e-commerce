from django.urls import path
from .views import (
    # New dashboard views
    DashboardSummaryView, SalesChartView, TopProductsView, DashboardOrdersView,
    ProfitSummaryView, CustomerInsightsView, OrdersChartView, OrderStatusPieView,
    # Legacy (kept for backwards compat)
    DashboardStatsView, DailyRevenueView, RecentOrdersView,
    # Product management
    AdminProductListView, AdminProductCreateView, AdminProductUpdateView,
    AdminProductDeleteView, StockUpdateView,
    # Category management
    AdminCategoryListCreateView, AdminCategoryDetailView, AdminCategoryDeleteView,
    # Order management
    AdminOrderListView, AdminOrderDetailView, AdminOrderStatusUpdateView, OrderExportView,
    # User management
    AdminUserListView, AdminUserDetailView, AdminUserRoleUpdateView,
    AdminUserDeactivateView, AdminUserOrderHistoryView,
    # Inventory
    LowStockView, BulkStockUpdateView, StockHistoryView,
    # Promo codes
    AdminPromoCodeListCreateView, AdminPromoCodeDetailView,
    PromoCodeUsageListView, BulkDeactivatePromoView, CheckPromoCodeView,
)

urlpatterns = [
    # ── New Comprehensive Dashboard ──────────────────────────────────────────
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='admin-dashboard-summary'),
    path('dashboard/sales-chart/', SalesChartView.as_view(), name='admin-dashboard-sales-chart'),
    path('dashboard/top-products/', TopProductsView.as_view(), name='admin-dashboard-top-products'),
    path('dashboard/orders/', DashboardOrdersView.as_view(), name='admin-dashboard-orders'),
    path('dashboard/profit/', ProfitSummaryView.as_view(), name='admin-dashboard-profit'),
    path('dashboard/customers/', CustomerInsightsView.as_view(), name='admin-dashboard-customers'),
    path('dashboard/orders-chart/', OrdersChartView.as_view(), name='admin-dashboard-orders-chart'),
    path('dashboard/status-pie/', OrderStatusPieView.as_view(), name='admin-dashboard-status-pie'),

    # ── Legacy dashboard routes (backwards compat) ───────────────────────────
    path('dashboard/', DashboardStatsView.as_view(), name='admin-dashboard'),
    path('dashboard/revenue/', DailyRevenueView.as_view(), name='admin-dashboard-revenue'),
    path('dashboard/recent-orders/', RecentOrdersView.as_view(), name='admin-dashboard-recent-orders'),

    # ── Category Management ──────────────────────────────────────────────────
    path('categories/', AdminCategoryListCreateView.as_view(), name='admin-category-list'),
    path('categories/<int:pk>/', AdminCategoryDetailView.as_view(), name='admin-category-detail'),
    path('categories/<int:pk>/delete/', AdminCategoryDeleteView.as_view(), name='admin-category-delete'),

    # ── Order Management ─────────────────────────────────────────────────────
    path('orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('orders/export/', OrderExportView.as_view(), name='admin-order-export'),
    path('orders/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('orders/<int:pk>/status/', AdminOrderStatusUpdateView.as_view(), name='admin-order-status-update'),

    # ── User Management ──────────────────────────────────────────────────────
    path('users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('users/<int:pk>/role/', AdminUserRoleUpdateView.as_view(), name='admin-user-role-update'),
    path('users/<int:pk>/deactivate/', AdminUserDeactivateView.as_view(), name='admin-user-deactivate'),
    path('users/<int:pk>/orders/', AdminUserOrderHistoryView.as_view(), name='admin-user-order-history'),

    # ── Inventory Management ─────────────────────────────────────────────────
    path('inventory/low-stock/', LowStockView.as_view(), name='admin-low-stock'),
    path('inventory/bulk-stock/', BulkStockUpdateView.as_view(), name='admin-bulk-stock'),
    path('products/<int:pk>/stock-history/', StockHistoryView.as_view(), name='admin-product-stock-history'),
    path('products/<int:pk>/stock/', StockUpdateView.as_view(), name='admin-product-stock'),

    # ── Product Management ───────────────────────────────────────────────────
    path('products/', AdminProductListView.as_view(), name='admin-product-list'),
    path('products/create/', AdminProductCreateView.as_view(), name='admin-product-create'),
    path('products/<int:pk>/', AdminProductUpdateView.as_view(), name='admin-product-detail'),
    path('products/<int:pk>/delete/', AdminProductDeleteView.as_view(), name='admin-product-delete'),

    # ── Promo Code Management ────────────────────────────────────────────────
    path('promos/', AdminPromoCodeListCreateView.as_view(), name='admin-promo-list'),
    path('promos/check-code/', CheckPromoCodeView.as_view(), name='admin-promo-check'),
    path('promos/bulk-deactivate/', BulkDeactivatePromoView.as_view(), name='admin-promo-bulk-deactivate'),
    path('promos/<int:pk>/', AdminPromoCodeDetailView.as_view(), name='admin-promo-detail'),
    path('promos/<int:pk>/usage/', PromoCodeUsageListView.as_view(), name='admin-promo-usage'),
]
