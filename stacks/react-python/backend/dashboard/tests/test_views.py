# dashboard/tests/test_views.py

import pytest

@pytest.mark.django_db
def test_dashboard_returns_correct_structure(authenticated_client):
    response = authenticated_client.get('/api/v1/dashboard/')
    assert response.status_code == 200
    assert 'total_customers' in response.data
    assert 'active_leads' in response.data
    assert 'leads_total_value' in response.data
    
@pytest.mark.django_db
def test_dashboard_returns_correct_data(authenticated_client, customer, lead):
    response = authenticated_client.get('/api/v1/dashboard/')
    assert response.status_code == 200
    assert response.data["total_customers"] == 1
    assert response.data["active_leads"]["new"] == 1  

    
@pytest.mark.django_db
def test_dashboard_returns_zeros_when_no_data(authenticated_client):
    response = authenticated_client.get('/api/v1/dashboard/')
    assert response.status_code == 200
    assert response.data["total_customers"] == 0
    assert response.data["active_leads"]["new"] == 0