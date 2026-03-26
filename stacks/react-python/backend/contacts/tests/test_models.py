# contacts/tests/test_models

import pytest

@pytest.mark.django_db
def test_contact_is_linked_to_tenant(contact, tenant):
    """Check if the contact is linked to a tenant"""
    assert contact.tenant==tenant
    
@pytest.mark.django_db
def test_contact_is_linked_to_customer(contact, customer):
    """Check if the contact is linked to a customer"""
    assert contact.customer==customer
    
@pytest.mark.django_db
def test_contact_str_returns_name(contact):
    """Check that __str__ returns the name"""
    assert str(contact) == f"{contact.first_name} {contact.last_name}"
    
@pytest.mark.django_db
def test_contact_email_tenant_must_be_unique(tenant, customer):
    """Check that email with tenant must be unique"""
    from contacts.models import Contact
    from django.db import IntegrityError
    
    Contact.objects.create(
        first_name="Juan",
        last_name="Perez",
        email="juan@example.com",
        phone="123456789",
        position="CEO",
        tenant=tenant,
        customer=customer
    )
    with pytest.raises(IntegrityError):
        Contact.objects.create(
            first_name="Pedro",
            last_name="Garcia",
            email="juan@example.com",
            phone="987654321",
            position="CTO",
            tenant=tenant,
            customer=customer
        )