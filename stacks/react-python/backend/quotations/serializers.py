# quotations/serializers.py
from rest_framework import serializers
from quotations.models import Quotation, QuotationItem


class QuotationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationItem
        fields = [
            'id',
            'description',
            'quantity',
            'unit_price',
            'tax_rate',
            'subtotal',
            'tax_amount',
            'total',
        ]
        read_only_fields = ['id', 'subtotal', 'tax_amount', 'total']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError('Quantity must be greater than zero.')
        return value

    def validate_unit_price(self, value):
        if value < 0:
            raise serializers.ValidationError('Unit price cannot be negative.')
        return value


class QuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    approved_by_email = serializers.CharField(
        source='approved_by.email', read_only=True, default=None
    )

    class Meta:
        model = Quotation
        fields = [
            'id',
            'customer',
            'customer_name',
            'lead',
            'status',
            'version',
            'notes',
            'subtotal',
            'tax_amount',
            'total',
            'items',
            'created_by',
            'created_by_email',
            'approved_by',
            'approved_by_email',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'status',
            'version',
            'subtotal',
            'tax_amount',
            'total',
            'created_by',
            'approved_by',
            'created_at',
            'updated_at',
        ]


class CreateQuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True)

    class Meta:
        model = Quotation
        fields = [
            'customer',
            'lead',
            'notes',
            'items',
        ]

    def validate_items(self, value):
        # At least one item is required
        if not value:
            raise serializers.ValidationError('At least one item is required.')
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        request = self.context.get('request')

        quotation = Quotation.objects.create(
            tenant=request.user.tenant,
            created_by=request.user,
            **validated_data,
        )

        # Create items and calculate totals
        subtotal = 0
        tax_amount = 0

        for item_data in items_data:
            item = QuotationItem(quotation=quotation, **item_data)
            item.calculate_totals()
            item.save()
            subtotal += item.subtotal
            tax_amount += item.tax_amount

        # Update quotation totals
        quotation.subtotal = subtotal
        quotation.tax_amount = tax_amount
        quotation.total = subtotal + tax_amount
        quotation.save()

        return quotation


class UpdateQuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True, required=False)

    class Meta:
        model = Quotation
        fields = ['notes', 'items']

    def validate(self, attrs):
        # Cannot edit a converted quotation
        if self.instance and self.instance.status == Quotation.Status.CONVERTED:
            raise serializers.ValidationError('Cannot edit a converted quotation.')
        return attrs

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        # Update notes
        instance.notes = validated_data.get('notes', instance.notes)

        if items_data is not None:
            # Delete existing items and recreate
            instance.items.all().delete()

            subtotal = 0
            tax_amount = 0

            for item_data in items_data:
                item = QuotationItem(quotation=instance, **item_data)
                item.calculate_totals()
                item.save()
                subtotal += item.subtotal
                tax_amount += item.tax_amount

            instance.subtotal = subtotal
            instance.tax_amount = tax_amount
            instance.total = subtotal + tax_amount

        instance.save()
        return instance