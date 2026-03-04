from django.contrib import admin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "username", "tenant", "is_active", "is_staff")
    list_filter = ("is_active", "is_staff")
    search_fields = ("email", "username")
    readonly_fields = ("id", "created_at", "updated_at", "date_joined", "last_login")
