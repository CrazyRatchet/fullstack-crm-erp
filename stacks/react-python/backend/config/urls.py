from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),
    # Health check
    path("health/", include("core.urls")),
    path("health/readiness/", include("health_check.urls")),
    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/v1/", include("users.urls")),
    path("api/v1/", include("customers.urls")),
    path("api/v1/", include("contacts.urls")),
    path("api/v1/", include("leads.urls")),
    path("api/v1/", include("dashboard.urls")),
    path("api/v1/", include("quotations.urls")),
    path("api/v1/", include("sales.urls")),
    path("api/v1/", include("invoices.urls")),
    path("api/v1/", include("inventory.urls")),
]
