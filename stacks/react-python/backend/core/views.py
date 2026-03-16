# core/views.py

import logging

from django.core.cache import cache
from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """
    Liveness endpoint — verifies Django, PostgreSQL and Redis are alive.

    Does not require authentication — used by:
    - Docker to verify the container is healthy
    - GitHub Actions to verify the deploy worked
    - Load balancers in production

    Returns 200 if healthy, 503 if the database is down.
    """
    health = {"status": "healthy", "services": {}}
    http_status = 200

    # Check PostgreSQL
    try:
        connection.ensure_connection()
        health["services"]["database"] = "ok"
    except Exception as e:
        health["services"]["database"] = "error"
        health["status"] = "unhealthy"
        http_status = 503
        logger.error("Health check DB error: %s", str(e))

    # Check Redis
    try:
        cache.set("health_check_key", "ok", timeout=10)
        val = cache.get("health_check_key")
        health["services"]["cache"] = "ok" if val == "ok" else "error"
    except Exception as e:
        health["services"]["cache"] = "error"
        health["status"] = "degraded"
        logger.warning("Health check Redis error: %s", str(e))

    return Response(health, status=http_status)
