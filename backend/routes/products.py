from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Product

products_bp = Blueprint('products', __name__, url_prefix='/api/products')

@products_bp.route('', methods=['GET'])
@products_bp.route('/', methods=['GET'])
def get_products():
    """Get all active products."""
    category = request.args.get('category')
    
    query = Product.query.filter_by(is_active=True)
    
    if category:
        query = query.filter_by(category=category)
    
    products = query.all()
    return jsonify({'products': [p.to_dict() for p in products]})

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product by ID."""
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'message': 'Product not found'}), 404
    
    return jsonify({'product': product.to_dict()})

@products_bp.route('/featured', methods=['GET'])
def get_featured_products():
    """Get featured products."""
    products = Product.query.filter_by(is_active=True, is_featured=True).all()
    return jsonify({'products': [p.to_dict() for p in products]})

@products_bp.route('/new', methods=['GET'])
def get_new_arrivals():
    """Get new arrival products."""
    products = Product.query.filter_by(is_active=True, is_new=True).all()
    return jsonify({'products': [p.to_dict() for p in products]})

@products_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    """Create a new product (admin only in production)."""
    data = request.get_json()
    
    product = Product(
        name=data.get('name'),
        price=data.get('price'),
        original_price=data.get('originalPrice'),
        category=data.get('category', 'normal'),
        description=data.get('description'),
        image=data.get('image'),
        designer_id=data.get('designerId'),
        designer_name=data.get('designerName'),
        is_featured=data.get('isFeatured', False),
        is_new=data.get('isNew', False),
        quantity=data.get('quantity', 0)
    )
    
    if data.get('sizes'):
        import json
        product.sizes = json.dumps(data.get('sizes'))
    if data.get('colors'):
        import json
        product.colors = json.dumps(data.get('colors'))
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify({'product': product.to_dict()}), 201
