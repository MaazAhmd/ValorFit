from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, CustomDesign, Product
import json

custom_designs_bp = Blueprint('custom_designs', __name__, url_prefix='/api/custom-designs')

@custom_designs_bp.route('', methods=['GET'])
@jwt_required()
def get_custom_designs():
    """Get all custom designs for the current user."""
    user_id = get_jwt_identity()
    designs = CustomDesign.query.filter_by(user_id=user_id).order_by(CustomDesign.created_at.desc()).all()
    return jsonify({'designs': [d.to_dict() for d in designs]})

@custom_designs_bp.route('', methods=['POST'])
@jwt_required()
def create_custom_design():
    """Create a new custom design."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Get base product (custom compression shirt)
    base_product = Product.query.filter_by(category='custom', is_active=True).first()
    
    design = CustomDesign(
        user_id=user_id,
        name=data.get('name', 'My Custom Design'),
        front_design=json.dumps(data.get('frontDesign', [])),
        back_design=json.dumps(data.get('backDesign', [])),
        preview_front=data.get('previewFront'),
        preview_back=data.get('previewBack'),
        base_product_id=base_product.id if base_product else None
    )
    
    db.session.add(design)
    db.session.commit()
    
    return jsonify({
        'message': 'Design saved successfully',
        'design': design.to_dict()
    }), 201

@custom_designs_bp.route('/<int:design_id>', methods=['GET'])
@jwt_required()
def get_custom_design(design_id):
    """Get a specific custom design."""
    user_id = get_jwt_identity()
    design = CustomDesign.query.filter_by(id=design_id, user_id=user_id).first()
    
    if not design:
        return jsonify({'message': 'Design not found'}), 404
    
    return jsonify({'design': design.to_dict()})

@custom_designs_bp.route('/<int:design_id>', methods=['PUT'])
@jwt_required()
def update_custom_design(design_id):
    """Update a custom design."""
    user_id = get_jwt_identity()
    design = CustomDesign.query.filter_by(id=design_id, user_id=user_id).first()
    
    if not design:
        return jsonify({'message': 'Design not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        design.name = data['name']
    if 'frontDesign' in data:
        design.front_design = json.dumps(data['frontDesign'])
    if 'backDesign' in data:
        design.back_design = json.dumps(data['backDesign'])
    if 'previewFront' in data:
        design.preview_front = data['previewFront']
    if 'previewBack' in data:
        design.preview_back = data['previewBack']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Design updated successfully',
        'design': design.to_dict()
    })

@custom_designs_bp.route('/<int:design_id>', methods=['DELETE'])
@jwt_required()
def delete_custom_design(design_id):
    """Delete a custom design."""
    user_id = get_jwt_identity()
    design = CustomDesign.query.filter_by(id=design_id, user_id=user_id).first()
    
    if not design:
        return jsonify({'message': 'Design not found'}), 404
    
    db.session.delete(design)
    db.session.commit()
    
    return jsonify({'message': 'Design deleted successfully'})

@custom_designs_bp.route('/base-product', methods=['GET'])
def get_base_product():
    """Get the base custom compression shirt product info."""
    product = Product.query.filter_by(category='custom', is_active=True).first()
    
    if not product:
        return jsonify({'message': 'Custom compression shirt product not found'}), 404
    
    return jsonify({'product': product.to_dict()})
