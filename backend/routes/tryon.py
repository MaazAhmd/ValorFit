from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Product, TryOn
from services.tryon_service import generate_tryon, save_tryon_image
import uuid
import os
from datetime import datetime

tryon_bp = Blueprint('tryon', __name__, url_prefix='/api/tryon')

@tryon_bp.route('/generate', methods=['POST'])
@jwt_required()
def create_tryon():
    """
    Generate AI try-on image.
    Expects multipart form data:
    - user_photo: image file (user wearing nothing/basic)
    - product_id: product to try on
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 401
    
    # Validate files
    if 'user_photo' not in request.files or 'product_id' not in request.form:
        return jsonify({'error': 'user_photo and product_id required'}), 400
    
    user_photo_file = request.files['user_photo']
    product_id = request.form.get('product_id')
    
    if not user_photo_file.filename:
        return jsonify({'error': 'No user_photo provided'}), 400
    
    # Get product
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    try:
        # Read files
        user_photo_data = user_photo_file.read()
        
        # Get product image (download from URL or use local file)
        import requests
        if product.image.startswith('http'):
            # External URL - download it
            product_image_data = requests.get(product.image).content
        elif product.image.startswith('/api/uploads/'):
            # Local upload path - read from uploads folder
            from config import Config
            # Extract the path after /api/uploads/
            relative_path = product.image.replace('/api/uploads/', '')
            local_path = os.path.join(Config.UPLOAD_FOLDER, relative_path)
            with open(local_path, 'rb') as f:
                product_image_data = f.read()
        else:
            # Direct file path
            with open(product.image, 'rb') as f:
                product_image_data = f.read()
        
        # Generate try-on using FASHN API
        tryon_image_data = generate_tryon(
            user_photo=user_photo_data,
            product_image=product_image_data,
            product_name=product.name
        )
        
        # Save result image
        filename = f"tryon_{uuid.uuid4()}.jpg"
        filepath = save_tryon_image(tryon_image_data, filename)
        
        # Save try-on record to database
        tryon_record = TryOn(
            user_id=user_id,
            product_id=product_id,
            image_path=filepath,
            filename=filename
        )
        db.session.add(tryon_record)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'tryon_id': tryon_record.id,
            'image_url': f'/api/tryon/image/{tryon_record.id}',
            'product': {
                'id': product.id,
                'name': product.name,
                'price': product.price
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tryon_bp.route('/image/<int:tryon_id>', methods=['GET'])
def get_tryon_image(tryon_id):
    """Retrieve try-on image."""
    tryon = TryOn.query.get(tryon_id)
    if not tryon:
        return jsonify({'error': 'Try-on not found'}), 404
    
    try:
        with open(tryon.image_path, 'rb') as f:
            image_data = f.read()
        return image_data, 200, {'Content-Type': 'image/jpeg'}
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tryon_bp.route('/history', methods=['GET'])
@jwt_required()
def get_tryons():
    """Get user's try-on history."""
    user_id = get_jwt_identity()
    tryons = TryOn.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        'id': t.id,
        'product': {
            'id': t.product.id,
            'name': t.product.name,
            'price': t.product.price
        },
        'image_url': f'/api/tryon/image/{t.id}',
        'created_at': t.created_at.isoformat()
    } for t in tryons]), 200

@tryon_bp.route('/<int:tryon_id>', methods=['DELETE'])
@jwt_required()
def delete_tryon(tryon_id):
    """Delete a try-on."""
    user_id = get_jwt_identity()
    tryon = TryOn.query.get(tryon_id)
    
    if not tryon or tryon.user_id != user_id:
        return jsonify({'error': 'Not found or unauthorized'}), 404
    
    # Delete file
    if os.path.exists(tryon.image_path):
        os.remove(tryon.image_path)
    
    db.session.delete(tryon)
    db.session.commit()
    
    return jsonify({'success': True}), 200