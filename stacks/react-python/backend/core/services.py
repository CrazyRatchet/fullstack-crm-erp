import logging

from core.models import AuditLog

logger = logging.getLogger(__name__)


class AuditService:
    """
    Centralized service for recording audit log entries.

    Usage:
        AuditService.log(
            action=AuditLog.Action.LOGIN_SUCCESS,
            user=request.user,
            request=request,
            metadata={'email': user.email}
        )
    """

    @staticmethod
    def log(action: str, request=None, user=None, metadata: dict = None) -> None:
        """
        Creates an audit log entry.

        Args:
            action: The action type from AuditLog.Action choices
            request: The HTTP request object (used to extract IP and tenant)
            user: The user performing the action
            metadata: Additional context about the action
        """
        try:
            ip_address = None
            tenant = None

            if request:
                # Extract real IP address even behind proxies
                ip_address = (
                    request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
                    or request.META.get('REMOTE_ADDR')
                )
                tenant = getattr(request, 'tenant', None)

            AuditLog.objects.create(
                action=action,
                user=user,
                tenant=tenant,
                ip_address=ip_address or None,
                metadata=metadata or {},
            )

        except Exception as e:
            # Audit logging must never break the main request flow
            logger.exception('Failed to create audit log entry: %s', str(e))