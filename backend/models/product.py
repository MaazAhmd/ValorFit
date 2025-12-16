from datetime import datetime
import json
from . import db

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, nullable=False)
    original_price = db.Column(db.Float, nullable=True)
    category = db.Column(db.String(50), nullable=False, default='normal')  # normal, designer
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(500), nullable=False)
    images = db.Column(db.Text, nullable=True)  # JSON array of image URLs
    sizes = db.Column(db.Text, nullable=False, default='["S","M","L","XL"]')  # JSON array
    colors = db.Column(db.Text, nullable=False, default='[]')  # JSON array of {name, hex}
    designer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    designer_name = db.Column(db.String(100), nullable=True)
    is_featured = db.Column(db.Boolean, default=False)
    is_new = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    quantity = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'price': self.price,
            'originalPrice': self.original_price,
            'category': self.category,
            'description': self.description,
            'image': self.image,
            'images': json.loads(self.images) if self.images else [],
            'sizes': json.loads(self.sizes) if self.sizes else [],
            'colors': json.loads(self.colors) if self.colors else [],
            'designer': self.designer_name,
            'designerId': self.designer_id,
            'isFeatured': self.is_featured,
            'isNew': self.is_new,
            'isActive': self.is_active,
            'quantity': self.quantity
        }
