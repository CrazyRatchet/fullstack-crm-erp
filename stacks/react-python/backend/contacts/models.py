# contacts/models
from django.db import models
from core.models import TimeStampedModel

class Contact(TimeStampedModel):
    """
    Represents the Contact of the customers(Company)
    Inherits from TimeStampedModel, so it already has:
    id(UUID), created_at, updated_at
    """

    first_name = models.CharField(max_length=50, verbose_name="First name")
    last_name = models.CharField(max_length=50, verbose_name="Last name")
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    position = models.CharField(max_length=255)
    
    # Foreign Keys
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="tenants_contact",
        
    )
    
    customer = models.ForeignKey(
        "customers.Customer",
        on_delete=models.CASCADE,
        related_name="customers_contacts"
    )
    
    class Meta:
        db_table = "contacts"
        unique_together = [["email", "tenant"]]
        ordering = ['-last_name']
        
    def __str__(self):
        return f"{self.first_name} {self.last_name}"