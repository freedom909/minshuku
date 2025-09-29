from fastapi import APIRouter, HTTPException
from models.listing import SuggestRequest, SuggestResponse
from services.description_service import suggest_description


router = APIRouter()

@router.post("/suggest", response_model=SuggestResponse)
async def suggest_description(req: SuggestRequest):
    try:
        return await generate_description_suggestions(req.listingId)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
