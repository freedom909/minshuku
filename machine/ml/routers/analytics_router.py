# machine/ml/routers/analytics_router.py
"""Real-time Analytics Router for ML API"""

from fastapi import APIRouter, HTTPException, Query, Body
from typing import Dict, List, Optional, Any
import logging

from machine.ml.real_time_analytics import real_time_analytics_instance

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/track/user-behavior", tags=["Real-time Analytics"])
async def track_user_behavior(
    user_id: str = Body(..., description="User ID to track"),
    action: str = Body(..., description="User action being tracked"),
    metadata: Dict = Body(None, description="Additional metadata for the action")
):
    """
    Track real-time user behavior
    """
    try:
        logger.info(f"Tracking user behavior: {user_id} - {action}")
        
        result = await real_time_analytics_instance.track_user_behavior(
            user_id=user_id,
            action=action,
            metadata=metadata
        )
        
        return {
            "success": "error" not in result,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error tracking user behavior: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/monitor/performance", tags=["Real-time Analytics"])
async def monitor_system_performance():
    """
    Monitor real-time system performance
    """
    try:
        logger.info("Monitoring system performance")
        
        result = await real_time_analytics_instance.monitor_system_performance()
        
        return {
            "success": "error" not in result,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error monitoring system performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analyze/conversion-funnel", tags=["Real-time Analytics"])
async def analyze_conversion_funnel():
    """
    Analyze real-time conversion funnel
    """
    try:
        logger.info("Analyzing conversion funnel")
        
        result = await real_time_analytics_instance.analyze_conversion_funnel()
        
        return {
            "success": "error" not in result,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error analyzing conversion funnel: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/predict/demand-peaks", tags=["Real-time Analytics"])
async def predict_demand_peaks(
    hours_ahead: int = Query(24, description="Hours ahead to predict")
):
    """
    Predict demand peaks in real-time
    """
    try:
        logger.info(f"Predicting demand peaks for next {hours_ahead} hours")
        
        result = await real_time_analytics_instance.predict_demand_peaks(hours_ahead)
        
        return {
            "success": "error" not in result,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error predicting demand peaks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard", tags=["Real-time Analytics"])
async def get_dashboard_data():
    """
    Get comprehensive dashboard data
    """
    try:
        logger.info("Getting dashboard data")
        
        result = await real_time_analytics_instance.get_dashboard_data()
        
        return {
            "success": "error" not in result,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error getting dashboard data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health", tags=["Real-time Analytics"])
async def analytics_health_check():
    """
    Health check for analytics service
    """
    try:
        return {
            "status": "healthy",
            "service": "Real-time Analytics",
            "features": {
                "user_behavior_tracking": "active",
                "performance_monitoring": "active",
                "conversion_analysis": "active",
                "demand_prediction": "active",
                "dashboard": "active"
            },
            "timestamp": "2024-01-15T10:00:00Z"
        }
    except Exception as e:
        logger.error(f"Error in analytics health check: {e}")
        raise HTTPException(status_code=500, detail=str(e))