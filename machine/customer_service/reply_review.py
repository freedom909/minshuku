from fastapi import APIRouter
from core.db_connection import neo4j_query
import logging


router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/reply_review")
def reply_review(review_id: str):
    query = """
    MATCH (r:Review {id: $review_id})
    RETURN r.text AS review_text
    """
    result = neo4j_query(query, {"review_id": review_id})
    return {"reply": "感谢您的反馈！我们会继续改进。"}