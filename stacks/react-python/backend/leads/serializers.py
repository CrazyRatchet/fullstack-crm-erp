# leads/serializers.py

from .models import Lead
from customers.models import Customer
from users.models import User
from rest_framework import serializers
from datetime import date

class CustomerSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name']

class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email']

class LeadSerializer(serializers.ModelSerializer):
    """Read-only serializer for listing and retrieving customers."""
    
    customer = CustomerSummarySerializer(read_only=True)
    assigned_to = UserSummarySerializer(read_only=True)
    
    class Meta:
        model = Lead
        fields = [
            'id',
            'title',
            'value',
            'stage',
            'expected_close_date',
            'customer',
            'assigned_to',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
        
class LeadCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating leads details."""
    
    def validate_expected_close_date(self, value):
        if value < date.today():
            raise serializers.ValidationError("Expected close date cannot be in the past.")
        return value
    
    class Meta:
        model = Lead
        fields = [
            'title',
            'value',
            'stage',
            'expected_close_date',
            'customer',
            'assigned_to'
        ]
