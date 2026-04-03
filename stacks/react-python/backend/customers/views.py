# customers/views.py

from drf_spectacular.utils import extend_schema
from customers.serializers import CustomerSerializer, CustomerCreateUpdateSerializer
from rest_framework import status, generics
from rest_framework.response import Response
from .models import Customer
from core.services import AuditService
from core.models import AuditLog
# Create your views here.

class CustomerListCreateView(generics.ListCreateAPIView):
    """
    Endpoint for Creation of Customer
    And List all customers
    GET and POST /api/v1/customers/
    """
    
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()
    permission_classes = []
    @extend_schema(
        request = CustomerCreateUpdateSerializer,
        responses={201: CustomerCreateUpdateSerializer},
    )

    def get_queryset(self):
        """
        List all customers with optional filters.
        """
        from django.db.models import Q

        # Return empty queryset for schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Customer.objects.none()
        queryset = super().get_queryset()
        
        # Search by name or email
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(email__icontains=search)
            )

        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset
    
    def post(self, request):
        """
        Create Customer
        """
        
        serializer = CustomerCreateUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            customer = serializer.save(tenant=request.user.tenant)
            AuditService.log(
                action=AuditLog.Action.REGISTER,
                request=request,
                user=request.user,
                metadata={'email': customer.email, 'tenant': customer.tenant},
            )
            return Response(
                {
                    "message": "Customer registered succesfully",
                    "customer": CustomerSerializer(customer).data,
                },
                status=status.HTTP_201_CREATED,
            ) 
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        

class CustomerDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update specific customer.
    GET and PATCH /api/v1/customers/<uuid>/
    """
    
    http_method_names = ['get', 'patch', 'head', 'options']
    permission_classes = []
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    
    @extend_schema(responses={200: CustomerSerializer})
    def get_object(self):
        return super().get_object()
    
    @extend_schema(request=CustomerCreateUpdateSerializer, responses={200:CustomerSerializer})
    def get(self, request, *args, **kwargs):
        customer = self.get_object()
        serializer = CustomerSerializer(customer)
        return Response(serializer.data)
    
    @extend_schema(request=CustomerCreateUpdateSerializer, responses={200:CustomerCreateUpdateSerializer})
    def patch(self, request, *args, **kwargs):
        customer = self.get_object()
        serializer = CustomerCreateUpdateSerializer(customer, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            action = (AuditLog.Action.CUSTOMER_UPDATED)
            AuditService.log(
                action=action,
                request=request,
                user=request.user,
                metadata={'updated_customer': customer.email, 'changes': request.data},
            )
            return Response({"customer": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeactivateCustomerView(generics.GenericAPIView):
    """
    Deactivate a customer account.
    POST /api/v1/customers/<uuid>/deactivate/
    """
    permission_classes = []

    queryset = Customer.objects.all()
    
    @extend_schema(request=CustomerCreateUpdateSerializer, responses={200: CustomerSerializer})
    def post(self, request, pk, *args, **kwargs):
        # Get customer within the same tenant
        customer = self.get_object()

        # Prevent deactivating yourself
        if customer == request.user:
            return Response(
                {'error': 'You cannot deactivate your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        customer.is_active = False
        customer.save()
        AuditService.log(
            action=AuditLog.Action.CUSTOMER_DEACTIVATED,
            request=request,
            user=request.user,
            metadata={'deactivated_customer_email': customer.email},
        )
        return Response(
            {'message': f'Customer {customer.email} has been deactivated.'},
            status=status.HTTP_200_OK,
        )