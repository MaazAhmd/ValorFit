from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Design, Transaction
from utils.decorators import designer_required

designer_bp = Blueprint('designer', __name__, url_prefix='/api/designer')

@designer_bp.route('/stats', methods=['GET'])
@jwt_required()
@designer_required
def get_designer_stats():
    """Get dashboard statistics for designer with optional date filtering."""
    from datetime import datetime
    import json
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # Get date filters from query params
    date_from = request.args.get('dateFrom')
    date_to = request.args.get('dateTo')
    
    # Get all designs by this designer
    designs = Design.query.filter_by(designer_id=user_id).all()
    approved_designs = [d for d in designs if d.status == 'approved']
    pending_designs = [d for d in designs if d.status == 'pending']
    
    # Get all products by this designer
    from models import Product, Order
    products = Product.query.filter_by(designer_id=user_id, is_active=True).all()
    product_ids = [p.id for p in products]
    
    # Get all orders and filter for this designer's products
    orders_query = Order.query
    
    # Apply date filters
    if date_from:
        try:
            from_date = datetime.strptime(date_from, '%Y-%m-%d')
            orders_query = orders_query.filter(Order.created_at >= from_date)
        except ValueError:
            pass
    
    if date_to:
        try:
            to_date = datetime.strptime(date_to, '%Y-%m-%d')
            # Add 1 day to include the end date
            to_date = datetime(to_date.year, to_date.month, to_date.day, 23, 59, 59)
            orders_query = orders_query.filter(Order.created_at <= to_date)
        except ValueError:
            pass
    
    all_orders = orders_query.filter(Order.status != 'cancelled').all()
    
    # Calculate sales for each product
    product_sales = {}
    total_sales = 0
    total_revenue = 0
    
    for order in all_orders:
        try:
            items = json.loads(order.items) if order.items else []
            for item in items:
                item_product_id = item.get('productId') or item.get('id')
                if item_product_id:
                    try:
                        item_product_id = int(item_product_id)
                    except (ValueError, TypeError):
                        continue
                    
                    if item_product_id in product_ids:
                        quantity = item.get('quantity', 1)
                        price = item.get('price', 0)
                        item_total = price * quantity
                        
                        if item_product_id not in product_sales:
                            # Find the product
                            product = next((p for p in products if p.id == item_product_id), None)
                            product_sales[item_product_id] = {
                                'productId': str(item_product_id),
                                'productName': product.name if product else item.get('name', 'Unknown'),
                                'productImage': product.image if product else item.get('image', ''),
                                'unitsSold': 0,
                                'revenue': 0,
                                'commission': 0
                            }
                        
                        product_sales[item_product_id]['unitsSold'] += quantity
                        product_sales[item_product_id]['revenue'] += item_total
                        product_sales[item_product_id]['commission'] += item_total * 0.05
                        if order.status == 'delivered':
                            total_sales += quantity
                        total_revenue += item_total
        except (json.JSONDecodeError, TypeError):
            continue
    
    # Convert to list and sort by units sold
    product_sales_list = sorted(
        product_sales.values(), 
        key=lambda x: x['unitsSold'], 
        reverse=True
    )
    
    # Round values
    for ps in product_sales_list:
        ps['revenue'] = round(ps['revenue'], 2)
        ps['commission'] = round(ps['commission'], 2)
    
    total_commission = total_revenue * 0.05
    
    return jsonify({
        'stats': {
            'totalDesigns': len(designs),
            'approvedDesigns': len(approved_designs),
            'pendingDesigns': len(pending_designs),
            'activeProducts': len(products),
            'totalSales': total_sales,
            'totalRevenue': round(total_revenue, 2),
            'totalCommission': round(total_commission, 2),
            'walletBalance': user.wallet_balance
        },
        'productSales': product_sales_list,
        'designs': [d.to_dict() for d in designs]
    })

@designer_bp.route('/transactions', methods=['GET'])
@jwt_required()
@designer_required
def get_transactions():
    """Get transaction history for designer."""
    user_id = get_jwt_identity()
    transactions = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.created_at.desc()).all()
    
    return jsonify({'transactions': [t.to_dict() for t in transactions]})

@designer_bp.route('/withdraw', methods=['POST'])
@jwt_required()
@designer_required
def request_withdrawal():
    """Request withdrawal from wallet."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    amount = data.get('amount', 0)
    
    if amount <= 0:
        return jsonify({'message': 'Invalid withdrawal amount'}), 400
    
    if amount > user.wallet_balance:
        return jsonify({'message': 'Insufficient wallet balance'}), 400
    
    # Create withdrawal transaction
    transaction = Transaction(
        user_id=user_id,
        type='withdrawal',
        amount=-amount,
        description='Withdrawal to bank account',
        status='pending'
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        'message': 'Withdrawal request submitted',
        'transaction': transaction.to_dict()
    })

@designer_bp.route('/designs', methods=['GET'])
@jwt_required()
@designer_required
def get_my_designs():
    """Get designs for current designer."""
    user_id = get_jwt_identity()
    designs = Design.query.filter_by(designer_id=user_id, is_deleted=False).order_by(Design.upload_date.desc()).all()
    
    return jsonify({'designs': [d.to_dict() for d in designs]})
