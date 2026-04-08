from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminSiteConfigView, 
    AdminFeaturedProductView, AdminFeaturedProductDeleteView,
    PublicSiteConfigView,
    HeroSlideViewSet
)

router = DefaultRouter()
router.register(r'hero-slides', HeroSlideViewSet, basename='hero-slide')

urlpatterns = [
    # Admin CMS endpoints
    path('site-config/', AdminSiteConfigView.as_view(), name='admin-site-config'),
    path('featured-products/', AdminFeaturedProductView.as_view(), name='admin-featured-list'),
    path('featured-products/<int:id>/', AdminFeaturedProductDeleteView.as_view(), name='admin-featured-delete'),
    path('', include(router.urls)),
    
    # Public Initializer
    path('init/', PublicSiteConfigView.as_view(), name='public-site-init'),
]
