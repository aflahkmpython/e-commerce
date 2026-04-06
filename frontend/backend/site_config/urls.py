from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminSiteConfigView, AdminBannerViewSet, 
    AdminFeaturedProductView, AdminFeaturedProductDeleteView,
    AdminPromoSectionViewSet, PublicSiteConfigView
)

router = DefaultRouter()
router.register(r'banners', AdminBannerViewSet, basename='admin-banner')
router.register(r'promos', AdminPromoSectionViewSet, basename='admin-promo')

urlpatterns = [
    # Admin CMS endpoints
    path('admin/site-config/', AdminSiteConfigView.as_view(), name='admin-site-config'),
    path('admin/featured-products/', AdminFeaturedProductView.as_view(), name='admin-featured-list'),
    path('admin/featured-products/<int:id>/', AdminFeaturedProductDeleteView.as_view(), name='admin-featured-delete'),
    path('admin/', include(router.urls)),
    
    # Public Initializer
    path('init/', PublicSiteConfigView.as_view(), name='public-site-init'),
]
