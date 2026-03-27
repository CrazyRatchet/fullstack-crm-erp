# leads/views.py

from drf_spectacular.utils import extend_schema
from leads.serializers import LeadSerializer, LeadCreateUpdateSerializer
from rest_framework import status, generics
from rest_framework.response import Response
from .models import Lead
from core.services import AuditService
from core.models import AuditLog

class LeadListCreateView(generics.ListCreateAPIView):
    """
    Endpoint for Creation of a Lead
    And List all leads
    GET and POST /api/v1/leads/
    """
    
    serializer_class = LeadSerializer
    queryset = Lead.objects.all()
    permission_classes = []
    @extend_schema(
        request = LeadCreateUpdateSerializer,
        responses={201: LeadCreateUpdateSerializer},
    )
    
    def get_queryset(self):
        """List all contacts with optional filters."""
        
        from django.db.models import Q
        
        # Return empty queryset from schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Lead.objects.none()
        
        queryset = super().get_queryset()
        
        # Search by title, stage, customer, assigned_to, expected_close_date
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(stage__icontains=search) | Q(customer__name__icontains=search) | Q(assigned_to__email__icontains=search) | Q(expected_close_date__icontains=search))
        
        return queryset
    
    def post(self, request, *args, **kwargs):
        """Create Lead"""
        
        serializer = LeadCreateUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            lead = serializer.save(tenant=request.user.tenant)
            AuditService.log(
                action=AuditLog.Action.REGISTER,
                request=request,
                user=request.user,
                metadata={'title': lead.title, 'tenant': str(lead.tenant_id)},
            ),
            return Response(
                {
                    "message": "Lead registered succesfully",
                    "lead": LeadSerializer(lead).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
    
class LeadDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update specific contact information.
    GET and PATCH /api/v1/leads/<uuid>/
    """
    
    http_method_names = ['get', 'patch', 'head', 'options']
    permission_classes = []
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    
    @extend_schema(request={200: LeadSerializer})
    def get_object(self):
        return super().get_object()
    
    @extend_schema(request=LeadCreateUpdateSerializer, responses={200:LeadSerializer})
    def get(self, request, *args, **kwargs):
        lead = self.get_object()
        serializer = LeadSerializer(lead)
        return Response(serializer.data)
    
    @extend_schema(request=LeadCreateUpdateSerializer, responses={200:LeadSerializer})
    def patch(self, request, *args, **kwargs):
        lead = self.get_object()
        serializer = LeadCreateUpdateSerializer(lead, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            action = (AuditLog.Action.LEAD_UPDATED)
            AuditService.log(
                action=action,
                request=request,
                user=request.user,
                metadata={'updated_lead': lead.title, 'changes': request.data},
            )
            return Response({"lead": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
