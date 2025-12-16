from datetime import datetime
from . import db

class TryOn(db.Model):
    __tablename__ = 'try_ons'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='tryons')
    product = db.relationship('Product', backref='tryons')
