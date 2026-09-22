from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_wtf.csrf import CSRFProtect
import os


DEBUG = os.environ.get("FLASK_DEBUG", "False").lower() == "true"

if DEBUG:
    DEFAULT_LIMITS = ["100000 per day", "10000 per hour", "1000 per minute"]
else:
    DEFAULT_LIMITS = ["50000 per day", "5000 per hour", "500 per minute"]

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=DEFAULT_LIMITS,
    storage_uri="memory://",
    strategy="fixed-window",
    enabled=not DEBUG,
)


@limiter.request_filter
def bypass_rate_limits():
    if DEBUG:
        return True

    from flask import request
    if request is None:
        return False

    # Endpoints that must never be rate-limited:
    #   /api/health              — uptime checks
    #   /api/csrf-token          — hit once per page load / periodically by the SPA
    #   /api/exercises/batch/subject-stats — public, hit on every subjects page view
    bypass_paths = {
        "/api/health",
        "/api/csrf-token",
        "/api/exercises/batch/subject-stats",
    }

    return request.path in bypass_paths


csrf = CSRFProtect()