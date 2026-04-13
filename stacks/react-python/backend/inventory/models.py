# inventory/models.py
from django.db import models
from core.models import TimeStampedModel


class Product(TimeStampedModel):
    """
    Represents a product or service in the inventory.
    """

    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='products',
    )

    sku = models.CharField(max_length=100)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)

    # Pricing
    price = models.DecimalField(max_digits=12, decimal_places=2)
    cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Stock
    stock = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(
        default=5,
        help_text='Alert when stock falls below this level',
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'products'
        unique_together = [['sku', 'tenant']]
        ordering = ['name']

    def __str__(self):
        return f'{self.sku} - {self.name}'

    @property
    def is_low_stock(self):
        return self.stock <= self.low_stock_threshold


class InventoryMovement(TimeStampedModel):
    """
    Records every stock change for audit and traceability.
    Every time stock changes, a movement is created.
    """

    class MovementType(models.TextChoices):
        IN = 'in', 'Stock In'
        OUT = 'out', 'Stock Out'
        ADJUSTMENT = 'adjustment', 'Adjustment'

    class Reason(models.TextChoices):
        SALE = 'sale', 'Sale'
        PURCHASE = 'purchase', 'Purchase'
        ADJUSTMENT = 'adjustment', 'Manual Adjustment'
        RETURN = 'return', 'Return'

    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='inventory_movements',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='movements',
    )
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='inventory_movements',
    )

    # Optional link to the sale that triggered this movement
    sale = models.ForeignKey(
        'sales.Sale',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inventory_movements',
    )

    movement_type = models.CharField(max_length=20, choices=MovementType.choices)
    reason = models.CharField(max_length=20, choices=Reason.choices)
    quantity = models.IntegerField()

    # Stock levels before and after the movement
    stock_before = models.IntegerField()
    stock_after = models.IntegerField()

    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'inventory_movements'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.movement_type} {self.quantity} x {self.product.name}'