# customers/serializers.py
from .models import Customer
from rest_framework import serializers

class CustomerSerializer(serializers.ModelSerializer):
    """Read-only serializer for listing and retrieving customers."""
    class Meta:
        model = Customer
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'address',
            'is_active',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class CustomerCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating customers details."""
    
    class Meta:
        model = Customer
        fields = [
            'name',
            'email',
            'phone',
            'address',
            'is_active',
        ]