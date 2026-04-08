from django.db import transaction
from rest_framework import generics, viewsets, views, status, permissions
from rest_framework.response import Response
from .models import SiteConfig, FeaturedProduct, HeroSlide
from .serializers import (
    SiteConfigSerializer, 
    FeaturedProductSerializer, 
    HeroSlideSerializer
)

class AdminSiteConfigView(generics.RetrieveUpdateAPIView):
    queryset = SiteConfig.objects.all()
    serializer_class = SiteConfigSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_object(self):
        # Singleton logic: return the first row or create one.
        obj, created = SiteConfig.objects.get_or_create(id=1)
        return obj

class AdminFeaturedProductView(generics.ListCreateAPIView):
    queryset = FeaturedProduct.objects.all()
    serializer_class = FeaturedProductSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminFeaturedProductDeleteView(generics.DestroyAPIView):
    queryset = FeaturedProduct.objects.all()
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'

class PublicSiteConfigView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        obj, created = SiteConfig.objects.get_or_create(id=1)
        serializer = SiteConfigSerializer(obj)
        
        # Featured Products included for app init
        featured = FeaturedProduct.objects.all().order_by('display_order')[:8]

        return Response({
            'config': serializer.data,
            'featured': FeaturedProductSerializer(featured, many=True).data,
            'hero_slides': HeroSlideSerializer(HeroSlide.objects.filter(is_active=True).order_by('order'), many=True).data
        })

class HeroSlideViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HeroSlide.objects.filter(is_active=True).order_by('order')
    serializer_class = HeroSlideSerializer
    permission_classes = [permissions.AllowAny]
