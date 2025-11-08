from machine.core.db_connection import neo4j_query

def get_booking_trends():
    query = """
    MATCH (b:Booking)
    RETURN b.date AS date, count(b) AS bookings
    ORDER BY b.date
    """
    result = neo4j_query(query)
    return result
