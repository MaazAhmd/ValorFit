from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Design, User, Product
from utils.decorators import admin_required, designer_required
import json

designs_bp = Blueprint('designs', __name__, url_prefix='/api/designs')

@designs_bp.route('', methods=['GET'])
@jwt_required()
def get_designs():
    """Get designs - admin sees all, designer sees own."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # Only return non-deleted designs
    if user.role == 'admin':
        designs = Design.query.filter_by(is_deleted=False).all()
    else:
        designs = Design.query.filter_by(designer_id=user_id, is_deleted=False).all()
    
    return jsonify({'designs': [d.to_dict() for d in designs]})

@designs_bp.route('', methods=['POST'])
@jwt_required()
@designer_required
def create_design():
    """Submit a new design for approval."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    # Validate price
    price = data.get('price', 29.99)
    try:
        price = float(price)
        if price < 10:
            price = 29.99
    except (ValueError, TypeError):
        price = 29.99
    
    design = Design(
        name=data.get('name'),
        designer_id=user_id,
        image=data.get('image'),
        category='designer',  # Always 'designer' category for designer uploads
        status='pending',
        price=price,
        description=data.get('description', '')
    )
    
    db.session.add(design)
    db.session.commit()
    
    return jsonify({
        'message': 'Design submitted for approval',
        'design': design.to_dict()
    }), 201

@designs_bp.route('/<int:design_id>/approve', methods=['PUT'])
@jwt_required()
@admin_required
def approve_design(design_id):
    """Approve a design and create a product (admin only)."""
    design = Design.query.get(design_id)
    
    if not design:
        return jsonify({'message': 'Design not found'}), 404
    
    # Get designer info
    designer = User.query.get(design.designer_id)
    designer_name = designer.name if designer else 'Unknown Designer'
    
    # Create a product from this design
    product = Product(
        name=design.name,
        price=design.price,
        original_price=None,
        category='designer',
        description=design.description or f"Exclusive design by {designer_name}",
        image=design.image,
        designer_id=design.designer_id,
        designer_name=designer_name,
        is_featured=False,
        is_new=True,
        is_active=True,
        quantity=999999,  # "Infinite" stock for designer products
        sizes=json.dumps(['S', 'M', 'L', 'XL', 'XXL']),
        colors=json.dumps([{'name': 'Black', 'hex': '#000000'}, {'name': 'White', 'hex': '#FFFFFF'}])
    )
    
    db.session.add(product)
    db.session.flush()  # Get the product ID
    
    # Update design status and link to product
    design.status = 'approved'
    design.product_id = product.id
    
    db.session.commit()
    
    return jsonify({
        'message': 'Design approved and product created successfully',
        'design': design.to_dict(),
        'product': product.to_dict()
    })

@designs_bp.route('/<int:design_id>/reject', methods=['PUT'])
@jwt_required()
@admin_required
def reject_design(design_id):
    """Reject a design (admin only)."""
    design = Design.query.get(design_id)
    data = request.get_json()
    
    if not design:
        return jsonify({'message': 'Design not found'}), 404
    
    design.status = 'rejected'
    design.rejection_reason = data.get('reason', '')
    db.session.commit()
    
    return jsonify({
        'message': 'Design rejected',
        'design': design.to_dict()
    })

@designs_bp.route('/<int:design_id>', methods=['DELETE'])
@jwt_required()
def delete_design(design_id):
    """Soft-delete a design (owner or admin only). Marks `is_deleted=True` and keeps product and orders intact."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    design = Design.query.get(design_id)

    if not design:
        return jsonify({'message': 'Design not found'}), 404

    if design.designer_id != user_id and user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403

    # Soft-delete: mark the design as deleted so historical orders remain valid
    design.is_deleted = True
    db.session.commit()

    return jsonify({'message': 'Design deleted (soft) successfully'})

@designs_bp.route('/<int:design_id>', methods=['PUT'])
@jwt_required()
def update_design(design_id):
    """Update a design (owner or admin only)."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    design = Design.query.get(design_id)
    data = request.get_json()
    
    if not design:
        return jsonify({'message': 'Design not found'}), 404
    
    if design.designer_id != user_id and user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    
    # Update allowed fields
    if 'name' in data:
        design.name = data['name']
    if 'price' in data:
        try:
            design.price = float(data['price'])
        except (ValueError, TypeError):
            pass
    if 'description' in data:
        design.description = data['description']
    if 'image' in data:
        design.image = data['image']
    
    # If design is approved and has a product, update the product too
    if design.status == 'approved' and design.product_id:
        product = Product.query.get(design.product_id)
        if product:
            if 'name' in data:
                product.name = data['name']
            if 'price' in data:
                try:
                    product.price = float(data['price'])
                except (ValueError, TypeError):
                    pass
            if 'description' in data:
                product.description = data['description']
            if 'image' in data:
                product.image = data['image']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Design updated successfully',
        'design': design.to_dict()
    })
