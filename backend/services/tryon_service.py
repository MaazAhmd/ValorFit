import base64
import requests
import time
from config import Config
import os
from PIL import Image
import io
import traceback

# Validate FASHN API key
if not Config.FASHN_API_KEY:
    raise RuntimeError("FASHN_API_KEY is not set. Add it to your .env or environment.")

FASHN_API_BASE = "https://api.fashn.ai/v1"


def base64_to_image(base64_str: str) -> bytes:
    """Convert base64 string to image bytes."""
    return base64.b64decode(base64_str)

def image_to_base64(image_data: bytes) -> str:
    """Convert image bytes to base64 string."""
    return base64.b64encode(image_data).decode("utf-8")

def generate_tryon(user_photo: bytes, product_image: bytes, product_name: str) -> bytes:
    """
    Use FASHN Virtual Try-On v1.6 API to generate realistic try-on image.
    Returns resulting image as bytes (PNG format).
    """
    try:
        # Convert bytes to base64 with proper prefix
        user_photo_base64 = f"data:image/jpeg;base64,{image_to_base64(user_photo)}"
        product_image_base64 = f"data:image/jpeg;base64,{image_to_base64(product_image)}"
        
        # Submit try-on request
        headers = {
            "Authorization": f"Bearer {Config.FASHN_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model_name": "tryon-v1.6",
            "inputs": {
                "model_image": user_photo_base64,
                "garment_image": product_image_base64,
                "category": "auto",
                "mode": "balanced",
                "output_format": "png"
            }
        }
        
        # Submit request
        print("Submitting try-on request to FASHN API...")
        response = requests.post(
            f"{FASHN_API_BASE}/run",
            headers=headers,
            json=payload
        )
        
        if response.status_code != 200:
            raise Exception(f"FASHN API request failed: {response.status_code} - {response.text}")
        
        result = response.json()
        prediction_id = result.get("id")
        
        if not prediction_id:
            raise Exception(f"No prediction ID returned: {result}")
        
        print(f"Prediction ID: {prediction_id}")
        
        # Poll for completion
        status_url = f"{FASHN_API_BASE}/status/{prediction_id}"
        max_attempts = 60  # 60 attempts * 2 seconds = 2 minutes max
        attempt = 0
        
        while attempt < max_attempts:
            time.sleep(2)  # Wait 2 seconds between polls
            attempt += 1
            
            status_response = requests.get(status_url, headers=headers)
            
            if status_response.status_code != 200:
                raise Exception(f"Status check failed: {status_response.status_code}")
            
            status_result = status_response.json()
            status = status_result.get("status")
            
            print(f"Attempt {attempt}: Status = {status}")
            
            if status == "completed":
                output = status_result.get("output")
                if not output or len(output) == 0:
                    raise Exception("No output image URL returned")
                
                # Download the result image
                image_url = output[0]
                print(f"Downloading result from: {image_url}")
                
                image_response = requests.get(image_url)
                if image_response.status_code != 200:
                    raise Exception(f"Failed to download result image: {image_response.status_code}")
                
                return image_response.content
            
            elif status == "failed":
                error = status_result.get("error", "Unknown error")
                raise Exception(f"FASHN try-on failed: {error}")
            
            # Status is still "processing" or "queued", continue polling
        
        raise Exception("Try-on timed out after 2 minutes")
    
    except Exception as e:
        print(f"ERROR in generate_tryon: {str(e)}")
        traceback.print_exc()
        raise Exception(f"FASHN try-on failed: {str(e)}")

def save_tryon_image(image_data: bytes, filename: str) -> str:
    """Save try-on image to uploads folder."""
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
    with open(filepath, 'wb') as f:
        f.write(image_data)
    return filepath