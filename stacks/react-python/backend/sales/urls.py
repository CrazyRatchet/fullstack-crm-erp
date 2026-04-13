# sales/urls.py
from django.urls import path
from sales.views import (
    SaleDetailView,
    SaleListView,
)

urlpatterns = [
    path('sales/', SaleListView.as_view(), name='sale-list'),
    path('sales/<uuid:pk>/', SaleDetailView.as_view(), name='sale-detail'),
]