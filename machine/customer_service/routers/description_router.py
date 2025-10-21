from fastapi import APIRouter, HTTPException
from customer_service.models.listing import SuggestRequest, SuggestResponse
# from services.description_service import suggest_description
# from services.description_service import generate_description_suggestions
# from services.descriptions import generate_description_suggestions  # <-- make sure path is correct
from customer_service.models.description import DescriptionRequest, DescriptionResponse
router = APIRouter()

@router.post("/suggest", response_model=SuggestResponse)
async def suggest_description(req: SuggestRequest):
    try:
        return await generate_description_suggestions(req.listingId)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/description/suggest", response_model=DescriptionResponse)
async def suggest_description_endpoint(req: DescriptionRequest):
    # TODO: fetch real description from DB
    original_description = f"This is the original description for listing {req.listingId}."
    suggestions = [
        f"{original_description} Enjoy a luxurious stay with all amenities.",
        f"{original_description} Perfect for cozy getaways and adventures.",
    ]
    return DescriptionResponse(suggestion=suggestions[0])