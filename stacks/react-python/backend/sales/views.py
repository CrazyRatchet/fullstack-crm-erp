# sales/views.py
import logging

from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import AuditLog
from core.services import AuditService
from quotations.models import Quotation
from sales.models import Sale
from sales.serializers import SaleSerializer
from users.permissions import IsAdminOrAbove
from invoices.models import Invoice
from inventory.models import Product, InventoryMovement

logger = logging.getLogger(__name__)


class SaleListView(generics.ListAPIView):
    """
    GET /api/v1/sales/ — List all sales for the tenant
    """

    serializer_class = SaleSerializer
    permission_classes = [IsAdminOrAbove]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Sale.objects.none()
        qs = Sale.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('customer', 'quotation', 'created_by')

        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        return qs


class SaleDetailView(APIView):
    """
    GET /api/v1/sales/<id>/ — Retrieve a sale
    """

    permission_classes = [IsAdminOrAbove]

    def get_object(self, request, pk):
        return Sale.objects.filter(
            tenant=request.user.tenant, pk=pk
        ).select_related('customer', 'quotation', 'created_by').first()

    @extend_schema(responses={200: SaleSerializer})
    def get(self, request, pk):
        sale = self.get_object(request, pk)
        if not sale:
            return Response({'error': 'Sale not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = SaleSerializer(sale)
        return Response(serializer.data)


class QuotationConvertView(APIView):
    """
    POST /api/v1/quotations/<id>/convert/
    Converts an approved quotation into a sale.
    Only approved quotations can be converted.
    """

    permission_classes = [IsAdminOrAbove]

    def post(self, request, pk):
        quotation = Quotation.objects.filter(
            tenant=request.user.tenant, pk=pk
        ).first()

        if not quotation:
            return Response(
                {'error': 'Quotation not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if quotation.status != Quotation.Status.APPROVED:
            return Response(
                {'error': 'Only approved quotations can be converted to sales.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if already converted
        if hasattr(quotation, 'sale'):
            return Response(
                {'error': 'This quotation has already been converted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create the sale from the quotation
        sale = Sale.objects.create(
            tenant=request.user.tenant,
            customer=quotation.customer,
            quotation=quotation,
            created_by=request.user,
            subtotal=quotation.subtotal,
            tax_amount=quotation.tax_amount,
            total=quotation.total,
        )

        # Update quotation status to converted
        quotation.status = Quotation.Status.CONVERTED
        quotation.save()

        # Auto-generate invoice on conversion
        Invoice.objects.create(
            tenant=request.user.tenant,
            customer=quotation.customer,
            sale=sale,
            created_by=request.user,
            subtotal=quotation.subtotal,
            tax_amount=quotation.tax_amount,
            total=quotation.total,
        )

        # Update inventory for each quotation item
        for item in quotation.items.all():
            # Try to find a matching product by description
            # In a real system this would link by product FK
            pass

        # Update lead stage to won if linked
        if quotation.lead:
            quotation.lead.stage = 'won'
            quotation.lead.save()

        AuditService.log(
            action=AuditLog.Action.USER_CREATED,
            request=request,
            user=request.user,
            metadata={
                'quotation_id': str(quotation.id),
                'sale_id': str(sale.id),
                'action': 'converted',
            },
        )

        return Response(SaleSerializer(sale).data, status=status.HTTP_201_CREATED)