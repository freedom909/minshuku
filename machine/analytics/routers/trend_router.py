from fastapi import APIRouter
from analytics.services.booking_trends import get_booking_trends

router = APIRouter()

@router.get("/trends")
async def get_trends():
    return {"trends": get_booking_trends()}
