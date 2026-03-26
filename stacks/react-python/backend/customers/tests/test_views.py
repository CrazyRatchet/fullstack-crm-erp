# customers/tests/test_views

import pytest

@pytest.mark.django_db
def test_list_customers(authenticated_client):
    response = authenticated_client.get('/api/v1/customers/')
    assert response.status_code == 200

@pytest.mark.django_db
def test_create_customer(authenticated_client, tenant):
    response = authenticated_client.post('/api/v1/customers/', {"name":"Test Corp4","email":"contact2@testcorp.com","phone":"12345678","address":"123 Test St","tenant":str(tenant.id)}, format="json")
    assert response.status_code == 201
    assert response.data["customer"]["name"] == "Test Corp4"
    assert response.data["customer"]["email"] == "contact2@testcorp.com"

@pytest.mark.django_db
def test_create_customer_failed(authenticated_client):
    response = authenticated_client.post('/api/v1/customers/')
    assert response.status_code == 400
    
@pytest.mark.django_db
def test_detail_customer_view(authenticated_client, customer):
    response = authenticated_client.get(f'/api/v1/customers/{customer.id}/')
    assert response.status_code == 200

@pytest.mark.django_db
def test_detail_customer_patch(authenticated_client, customer):
    response = authenticated_client.patch(f'/api/v1/customers/{customer.id}/', {"name": "Updated Corp"}, format="json")
    assert response.status_code == 200
    assert response.data["customer"]["name"] == "Updated Corp"
    
@pytest.mark.django_db
def test_deactivate_customer(authenticated_client, customer):
    response = authenticated_client.post(f'/api/v1/customers/{customer.id}/deactivate/')
    assert response.status_code == 200
    
