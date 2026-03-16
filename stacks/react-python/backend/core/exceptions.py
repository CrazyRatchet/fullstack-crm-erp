import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Global error handler for the entire API.

    Without this, DRF returns inconsistent error formats:
        {"detail": "Not found."}
        {"email": ["This field is required."]}

    With this, the frontend ALWAYS receives the same structure:
        {
            "success": false,
            "error": {
                "code": "not_found",
                "message": "Human readable message",
                "details": { ... raw DRF error ... }
            }
        }

    This is critical for Expo/React Native to handle errors
    generically in a single place (e.g. an Axios interceptor).
    """

    # Let DRF handle the exception first to get the base response
    response = exception_handler(exc, context)

    view = context.get("view")

    if response is not None:
        # Known error (4xx): DRF recognized it
        error_data = {
            "success": False,
            "error": {
                "code": _get_error_code(response.status_code),
                "message": _extract_message(response.data),
                "details": response.data,
            },
        }

        logger.warning(
            "API error %s in %s: %s",
            view.__class__.__name__ if view else "unknown",
            response.data,
        )

        response.data = error_data

    else:
        # Unhandled error (500): something unexpected crashed
        logger.exception(
            "Unhandled error in %s",
            view.__class__.__name__ if view else "unknown",
            exc_info=exc,
        )

        response = Response(
            {
                "success": False,
                "error": {
                    "code": "server_error",
                    "message": "Internal server error",
                    "details": {},
                },
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    return response


def _get_error_code(status_code: int) -> str:
    """Maps HTTP status code to a descriptive string fro the frontend."""
    return {
        400: "bad_request",
        401: "unauthorized",
        403: "forbidden",
        404: "not_found",
        405: "method_not_allowed",
        409: "conflict",
        422: "validation_error",
        429: "rate_limit_exceeded",
        500: "server_error",
    }.get(status_code, "unknown_error")


def _extract_message(data) -> str:
    """Extracts a human-readable message from DRF's error data."""
    if isinstance(data, dict):
        if "detail" in data:
            return str(data["detail"])
        first_key = next(iter(data))
        first_value = data[first_key]
        if isinstance(first_value, list):
            return str(first_value[0])
        return str(first_value)
    if isinstance(data, list) and data:
        return str(data[0])
    return str(data)
