"""
Upload routes for handling local file storage.
Provides endpoints for uploading and serving product/design images.
"""
import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from config import Config

uploads_bp = Blueprint('uploads', __name__, url_prefix='/api/uploads')

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_upload_folder():
    """Get the upload folder path, create if doesn't exist."""
    upload_folder = Config.UPLOAD_FOLDER
    # Create subdirectories for different types
    products_folder = os.path.join(upload_folder, 'products')
    designs_folder = os.path.join(upload_folder, 'designs')
    
    os.makedirs(products_folder, exist_ok=True)
    os.makedirs(designs_folder, exist_ok=True)
    
    return upload_folder

@uploads_bp.route('/product', methods=['POST'])
@jwt_required()
def upload_product_image():
    """Upload a product image. Returns the local path to use."""
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Use: png, jpg, jpeg, gif, webp'}), 400
    
    try:
        upload_folder = get_upload_folder()
        products_folder = os.path.join(upload_folder, 'products')
        
        # Generate unique filename
        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(products_folder, unique_filename)
        
        # Save the file
        file.save(filepath)
        
        # Return the URL path that can be used to access this image
        image_url = f"/api/uploads/products/{unique_filename}"
        
        return jsonify({
            'success': True,
            'image_url': image_url,
            'filename': unique_filename
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@uploads_bp.route('/design', methods=['POST'])
@jwt_required()
def upload_design_image():
    """Upload a design image. Returns the local path to use."""
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Use: png, jpg, jpeg, gif, webp'}), 400
    
    try:
        upload_folder = get_upload_folder()
        designs_folder = os.path.join(upload_folder, 'designs')
        
        # Generate unique filename
        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(designs_folder, unique_filename)
        
        # Save the file
        file.save(filepath)
        
        # Return the URL path that can be used to access this image
        image_url = f"/api/uploads/designs/{unique_filename}"
        
        return jsonify({
            'success': True,
            'image_url': image_url,
            'filename': unique_filename
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@uploads_bp.route('/products/<filename>', methods=['GET'])
def serve_product_image(filename):
    """Serve a product image from local storage."""
    try:
        upload_folder = get_upload_folder()
        products_folder = os.path.join(upload_folder, 'products')
        return send_from_directory(products_folder, filename)
    except Exception as e:
        return jsonify({'error': 'Image not found'}), 404

@uploads_bp.route('/designs/<filename>', methods=['GET'])
def serve_design_image(filename):
    """Serve a design image from local storage."""
    try:
        upload_folder = get_upload_folder()
        designs_folder = os.path.join(upload_folder, 'designs')
        return send_from_directory(designs_folder, filename)
    except Exception as e:
        return jsonify({'error': 'Image not found'}), 404
