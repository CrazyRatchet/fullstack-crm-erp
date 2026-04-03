# contacts/serializers.py
from .models import Contact
from rest_framework import serializers

class ContactSerializer(serializers.ModelSerializer):
    """Read-only serializer for listing and retrieving customers."""
    
    class Meta:
        model = Contact
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'position',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
        
class ContactCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating contacts details."""
        
    class Meta:
        model = Contact
        fields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'position',
        ]