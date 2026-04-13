# inventory/views.py
import logging

from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from inventory.models import Product, InventoryMovement
from inventory.serializers import (
    ProductSerializer,
    CreateProductSerializer,
    InventoryMovementSerializer,
)
from users.permissions import IsAdminOrAbove

logger = logging.getLogger(__name__)


class ProductListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/products/  — List all products for the tenant
    POST /api/v1/products/  — Create a new product
    """

    permission_classes = [IsAdminOrAbove]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateProductSerializer
        return ProductSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Product.objects.none()
        qs = Product.objects.filter(tenant=self.request.user.tenant)

        # Filter by search
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(sku__icontains=search)

        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)

        # Filter by low stock
        low_stock = self.request.query_params.get('low_stock')
        if low_stock == 'true':
            qs = [p for p in qs if p.is_low_stock]

        return qs

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class ProductDetailView(APIView):
    """
    GET   /api/v1/products/<id>/  — Retrieve a product
    PATCH /api/v1/products/<id>/  — Update a product
    """

    permission_classes = [IsAdminOrAbove]

    def get_object(self, request, pk):
        return Product.objects.filter(
            tenant=request.user.tenant, pk=pk
        ).first()

    @extend_schema(responses={200: ProductSerializer})
    def get(self, request, pk):
        product = self.get_object(request, pk)
        if not product:
            return Response(
                {'error': 'Product not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(ProductSerializer(product).data)

    @extend_schema(request=CreateProductSerializer, responses={200: ProductSerializer})
    def patch(self, request, pk):
        product = self.get_object(request, pk)
        if not product:
            return Response(
                {'error': 'Product not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = CreateProductSerializer(
            product, data=request.data, partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(ProductSerializer(product).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InventoryMovementListView(generics.ListAPIView):
    """
    GET /api/v1/inventory/movements/ — List all inventory movements
    """

    serializer_class = InventoryMovementSerializer
    permission_classes = [IsAdminOrAbove]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return InventoryMovement.objects.none()
        return InventoryMovement.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('product', 'created_by')