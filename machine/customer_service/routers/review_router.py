from fastapi import APIRouter
from pydantic import BaseModel
from services.review_service import generate_reply

router = APIRouter()

class ReplyRequest(BaseModel):
    reviewId: str
    reviewText: str

class ReplyResponse(BaseModel):
    reply: str

@router.post("/reply", response_model=ReplyResponse)
async def reply_to_review(request: ReplyRequest):
    reply = await generate_reply(request.reviewId, request.reviewText)
    return  {"reply": reply}
