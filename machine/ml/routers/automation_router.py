# machine/ml/routers/automation_router.py
"""Intelligent Automation API Router"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import logging
from machine.core.db_connection import mysql_pool, driver
from machine.ml.intelligent_automation import IntelligentAutomation, AutomationType

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize intelligent automation engine
automation_engine = IntelligentAutomation(mysql_pool, driver)

@router.post("/pricing-strategy/{listing_id}")
async def automate_pricing_strategy(listing_id: str):
    """
    Automatically adjust pricing strategy for a listing
    
    Args:
        listing_id: The ID of the listing to automate pricing for
    
    Returns:
        JSON object containing pricing automation results
    """
    try:
        result = await automation_engine.automate_pricing_strategy(listing_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "status": "success",
            "data": result,
            "message": f"Pricing strategy automated for {listing_id}"
        }
        
    except Exception as e:
        logger.error(f"Error automating pricing strategy: {e}")
        raise HTTPException(status_code=500, detail=f"Pricing automation failed: {str(e)}")

@router.post("/content-optimization/{listing_id}")
async def automate_content_optimization(listing_id: str):
    """
    Automatically optimize listing content
    
    Args:
        listing_id: The ID of the listing to optimize content for
    
    Returns:
        JSON object containing content optimization results
    """
    try:
        result = await automation_engine.automate_content_optimization(listing_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "status": "success",
            "data": result,
            "message": f"Content optimization automated for {listing_id}"
        }
        
    except Exception as e:
        logger.error(f"Error automating content optimization: {e}")
        raise HTTPException(status_code=500, detail=f"Content automation failed: {str(e)}")

@router.post("/promotional-campaigns/{listing_id}")
async def automate_promotional_campaigns(listing_id: str):
    """
    Automatically create and manage promotional campaigns
    
    Args:
        listing_id: The ID of the listing to create campaigns for
    
    Returns:
        JSON object containing campaign automation results
    """
    try:
        result = await automation_engine.automate_promotional_campaigns(listing_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "status": "success",
            "data": result,
            "message": f"Promotional campaigns automated for {listing_id}"
        }
        
    except Exception as e:
        logger.error(f"Error automating promotional campaigns: {e}")
        raise HTTPException(status_code=500, detail=f"Campaign automation failed: {str(e)}")

@router.post("/guest-communication/{booking_id}")
async def automate_guest_communication(booking_id: str):
    """
    Automate guest communication throughout booking lifecycle
    
    Args:
        booking_id: The ID of the booking to automate communication for
    
    Returns:
        JSON object containing communication automation results
    """
    try:
        result = await automation_engine.automate_guest_communication(booking_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "status": "success",
            "data": result,
            "message": f"Guest communication automated for booking {booking_id}"
        }
        
    except Exception as e:
        logger.error(f"Error automating guest communication: {e}")
        raise HTTPException(status_code=500, detail=f"Communication automation failed: {str(e)}")

@router.post("/maintenance-scheduling/{listing_id}")
async def automate_maintenance_scheduling(listing_id: str):
    """
    Automate maintenance scheduling based on usage and feedback
    
    Args:
        listing_id: The ID of the listing to schedule maintenance for
    
    Returns:
        JSON object containing maintenance automation results
    """
    try:
        result = await automation_engine.automate_maintenance_scheduling(listing_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "status": "success",
            "data": result,
            "message": f"Maintenance scheduling automated for {listing_id}"
        }
        
    except Exception as e:
        logger.error(f"Error automating maintenance scheduling: {e}")
        raise HTTPException(status_code=500, detail=f"Maintenance automation failed: {str(e)}")

@router.post("/batch-automation")
async def run_batch_automation(
    listing_ids: List[str],
    automation_type: str = Query(..., description="Type of automation to run")
):
    """
    Run automation for multiple listings in batch
    
    Args:
        listing_ids: List of listing IDs to automate
        automation_type: Type of automation (pricing, content, promotion)
    
    Returns:
        JSON object containing batch automation results
    """
    try:
        if len(listing_ids) > 25:
            raise HTTPException(status_code=400, detail="Maximum 25 listings per batch")
        
        # Validate automation type
        valid_types = [t.value for t in AutomationType]
        if automation_type not in valid_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid automation type. Valid types: {valid_types}"
            )
        
        result = await automation_engine.run_batch_automation(listing_ids, automation_type)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "status": "success",
            "data": result,
            "message": f"Batch automation completed for {len(listing_ids)} listings"
        }
        
    except Exception as e:
        logger.error(f"Error running batch automation: {e}")
        raise HTTPException(status_code=500, detail=f"Batch automation failed: {str(e)}")

@router.get("/automation-status/{listing_id}")
async def get_automation_status(
    listing_id: str,
    automation_type: Optional[str] = Query(None, description="Filter by automation type")
):
    """
    Get automation status and history for a listing
    
    Args:
        listing_id: The ID of the listing
        automation_type: Filter by specific automation type
    
    Returns:
        JSON object containing automation status and history
    """
    try:
        # Simulate getting automation status (would query database in production)
        status_data = await _get_automation_status_data(listing_id, automation_type)
        
        return {
            "status": "success",
            "data": status_data,
            "message": f"Automation status retrieved for {listing_id}"
        }
        
    except Exception as e:
        logger.error(f"Error getting automation status: {e}")
        raise HTTPException(status_code=500, detail=f"Status retrieval failed: {str(e)}")

@router.post("/schedule-automation")
async def schedule_automation(
    listing_ids: List[str],
    automation_type: str,
    schedule: dict
):
    """
    Schedule automated tasks for future execution
    
    Args:
        listing_ids: List of listing IDs to schedule
        automation_type: Type of automation to schedule
        schedule: Schedule configuration
    
    Returns:
        JSON object containing scheduling results
    """
    try:
        if len(listing_ids) > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 listings per schedule")
        
        # Validate schedule
        if not _validate_schedule(schedule):
            raise HTTPException(status_code=400, detail="Invalid schedule configuration")
        
        # Schedule automation tasks
        scheduling_result = await _schedule_automation_tasks(listing_ids, automation_type, schedule)
        
        return {
            "status": "success",
            "data": scheduling_result,
            "message": f"Automation scheduled for {len(listing_ids)} listings"
        }
        
    except Exception as e:
        logger.error(f"Error scheduling automation: {e}")
        raise HTTPException(status_code=500, detail=f"Scheduling failed: {str(e)}")

async def _get_automation_status_data(listing_id: str, automation_type: Optional[str]) -> dict:
    """Get automation status data for a listing"""
    # Simulated data (would query database in production)
    return {
        "listing_id": listing_id,
        "automation_status": {
            "pricing": {
                "last_run": "2024-01-15T10:30:00",
                "status": "completed",
                "next_scheduled": "2024-01-22T10:30:00",
                "success_rate": 0.95
            },
            "content": {
                "last_run": "2024-01-14T14:20:00", 
                "status": "completed",
                "next_scheduled": "2024-01-28T14:20:00",
                "success_rate": 0.88
            },
            "promotion": {
                "last_run": "2024-01-10T09:15:00",
                "status": "completed",
                "next_scheduled": "2024-01-24T09:15:00",
                "success_rate": 0.92
            }
        },
        "recent_activities": [
            {
                "type": "pricing",
                "timestamp": "2024-01-15T10:30:00",
                "action": "Price adjusted by +5%",
                "result": "success"
            },
            {
                "type": "content", 
                "timestamp": "2024-01-14T14:20:00",
                "action": "Description optimized",
                "result": "success"
            }
        ],
        "performance_metrics": {
            "total_automations": 15,
            "success_rate": 0.93,
            "time_saved_hours": 45,
            "revenue_impact": "+12%"
        }
    }

def _validate_schedule(schedule: dict) -> bool:
    """Validate schedule configuration"""
    required_fields = ["frequency", "start_time", "timezone"]
    
    for field in required_fields:
        if field not in schedule:
            return False
    
    valid_frequencies = ["daily", "weekly", "monthly"]
    if schedule["frequency"] not in valid_frequencies:
        return False
    
    return True

async def _schedule_automation_tasks(listing_ids: List[str], automation_type: str, schedule: dict) -> dict:
    """Schedule automation tasks"""
    # Simulated scheduling (would integrate with task scheduler in production)
    return {
        "scheduled_tasks": len(listing_ids),
        "automation_type": automation_type,
        "schedule": schedule,
        "next_execution": "2024-01-22T10:00:00",
        "task_ids": [f"task_{i}_{automation_type}" for i in range(len(listing_ids))]
    }