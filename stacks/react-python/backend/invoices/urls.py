#invoices/urls.py
from django.urls import path
from invoices.views import (
    InvoiceListView,
    InvoiceDetailView,
)

urlpatterns = [
    path('invoices/', InvoiceListView.as_view(), name='invoice-list'),
    path('invoices/<uuid:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
]