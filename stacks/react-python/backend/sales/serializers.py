# sales/serializers.py
from rest_framework import serializers
from sales.models import Sale
from quotations.serializers import QuotationSerializer


class SaleSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    quotation_detail = QuotationSerializer(source='quotation', read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id',
            'customer',
            'customer_name',
            'quotation',
            'quotation_detail',
            'status',
            'subtotal',
            'tax_amount',
            'total',
            'notes',
            'created_by',
            'created_by_email',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'customer',
            'quotation',
            'subtotal',
            'tax_amount',
            'total',
            'created_by',
            'created_at',
            'updated_at',
        ]