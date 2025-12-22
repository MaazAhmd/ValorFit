"""
Upload routes for handling local file storage.
Provides endpoints for uploading and serving product/design images.
"""
import os
import uuid
from flask import Blueprint, request, jsonify, current_app, redirect
from flask_jwt_extended import jwt_required
from config import Config
import boto3
from botocore.config import Config as BotoConfig

uploads_bp = Blueprint('uploads', __name__, url_prefix='/api/uploads')

# Create S3-compatible client for Cloudflare R2
s3_client = boto3.client(
    's3',
    endpoint_url=Config.R2_ENDPOINT,
    aws_access_key_id=Config.R2_ACCESS_KEY_ID,
    aws_secret_access_key=Config.R2_SECRET_ACCESS_KEY,
    config=BotoConfig(signature_version='s3v4'),
)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def generate_presigned_get_url(bucket: str, key: str, expires: int = 3600) -> str:
    """
    Generate a presigned GET URL for a private R2 object.
    """
    return s3_client.generate_presigned_url(
        'get_object',
        Params={'Bucket': bucket, 'Key': key},
        ExpiresIn=expires
    )


def upload_to_r2(bucket: str, key: str, file_stream, content_type: str) -> str:
    """
    Uploads file to R2 and returns a presigned GET URL.
    """
    try:
        file_stream.seek(0)
    except Exception:
        pass

    s3_client.put_object(
        Bucket=bucket,
        Key=key,
        Body=file_stream.read(),
        ContentType=content_type
    )

    # ALWAYS return presigned URL (bucket is private)
    return generate_presigned_get_url(bucket, key)


@uploads_bp.route('/product', methods=['POST'])
@jwt_required()
def upload_product_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Use: png, jpg, jpeg, gif, webp'}), 400

    try:
        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{ext}"
        key = f"products/{unique_filename}"
        content_type = file.mimetype or f"image/{ext}"

        image_url = upload_to_r2(Config.R2_BUCKET, key, file.stream, content_type)

        return jsonify({
            'success': True,
            'image_url': image_url,   # presigned URL
            'filename': unique_filename
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@uploads_bp.route('/design', methods=['POST'])
@jwt_required()
def upload_design_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Use: png, jpg, jpeg, gif, webp'}), 400

    try:
        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{ext}"
        key = f"designs/{unique_filename}"
        content_type = file.mimetype or f"image/{ext}"

        image_url = upload_to_r2(Config.R2_BUCKET, key, file.stream, content_type)

        return jsonify({
            'success': True,
            'image_url': image_url,   # presigned URL
            'filename': unique_filename
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@uploads_bp.route('/products/<filename>', methods=['GET'])
def serve_product_image(filename):
    """
    Redirect to a presigned URL (keeps bucket private).
    """
    key = f"products/{filename}"
    url = generate_presigned_get_url(Config.R2_BUCKET, key)
    return redirect(url, code=302)


@uploads_bp.route('/designs/<filename>', methods=['GET'])
def serve_design_image(filename):
    key = f"designs/{filename}"
    url = generate_presigned_get_url(Config.R2_BUCKET, key)
    return redirect(url, code=302)
