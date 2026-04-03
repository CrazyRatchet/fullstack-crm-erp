# customers/urls.py

from django.urls import path
from customers.views import CustomerListCreateView, CustomerDetailView, DeactivateCustomerView

urlpatterns = [
    path("customers/", CustomerListCreateView.as_view(), name="customer-list"),
    path("customers/<uuid:pk>/", CustomerDetailView.as_view(), name="customers-detail"),
    path("customers/<uuid:pk>/deactivate/", DeactivateCustomerView.as_view(), name="customers-deactivate"),
]