from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user (customer or designer)."""
    data = request.get_json()
    
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'customer')
    
    if not all([name, email, password]):
        return jsonify({'message': 'Name, email, and password are required'}), 400
    
    if role not in ['customer', 'designer']:
        return jsonify({'message': 'Invalid role. Must be customer or designer'}), 400
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'message': 'Email already registered'}), 409
    
    # Create new user
    user = User(name=name, email=email, role=role)
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()
    
    # Create token
    token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Registration successful',
        'access_token': token,
        'user': user.to_dict(include_wallet=True)
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login for customers and designers."""
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'customer')
    
    if not all([email, password]):
        return jsonify({'message': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Check if user has the requested role (or is admin which can access everything)
    if user.role != role and user.role != 'admin':
        return jsonify({'message': f'This account is not registered as a {role}'}), 403
    
    token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Login successful',
        'access_token': token,
        'user': user.to_dict(include_wallet=True)
    })

@auth_bp.route('/admin/login', methods=['POST'])
def admin_login():
    """Login for admins only."""
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({'message': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    if user.role != 'admin':
        return jsonify({'message': 'Access denied. Admin privileges required.'}), 403
    
    token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Admin login successful',
        'access_token': token,
        'user': user.to_dict()
    })

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict(include_wallet=True)})

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout current user (frontend should remove token)."""
    return jsonify({'message': 'Logged out successfully'})
