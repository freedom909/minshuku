from fastapi import APIRouter
from customer_service.services.suggest_title import suggest_title_improvement

router = APIRouter()

@router.post("/title/suggest")
@router.get("/title/suggest")
def suggest_title_endpoint(listingId: str):
    """Suggest better title for listing"""
    suggestion =suggest_title_improvement(listingId)
    return {"suggestion": suggestion}
