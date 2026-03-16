import logging

from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class TenantIsolationMiddleware(MiddlewareMixin):
    """
    Middleware that attaches the tenant to every authenticated request.

    This ensures that all views have access to request.tenant
    without needing to query it individually.

    Flow:
        1. Request comes in with JWT token
        2. Django authenticates the user via JWTAuthentication
        3. This middleware reads request.user.tenant
        4. Attaches it to request.tenant for easy access in views
    """

    def process_request(self, request):
        # Default to None for unauthenticated requests
        request.tenant = None

        # Attach tenant only for authenticated users
        if hasattr(request, 'user') and request.user.is_authenticated:
            request.tenant = getattr(request.user, 'tenant', None)

            if request.tenant is None:
                logger.warning(
                    'Authenticated user %s has no tenant assigned.',
                    request.user.email,
                )