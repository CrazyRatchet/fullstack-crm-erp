# invoices/serializers.py
from rest_framework import serializers
from invoices.models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    amount_due = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = Invoice
        fields = [
            'id',
            'customer',
            'customer_name',
            'sale',
            'status',
            'subtotal',
            'tax_amount',
            'total',
            'amount_paid',
            'amount_due',
            'notes',
            'created_by',
            'created_by_email',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'customer',
            'sale',
            'subtotal',
            'tax_amount',
            'total',
            'amount_due',
            'created_by',
            'created_at',
            'updated_at',
        ]