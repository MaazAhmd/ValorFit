import json
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from config import Config
from models import db, bcrypt, User, Product

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    migrate = Migrate(app, db)

    JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.products import products_bp
    from routes.designs import designs_bp
    from routes.orders import orders_bp
    from routes.admin import admin_bp
    from routes.designer import designer_bp
    from routes.tryon import tryon_bp
    from routes.uploads import uploads_bp
    from routes.custom_designs import custom_designs_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(designs_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(designer_bp)
    app.register_blueprint(tryon_bp)
    app.register_blueprint(uploads_bp)
    app.register_blueprint(custom_designs_bp)
    
    # with app.app_context():
    #     print("Dropping all tables...")
    #     db.drop_all()
    #     print("Creating all tables...")
    #     db.create_all()
    #     seed_database()

    return app

def seed_database():
    """Seed the database with initial data."""
    # Check if admin already exists
    if User.query.filter_by(email='admin@tshirt.com').first():
        return
    
    print("Seeding database...")
    
    # Create admin user
    admin = User(
        name='Admin',
        email='admin@tshirt.com',
        role='admin'
    )
    admin.set_password('admin123')
    db.session.add(admin)
    
    # Create sample designer
    designer = User(
        name='Alex Rivera',
        email='alex@designer.com',
        role='designer',
        wallet_balance=1850.25
    )
    designer.set_password('designer123')
    db.session.add(designer)
    
    # Create sample customer
    customer = User(
        name='John Doe',
        email='john@customer.com',
        role='customer'
    )
    customer.set_password('customer123')
    db.session.add(customer)
    
    db.session.commit()
    
    # Seed products
    products_data = [
        {
            'name': 'Midnight Essence',
            'price': 49,
            'category': 'normal',
            'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
            'colors': [{'name': 'Black', 'hex': '#0a0a0a'}, {'name': 'Charcoal', 'hex': '#2d2d2d'}],
            'image': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
            'description': 'Premium cotton tee with minimalist design. Perfect for everyday wear.',
            'is_featured': True
        },
        {
            'name': 'Urban Edge',
            'price': 55,
            'original_price': 70,
            'category': 'normal',
            'sizes': ['S', 'M', 'L', 'XL'],
            'colors': [{'name': 'White', 'hex': '#f5f5f5'}, {'name': 'Grey', 'hex': '#6b6b6b'}],
            'image': 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop',
            'description': 'Street-ready style with premium quality fabric.',
            'is_new': True
        },
        {
            'name': 'Neon Dreams',
            'price': 120,
            'category': 'designer',
            'designer_id': 2,
            'designer_name': 'Alex Rivera',
            'sizes': ['S', 'M', 'L', 'XL'],
            'colors': [{'name': 'Black', 'hex': '#0a0a0a'}],
            'image': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=800&fit=crop',
            'description': 'Limited edition designer piece featuring neon accents and unique graphics.',
            'is_featured': True
        },
        {
            'name': 'Void Walker',
            'price': 150,
            'category': 'designer',
            'designer_id': 2,
            'designer_name': 'Alex Rivera',
            'sizes': ['M', 'L', 'XL'],
            'colors': [{'name': 'Obsidian', 'hex': '#1a1a1a'}, {'name': 'Smoke', 'hex': '#3d3d3d'}],
            'image': 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop',
            'description': 'Abstract geometric patterns meet luxury streetwear.',
            'is_new': True,
            'is_featured': True
        },
        {
            'name': 'Classic Raw',
            'price': 45,
            'category': 'normal',
            'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
            'colors': [{'name': 'Black', 'hex': '#0a0a0a'}, {'name': 'Navy', 'hex': '#1a1a2e'}, {'name': 'Forest', 'hex': '#1a2e1a'}],
            'image': 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=800&fit=crop',
            'description': 'Timeless design with raw edge details.'
        },
        {
            'name': 'Digital Flux',
            'price': 135,
            'category': 'designer',
            'designer_id': 2,
            'designer_name': 'Alex Rivera',
            'sizes': ['S', 'M', 'L'],
            'colors': [{'name': 'Black', 'hex': '#0a0a0a'}],
            'image': 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=800&fit=crop',
            'description': 'Digital art meets fashion in this exclusive designer collaboration.'
        },
        {
            'name': 'Shadow Line',
            'price': 52,
            'category': 'normal',
            'sizes': ['S', 'M', 'L', 'XL'],
            'colors': [{'name': 'Slate', 'hex': '#4a4a4a'}, {'name': 'Onyx', 'hex': '#121212'}],
            'image': 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&h=800&fit=crop',
            'description': 'Subtle shadow print on premium cotton blend.'
        },
        {
            'name': 'Essential Noir',
            'price': 42,
            'category': 'normal',
            'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
            'colors': [{'name': 'Black', 'hex': '#0a0a0a'}],
            'image': 'https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?w=600&h=800&fit=crop',
            'description': 'The essential black tee, perfected.',
            'is_featured': True
        },
        {
            'name': 'Pulse',
            'price': 48,
            'category': 'normal',
            'sizes': ['S', 'M', 'L', 'XL'],
            'colors': [{'name': 'Dark Grey', 'hex': '#333333'}, {'name': 'Black', 'hex': '#0a0a0a'}],
            'image': 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&h=800&fit=crop',
            'description': 'Dynamic comfort for an active lifestyle.'
        },
        {
            'name': 'Ethereal',
            'price': 195,
            'category': 'designer',
            'designer_id': 2,
            'designer_name': 'Alex Rivera',
            'sizes': ['S', 'M', 'L'],
            'colors': [{'name': 'Phantom', 'hex': '#1f1f1f'}],
            'image': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop',
            'description': 'Where dreams meet fabric. A designer masterpiece.',
            'is_featured': True
        },
        # Custom Compression Shirt - Base product for customer customization
        {
            'name': 'Custom Compression Shirt',
            'price': 35,
            'category': 'custom',
            'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
            'colors': [{'name': 'White', 'hex': '#ffffff'}],
            'image': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
            'description': 'Design your own custom compression shirt! Upload your artwork or use our design tools.',
            'is_featured': True,
            'quantity': 999999
        }
    ]
    
    for p_data in products_data:
        product = Product(
            name=p_data['name'],
            price=p_data['price'],
            original_price=p_data.get('original_price'),
            category=p_data['category'],
            description=p_data['description'],
            image=p_data['image'],
            sizes=json.dumps(p_data['sizes']),
            colors=json.dumps(p_data['colors']),
            designer_id=p_data.get('designer_id'),
            designer_name=p_data.get('designer_name'),
            is_featured=p_data.get('is_featured', False),
            is_new=p_data.get('is_new', False)
        )
        db.session.add(product)
    
    db.session.commit()
    print("Database seeded successfully!")
    print("Admin: admin@tshirt.com / admin123")
    print("Designer: alex@designer.com / designer123")
    print("Customer: john@customer.com / customer123")


if __name__ == '__main__':
    app = create_app()
    print("\nFlask backend running on http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, port=5001)
