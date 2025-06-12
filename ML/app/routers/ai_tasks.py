from fastapi import APIRouter, Body, Request
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class TitleInput(BaseModel):
    title: str

class DescriptionInput(BaseModel):
    description: str

class ReviewInput(BaseModel):
    review: str

@router.api_route("/suggest-title", methods=["GET", "POST"])
async def suggest_title(input: Optional[TitleInput] = Body(None), request: Request = None):
    if request.method == "GET":
        return {"message": "Send a POST request with a JSON body like: {\"title\": \"Charming Studio\"}"}
    title = input.title if input else ""
    # Dummy logic – replace with ML model
    return {"suggestions": [f"Improved Title: {title} - Cozy Retreat"]}

@router.api_route("/suggest-description", methods=["GET","POST"])
async def suggest_description(input: Optional[DescriptionInput] = Body(None), request: Request = None):
    if request.method == "GET":
        return {"message": "Send a POST request with a JSON body like: {\"description\": \"Bright and clean room\"}"}
    description = input.description if input else ""
    return {"suggestions": [f"Better Description: {description} with great lighting and location!"]}

@router.api_route("/reply-to-review", methods=["GET", "POST"])
async def reply_to_review(input: Optional[ReviewInput] = Body(None), request: Request = None):
    if request.method == "GET":
        return {"message": "Send a POST request with a JSON body like: {\"review\": \"Loved the space!\"}"}
    review = input.review if input else ""
    return {"reply": f"Thank you for your feedback! We're glad you enjoyed your stay."}
