from fastapi import APIRouter
from pydantic import BaseModel
from customer_service.services.suggest_title import suggest_title_improvement
from customer_service.services.suggest_description import generate_description_suggestions

router = APIRouter()

class ListingRequest(BaseModel):
    listingId: str

@router.post("/listing/suggest")
def suggest_listing_endpoint(request: ListingRequest):
    try:
        """Generate AI suggestions for a listing (title + description)."""
        listing_id = request.listingId
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid request body: {e}"
        )

    # Reuse existing AI logic
    title_suggestion = suggest_title_improvement(listing_id)
    desc_suggestion = generate_description_suggestions(listing_id)

    return {
        "listingId": listing_id,
        "titleSuggestion": title_suggestion,
        "descriptionSuggestion": desc_suggestion,
    }
