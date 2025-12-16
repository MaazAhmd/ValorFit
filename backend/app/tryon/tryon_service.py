import base64
import io
from PIL import Image
import google.genai as genai
import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set in .env")

genai.configure(api_key=GEMINI_API_KEY)

def image_to_base64(image_data: bytes) -> str:
    """Convert image bytes to base64 string."""
    return base64.b64encode(image_data).decode("utf-8")

def base64_to_image(base64_str: str) -> bytes:
    """Convert base64 string to image bytes."""
    return base64.b64decode(base64_str)

async def generate_tryon(user_photo: bytes, product_image: bytes, product_name: str) -> bytes:
    """
    Use Gemini 2.5 Flash to composite user photo with t-shirt.
    Returns resulting image as bytes.
    """
    try:
        # Create Gemini client
        client = genai.Client()
        
        # Prepare prompt
        prompt = f"""Create a professional e-commerce try-on photo.
        
Take the t-shirt from the product image and place it on the person in the user photo.
Generate a realistic, full-body or upper-body shot of the person wearing the {product_name}.
Adjust lighting and shadows to match the original environment.
Keep the person's face and body proportions natural.
Make the t-shirt fit naturally on their body.

Return ONLY the composite image without any text or watermarks."""

        # Call Gemini with both images
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                {
                    "role": "user",
                    "parts": [
                        {"inline_data": {"mime_type": "image/jpeg", "data": image_to_base64(user_photo)}},
                        {"inline_data": {"mime_type": "image/jpeg", "data": image_to_base64(product_image)}},
                        {"text": prompt}
                    ]
                }
            ],
            generation_config={
                "response_modalities": ["IMAGE"],
            }
        )

        # Extract image from response
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    return part.inline_data.data
        
        raise Exception("No image in Gemini response")
    
    except Exception as e:
        raise Exception(f"Gemini try-on failed: {str(e)}")