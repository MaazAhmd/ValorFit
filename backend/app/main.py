from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)
    # config from env
    # app.config["FASHN_API_KEY"] = os.getenv("FASHN_API_KEY")
    # register blueprints
    from .auth.routes import auth_bp
    from .products.routes import products_bp
    from .cart.routes import cart_bp
    from .upload.routes import upload_bp
    from .tryon.routes import tryon_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(products_bp, url_prefix="/api/products")
    app.register_blueprint(cart_bp, url_prefix="/api/cart")
    app.register_blueprint(upload_bp, url_prefix="/api/upload")
    app.register_blueprint(tryon_bp, url_prefix="/api/tryon")

    # simple health / root route
    @app.route("/", methods=["GET"])
    def index():
        return {"status": "ok", "service": "T-Shirt Studio backend"}

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=int(os.getenv("PORT", 8000)))
