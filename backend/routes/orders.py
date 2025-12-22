from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
from models import db, Order, User, Product, Transaction, Design
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

    # Create pending earning transactions for designers at order creation
    try:
        db.session.flush()

        items_list = items
        earnings_by_designer = {}

        for item in items_list:
            product_id = item.get('productId') or item.get('id')
            quantity = item.get('quantity', 1)

            product = Product.query.get(product_id)
            if not product:
                continue

            designer_id = product.designer_id
            if not designer_id:
                continue

            earning = (product.price or 0) * quantity * 0.05
            if earning > 0:
                earnings_by_designer.setdefault(designer_id, 0)
                earnings_by_designer[designer_id] += earning

        desc = f'Earnings for order ORD-{order.id:03d}'
        for designer_id, amount in earnings_by_designer.items():
            # Avoid duplicating pending transactions for same order+designer
            existing = Transaction.query.filter_by(user_id=designer_id, type='earning', status='pending', description=desc).first()
            if existing:
                continue
            if data.get("paymentMethod") == "cod":
                tx = Transaction(
                    user_id=designer_id,
                    type='earning',
                    amount=amount,
                    description=desc,
                    status='pending'
                )
            else:
                designer = User.query.get(designer_id)
                if not designer:
                  continue
                designer.wallet_balance = (designer.wallet_balance or 0) + amount
                tx = Transaction(
                    user_id=designer_id,
                    type='earning',
                    amount=amount,
                    description=desc,
                    status='completed'
                )

            db.session.add(tx)

    except Exception:
        db.session.rollback()
        return jsonify({'message': 'Failed to create pending transactions for designers'}), 500

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

    previous_status = order.status
    order.status = new_status

    # If order moves to processing or shipped, create pending earning transactions for designers
    if new_status in ['processing', 'shipped'] and previous_status != new_status:
        try:
            items = json.loads(order.items) if order.items else []
            earnings_by_designer = {}

            for item in items:
                product_id = item.get('productId') or item.get('id')
                quantity = item.get('quantity', 1)

                product = Product.query.get(product_id)
                if not product:
                    continue

                designer_id = product.designer_id
                if not designer_id:
                    continue

                earning = (product.price or 0) * quantity * 0.05
                if earning > 0:
                    earnings_by_designer.setdefault(designer_id, 0)
                    earnings_by_designer[designer_id] += earning

            desc = f'Earnings for order ORD-{order.id:03d}'
            # Create pending transactions, avoid duplicates
            for designer_id, amount in earnings_by_designer.items():
                existing = Transaction.query.filter_by(user_id=designer_id, type='earning', status='pending', description=desc).first()
                if existing:
                    continue

                tx = Transaction(
                    user_id=designer_id,
                    type='earning',
                    amount=amount,
                    description=desc,
                    status='pending'
                )
                db.session.add(tx)

        except Exception:
            db.session.rollback()
            return jsonify({'message': 'Failed to create pending transactions for designers'}), 500

    # If delivered: complete pending transactions, credit wallets and update design sales
    if new_status == 'delivered' and previous_status != 'delivered':
        try:
            desc = f'Earnings for order ORD-{order.id:03d}'
            # Find pending earning transactions for this order
            pending_txs = Transaction.query.filter_by(description=desc, type='earning', status='pending').all()

            items = json.loads(order.items) if order.items else []
            sales_by_design = {}

            if pending_txs:
                # Complete existing pending transactions and credit wallets
                for tx in pending_txs:
                    designer = User.query.get(tx.user_id)
                    if not designer:
                        continue
                    # Mark transaction completed
                    tx.status = 'completed'
                    # Credit wallet
                    designer.wallet_balance = (designer.wallet_balance or 0) + (tx.amount or 0)

                # Update design sales counts from order items
                for item in items:
                    product_id = item.get('productId') or item.get('id')
                    quantity = item.get('quantity', 1)
                    product = Product.query.get(product_id)
                    if not product:
                        continue
                    design = Design.query.filter_by(product_id=product.id).first()
                    if design:
                        sales_by_design.setdefault(design.id, 0)
                        sales_by_design[design.id] += quantity

                for design_id, qty in sales_by_design.items():
                    design = Design.query.get(design_id)
                    if not design:
                        continue
                    design.sales = (design.sales or 0) + qty

            else:
                earnings_by_designer = {}
                for item in items:
                    product_id = item.get('productId') or item.get('id')
                    quantity = item.get('quantity', 1)
                    product = Product.query.get(product_id)
                    if not product:
                        continue
                    designer_id = product.designer_id
                    if not designer_id:
                        continue
                    earning = (product.price or 0) * quantity * 0.05
                    if earning > 0:
                        earnings_by_designer.setdefault(designer_id, 0)
                        earnings_by_designer[designer_id] += earning

                    design = Design.query.filter_by(product_id=product.id).first()
                    if design:
                        sales_by_design.setdefault(design.id, 0)
                        sales_by_design[design.id] += quantity

                for designer_id, amount in earnings_by_designer.items():
                    designer = User.query.get(designer_id)
                    if not designer:
                        continue
                    designer.wallet_balance = (designer.wallet_balance or 0) + amount
                    tx = Transaction(
                        user_id=designer_id,
                        type='earning',
                        amount=amount,
                        description=desc,
                        status='completed'
                    )
                    db.session.add(tx)

                for design_id, qty in sales_by_design.items():
                    design = Design.query.get(design_id)
                    if not design:
                        continue
                    design.sales = (design.sales or 0) + qty

        except Exception:
            db.session.rollback()
            return jsonify({'message': 'Failed to complete transactions and credit designers'}), 500

    # Commit everything (order status and any transactions/wallet updates)
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
