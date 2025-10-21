from fastapi import APIRouter, HTTPException, Query
from services.listing_service import suggest_title
import google.generativeai as genai

router = APIRouter(prefix="/api")

@router.get("/listing/suggest_title")
async def suggest_title_route(listing_id: str = Query(..., description="Listing ID to generate title for")):
    """
    Suggest a marketing title for a given listing.
    Example:
        GET /customer/suggest_title?listing_id=listing-002
    """
    try:
        suggestion = suggest_title(listing_id)
        return {"listing_id": listing_id, "suggestion": suggestion}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error suggesting title: {str(e)}")

    """
    Suggest a marketing title for a given listing using Gemini API.
    Example:
        POST /api/listing/suggest
        Body: {"listingId": "listing-001"}
    """
    try:
        # Initialize Gemini API
        genai.configure(api_key="YOUR_GEMINI_API_KEY")
        model = genai.GenerativeModel('gemini-pro')
        
        # Generate suggestion
        prompt = f"Generate a short and attractive description for a property with ID {listingId}."
        response = model.generate_content(prompt)
        
        return {"suggestion": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error suggesting title: {str(e)}")

@router.post("/listing/suggest", response_model=ListingResponse)
async def suggest_listing_endpoint(req: ListingRequest):
    # TODO: fetch real listing from DB
    original_listing = f"This is the original listing for {req.listingId}."
    suggestions = [
        f"{original_listing} Enjoy a luxurious stay with all amenities.",
        f"{original_listing} Perfect for cozy getaways and adventures.",
    ]
    return ListingResponse(suggestion=suggestions[0])        
