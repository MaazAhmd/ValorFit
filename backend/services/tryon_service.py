import base64
import google.genai as genai
from google.genai import types
from config import Config
import os
from PIL import Image
import io
import traceback

# Validate Gemini API key
if not Config.GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set. Add it to your .env or environment.")


def base64_to_image(base64_str: str) -> bytes:
    """Convert base64 string to image bytes."""
    return base64.b64decode(base64_str)

def image_to_base64(image_data: bytes) -> str:
    """Convert image bytes to base64 string."""
    return base64.b64encode(image_data).decode("utf-8")

def generate_tryon(user_photo: bytes, product_image: bytes, product_name: str) -> bytes:
    """
    Use Gemini 2.5 Flash to composite user photo with t-shirt.
    Returns resulting image as bytes (JPG format).
    """
    try:
        client = genai.Client(api_key=Config.GEMINI_API_KEY)
        
        # Convert bytes to PIL Images
        user_pil = Image.open(io.BytesIO(user_photo))
        product_pil = Image.open(io.BytesIO(product_image))
        
        # Create the composition prompt
        prompt = f"""Create a professional e-commerce fashion photo.
Take the {product_name} from the first image and let the person from the second image wear it. 
Generate a realistic, full-body or upper-body shot of the person wearing the {product_name}.
Adjust lighting and shadows to match the original environment.
Keep the person's face and body proportions natural.
Make the {product_name} fit naturally on their body.

Return ONLY the composite image without any text or watermarks."""

        # Call Gemini with images using the correct format
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[product_pil, user_pil, prompt]
        )

        # Extract image from response
        print(f"Response parts: {len(response.parts)}")
        for part in response.parts:
            print(f"Part: {part}")
            if part.inline_data is not None:
                return part.inline_data.data
        
        raise Exception("No image returned from Gemini")
    
    except Exception as e:
        print(f"ERROR in generate_tryon: {str(e)}")
        traceback.print_exc()
        raise Exception(f"Gemini try-on failed: {str(e)}")

def save_tryon_image(image_data: bytes, filename: str) -> str:
    """Save try-on image to uploads folder."""
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
    with open(filepath, 'wb') as f:
        f.write(image_data)
    return filepath