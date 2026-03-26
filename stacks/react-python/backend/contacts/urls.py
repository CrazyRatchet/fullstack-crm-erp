# contacts/urls.py

from django.urls import path
from contacts.views import ContactListCreateView, ContactDetailView

urlpatterns = [
    path("customers/<uuid:customer_pk>/contacts/", ContactListCreateView.as_view(), name="contacts"),
    path("contacts/<uuid:pk>/", ContactDetailView.as_view(), name="contact-details"),
]