# core/tests/test_health.py

from unittest.mock import patch

import pytest


@pytest.mark.django_db
def test_health_returns_200(client):
    """Healthy system must return 200."""
    response = client.get("/health/")
    assert response.status_code == 200


@pytest.mark.django_db
def test_health_response_structure(client):
    """Response must always contain status and services fields."""
    data = client.get("/health/").json()
    assert "status" in data
    assert "services" in data
    assert "database" in data["services"]
    assert "cache" in data["services"]


@pytest.mark.django_db
def test_health_status_is_healthy(client):
    """When everything is ok, status must be 'healthy'."""
    data = client.get("/health/").json()
    assert data["status"] == "healthy"
    assert data["services"]["database"] == "ok"
    assert data["services"]["cache"] == "ok"


@pytest.mark.django_db
def test_health_no_authentication_required(client):
    """
    Health check must be accessible without authentication.
    Docker and load balancers call this endpoint without credentials.
    """
    response = client.get("/health/")
    assert response.status_code != 401


@pytest.mark.django_db
@patch("django.db.connection.ensure_connection", side_effect=Exception("DB down"))
def test_health_returns_503_when_db_fails(_mock, client):
    """When the database is down, must return 503 and status unhealthy."""
    response = client.get("/health/")
    assert response.status_code == 503
    assert response.json()["status"] == "unhealthy"
    assert response.json()["services"]["database"] == "error"
