from django.db import models

from core.models import TimeStampedModel

# Create your models here.


class Tenant(TimeStampedModel):
    """
    Represents a company or organization within the system.

    Multi-tenancy with shared schema means:
    - One single database for all tenants
    - Every record has a tenant reference
    - Queries automatically filter by tenant
    - A user from Company A NEVER sees data from Company B

    Inherits from TimeStampedModel, so it already has:
    id (UUID), created_at, updated_at
    """

    name = models.CharField(max_length=255, verbose_name="Company name")

    slug = models.SlugField(
        unique=True,
        max_length=100,
        help_text="Unique URL-friendly identifier. E.g: 'company-abc'",
    )

    is_active = models.BooleanField(
        default=True, help_text="Inactive tenants cannot log in to the system"
    )

    plan = models.CharField(
        max_length=50,
        choices=[
            ("free", "Free"),
            ("starter", "Starter"),
            ("professional", "Professional"),
            ("enterprise", "Enterprise"),
        ],
        default="free",
    )

    class Meta:
        db_table = "tenants"
        verbose_name = "Company"
        verbose_name_plural = "Companies"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.slug})"
