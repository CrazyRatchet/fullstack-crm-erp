# dashboard/views

from customers.models import Customer
from leads.models import Lead
from rest_framework import status, generics
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django.db.models import Sum

class DashboardView(generics.GenericAPIView):
    """
    Endpoint for Dashboard
    GET 
    """
    
    permission_classes= []
    
    def get(self, request, *args, **kwargs):
        tenant = request.user.tenant
        
        total_customers = Customer.objects.filter(tenant=tenant).count()
        
        # Calcula leads por stage
        active_leads = {}
        for stage in Lead.Stage:
            active_leads[stage.value] = Lead.objects.filter(tenant=tenant, stage=stage).count()
        
        # Suma el valor total de todos los leads
        total_value = Lead.objects.filter(tenant=tenant).aggregate(Sum('value'))['value__sum'] or 0
        
        return Response({
            "total_customers": total_customers,
            "active_leads": active_leads,
            "leads_total_value": str(total_value),
        })