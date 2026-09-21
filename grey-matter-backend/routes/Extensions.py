from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_wtf.csrf import CSRFProtect
import os

if os.environ.get("FLASK_DEBUG", "False").lower() == "true":
    DEFAULT_LIMITS = ["100000 per day", "10000 per hour", "1000 per minute"]
else:
    DEFAULT_LIMITS = ["50000 per day", "5000 per hour", "500 per minute"]

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=DEFAULT_LIMITS,
    storage_uri="memory://",
    strategy="fixed-window",
    enabled=not os.environ.get("FLASK_DEBUG", "False").lower() == "true",
)

@limiter.request_filter
def bypass_rate_limits():
    if os.environ.get("FLASK_DEBUG", "False").lower() == "true":
        return True
    
    from flask import request
    if request and request.path == '/api/health':
        return True
    if request and request.path == '/api/csrf-token':
        return True
    
    return False

csrf = CSRFProtect()