# customer_service/routers/title_router.py
from fastapi import APIRouter, Body
from machine.customer_service.services.suggest_title import suggest_title_improvement

router = APIRouter()

from fastapi import Query

@router.post("/title/suggest")
def suggest_title_endpoint_post(listingId: str = Body(..., embed=True)):
    """Suggest better title for listing (POST)"""
    suggestion = suggest_title_improvement(listingId)
    return {"suggestion": suggestion}

@router.get("/title/suggest")
def suggest_title_endpoint_get(listingId: str = Query(..., alias="listingId")):
    """Suggest better title for listing (GET)"""
    suggestion = suggest_title_improvement(listingId)
    return {"suggestion": suggestion}

