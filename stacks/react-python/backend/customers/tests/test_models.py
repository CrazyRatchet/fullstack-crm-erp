# customers/tests/test_models

import pytest
from customers.models import Customer
from django.db import IntegrityError

@pytest.mark.django_db
def test_customer_is_linked_to_tenant(customer, tenant):
    """Check if the customer is linked to a tenant"""
    assert customer.tenant ==tenant
    
@pytest.mark.django_db
def test_customer_str_returns_name(customer):
    """Check that __str__ returns the name"""
    assert str(customer) == customer.name

@pytest.mark.django_db
def test_customer_email_tenant_must_be_unique(tenant):
    """Check that email with tenant must be unique"""
    Customer.objects.create(
        name = "Test Corp",
        email = "contact1@testcorp.com",
        phone="12345678",
        address= "123 Test St",
        tenant=tenant,
    )
    with pytest.raises(IntegrityError):
        Customer.objects.create(
        name = "Test2 Corp",
        email = "contact1@testcorp.com",
        phone="12345678",
        address= "123 Test St",
        tenant=tenant,
    )