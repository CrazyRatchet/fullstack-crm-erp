from django.contrib.auth.models import AbstractUser
from django.db import models

from core.models import TimeStampedModel


class User(AbstractUser, TimeStampedModel):
    class Role(models.TextChoices):
        SUPER_ADMIN = "super_admin", "Super Admin"
        BUSINESS_ADMIN = "business_admin", "Business Administrator"
        MANAGER = "manager", "Manager / Supervisor"
        SALESPERSON = "salesperson", "Salesperson"
        ER_OPERATOR = "erp_operator", "ERP Operator"
        BASIC_USER = "basic_user", "Basic User"

    email = models.EmailField(unique=True)

    # Using a string reference instead of importing Tenant directly
    # prevents circular import errors as the project grows
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
    )
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.URLField(blank=True)

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.BASIC_USER,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.email

    def has_role(self, *roles) -> bool:
        # Check if the user has any of the given roles
        return self.role in roles