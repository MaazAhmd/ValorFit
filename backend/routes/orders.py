from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
from models import db, Order, User
from utils.decorators import admin_required

orders_bp = Blueprint('orders', __name__, url_prefix='/api/orders')

@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_orders():
    """Get orders - admin sees all, user sees own."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    if user.role == 'admin':
        orders = Order.query.order_by(Order.created_at.desc()).all()
    else:
        orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    
    return jsonify({'orders': [o.to_dict() for o in orders]})

@orders_bp.route('', methods=['POST'])
@jwt_required()
def create_order():
    """Create a new order."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    items = data.get('items', [])
    if not items:
        return jsonify({'message': 'Order must contain items'}), 400
        
    # Check inventory and deduct stock
    from models import Product # Ensure Product is imported
    
    total_amount = 0
    for item in items:
        product_id = item.get('productId') or item.get('id')
        quantity = item.get('quantity', 1)
        
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'message': f'Product {product_id} not found'}), 404
            
        if product.quantity < quantity:
            return jsonify({'message': f'Insufficient stock for {product.name}. Available: {product.quantity}'}), 400
            
        product.quantity -= quantity
        total_amount += product.price * quantity

    order = Order(
        user_id=user_id,
        items=json.dumps(items),
        total=data.get('total', total_amount),
        shipping_address=data.get('shippingAddress', ''),
        customer_name=data.get('customerName', user.name),
        customer_email=data.get('customerEmail', user.email),
        status='pending',
        payment_method=data.get('paymentMethod', 'cod'),
        payment_status='pending'
    )
    
    db.session.add(order)
    db.session.commit()
    
    return jsonify({
        'message': 'Order created successfully',
        'order': order.to_dict()
    }), 201

@orders_bp.route('/<int:order_id>/status', methods=['PUT'])
@jwt_required()
@admin_required
def update_order_status(order_id):
    """Update order status (admin only)."""
    data = request.get_json()
    new_status = data.get('status')
    
    if new_status not in ['pending', 'processing', 'shipped', 'delivered', 'cancelled']:
        return jsonify({'message': 'Invalid status'}), 400
    
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'message': 'Order not found'}), 404
    
    order.status = new_status
    db.session.commit()
    
    return jsonify({
        'message': 'Order status updated',
        'order': order.to_dict()
    })

@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """Get a single order."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'message': 'Order not found'}), 404
    
    # Check access
    if order.user_id != user_id and user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    
    return jsonify({'order': order.to_dict()})
