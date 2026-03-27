# leads/urls.py

from django.urls import path
from leads.views import LeadListCreateView, LeadDetailView

urlpatterns = [
    path("leads/", LeadListCreateView.as_view(), name="leads-list"),
    path("leads/<uuid:pk>/", LeadDetailView.as_view(), name="lead-detail"),
]