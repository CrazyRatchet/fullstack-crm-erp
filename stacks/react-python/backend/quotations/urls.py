# quotations/urls.py
from django.urls import path
from quotations.views import (
    QuotationListCreateView,
    QuotationDetailView,
    QuotationApproveView,
    QuotationRejectView,
)
from sales.views import QuotationConvertView

urlpatterns = [
    path('quotations/', QuotationListCreateView.as_view(), name='quotation-list'),
    path('quotations/<uuid:pk>/', QuotationDetailView.as_view(), name='quotation-detail'),
    path('quotations/<uuid:pk>/approve/', QuotationApproveView.as_view(), name='quotation-approve'),
    path('quotations/<uuid:pk>/reject/', QuotationRejectView.as_view(), name='quotation-reject'),
    path('quotations/<uuid:pk>/convert/', QuotationConvertView.as_view(), name='quotation-convert'),
]