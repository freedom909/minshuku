# machine/core/routers/monitoring_router.py
"""Monitoring Router for System Observability"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, List, Optional, Any
import logging

from machine.core.monitoring import system_monitor

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/metrics", tags=["Monitoring"])
async def get_system_metrics():
    """
    Get current system metrics
    """
    try:
        logger.info("Collecting system metrics")
        
        metrics = await system_monitor.collect_system_metrics()
        
        return {
            "success": "error" not in metrics,
            "data": metrics
        }
        
    except Exception as e:
        logger.error(f"Error getting system metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance", tags=["Monitoring"])
async def get_performance_summary(
    hours: int = Query(24, description="Hours to include in summary")
):
    """
    Get performance summary for specified period
    """
    try:
        logger.info(f"Getting performance summary for last {hours} hours")
        
        summary = await system_monitor.get_performance_summary(hours)
        
        return {
            "success": "error" not in summary,
            "data": summary
        }
        
    except Exception as e:
        logger.error(f"Error getting performance summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts", tags=["Monitoring"])
async def get_alerts(
    severity: str = Query(None, description="Filter by severity (warning/critical)")
):
    """
    Get current system alerts
    """
    try:
        logger.info("Getting system alerts")
        
        alerts = await system_monitor.get_alerts(severity)
        
        return {
            "success": True,
            "data": {
                "alerts": alerts,
                "total_count": len(alerts),
                "critical_count": len([a for a in alerts if a["severity"] == "critical"]),
                "warning_count": len([a for a in alerts if a["severity"] == "warning"])
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/alerts", tags=["Monitoring"])
async def clear_alerts(
    alert_ids: List[str] = Query(None, description="List of alert IDs to clear")
):
    """
    Clear specified alerts or all alerts
    """
    try:
        logger.info(f"Clearing alerts: {alert_ids if alert_ids else 'all'}")
        
        result = await system_monitor.clear_alerts(alert_ids)
        
        return {
            "success": "error" not in result,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error clearing alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health/detailed", tags=["Monitoring"])
async def detailed_health_check():
    """
    Detailed health check with system metrics
    """
    try:
        # Get current metrics
        metrics = await system_monitor.collect_system_metrics()
        
        # Get performance summary
        summary = await system_monitor.get_performance_summary(1)  # Last hour
        
        # Get current alerts
        alerts = await system_monitor.get_alerts()
        
        return {
            "status": "healthy",
            "service": "System Monitoring",
            "current_metrics": metrics,
            "performance_summary": summary,
            "active_alerts": {
                "total": len(alerts),
                "critical": len([a for a in alerts if a["severity"] == "critical"]),
                "warning": len([a for a in alerts if a["severity"] == "warning"])
            },
            "timestamp": "2024-01-15T10:00:00Z"
        }
        
    except Exception as e:
        logger.error(f"Error in detailed health check: {e}")
        raise HTTPException(status_code=500, detail=str(e))