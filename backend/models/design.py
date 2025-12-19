from datetime import datetime
from . import db

class Design(db.Model):
    __tablename__ = 'designs'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    designer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    image = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(50), default='designer')  # classic, designer
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    rejection_reason = db.Column(db.Text, nullable=True)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    sales = db.Column(db.Integer, default=0)
    revenue = db.Column(db.Float, default=0.0)
    price = db.Column(db.Float, default=29.99)  # Designer sets the price
    description = db.Column(db.Text, nullable=True)  # Optional description
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)  # Link to created product
    
    def to_dict(self):
        return {
            'id': f'DES-{self.id:03d}',
            'numericId': self.id,
            'name': self.name,
            'designerId': str(self.designer_id),
            'designerName': self.designer.name if self.designer else None,
            'image': self.image,
            'category': self.category,
            'status': self.status,
            'rejectionReason': self.rejection_reason,
            'uploadDate': self.upload_date.strftime('%Y-%m-%d') if self.upload_date else None,
            'sales': self.sales,
            'revenue': self.revenue,
            'price': self.price,
            'description': self.description,
            'productId': self.product_id
        }
