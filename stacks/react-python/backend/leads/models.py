from django.db import models
from core.models import TimeStampedModel

class Lead(TimeStampedModel):
    """
    Represents an Lead (Possible client) 
    Inherits from TimeStampedModel, so it already has:
    id (UUID), created_at, updated_at
    """
    
    class Stage(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        PROPOSAL_SENT = "proposal_sent", "Proposal Sent"
        NEGOTIATION = "negotiation", "Negotiation"
        WON = "won", "Won"
        LOST = "lost", "Lost"
    
    title = models.CharField(max_length=255)
    value = models.DecimalField(max_digits=12, decimal_places=2)
    
    stage = models.CharField(
        max_length=20,
        choices=Stage.choices,
        default=Stage.NEW,
    )
    
    expected_close_date = models.DateField()
    
    # Foreign Keys
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="tenants_lead"
    )
    
    customer = models.ForeignKey(
        "customers.Customer",
        on_delete=models.CASCADE,  
        related_name="customers_lead"
    )
    
    assigned_to = models.ForeignKey(
        "users.User",
        null=True,
        on_delete=models.SET_NULL,
        verbose_name="Employee assigned",
        related_name="users_lead"
    )
    
    class Meta:
        db_table = "leads"
        ordering = ['-expected_close_date']

    def __str__(self):
        return self.title
    
    def has_stage(self, *stages) -> bool:
        # Check if the lead has any of the given stages
        return self.stage in stages