from fastapi import APIRouter
from pydantic import BaseModel
from app.services.title_suggester import suggest_titles

router = APIRouter(prefix="/title", tags=["Title Suggestions"])

class TitleRequest(BaseModel):
    current_title: str
    description: str



@router.get("/suggest-title")
def suggest_title(title: str):
    return {"suggestions": [f"{title} - Improved"]}

