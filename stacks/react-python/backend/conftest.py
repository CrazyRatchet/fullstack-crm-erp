# conftest.py

import pytest
from django.contrib.auth import get_user_model
from customers.models import Customer
from tenants.models import Tenant
from contacts.models import Contact

User = get_user_model()


@pytest.fixture
def tenant(db):
    """
    Creates a test tenant available to any test that requests it.

    The 'db' parameter is a built-in pytest-django fixture that
    gives the test access to the database. Any fixture that needs
    DB access must receive 'db' as a parameter.

    Usage in a test:
        def test_something(tenant):
            assert tenant.name == "Test Company"
    """
    return Tenant.objects.create(
        name="Test Company", slug="test-company", plan="starter"
    )


@pytest.fixture
def user(db, tenant):
    """
    Creates a test user linked to the test tenant.

    Receives 'tenant' as parameter — pytest injects it automatically.

    Usage in a test:
        def test_something(user):
            assert user.tenant.slug == "test-company"
    """

    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="TestPass123!",
        tenant=tenant,
    )


@pytest.fixture
def admin_user(db):
    """
    Creates a system superuser with no tenant.

    Usage in a test:
        def test_something(admin_user):
            assert admin_user.is_superuser is True
    """

    return User.objects.create_superuser(
        username="admin",
        email="admin@system.com",
        password="AdminPass123!",
        tenant=None,
    )


@pytest.fixture
def api_client():
    """
    Provides an HTTP client to make requests to the API in tests.

    Usage in a test:
        def test_something(api_client):
            response = api_client.get('/health/')
            assert response.status_code == 200
    """

    from rest_framework.test import APIClient

    return APIClient()


@pytest.fixture
def authenticated_client(api_client, user):
    """
    Provides an HTTP client already authenticated as 'user'.

    Usage in a test:
        def test_private_endpoint(authenticated_client):
            response = authenticated_client.get('/api/v1/something/')
            assert response.status_code == 200
    """
    api_client.force_authenticate(user=user)
    return api_client

@pytest.fixture
def customer(db, tenant):
    """
    Creates a test customer linked to the test tenant.
    """
    return Customer.objects.create(
        name="Test Corp",
        email="contact@testcorp.com",
        phone="12345678",
        address="123 Test St",
        tenant=tenant,
    )
    
@pytest.fixture
def contact(db, tenant, customer):
    """
    Creates a test contact linked to the test tenant.
    """
    return Contact.objects.create(
        first_name="Carlos",
        last_name="Rodriguez",
        email="carlitosrodriguito@example.com",
        phone="123456789",
        position="madmen",
        tenant=tenant,
        customer=customer
    )