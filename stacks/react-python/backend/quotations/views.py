# quotations/views.py
import logging

from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import AuditLog
from core.services import AuditService
from quotations.models import Quotation
from quotations.serializers import (
    CreateQuotationSerializer,
    QuotationSerializer,
    UpdateQuotationSerializer,
)
from users.permissions import IsAdminOrAbove, IsAdminOrManager
from drf_spectacular.utils import extend_schema, OpenApiParameter

logger = logging.getLogger(__name__)


@extend_schema(
    parameters=[
        OpenApiParameter(
            name='status',
            description='Filter by quotation status',
            required=False,
            type=str,
            enum=['draft', 'pending_approval', 'approved', 'rejected', 'converted'],
        )
    ]
)
class QuotationListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/quotations/  — List all quotations for the tenant
    POST /api/v1/quotations/  — Create a new quotation
    """

    permission_classes = [IsAdminOrAbove]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateQuotationSerializer
        return QuotationSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Quotation.objects.none()
        qs = Quotation.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('customer', 'created_by', 'approved_by')

        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        return qs

    def perform_create(self, serializer):
        quotation = serializer.save()
        AuditService.log(
            action=AuditLog.Action.USER_CREATED,
            request=self.request,
            user=self.request.user,
            metadata={'quotation_id': str(quotation.id)},
        )


class QuotationDetailView(APIView):
    """
    GET   /api/v1/quotations/<id>/  — Retrieve a quotation
    PATCH /api/v1/quotations/<id>/  — Update a quotation
    """

    permission_classes = [IsAdminOrAbove]

    def get_object(self, request, pk):
        return Quotation.objects.filter(
            tenant=request.user.tenant, pk=pk
        ).select_related('customer', 'created_by', 'approved_by').first()

    @extend_schema(responses={200: QuotationSerializer})
    def get(self, request, pk):
        quotation = self.get_object(request, pk)
        if not quotation:
            return Response({'error': 'Quotation not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = QuotationSerializer(quotation)
        return Response(serializer.data)

    @extend_schema(request=UpdateQuotationSerializer, responses={200: QuotationSerializer})
    def patch(self, request, pk):
        quotation = self.get_object(request, pk)
        if not quotation:
            return Response({'error': 'Quotation not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UpdateQuotationSerializer(
            quotation, data=request.data, partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(QuotationSerializer(quotation).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuotationApproveView(APIView):
    """
    POST /api/v1/quotations/<id>/approve/
    Approves a quotation — restricted to managers and admins.
    """

    permission_classes = [IsAdminOrManager]

    def post(self, request, pk):
        quotation = Quotation.objects.filter(
            tenant=request.user.tenant, pk=pk
        ).first()

        if not quotation:
            return Response({'error': 'Quotation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if quotation.status != Quotation.Status.DRAFT:
            return Response(
                {'error': 'Only draft quotations can be approved.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        quotation.status = Quotation.Status.APPROVED
        quotation.approved_by = request.user
        quotation.save()

        AuditService.log(
            action=AuditLog.Action.USER_UPDATED,
            request=request,
            user=request.user,
            metadata={'quotation_id': str(quotation.id), 'action': 'approved'},
        )

        return Response(QuotationSerializer(quotation).data)


class QuotationRejectView(APIView):
    """
    POST /api/v1/quotations/<id>/reject/
    Rejects a quotation — restricted to managers and admins.
    """

    permission_classes = [IsAdminOrManager]

    def post(self, request, pk):
        quotation = Quotation.objects.filter(
            tenant=request.user.tenant, pk=pk
        ).first()

        if not quotation:
            return Response({'error': 'Quotation not found.'}, status=status.HTTP_404_NOT_FOUND)

        if quotation.status != Quotation.Status.DRAFT:
            return Response(
                {'error': 'Only draft quotations can be rejected.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        quotation.status = Quotation.Status.REJECTED
        quotation.save()

        AuditService.log(
            action=AuditLog.Action.USER_UPDATED,
            request=request,
            user=request.user,
            metadata={'quotation_id': str(quotation.id), 'action': 'rejected'},
        )

        return Response(QuotationSerializer(quotation).data)