from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from machine.customer_service.services.performance_tips import get_performance_tips

router = APIRouter(tags=["performance_tips"])

@router.get("/performance-tips/")
async def get_performance_tips_endpoint(
    listingId: Optional[str] = Query(None, alias="listingId", description="The ID of the listing to analyze")
):
    """
    Get performance optimization tips for a listing.

    Parameters:
    - listingId: The ID of the listing to analyze. If not provided, general tips will be returned.

    Returns:
    - A list of performance optimization tips.
    """
    try:
        tips = get_performance_tips(listingId)
        return {"tips": tips}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch performance tips: {str(e)}")