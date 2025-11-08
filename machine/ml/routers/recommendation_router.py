# machine/ml/routers/recommendation_router.py
"""Recommendation Engine API Router"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import logging
from machine.core.db_connection import mysql_pool, driver
from machine.ml.recommendation_engine import RecommendationEngine

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize recommendation engine
recommendation_engine = RecommendationEngine(mysql_pool, driver)

@router.get("/similar-listings/{listing_id}")
async def recommend_similar_listings(
    listing_id: str,
    limit: int = Query(10, description="Number of recommendations", ge=1, le=50)
):
    """
    Recommend similar listings based on content and features
    
    Args:
        listing_id: The ID of the target listing
        limit: Maximum number of recommendations to return (1-50)
    
    Returns:
        JSON object containing similar listing recommendations
    """
    try:
        result = await recommendation_engine.recommend_similar_listings(listing_id, limit)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "status": "success",
            "data": result,
            "message": f"Found {len(result.get('recommendations', []))} similar listings"
        }
        
    except Exception as e:
        logger.error(f"Error recommending similar listings: {e}")
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")

@router.get("/user-recommendations/{user_id}")
async def recommend_for_user(
    user_id: str,
    limit: int = Query(15, description="Number of recommendations", ge=1, le=50)
):
    """
    Recommend listings based on user preferences and behavior
    
    Args:
        user_id: The ID of the user
        limit: Maximum number of recommendations to return (1-50)
    
    Returns:
        JSON object containing personalized recommendations
    """
    try:
        result = await recommendation_engine.recommend_for_user(user_id, limit)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "status": "success",
            "data": result,
            "message": f"Generated {len(result.get('recommendations', []))} personalized recommendations"
        }
        
    except Exception as e:
        logger.error(f"Error recommending for user: {e}")
        raise HTTPException(status_code=500, detail=f"User recommendation failed: {str(e)}")

@router.get("/promotion-recommendations/{listing_id}")
async def recommend_promotions(
    listing_id: str,
    strategy: str = Query("smart", description="Promotion strategy type")
):
    """
    Recommend promotional strategies for a listing
    
    Args:
        listing_id: The ID of the listing
        strategy: Promotion strategy type (smart, aggressive, conservative)
    
    Returns:
        JSON object containing promotion recommendations
    """
    try:
        result = await recommendation_engine.recommend_promotions(listing_id, strategy)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "status": "success",
            "data": result,
            "message": f"Promotion recommendations generated for {listing_id}"
        }
        
    except Exception as e:
        logger.error(f"Error recommending promotions: {e}")
        raise HTTPException(status_code=500, detail=f"Promotion recommendation failed: {str(e)}")

@router.get("/content-optimization/{listing_id}")
async def recommend_content_optimization(listing_id: str):
    """
    Recommend content optimization strategies for a listing
    
    Args:
        listing_id: The ID of the listing
    
    Returns:
        JSON object containing content optimization recommendations
    """
    try:
        result = await recommendation_engine.recommend_content_optimization(listing_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "status": "success",
            "data": result,
            "message": f"Content optimization recommendations generated for {listing_id}"
        }
        
    except Exception as e:
        logger.error(f"Error recommending content optimization: {e}")
        raise HTTPException(status_code=500, detail=f"Content optimization recommendation failed: {str(e)}")

@router.get("/market-insights")
async def get_market_insights(
    location_type: Optional[str] = Query(None, description="Filter by location type"),
    price_range: Optional[str] = Query(None, description="Filter by price range (min-max)"),
    limit: int = Query(20, description="Number of insights", ge=1, le=100)
):
    """
    Get market insights and trends
    
    Args:
        location_type: Filter by location type
        price_range: Filter by price range (format: min-max)
        limit: Maximum number of insights to return
    
    Returns:
        JSON object containing market insights
    """
    try:
        # Get all listings for analysis
        all_listings = await recommendation_engine._get_all_listings()
        
        # Apply filters
        filtered_listings = _apply_filters(all_listings, location_type, price_range)
        
        # Generate insights
        insights = _generate_market_insights(filtered_listings, limit)
        
        return {
            "status": "success",
            "data": insights,
            "message": f"Generated {len(insights.get('trends', []))} market insights"
        }
        
    except Exception as e:
        logger.error(f"Error getting market insights: {e}")
        raise HTTPException(status_code=500, detail=f"Market insights generation failed: {str(e)}")

@router.post("/batch-recommendations")
async def batch_recommendations(
    listing_ids: List[str],
    recommendation_type: str = Query("similar", description="Type of recommendation")
):
    """
    Generate batch recommendations for multiple listings
    
    Args:
        listing_ids: List of listing IDs
        recommendation_type: Type of recommendation (similar, promotion, content)
    
    Returns:
        JSON object containing batch recommendations
    """
    try:
        if len(listing_ids) > 30:
            raise HTTPException(status_code=400, detail="Maximum 30 listings per batch")
        
        batch_results = []
        
        for listing_id in listing_ids:
            try:
                if recommendation_type == "similar":
                    result = await recommendation_engine.recommend_similar_listings(listing_id, 5)
                elif recommendation_type == "promotion":
                    result = await recommendation_engine.recommend_promotions(listing_id)
                elif recommendation_type == "content":
                    result = await recommendation_engine.recommend_content_optimization(listing_id)
                else:
                    result = {"error": f"Unsupported recommendation type: {recommendation_type}"}
                
                batch_results.append({
                    "listing_id": listing_id,
                    "result": result,
                    "status": "success" if "error" not in result else "failed"
                })
                
            except Exception as e:
                batch_results.append({
                    "listing_id": listing_id,
                    "error": str(e),
                    "status": "failed"
                })
        
        return {
            "status": "success",
            "data": {
                "recommendation_type": recommendation_type,
                "total_listings": len(listing_ids),
                "successful_recommendations": len([r for r in batch_results if r["status"] == "success"]),
                "failed_recommendations": len([r for r in batch_results if r["status"] == "failed"]),
                "results": batch_results
            },
            "message": f"Batch recommendations completed for {len(listing_ids)} listings"
        }
        
    except Exception as e:
        logger.error(f"Error performing batch recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Batch recommendations failed: {str(e)}")

def _apply_filters(listings: List[dict], location_type: Optional[str], price_range: Optional[str]) -> List[dict]:
    """Apply filters to listings"""
    filtered = listings.copy()
    
    if location_type:
        filtered = [l for l in filtered if l.get('locationType') == location_type]
    
    if price_range:
        try:
            min_price, max_price = map(float, price_range.split('-'))
            filtered = [l for l in filtered if min_price <= l.get('price', 0) <= max_price]
        except ValueError:
            pass  # Ignore invalid price range
    
    return filtered

def _generate_market_insights(listings: List[dict], limit: int) -> dict:
    """Generate market insights from listings"""
    if not listings:
        return {"trends": [], "statistics": {}}
    
    # Calculate basic statistics
    prices = [l.get('price', 0) for l in listings if l.get('price')]
    ratings = [l.get('avg_rating', 0) for l in listings if l.get('avg_rating')]
    
    statistics = {
        "total_listings": len(listings),
        "average_price": round(sum(prices) / len(prices), 2) if prices else 0,
        "average_rating": round(sum(ratings) / len(ratings), 2) if ratings else 0,
        "price_range": {
            "min": min(prices) if prices else 0,
            "max": max(prices) if prices else 0
        },
        "rating_distribution": {
            "excellent": len([r for r in ratings if r >= 4.5]),
            "good": len([r for r in ratings if 4.0 <= r < 4.5]),
            "average": len([r for r in ratings if 3.0 <= r < 4.0]),
            "poor": len([r for r in ratings if r < 3.0])
        }
    }
    
    # Generate trends
    trends = []
    
    # Price trend
    if len(prices) > 10:
        avg_price = statistics["average_price"]
        if avg_price > 150:
            trends.append("Premium market segment")
        elif avg_price < 50:
            trends.append("Budget-friendly market")
        else:
            trends.append("Mid-range market")
    
    # Rating trend
    if len(ratings) > 10:
        avg_rating = statistics["average_rating"]
        if avg_rating >= 4.5:
            trends.append("High-quality listings")
        elif avg_rating >= 4.0:
            trends.append("Good overall quality")
        else:
            trends.append("Quality improvement opportunities")
    
    # Location distribution
    location_counts = {}
    for listing in listings:
        loc_type = listing.get('locationType', 'unknown')
        location_counts[loc_type] = location_counts.get(loc_type, 0) + 1
    
    if location_counts:
        most_common = max(location_counts.items(), key=lambda x: x[1])
        trends.append(f"Most common location type: {most_common[0]} ({most_common[1]} listings)")
    
    return {
        "trends": trends[:limit],
        "statistics": statistics,
        "recommendations": [
            "Consider competitive pricing strategies",
            "Focus on quality improvements for better ratings",
            "Diversify location offerings"
        ]
    }