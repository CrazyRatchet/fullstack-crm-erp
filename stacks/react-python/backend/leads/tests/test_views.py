# leads/tests/test_views

import pytest

@pytest.mark.django_db
def test_list_leads(authenticated_client):
    response = authenticated_client.get(f'/api/v1/leads/')
    assert response.status_code == 200
    
@pytest.mark.django_db
def test_create_lead(authenticated_client, lead):
    response = authenticated_client.post(
        f'/api/v1/leads/',
        {"title": "BlackRock", "value": 23454.43, "stage":"new", "expected_close_date": "2027-05-12", "customer": str(lead.customer_id)},
        format="json"
    )
    assert response.status_code == 201
    assert response.data["lead"]["title"] == "BlackRock"
    assert response.data["lead"]["value"] == "23454.43"
    
@pytest.mark.django_db
def test_create_lead_failed(authenticated_client):
    response = authenticated_client.post(f'/api/v1/leads/')
    assert response.status_code == 400
    

@pytest.mark.django_db
def test_create_lead_bad_expected_date(authenticated_client):
    response = authenticated_client.post(
        f'/api/v1/leads/',
        {"title": "BlackRocky", "value": 23454.43, "stage":"new", "expected_close_date": "2015-05-12"},
        format="json"
    )
    assert response.status_code == 400

@pytest.mark.django_db
def test_detail_lead_view(authenticated_client, lead):
    response = authenticated_client.get(f'/api/v1/leads/{lead.id}/')
    assert response.status_code == 200


@pytest.mark.django_db
def test_detail_lead_patch(authenticated_client, lead):
    response = authenticated_client.patch(
        f'/api/v1/leads/{lead.id}/',
        {"title": "Blac_Rock"},
        format="json"
    )
    assert response.status_code == 200
    assert response.data["lead"]["title"] == "Blac_Rock"