import os
import sys
import traceback
from datetime import timedelta, datetime
from flask import Flask, send_from_directory, jsonify, session, request
from flask_cors import CORS
from flask_wtf.csrf import generate_csrf
from dotenv import load_dotenv
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.exceptions import HTTPException
from psycopg2.extras import Json
from routes.Extensions import limiter, csrf
from routes.Auth import auth_bp
from routes.Settings import settings_bp
from routes.Profile import profile_bp
from routes.ExerciseList import exercise_list_bp
from routes.Profile import BASE_DIR
from routes.Exercise import exercise_bp
from routes.Contact import contact_bp
from routes.Admin import admin_bp
from routes.AdminUsers import admin_users_bp
from routes.AdminExercises import admin_exercises_bp
from routes.AdminAnalytics import admin_analytics_bp
from routes.AdminFeedback import admin_feedback_bp
from routes.AdminLogs import admin_logs_bp
from routes.Results import results_bp
from routes.db import get_db_connection, return_db_connection
from routes.db_pool import close_all_connections
from routes.Upload import upload_bp
from routes.Notes import notes_bp
import atexit
import logging
from psycopg2 import OperationalError

# Only import signal on Unix systems
if sys.platform != 'win32':
    import signal

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def log_error_to_db(level, source, message, stack_trace=None,
                    endpoint=None, method=None, ip=None, ua=None,
                    extra=None, user_id=None):
    """Best-effort error logging. Never raises, even if the DB is down."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO error_logs
                (user_id, level, source, message, stack_trace,
                 endpoint, method, ip_address, user_agent, extra)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id, level, source, message, stack_trace,
            endpoint, method, ip, (ua or "")[:500] or None,
            Json(extra) if extra else None,
        ))
        conn.commit()
    except Exception as log_exc:
        # DB unavailable — do not recurse, just stderr.
        logger.error(f"[error_log_failed] {log_exc} | original: {message}")
    finally:
        try:
            if cursor:
                cursor.close()
        except Exception:
            pass
        try:
            if conn:
                return_db_connection(conn)
        except Exception:
            pass


app = Flask(__name__)

# --- ProxyFix: trust one nginx hop so request.remote_addr is the real client IP ---
# nginx sends X-Forwarded-For via $proxy_add_x_forwarded_for (appends the real IP
# to any client-supplied value). x_for=1 tells ProxyFix to take the rightmost entry,
# which is the value nginx appended — spoof-proof.
app.wsgi_app = ProxyFix(
    app.wsgi_app,
    x_for=1,
    x_proto=1,
    x_host=1,
    x_port=0,
    x_prefix=0,
)

# Allow URLs with and without trailing slashes
app.url_map.strict_slashes = False

app.secret_key = os.environ.get("FLASK_SECRET_KEY")
if not app.secret_key:
    raise ValueError("FLASK_SECRET_KEY environment variable is not set")

debug_mode = os.environ.get("FLASK_DEBUG", "False").lower() == "true"

app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=48)
app.config['SESSION_REFRESH_EACH_REQUEST'] = True
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

app.config['WTF_CSRF_TIME_LIMIT'] = 3600
app.config['WTF_CSRF_SSL_STRICT'] = False
app.config['WTF_CSRF_CHECK_DEFAULT'] = False

REQUEST_TIMEOUT_SECONDS = 30
LONG_PROCESS_TIMEOUT_SECONDS = 120

limiter.init_app(app)
csrf.init_app(app)

# Only define timeout handlers on Unix systems
if sys.platform != 'win32':
    def timeout_handler(signum, frame):
        raise TimeoutError("Request exceeded time limit")

    @app.before_request
    def set_timeout():
        if not debug_mode:
            signal.signal(signal.SIGALRM, timeout_handler)
            if request.endpoint and 'contact' in request.endpoint:
                signal.alarm(LONG_PROCESS_TIMEOUT_SECONDS)
            else:
                signal.alarm(REQUEST_TIMEOUT_SECONDS)

    @app.after_request
    def clear_timeout(response):
        if not debug_mode:
            signal.alarm(0)
        return response

    @app.errorhandler(TimeoutError)
    def handle_timeout(e):
        log_error_to_db(
            level="warn",
            source="timeout",
            message=f"Request timed out on {request.endpoint}",
            endpoint=request.endpoint,
            method=request.method,
            ip=request.remote_addr,
            ua=request.headers.get('User-Agent', ''),
            user_id=session.get('user_id') if 'user_id' in session else None,
        )
        return jsonify({
            "error": "Request timed out",
            "degraded": True,
            "message": "The request took too long. Please try again."
        }), 504


@app.errorhandler(OperationalError)
def handle_db_failure(e):
    logger.error(f"Database error: {e}")
    log_error_to_db(
        level="error",
        source="db",
        message=str(e) or e.__class__.__name__,
        stack_trace=traceback.format_exc(),
        endpoint=request.endpoint,
        method=request.method,
        ip=request.remote_addr,
        ua=request.headers.get('User-Agent', ''),
        user_id=session.get('user_id') if 'user_id' in session else None,
    )
    return jsonify({
        "error": "Service temporarily unavailable",
        "degraded": True,
        "message": "We're experiencing high traffic. Please try again later."
    }), 503


@app.errorhandler(Exception)
def handle_any_error(e):
    # Let Flask handle normal HTTP exceptions (404, 405, etc.) with their own
    # status codes instead of converting them to 500s.
    if isinstance(e, HTTPException):
        return e

    stack = traceback.format_exc()
    logger.error(f"Unhandled error: {e}\n{stack}")

    log_error_to_db(
        level="error",
        source="app",
        message=str(e) or e.__class__.__name__,
        stack_trace=stack,
        endpoint=request.endpoint,
        method=request.method,
        ip=request.remote_addr,
        ua=request.headers.get('User-Agent', ''),
        user_id=session.get('user_id') if 'user_id' in session else None,
    )

    return jsonify({
        "error": "Something went wrong",
        "degraded": True,
        "message": "We've been notified. Please try again later."
    }), 500


@app.before_request
def check_session_timeout():
    if request.endpoint in ['serve_uploads', 'static', 'get_csrf_token']:
        return None
    if 'user_id' in session:
        session['last_activity'] = datetime.now().isoformat()
    elif 'last_activity' in session:
        session.clear()


@app.route("/api/csrf-token", methods=["GET"])
def get_csrf_token():
    return jsonify({"csrf_token": generate_csrf()})


@app.errorhandler(429)
def rate_limit_handler(e):
    return jsonify({
        "error": "Too many requests. Please slow down and try again later."
    }), 429


@app.errorhandler(400)
def csrf_error_handler(e):
    if "CSRF" in str(e):
        return jsonify({"error": "CSRF token missing or invalid"}), 400
    return jsonify({"error": str(e)}), 400


CORS(app, supports_credentials=True, origins=[
    "https://greymatterschool.co.za",
    "http://greymatterschool.co.za",
    "http://localhost:5173",
    "http://localhost:5000"
])

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(settings_bp, url_prefix="/api")
app.register_blueprint(profile_bp, url_prefix="/api/persona")
app.register_blueprint(exercise_list_bp, url_prefix="/api")
app.register_blueprint(exercise_bp, url_prefix="/api")
app.register_blueprint(contact_bp, url_prefix="/api")
app.register_blueprint(results_bp, url_prefix="/api")
app.register_blueprint(upload_bp)
app.register_blueprint(notes_bp, url_prefix="/api")

# Admin blueprints
app.register_blueprint(admin_bp, url_prefix="/api")
app.register_blueprint(admin_users_bp, url_prefix="/api")
app.register_blueprint(admin_exercises_bp, url_prefix="/api")
app.register_blueprint(admin_analytics_bp, url_prefix="/api")
app.register_blueprint(admin_feedback_bp, url_prefix="/api")
app.register_blueprint(admin_logs_bp, url_prefix="/api")


@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    upload_folder = os.path.join(BASE_DIR, 'uploads')
    return send_from_directory(upload_folder, filename)


atexit.register(close_all_connections)


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "degraded": False,
        "timestamp": datetime.now().isoformat()
    }), 200


if __name__ == "__main__":
    app.run(debug=debug_mode, port=5000, host='0.0.0.0')