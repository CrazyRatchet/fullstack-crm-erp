# inventory/serializers.py
from rest_framework import serializers
from inventory.models import Product, InventoryMovement


class ProductSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'sku',
            'name',
            'description',
            'category',
            'price',
            'cost',
            'stock',
            'low_stock_threshold',
            'is_low_stock',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'is_low_stock', 'created_at', 'updated_at']


class CreateProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'sku',
            'name',
            'description',
            'category',
            'price',
            'cost',
            'stock',
            'low_stock_threshold',
        ]

    def validate_sku(self, value):
        request = self.context.get('request')
        # SKU must be unique per tenant
        if Product.objects.filter(
            sku=value, tenant=request.user.tenant
        ).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError('A product with this SKU already exists.')
        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError('Price cannot be negative.')
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError('Stock cannot be negative.')
        return value


class InventoryMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)

    class Meta:
        model = InventoryMovement
        fields = [
            'id',
            'product',
            'product_name',
            'movement_type',
            'reason',
            'quantity',
            'stock_before',
            'stock_after',
            'notes',
            'sale',
            'created_by',
            'created_by_email',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'stock_before',
            'stock_after',
            'created_by',
            'created_at',
        ]