# machine/ml/routers/predictive_router.py
"""Predictive Analytics API Router"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import logging
from machine.core.db_connection import mysql_pool, driver
from machine.ml.predictive_analytics import PredictiveAnalytics

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize predictive analytics engine
predictive_engine = PredictiveAnalytics(mysql_pool, driver)

@router.get("/booking-trends/{listing_id}")
async def predict_booking_trends(
    listing_id: str,
    days_ahead: int = Query(30, description="Number of days to predict ahead", ge=1, le=365)
):
    """
    Predict booking trends for a specific listing
    
    Args:
        listing_id: The ID of the listing to analyze
        days_ahead: Number of days to predict into the future (1-365)
    
    Returns:
        JSON object containing booking trend predictions
    """
    try:
        result = await predictive_engine.predict_booking_trends(listing_id, days_ahead)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "status": "success",
            "data": result,
            "message": f"Booking trends predicted for {listing_id}"
        }
        
    except Exception as e:
        logger.error(f"Error predicting booking trends: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/optimal-pricing/{listing_id}")
async def predict_optimal_pricing(listing_id: str):
    """
    Predict optimal pricing for a listing based on market conditions
    
    Args:
        listing_id: The ID of the listing to analyze
    
    Returns:
        JSON object containing optimal pricing recommendations
    """
    try:
        result = await predictive_engine.predict_optimal_pricing(listing_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "status": "success",
            "data": result,
            "message": f"Optimal pricing calculated for {listing_id}"
        }
        
    except Exception as e:
        logger.error(f"Error predicting optimal pricing: {e}")
        raise HTTPException(status_code=500, detail=f"Pricing prediction failed: {str(e)}")

@router.get("/occupancy-rate/{listing_id}")
async def predict_occupancy_rate(
    listing_id: str,
    months_ahead: int = Query(3, description="Number of months to predict ahead", ge=1, le=12)
):
    """
    Predict occupancy rates for a listing
    
    Args:
        listing_id: The ID of the listing to analyze
        months_ahead: Number of months to predict into the future (1-12)
    
    Returns:
        JSON object containing occupancy rate predictions
    """
    try:
        result = await predictive_engine.predict_occupancy_rate(listing_id, months_ahead)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "status": "success",
            "data": result,
            "message": f"Occupancy rates predicted for {listing_id}"
        }
        
    except Exception as e:
        logger.error(f"Error predicting occupancy rate: {e}")
        raise HTTPException(status_code=500, detail=f"Occupancy prediction failed: {str(e)}")

@router.get("/market-analysis/{listing_id}")
async def comprehensive_market_analysis(listing_id: str):
    """
    Perform comprehensive market analysis for a listing
    
    Args:
        listing_id: The ID of the listing to analyze
    
    Returns:
        JSON object containing comprehensive market analysis
    """
    try:
        # Run all predictive analyses
        booking_trends = await predictive_engine.predict_booking_trends(listing_id, 30)
        optimal_pricing = await predictive_engine.predict_optimal_pricing(listing_id)
        occupancy_rates = await predictive_engine.predict_occupancy_rate(listing_id, 3)
        
        # Combine results
        comprehensive_analysis = {
            "listing_id": listing_id,
            "booking_trends": booking_trends,
            "optimal_pricing": optimal_pricing,
            "occupancy_rates": occupancy_rates,
            "overall_recommendation": _generate_overall_recommendation(
                booking_trends, optimal_pricing, occupancy_rates
            ),
            "risk_assessment": _assess_risks(booking_trends, optimal_pricing, occupancy_rates)
        }
        
        return {
            "status": "success",
            "data": comprehensive_analysis,
            "message": f"Comprehensive market analysis completed for {listing_id}"
        }
        
    except Exception as e:
        logger.error(f"Error performing market analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Market analysis failed: {str(e)}")

@router.post("/batch-predictions")
async def batch_predictions(listing_ids: List[str]):
    """
    Perform batch predictions for multiple listings
    
    Args:
        listing_ids: List of listing IDs to analyze
    
    Returns:
        JSON object containing batch prediction results
    """
    try:
        if len(listing_ids) > 50:
            raise HTTPException(status_code=400, detail="Maximum 50 listings per batch")
        
        batch_results = []
        
        for listing_id in listing_ids:
            try:
                # Get basic predictions for each listing
                pricing_result = await predictive_engine.predict_optimal_pricing(listing_id)
                occupancy_result = await predictive_engine.predict_occupancy_rate(listing_id, 1)
                
                batch_results.append({
                    "listing_id": listing_id,
                    "pricing": pricing_result,
                    "occupancy": occupancy_result,
                    "status": "success"
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
                "total_listings": len(listing_ids),
                "successful_predictions": len([r for r in batch_results if r["status"] == "success"]),
                "failed_predictions": len([r for r in batch_results if r["status"] == "failed"]),
                "results": batch_results
            },
            "message": f"Batch predictions completed for {len(listing_ids)} listings"
        }
        
    except Exception as e:
        logger.error(f"Error performing batch predictions: {e}")
        raise HTTPException(status_code=500, detail=f"Batch predictions failed: {str(e)}")

def _generate_overall_recommendation(booking_trends: dict, optimal_pricing: dict, occupancy_rates: dict) -> dict:
    """Generate overall recommendation based on all analyses"""
    # Simple recommendation logic (would be more sophisticated in production)
    confidence_scores = []
    
    if "confidence" in booking_trends:
        confidence_scores.append(1.0 if booking_trends["confidence"] == "high" else 0.5)
    
    if "confidence" in optimal_pricing:
        confidence_scores.append(1.0 if optimal_pricing["confidence"] == "high" else 0.5)
    
    avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.5
    
    return {
        "recommendation": "optimistic" if avg_confidence > 0.7 else "cautious",
        "confidence_score": round(avg_confidence, 2),
        "key_insights": ["Market conditions favorable", "Consider price optimization"],
        "action_items": ["Monitor booking trends", "Adjust pricing strategy"]
    }

def _assess_risks(booking_trends: dict, optimal_pricing: dict, occupancy_rates: dict) -> dict:
    """Assess risks based on predictive analyses"""
    risks = []
    
    if "confidence" in booking_trends and booking_trends["confidence"] == "low":
        risks.append("Unreliable booking trend predictions")
    
    if "price_adjustment" in optimal_pricing and optimal_pricing["price_adjustment"] < -10:
        risks.append("Significant price reduction recommended")
    
    if "current_occupancy" in occupancy_rates and occupancy_rates["current_occupancy"] < 0.3:
        risks.append("Low current occupancy rate")
    
    return {
        "risk_level": "high" if len(risks) > 1 else "medium" if risks else "low",
        "identified_risks": risks,
        "mitigation_strategies": ["Diversify marketing", "Offer promotions"] if risks else []
    }