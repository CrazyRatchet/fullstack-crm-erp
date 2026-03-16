from rest_framework.permissions import BasePermission

from users.models import User


class IsSuperAdmin(BasePermission):
    """Grants access only to super admins."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role(User.Role.SUPER_ADMIN)


class IsBusinessAdmin(BasePermission):
    """Grants access only to business administrators."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role(User.Role.BUSINESS_ADMIN)


class IsManager(BasePermission):
    """Grants access only to managers."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role(User.Role.MANAGER)


class IsSalesperson(BasePermission):
    """Grants access only to salespersons."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role(User.Role.SALESPERSON)


class IsERPOperator(BasePermission):
    """Grants access only to ERP operators."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role(User.Role.ERP_OPERATOR)


class IsAdminOrManager(BasePermission):
    """Grants access to business admins and managers."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role(
            User.Role.BUSINESS_ADMIN,
            User.Role.MANAGER,
        )


class IsAdminOrAbove(BasePermission):
    """Grants access to super admins and business admins."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role(
            User.Role.SUPER_ADMIN,
            User.Role.BUSINESS_ADMIN,
        )