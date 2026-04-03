# customers/admin.py
from django.contrib import admin
from .models import Customer

# Register your models here.
@admin.register(Customer)
class CustomersAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "address", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "email", "phone", "address")
    readonly_fields = ("id", "created_at", "updated_at")