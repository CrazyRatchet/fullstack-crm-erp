# leads/tests/test_models

import pytest

@pytest.mark.django_db
def test_lead_is_linked_to_tenant(lead, tenant):
    """Check if the lead is linked to a tenant"""
    assert lead.tenant==tenant
    
@pytest.mark.django_db
def test_lead_is_linked_to_cutomer(lead, customer):
    """Check if the lead is linked to a company"""
    assert lead.customer==customer
    
@pytest.mark.django_db
def test_lead_is_linked_to_employee(lead, user):
    """Check if the lead is linked to a employee"""
    assert lead.assigned_to==user
    
@pytest.mark.django_db
def test_lead_str_returns_name(lead):
    """Check that __str__ returns the title"""
    assert str(lead) == lead.title
    
@pytest.mark.django_db
def test_lead_stage_is_set_correctly(lead):
    assert lead.stage == "new"
    
