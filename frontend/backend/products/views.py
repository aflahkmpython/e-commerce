from rest_framework import viewsets, permissions, filters, pagination
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, Tag, ProductImage, Review, Wishlist
from .serializers import (
    CategorySerializer, 
    ProductSerializer, 
    TagSerializer, 
    ProductImageSerializer, 
    ReviewSerializer,
    WishlistSerializer
)
from rest_framework.decorators import action
from rest_framework.response import Response

class WishlistViewSet(viewsets.GenericViewSet, viewsets.mixins.ListModelMixin):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return Wishlist.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='toggle/(?P<product_id>\d+)')
    def toggle(self, request, product_id=None):
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        if product in wishlist.products.all():
            wishlist.products.remove(product)
            return Response({"message": "Removed from wishlist", "wishlisted": False})
        else:
            wishlist.products.add(product)
            return Response({"message": "Added to wishlist", "wishlisted": True})
from .filters import ProductFilter

class StandardResultsSetPagination(pagination.PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 48

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing categories in a recursive tree or individually.
    """
    queryset = Category.objects.filter(parent=None)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for products, supporting advanced filtering, searching, and ordering.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = StandardResultsSetPagination
    lookup_field = 'slug'
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'category__name', 'tags__name']
    ordering_fields = ['price', 'created_at', 'rating']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class ReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for product reviews, restricted to authenticated users.
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]
