from datetime import datetime
from . import db

class CustomDesign(db.Model):
    """Customer-created custom compression shirt designs."""
    __tablename__ = 'custom_designs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    front_design = db.Column(db.Text, nullable=True)  # JSON string of front elements
    back_design = db.Column(db.Text, nullable=True)   # JSON string of back elements
    preview_front = db.Column(db.Text, nullable=True) # Base64 preview image
    preview_back = db.Column(db.Text, nullable=True)  # Base64 preview image
    base_product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', backref=db.backref('custom_designs', lazy=True))
    base_product = db.relationship('Product', backref=db.backref('custom_designs', lazy=True))
    
    def to_dict(self):
        import json
        return {
            'id': self.id,
            'userId': self.user_id,
            'name': self.name,
            'frontDesign': json.loads(self.front_design) if self.front_design else [],
            'backDesign': json.loads(self.back_design) if self.back_design else [],
            'previewFront': self.preview_front,
            'previewBack': self.preview_back,
            'baseProductId': self.base_product_id,
            'createdAt': self.created_at.strftime('%Y-%m-%d %H:%M') if self.created_at else None,
            'updatedAt': self.updated_at.strftime('%Y-%m-%d %H:%M') if self.updated_at else None,
        }
