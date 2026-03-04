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
