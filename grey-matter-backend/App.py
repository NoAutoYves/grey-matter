import os
from datetime import timedelta, datetime
from flask import Flask, send_from_directory, jsonify, session, request
from flask_cors import CORS
from flask_wtf.csrf import generate_csrf
from dotenv import load_dotenv
from routes.Extensions import limiter, csrf
from routes.Auth import auth_bp
from routes.Settings import settings_bp
from routes.Profile import profile_bp
from routes.ExerciseList import exercise_list_bp
from routes.Profile import BASE_DIR
from routes.Exercise import exercise_bp
from routes.Contact import contact_bp
from routes.Admin import admin_bp
from routes.Results import results_bp

load_dotenv()

app = Flask(__name__)

app.secret_key = os.environ.get("FLASK_SECRET_KEY")
if not app.secret_key:
    raise ValueError("FLASK_SECRET_KEY environment variable is not set")

debug_mode = os.environ.get("FLASK_DEBUG", "False").lower() == "true"

app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=12)
app.config['SESSION_REFRESH_EACH_REQUEST'] = True
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

app.config['WTF_CSRF_TIME_LIMIT'] = 3600
app.config['WTF_CSRF_SSL_STRICT'] = False
app.config['WTF_CSRF_CHECK_DEFAULT'] = False

limiter.init_app(app)
csrf.init_app(app)

@app.before_request
def check_session_timeout():
    if request.endpoint in ['serve_uploads', 'static', 'get_csrf_token']:
        return None
    if 'user_id' in session:
        session['last_activity'] = datetime.now().isoformat()
    elif 'last_activity' in session:
        session.clear()

@app.route("/api/csrf-token", methods=["GET"])
@limiter.exempt
def get_csrf_token():
    return jsonify({"csrf_token": generate_csrf()})

@app.errorhandler(429)
def rate_limit_handler(e):
    return jsonify({"error": "Too many requests. Please slow down and try again later."}), 429

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

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(settings_bp, url_prefix="/api")
app.register_blueprint(profile_bp, url_prefix="/api/persona")
app.register_blueprint(exercise_list_bp, url_prefix="/api")
app.register_blueprint(exercise_bp, url_prefix="/api")
app.register_blueprint(contact_bp, url_prefix="/api")
app.register_blueprint(admin_bp, url_prefix="/api")
app.register_blueprint(results_bp, url_prefix="/api")

@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    upload_folder = os.path.join(BASE_DIR, 'uploads')
    return send_from_directory(upload_folder, filename)

if __name__ == "__main__":
    app.run(debug=False, port=5000, host='0.0.0.0')