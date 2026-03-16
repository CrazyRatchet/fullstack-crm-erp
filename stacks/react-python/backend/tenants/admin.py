from django.contrib import admin

from .models import Tenant

# Register your models here.


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "plan", "is_active", "created_at")
    list_filter = ("is_active", "plan")
    search_fields = ("name", "slug")
    readonly_fields = ("id", "created_at", "updated_at")
