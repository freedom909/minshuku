from fastapi import APIRouter
from core.db_connection import neo4j_query

router = APIRouter()

@router.get("/booking_trends")
def get_booking_trends():
    query = """
    MATCH (b:Booking)
    RETURN b.date AS date, count(b) AS bookings
    ORDER BY b.date
    """
    result = neo4j_query(query)
    return {"trends": result}