from django.urls import path
from inventory.views import (
    ProductListCreateView,
    ProductDetailView,
    InventoryMovementListView,
)

urlPatterns = [
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('products/<uuid:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('inventory/movements/', InventoryMovementListView.as_view(), name='inventory-movement-list-create'),
]