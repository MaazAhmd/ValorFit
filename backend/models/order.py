from datetime import datetime
import json
from . import db

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    items = db.Column(db.Text, nullable=False)  # JSON array of order items
    total = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, processing, shipped, delivered, cancelled
    payment_method = db.Column(db.String(50), default='cod')
    payment_status = db.Column(db.String(20), default='pending')
    shipping_address = db.Column(db.Text, nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        items_list = json.loads(self.items) if self.items else []
        # Get first product name for display
        product_name = items_list[0].get('name', 'Unknown') if items_list else 'Unknown'
        
        return {
            'id': f'ORD-{self.id:03d}',
            'userId': self.user_id,
            'customerName': self.customer_name,
            'customerEmail': self.customer_email,
            'productName': product_name,
            'items': items_list,
            'quantity': sum(item.get('quantity', 1) for item in items_list),
            'price': self.total,
            'status': self.status,
            'paymentMethod': self.payment_method,
            'paymentStatus': self.payment_status,
            'shippingAddress': self.shipping_address,
            'date': self.created_at.strftime('%Y-%m-%d') if self.created_at else None
        }
