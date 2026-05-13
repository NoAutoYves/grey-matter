import re
import bleach

# Allowed HTML tags (none for most user input - strip everything)
ALLOWED_TAGS = []  # No HTML allowed
ALLOWED_ATTRIBUTES = {}

def sanitize_text(text, max_length=500):
    """Sanitize plain text input - removes HTML/JS"""
    if not text or not isinstance(text, str):
        return ""
    
    # Remove HTML/JS using bleach
    cleaned = bleach.clean(
        text,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True
    )
    
    # Remove potential SQL patterns
    sql_patterns = [
        r'\b(?:SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b',
        r'--',
        r';',
        r'/\*',
        r'\*/',
        r'xp_',
        r'exec\s*\(',
        r'declare\s+@'
    ]
    for pattern in sql_patterns:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
    
    # Remove script tags and event handlers
    cleaned = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'on\w+\s*=', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'javascript:', '', cleaned, flags=re.IGNORECASE)
    
    # Trim to max length
    return cleaned[:max_length].strip()

def sanitize_username(username, max_length=50):
    """Username only allows letters, numbers, underscore"""
    if not username:
        return ""
    # Remove anything that's not alphanumeric or underscore
    cleaned = re.sub(r'[^a-zA-Z0-9_]', '', username)
    return cleaned[:max_length].strip()

def sanitize_email(email):
    """Basic email sanitization - remove whitespace and dangerous chars"""
    if not email:
        return ""
    # Remove whitespace and newlines
    cleaned = email.strip().replace('\n', '').replace('\r', '')
    # Remove any HTML tags
    cleaned = bleach.clean(cleaned, tags=[], strip=True)
    return cleaned[:255]

def sanitize_bio(bio, max_length=500):
    """Bio allows basic punctuation but no HTML"""
    if not bio:
        return ""
    # Allow basic punctuation: . , ! ? ; : ' " -
    allowed_chars_pattern = r'[^a-zA-Z0-9\s\.\,\!\?\;\:\'\"\-]'
    cleaned = re.sub(allowed_chars_pattern, '', bio)
    return cleaned[:max_length].strip()

def sanitize_phone(phone):
    """Phone numbers - only digits, plus, hyphen, space"""
    if not phone:
        return ""
    cleaned = re.sub(r'[^0-9\+\-\s\(\)]', '', phone)
    return cleaned[:20]