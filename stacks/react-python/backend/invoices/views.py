# invoices/views.py
import logging

from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from invoices.models import Invoice
from invoices.serializers import InvoiceSerializer
from users.permissions import IsAdminOrAbove

logger = logging.getLogger(__name__)


class InvoiceListView(generics.ListAPIView):
    """
    GET /api/v1/invoices/ — List all invoices for the tenant
    """

    serializer_class = InvoiceSerializer
    permission_classes = [IsAdminOrAbove]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='status',
                description='Filter by invoice status',
                required=False,
                type=str,
                enum=['pending', 'paid', 'overdue', 'cancelled'],
            )
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Invoice.objects.none()
        qs = Invoice.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('customer', 'sale', 'created_by')

        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        return qs


class InvoiceDetailView(APIView):
    """
    GET /api/v1/invoices/<id>/ — Retrieve an invoice
    """

    permission_classes = [IsAdminOrAbove]

    def get_object(self, request, pk):
        return Invoice.objects.filter(
            tenant=request.user.tenant, pk=pk
        ).select_related('customer', 'sale', 'created_by').first()

    @extend_schema(responses={200: InvoiceSerializer})
    def get(self, request, pk):
        invoice = self.get_object(request, pk)
        if not invoice:
            return Response(
                {'error': 'Invoice not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data)