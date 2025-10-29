from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from customer_service.services import suggest_descriptions
from customer_service.services.suggest_descriptions import generate_description_suggestions


router = APIRouter()

class DescriptionRequest(BaseModel):
    listingId: str

@router.post("/suggest")
async def suggest_description_endpoint(req: DescriptionRequest):
    try:
        suggestion = await suggest_descriptions.generate_description_suggestions(req.listingId)
        return {"suggestion": suggestion}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/description/suggest")
async def suggest_description(listingId: str):
    """Generate AI-based description suggestion"""
    suggestion = await generate_description_suggestions(listingId)
    return {"suggestion": suggestion}