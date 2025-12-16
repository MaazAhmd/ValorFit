import base64
import google.genai as genai
from config import Config
import os
from PIL import Image
import io

# Configure Gemini API; provide clear error if missing.
if not Config.GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set. Add it to your .env or environment.")
genai.configure(api_key=Config.GEMINI_API_KEY)

def image_to_base64(image_data: bytes) -> str:
    """Convert image bytes to base64 string."""
    return base64.b64encode(image_data).decode("utf-8")

def base64_to_image(base64_str: str) -> bytes:
    """Convert base64 string to image bytes."""
    return base64.b64decode(base64_str)

def generate_tryon(user_photo: bytes, product_image: bytes, product_name: str) -> bytes:
    """
    Use Gemini 2.5 Flash to composite user photo with t-shirt.
    Returns resulting image as bytes (JPG format).
    
    Equivalent to the Java snippet:
    - Takes user photo (model) and product image (t-shirt)
    - Sends both to Gemini with composition prompt
    - Returns composite image
    """
    try:
        client = genai.Client()
        
        # Create the composition prompt (same as Java example)
        prompt = f"""Create a professional e-commerce fashion photo.
Take the {product_name} from the product image and let the person in the user photo wear it. 
Generate a realistic, full-body or upper-body shot of the person wearing the {product_name}.
Adjust lighting and shadows to match the original environment.
Keep the person's face and body proportions natural.
Make the {product_name} fit naturally on their body.

Return ONLY the composite image without any text or watermarks."""

        # Call Gemini with both images (same structure as Java)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                {
                    "role": "user",
                    "parts": [
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": image_to_base64(user_photo)
                            }
                        },
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": image_to_base64(product_image)
                            }
                        },
                        {"text": prompt}
                    ]
                }
            ],
            generation_config={
                "response_modalities": ["IMAGE"],
            }
        )

        # Extract image from response (same as Java blob.data().get())
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    return part.inline_data.data
        
        raise Exception("No image returned from Gemini")
    
    except Exception as e:
        raise Exception(f"Gemini try-on failed: {str(e)}")

def save_tryon_image(image_data: bytes, filename: str) -> str:
    """Save try-on image to uploads folder."""
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
    with open(filepath, 'wb') as f:
        f.write(image_data)
    return filepath