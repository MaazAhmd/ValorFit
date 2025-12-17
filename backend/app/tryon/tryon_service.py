import base64
import io
from PIL import Image
import google.genai as genai
from google.genai import types
import os
import traceback

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set in .env")

def base64_to_image(base64_str: str) -> bytes:
    """Convert base64 string to image bytes."""
    return base64.b64decode(base64_str)

def image_to_base64(image_data: bytes) -> str:
    """Convert image bytes to base64 string."""
    return base64.b64encode(image_data).decode("utf-8")

async def generate_tryon(user_photo: bytes, product_image: bytes, product_name: str) -> bytes:
    """
    Use Gemini 2.5 Flash to composite user photo with t-shirt.
    Returns resulting image as bytes.
    """
    try:
        # Create Gemini client
        client = genai.Client()
        
        # Convert bytes to PIL Images
        user_pil = Image.open(io.BytesIO(user_photo))
        product_pil = Image.open(io.BytesIO(product_image))
        
        # Prepare prompt
        prompt = f"""Create a professional e-commerce try-on photo.
        
Take the t-shirt from the first image and place it on the person in the second image.
Generate a realistic, full-body or upper-body shot of the person wearing the {product_name}.
Adjust lighting and shadows to match the original environment.
Keep the person's face and body proportions natural.
Make the t-shirt fit naturally on their body.

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
        
        raise Exception("No image in Gemini response")
    
    except Exception as e:
        print(f"ERROR in generate_tryon: {str(e)}")
        traceback.print_exc()
        raise Exception(f"Gemini try-on failed: {str(e)}")