from fastapi import APIRouter
from pydantic import BaseModel
from app.services.description_generator import generate_description

router = APIRouter(prefix="/description", tags=["Description Suggestions"])

class DescriptionRequest(BaseModel):
    current_description: str
    title: str

@router.post("/suggest")
def suggest_description(data: DescriptionRequest):
    return {"new_description": generate_description(data.current_description, data.title)}

@router.post("/suggest")
def get_suggested_titles(data: TitleRequest):
    return {"suggestions": suggest_titles(data.current_title, data.description)}