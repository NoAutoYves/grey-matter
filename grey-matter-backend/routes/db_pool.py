import os
from psycopg2 import pool
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Database configuration
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_NAME = os.environ.get("DB_NAME", "greymatter_db")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_PORT = os.environ.get("DB_PORT", "5432")

# Create connection pool
db_pool = pool.SimpleConnectionPool(
    minconn=2,          # Minimum connections always ready
    maxconn=20,         # Maximum connections allowed
    host=DB_HOST,
    database=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    port=DB_PORT,
    connect_timeout=5,   # 5 seconds to establish connection
    options="-c statement_timeout=10000"  # 10 seconds for queries
)

def get_db_connection():
    """Get connection from pool with timeout"""
    try:
        return db_pool.getconn()
    except Exception as e:
        logger.error("Failed to get connection from pool: %s", e)
        raise

def return_db_connection(conn):
    """Return connection to pool for reuse"""
    if conn:
        db_pool.putconn(conn)

def close_all_connections():
    """Call this when app shuts down"""
    db_pool.closeall()

def get_pool_stats():
    """Get pool statistics for monitoring"""
    try:
        return {
            "min_connections": db_pool.minconn,
            "max_connections": db_pool.maxconn,
            "available_connections": db_pool._pool.qsize() if hasattr(db_pool, '_pool') else 0
        }
    except Exception:
        return None