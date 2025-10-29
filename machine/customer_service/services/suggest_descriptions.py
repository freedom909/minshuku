import google.generativeai as genai
from core.config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

async def generate_description_suggestions(listingId: str) -> str:
    model = genai.GenerativeModel("gemini-1.5-pro")
    prompt = f"Improve the listing description for {listingId}."
    response = model.generate_content(prompt)
    return response.text or "No suggestion generated."
