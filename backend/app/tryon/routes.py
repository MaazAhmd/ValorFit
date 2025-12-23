import os
from flask import Blueprint, request, jsonify, current_app
import requests
from ..supabase_client import verify_token_get_user, call_postgrest, upload_file_to_storage
from .tryon_service import generate_tryon
import asyncio
import uuid

tryon_bp = Blueprint("tryon", __name__)

@tryon_bp.route("/", methods=["POST"])
def create_tryon():
    auth = request.headers.get("Authorization", "")
    token = auth.split("Bearer ")[-1] if auth else None
    user = verify_token_get_user(token)
    
    if not user:
        return jsonify({"message": "unauthorized"}), 401
    
    # Get files
    if "user_photo" not in request.files or "product_image" not in request.files:
        return jsonify({"message": "user_photo and product_image required"}), 400
    
    user_photo_file = request.files["user_photo"]
    product_image_file = request.files["product_image"]
    product_name = request.form.get("product_name", "t-shirt")
    
    try:
        # Read image bytes
        user_photo = user_photo_file.read()
        product_image = product_image_file.read()
        
        # Generate try-on image using FASHN API
        result_image = asyncio.run(generate_tryon(user_photo, product_image, product_name))
        
        # Upload result to storage
        filename = f"tryon_{uuid.uuid4()}.jpg"
        public_url = upload_file_to_storage(
            bucket="tryon-results",
            path=filename,
            file_data=result_image,
            content_type="image/jpeg"
        )
        
        # Save try-on record to database (optional)
        tryon_record = {
            "user_id": user["id"],
            "product_name": product_name,
            "result_image_url": public_url,
            "storage_path": filename
        }
        
        return jsonify({
            "success": True,
            "image_url": public_url,
            "record": tryon_record
        }), 200
    
    except Exception as e:
        return jsonify({"message": str(e)}), 500