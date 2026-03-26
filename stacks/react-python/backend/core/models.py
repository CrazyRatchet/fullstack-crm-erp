# core/models.py

import uuid

from django.db import models


class TimeStampedModel(models.Model):
    """
    Abstract base model inherited by all models in the project.

    Why UUID instead of auto-increment integer?
    - Cannot guess the previous or next record ID
    - Safe to expose in public API URLs
    - Allows generating IDs on the client before saving to the server

    Why abstract = True?
    - Django does NOT create a table for this model
    - It only exists so other models can inherit its fields
    - Every model that inherits this gets: id, created_at, updated_at
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class AuditLog(TimeStampedModel):
    """
    Records important actions performed by users in the system.

    Why store audit logs in the database?
    - Queryable and filterable by authorized users
    - Survives server restarts unlike in-memory logs
    - Required for compliance and accountability

    Note: user and tenant are nullable to support system-level
    actions that occur before or outside of user context.
    """

    class Action(models.TextChoices):
        # Auth actions
        LOGIN_SUCCESS = 'login_success', 'Login Success'
        LOGIN_FAILED = 'login_failed', 'Login Failed'
        LOGOUT = 'logout', 'Logout'
        REGISTER = 'register', 'Register'
        # User management actions
        USER_CREATED = 'user_created', 'User Created'
        USER_UPDATED = 'user_updated', 'User Updated'
        USER_DEACTIVATED = 'user_deactivated', 'User Deactivated'
        ROLE_CHANGED = 'role_changed', 'Role Changed',
        # Customer actions
        CUSTOMER_UPDATED = 'customer_updated', 'Customer Updated'
        CUSTOMER_DEACTIVATED = 'customer_deactivated', 'Customer Deactivated'
        # Contact action
        CONTACT_UPDATED = 'contact_updated', 'Contact Updated'

    # Who performed the action (null if system or anonymous)
    user = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
    )

    # Which tenant this action belongs to
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
    )

    action = models.CharField(max_length=50, choices=Action.choices)

    # IP address of the request
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    # Additional context about the action
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.action} by {self.user} at {self.created_at}'