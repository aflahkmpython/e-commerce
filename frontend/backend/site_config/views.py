from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework import generics, viewsets, views, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import SiteConfig, Banner, FeaturedProduct, PromoSection
from .serializers import (
    SiteConfigSerializer, BannerSerializer, 
    FeaturedProductSerializer, PromoSectionSerializer
)

class AdminSiteConfigView(generics.RetrieveUpdateAPIView):
    queryset = SiteConfig.objects.all()
    serializer_class = SiteConfigSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_object(self):
        # Singleton logic: return the first row or create one.
        obj, created = SiteConfig.objects.get_or_create(id=1)
        return obj

class AdminBannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        # Atomic reorder: updates multiple display_order fields in one transaction.
        banner_ids = request.data.get('banner_ids', [])
        if not banner_ids:
            return Response({'error': 'banner_ids missing'}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            for index, bid in enumerate(banner_ids):
                Banner.objects.filter(id=bid).update(display_order=index)
        
        return Response({'status': 'Banners reordered'}, status=status.HTTP_200_OK)

class AdminFeaturedProductView(generics.ListCreateAPIView):
    queryset = FeaturedProduct.objects.all()
    serializer_class = FeaturedProductSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminFeaturedProductDeleteView(generics.DestroyAPIView):
    queryset = FeaturedProduct.objects.all()
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'

class AdminPromoSectionViewSet(viewsets.ModelViewSet):
    queryset = PromoSection.objects.all()
    serializer_class = PromoSectionSerializer
    permission_classes = [permissions.IsAdminUser]

class PublicSiteConfigView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        obj, created = SiteConfig.objects.get_or_create(id=1)
        serializer = SiteConfigSerializer(obj)
        
        # Banners and Featured Products included for app init
        banners = Banner.objects.filter(is_active=True).order_by('display_order')[:5]
        featured = FeaturedProduct.objects.all().order_by('display_order')[:8]
        promos = PromoSection.objects.filter(is_active=True)

        return Response({
            'config': serializer.data,
            'banners': BannerSerializer(banners, many=True).data,
            'featured': FeaturedProductSerializer(featured, many=True).data,
            'promos': PromoSectionSerializer(promos, many=True).data
        })
