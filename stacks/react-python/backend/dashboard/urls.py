# dashbard/urls.py

from django.urls import path
from dashboard.views import DashboardView

urlpatterns = [
    path("dashboard/", DashboardView.as_view(), name="Dashboard"),
]
