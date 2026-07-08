from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_wtf.csrf import CSRFProtect
import os

# Create limiter instance without app
# Configure rate limits based on environment
if os.environ.get("FLASK_DEBUG", "False").lower() == "true":
    # Development: lighter limits
    DEFAULT_LIMITS = ["1000 per day", "200 per hour", "10 per minute"]
else:
    # Production: stricter limits
    DEFAULT_LIMITS = ["200 per day", "50 per hour", "5 per minute"]

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=DEFAULT_LIMITS,
    storage_uri="memory://",
    # Add timeout for rate limit storage operations
    strategy="fixed-window",  # Use fixed window for simpler timeout handling
)

# Create CSRF protection instance
csrf = CSRFProtect()