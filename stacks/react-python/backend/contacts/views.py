# contacts/views.py

from drf_spectacular.utils import extend_schema
from contacts.serializers import ContactSerializer, ContactCreateUpdateSerializer
from rest_framework import status, generics
from rest_framework.response import Response
from .models import Contact
from core.services import AuditService
from core.models import AuditLog

class ContactListCreateView(generics.ListCreateAPIView):
    """
    Endpoint for Creation of a Contact
    And List all contacts
    GET and POST /api/v1/customers/<uuid>/contacts/
    """
    
    serializer_class = ContactSerializer
    queryset = Contact.objects.all()
    permission_classes = []
    @extend_schema(
        request = ContactCreateUpdateSerializer,
        responses={201:ContactCreateUpdateSerializer},
    )
    
    def get_queryset(self):
        """List all contacts with optional filters."""
        
        from django.db.models import Q
        
        #Return empty queryset from schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Contact.objects.none()
        queryset = super().get_queryset()
        
        # Search by first, last name and email
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) | Q(last_name__icontains=search) | Q(email__icontains=search) 
            )
        return queryset
    
    def post(self, request, customer_pk, *args, **kwargs):
        """Create Contact"""
        
        serializer = ContactCreateUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            contact = serializer.save(tenant=request.user.tenant, customer_id=self.kwargs['customer_pk'])
            AuditService.log(
                action=AuditLog.Action.REGISTER,
                request=request,
                user=request.user,
                metadata={'email': contact.email, 'tenant': contact.tenant},
            ),
            return Response(
                {
                    "message": "Contact registered succesfully",
                    "contact": {
                        "id": str(contact.id),
                        "first_name": contact.first_name,
                        "last_name": contact.last_name,
                        "email": contact.email,
                    },
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
    
class ContactDetailView (generics.RetrieveUpdateAPIView):
    """
    Retrieve or update specific contact information.
    GET and PATCH /api/v1/contacts/<uuid>/
    """
    
    http_method_names = ['get', 'patch', 'head', 'options']
    permission_classes = []
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    
    @extend_schema(request={200: ContactSerializer})
    def get_object(self):
        return super().get_object()
    
    @extend_schema(request=ContactCreateUpdateSerializer, responses={200:ContactSerializer})
    def get(self, request, *args, **kwargs):
        contact = self.get_object()
        serializer = ContactSerializer(contact)
        return Response(serializer.data)

    @extend_schema(request=ContactCreateUpdateSerializer, responses={200:ContactCreateUpdateSerializer})
    def patch(self, request, *args, **kwargs):
        contact = self.get_object()
        serializer = ContactCreateUpdateSerializer(contact, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            action = (AuditLog.Action.CONTACT_UPDATED)
            AuditService.log(
                action=action,
                request=request,
                user=request.user,
                metadata={'updated_contact': contact.email, 'changes': request.data},
            )
            return Response({"contact": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
