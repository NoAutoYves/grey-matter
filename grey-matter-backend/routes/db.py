import os
from dotenv import load_dotenv
from routes.db_pool import get_db_connection, return_db_connection, close_all_connections, get_pool_stats

load_dotenv()

# Database configuration from environment variables
DB_NAME = os.environ.get("DB_NAME", "greymatter_db")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")

# For backward compatibility, you can still use this function
# But it now uses the pool via db_pool.py
def get_db_connection_legacy():
    """Legacy function - now uses connection pool"""
    return get_db_connection()

# Re-export pool functions
__all__ = [
    'get_db_connection', 
    'return_db_connection', 
    'close_all_connections', 
    'get_pool_stats'
]