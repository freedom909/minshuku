from fastapi import APIRouter
from pydantic import BaseModel
from services.listing_service import suggest_title

router = APIRouter()

class SuggestRequest(BaseModel):
    listingId: str

class SuggestResponse(BaseModel):
    suggestion: str

@router.post("/suggest", response_model=SuggestResponse)
async def suggest_title_improvements(request: SuggestRequest):
    suggestion = suggest_title(request.listingId)
    return {"suggestion": suggestion}
