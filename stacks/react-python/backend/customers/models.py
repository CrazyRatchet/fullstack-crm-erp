# customers/models
from django.db import models
from core.models import TimeStampedModel

class Customer(TimeStampedModel):
    """
    Represents an Customer (Company) 
    Inherits from TimeStampedModel, so it already has:
    id (UUID), created_at, updated_at
    """
    
    name = models.CharField(max_length=100, verbose_name="Company name")
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    
    # Foreign Key
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="customers",
    )
    
    class Meta:
        db_table = "customers"
        unique_together = [["email", "tenant"]]
        ordering = ['-created_at']
        
    def __str__(self):
        return self.name