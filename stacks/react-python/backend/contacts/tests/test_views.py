# contacts/tests/test_views

import pytest

@pytest.mark.django_db
def test_list_contacts(authenticated_client, contact):
    response = authenticated_client.get(f'/api/v1/customers/{contact.customer.id}/contacts/')
    assert response.status_code == 200

@pytest.mark.django_db
def test_create_contact(authenticated_client, customer, tenant):
    response = authenticated_client.post(
        f'/api/v1/customers/{customer.id}/contacts/',
        {"first_name": "Carlitos", "last_name": "Rodriguinio", "email": "cr12@example.com", "phone": "123456789", "position": "madmen"},
        format="json"
    )
    assert response.status_code == 201
    assert response.data["contact"]["first_name"] == "Carlitos"
    assert response.data["contact"]["email"] == "cr12@example.com"

@pytest.mark.django_db
def test_create_contact_failed(authenticated_client, customer):
    response = authenticated_client.post(f'/api/v1/customers/{customer.id}/contacts/')
    assert response.status_code == 400

@pytest.mark.django_db
def test_detail_contact_view(authenticated_client, contact):
    response = authenticated_client.get(f'/api/v1/contacts/{contact.id}/')
    assert response.status_code == 200

@pytest.mark.django_db
def test_detail_contact_patch(authenticated_client, contact):
    response = authenticated_client.patch(
        f'/api/v1/contacts/{contact.id}/',
        {"first_name": "Carlos"},
        format="json"
    )
    assert response.status_code == 200
    assert response.data["contact"]["first_name"] == "Carlos"