from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_wtf.csrf import CSRFProtect
import os

if os.environ.get("FLASK_DEBUG", "False").lower() == "true":
    DEFAULT_LIMITS = ["1000 per day", "200 per hour", "10 per minute"]
else:
    DEFAULT_LIMITS = ["200 per day", "50 per hour", "5 per minute"]

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=DEFAULT_LIMITS,
    storage_uri="memory://",
    strategy="fixed-window",
)

# Bypass rate limiting in development or for specific conditions
@limiter.request_filter
def bypass_rate_limits():
    # Bypass in development mode
    if os.environ.get("FLASK_DEBUG", "False").lower() == "true":
        return True
    # Bypass for health check endpoint
    from flask import request
    if request and request.path == '/api/health':
        return True
    return False

csrf = CSRFProtect()