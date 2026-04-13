# sales/models.py
from django.db import models
from core.models import TimeStampedModel


class Sale(TimeStampedModel):
    """
    Represents a confirmed sale generated from an approved quotation.
    When a quotation is converted, a Sale is automatically created.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'
        OVERDUE = 'overdue', 'Overdue'
        CANCELLED = 'cancelled', 'Cancelled'

    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='sales',
    )
    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.CASCADE,
        related_name='sales',
    )
    quotation = models.OneToOneField(
        'quotations.Quotation',
        on_delete=models.PROTECT,
        related_name='sale',
    )
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='sales_created',
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    # Totals copied from quotation at conversion time
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)

    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'sales'
        ordering = ['-created_at']

    def __str__(self):
        return f'Sale #{self.id} - {self.customer.name}'