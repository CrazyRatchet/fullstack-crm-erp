# tenants/tests/test_models.py

import uuid

import pytest
from django.db import IntegrityError

from tenants.models import Tenant


@pytest.mark.django_db
def test_tenant_is_created_with_correct_values(tenant):
    """Check if the values are correct"""
    assert tenant.name == "Test Company"
    assert tenant.slug == "test-company"
    assert tenant.plan == "starter"


@pytest.mark.django_db
def test_tenant_id_is_valid_uuid(tenant):
    """Check if the id of the tennat is valid"""
    try:
        uuid.UUID(str(tenant.id))
    except ValueError:
        "There is a mistake"


@pytest.mark.django_db
def test_tenant_timestamps_are_set_automatically(tenant):
    """Check if the tenant timestamps are set autmotically"""
    assert tenant.created_at is not None
    assert tenant.updated_at is not None


@pytest.mark.django_db
def test_tenant_slug_must_be_unique():
    """Check if the slug is unique"""
    Tenant.objects.create(name="First", slug="first-slug")
    with pytest.raises(IntegrityError):
        Tenant.objects.create(name="NotFirst", slug="first-slug")


@pytest.mark.django_db
def test_tenant_str_representation(tenant):
    """Check if the format is correc"""
    assert str(tenant) == "Test Company (test-company)"


@pytest.mark.django_db
def test_tenant_is_active_by_default():
    """Check if the created tenant is active"""
    new_tenant = Tenant.objects.create(name="Second", slug="second-slug")
    assert new_tenant.is_active is True
