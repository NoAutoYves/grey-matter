from flask import Blueprint, request, jsonify
import os
import uuid

upload_bp = Blueprint('upload', __name__)

# Configuration
UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", "/var/www/greymatter/uploads/questions")

# For local development
if os.environ.get("FLASK_DEBUG", "False").lower() == "true":
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'questions')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/api/upload/question-image', methods=['POST'])
def upload_question_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    # Create upload folder if it doesn't exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    # Generate unique filename
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    
    # Save file
    file.save(filepath)
    
    # Return URL
    image_url = f"/uploads/questions/{filename}"
    
    return jsonify({
        'success': True,
        'image_url': image_url,
        'filename': filename
    }), 200