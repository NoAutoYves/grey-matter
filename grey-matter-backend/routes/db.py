import os
from dotenv import load_dotenv
from routes.db_pool import get_db_connection, return_db_connection, close_all_connections, get_pool_stats
import time
from functools import wraps

load_dotenv()

DB_NAME = os.environ.get("DB_NAME", "greymatter_db")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")

MAX_RETRIES = 3
RETRY_DELAY = 1  # seconds

def retry_on_connection_failure(func):
    """Decorator to retry database operations on connection failure"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        last_error = None
        for attempt in range(MAX_RETRIES):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                last_error = e
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))
                    continue
                raise
        raise last_error
    return wrapper

@retry_on_connection_failure
def get_db_connection_with_retry():
    """Get database connection with retry logic"""
    return get_db_connection()

def get_db_connection_legacy():
    """Legacy function - now uses connection pool"""
    return get_db_connection_with_retry()

def execute_with_fallback(query, params=None, fallback_value=None):
    """Execute a query with fallback value if it fails"""
    conn = None
    cursor = None
    try:
        conn = get_db_connection_with_retry()
        cursor = conn.cursor()
        cursor.execute(query, params or ())
        if query.strip().upper().startswith('SELECT'):
            return cursor.fetchall()
        conn.commit()
        return True
    except Exception as e:
        print(f"Database error: {e}")
        return fallback_value
    finally:
        if cursor:
            cursor.close()
        if conn:
            return_db_connection(conn)

# Re-export pool functions
__all__ = [
    'get_db_connection', 
    'return_db_connection', 
    'close_all_connections', 
    'get_pool_stats',
    'get_db_connection_with_retry',
    'execute_with_fallback'
]