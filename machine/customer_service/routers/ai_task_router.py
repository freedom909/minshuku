# routers/ai_task_router.py
from fastapi import APIRouter, Query
from tasks.generateDescriptionSuggestions import generate_description_suggestions

router = APIRouter()

@router.post("/generateDescriptionSuggestions")
async def generate_description_suggestions_api(listingId: str = Query(...)):
    result = generate_description_suggestions(listingId)
    return result
