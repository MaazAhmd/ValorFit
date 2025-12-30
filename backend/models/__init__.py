from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

from .user import User
from .product import Product
from .design import Design
from .order import Order
from .transaction import Transaction
from .tryon import TryOn
from .custom_design import CustomDesign
