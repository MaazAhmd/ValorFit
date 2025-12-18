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

@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Update a product (admin only in production)."""
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    data = request.get_json()
    
    # Update fields if provided
    if 'name' in data:
        product.name = data['name']
    if 'price' in data:
        product.price = data['price']
    if 'originalPrice' in data:
        product.original_price = data['originalPrice']
    if 'category' in data:
        product.category = data['category']
    if 'description' in data:
        product.description = data['description']
    if 'image' in data:
        product.image = data['image']
    if 'isFeatured' in data or 'is_featured' in data:
        product.is_featured = data.get('isFeatured', data.get('is_featured', False))
    if 'isNew' in data or 'is_new' in data:
        product.is_new = data.get('isNew', data.get('is_new', False))
    if 'quantity' in data:
        product.quantity = data['quantity']
    if 'isActive' in data or 'is_active' in data:
        product.is_active = data.get('isActive', data.get('is_active', True))
    if 'sizes' in data:
        import json
        product.sizes = json.dumps(data['sizes'])
    if 'colors' in data:
        import json
        product.colors = json.dumps(data['colors'])
    
    db.session.commit()
    
    return jsonify({'product': product.to_dict()})

@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """Delete a product (admin only in production)."""
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    db.session.delete(product)
    db.session.commit()
    
    return jsonify({'message': 'Product deleted successfully'})
