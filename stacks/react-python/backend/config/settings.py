# config/settings.py

from datetime import timedelta
from pathlib import Path

import environ

# ─────────────────────────────────────────────────────────────
# PATHS & ENVIRONMENT
# ─────────────────────────────────────────────────────────────
# BASE_DIR points to the backend/ folder
BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize django-environ and read the .env file
# The .env is one level above backend/ (at the project root)
env = environ.Env()
environ.Env.read_env(BASE_DIR.parent / ".env", overwrite=False)

# ─────────────────────────────────────────────────────────────
# SECURITY
# ─────────────────────────────────────────────────────────────
SECRET_KEY = env("SECRET_KEY")
DEBUG = env.bool("DEBUG", default=False)
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost"])

# ─────────────────────────────────────────────────────────────
# APPLICATIONS
# ─────────────────────────────────────────────────────────────
# Splitting apps into three groups is a best practice:
# it makes it immediately clear what is Django, what is
# third-party, and what is your own code.

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "drf_spectacular",
    "django_filters",
    "health_check",
    "health_check.db",
    "health_check.cache",
]

LOCAL_APPS = [
    "core",  # Shared utilities — to be created
    "tenants",  # Multi-tenancy — to be created
    "users",  # Custom user — already exists
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ─────────────────────────────────────────────────────────────
# MIDDLEWARE
# ─────────────────────────────────────────────────────────────
# Order matters here. CorsMiddleware must be as high as possible,
# before any middleware that can generate responses.

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "core.middleware.TenantIsolationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware"
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ─────────────────────────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────────────────────────
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("POSTGRES_DB"),
        "USER": env("POSTGRES_USER"),
        "PASSWORD": env("POSTGRES_PASSWORD"),
        "HOST": env("POSTGRES_HOST", default="localhost"),
        "PORT": env("POSTGRES_PORT", default="5432"),
    }
}

# ─────────────────────────────────────────────────────────────
# CACHE (Redis)
# ─────────────────────────────────────────────────────────────
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": env("REDIS_URL", default="redis://localhost:6379/0"),
    }
}

# ─────────────────────────────────────────────────────────────
# AUTHENTICATION
# ─────────────────────────────────────────────────────────────
AUTH_USER_MODEL = "users.User"

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ─────────────────────────────────────────────────────────────
# DJANGO REST FRAMEWORK
# ─────────────────────────────────────────────────────────────
# These are global defaults that apply to every endpoint.
# Individual views can override them with decorators.

REST_FRAMEWORK = {
    # All endpoints require authentication by default.
    # To make one public, use: @permission_classes([AllowAny])
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    # Client sends: Authorization: Bearer <token>
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    # Automatic pagination on all list endpoints
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    # Available filters on all ViewSets
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    # Global error handler — we will create this in core/exceptions.py
    "EXCEPTION_HANDLER": "core.exceptions.custom_exception_handler",
    # Required for drf-spectacular to generate the API schema
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    # Rate limiting — protects the API from abuse
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/day",
        "user": "1000/day",
    },
}

# ─────────────────────────────────────────────────────────────
# JWT SETTINGS
# ─────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    # Access token expires in 60 minutes — short-lived for security
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    # Refresh token lasts 7 days — used to get a new access token
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    # When you refresh, the old refresh token becomes invalid
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# ─────────────────────────────────────────────────────────────
# API DOCUMENTATION
# ─────────────────────────────────────────────────────────────
SPECTACULAR_SETTINGS = {
    "TITLE": "CRM/ERP API",
    "DESCRIPTION": "API for multi-tenant CRM/ERP system",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

# ─────────────────────────────────────────────────────────────
# CORS
# Allows Expo (mobile + web) to communicate with Django
# ─────────────────────────────────────────────────────────────
if DEBUG:
    # In development, allow all origins so Expo can connect freely
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])

# ─────────────────────────────────────────────────────────────
# INTERNATIONALIZATION
# ─────────────────────────────────────────────────────────────
LANGUAGE_CODE = "es-419"
TIME_ZONE = "America/Panama"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ─────────────────────────────────────────────────────────────
# SENTRY — error tracking in production
# ─────────────────────────────────────────────────────────────
# Only initializes if SENTRY_DSN is set in .env
# This means it does nothing in local development
SENTRY_DSN = env("SENTRY_DSN", default="")
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.celery import CeleryIntegration
    from sentry_sdk.integrations.django import DjangoIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(),
            CeleryIntegration(),
        ],
        # Capture 10% of transactions for performance monitoring
        traces_sample_rate=0.1,
        # Do not send personally identifiable information to Sentry
        send_default_pii=False,
    )

# ─────────────────────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────────────────────
# We use JSON format so logs can be parsed by external tools
# like Sentry, Datadog, or Papertrail in production.

LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(exist_ok=True)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            # Each log line is a valid JSON object
            # Makes logs easy to filter and search in production tools
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(levelname)s %(name)s %(module)s %(lineno)d %(message)s",
        },
        "simple": {
            # Human-readable format for the terminal during development
            "format": "{levelname} {name}: {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
            "level": "DEBUG",
        },
        "file_general": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOGS_DIR / "general.log",
            # Rotate when file reaches 10 MB, keep last 5 files
            "maxBytes": 1024 * 1024 * 10,
            "backupCount": 5,
            "formatter": "json",
            "level": "INFO",
        },
        "file_errors": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOGS_DIR / "errors.log",
            "maxBytes": 1024 * 1024 * 10,
            "backupCount": 5,
            "formatter": "json",
            "level": "ERROR",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file_general"],
            "level": "INFO",
            "propagate": False,
        },
        "core": {
            "handlers": ["console", "file_general", "file_errors"],
            "level": "DEBUG",
            "propagate": False,
        },
        "tenants": {
            "handlers": ["console", "file_general", "file_errors"],
            "level": "DEBUG",
            "propagate": False,
        },
        "users": {
            "handlers": ["console", "file_general", "file_errors"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}
