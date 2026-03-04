# users/tests/test_models
import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()


@pytest.mark.django_db
def test_user_is_linked_to_tenant(user, tenant):
    """Check if the user is linked to the tenant"""
    assert user.tenant == tenant


@pytest.mark.django_db
def test_tenant_users_reverse_relation(user, tenant):
    """Check if the user appears in tenant.users"""
    assert user in tenant.users.all()


@pytest.mark.django_db
def test_superuser_can_have_no_tenant(admin_user):
    """Check if the superuser doesn't need a tenant"""
    assert admin_user.tenant is None
    assert admin_user.is_superuser is True


@pytest.mark.django_db
def test_user_str_returns_email(user):
    """Check that __str__ returns the email"""
    assert str(user) == user.email


@pytest.mark.django_db
def test_user_email_must_be_unique(tenant):
    """Check that email must be unique"""
    User.objects.create_user(
        username="testuser2",
        email="test1@example.com",
        password="TestPass123!",
        tenant=tenant,
    )
    with pytest.raises(IntegrityError):
        User.objects.create_user(
            username="testuser3",
            email="test1@example.com",
            password="TestPass123!",
            tenant=tenant,
        )
