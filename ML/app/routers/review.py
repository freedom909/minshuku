from fastapi import APIRouter
from pydantic import BaseModel
from app.services.review_replier import reply_to_review

router = APIRouter(prefix="/review", tags=["Review Replier"])

class ReviewRequest(BaseModel):
    review_text: str
    tone: str = "friendly"

@router.post("/reply")
def reply(data: ReviewRequest):
    return {"reply": reply_to_review(data.review_text, data.tone)}
