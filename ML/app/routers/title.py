from fastapi import APIRouter
from pydantic import BaseModel
from app.services.title_suggester import suggest_titles

router = APIRouter(prefix="/title", tags=["Title Suggestions"])

class TitleRequest(BaseModel):
    current_title: str
    description: str

@router.post("/suggest")
def get_suggested_titles(data: TitleRequest):
    return {"suggestions": suggest_titles(data.current_title, data.description)}
