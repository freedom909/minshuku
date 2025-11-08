# machine/ml/routers/optimization_router.py
"""Advanced Optimization Router for ML API"""

from fastapi import APIRouter, HTTPException, Query, Body
from typing import Dict, List, Optional, Any
import logging

from machine.ml.advanced_optimization import advanced_optimization_instance

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/pricing-strategy", tags=["Advanced Optimization"])
async def optimize_pricing_strategy(
    listing_ids: List[str] = Body(..., description="List of listing IDs to optimize")
):
    """
    Optimize pricing strategy using advanced algorithms
    """
    try:
        logger.info(f"Optimizing pricing strategy for {len(listing_ids)} listings")
        
        result = await advanced_optimization_instance.optimize_pricing_strategy(listing_ids)
        
        return {
            "success": "error" not in result,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error optimizing pricing strategy: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/inventory-allocation", tags=["Advanced Optimization"])
async def optimize_inventory_allocation(
    listing_ids: List[str] = Body(..., description="List of listing IDs to optimize")
):
    """
    Optimize inventory allocation across listings
    """
    try:
        logger.info(f"Optimizing inventory allocation for {len(listing_ids)} listings")
        
        result = await advanced_optimization_instance.optimize_inventory_allocation(listing_ids)
        
        return {
            "success": "error" not in result,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error optimizing inventory allocation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/marketing-budget", tags=["Advanced Optimization"])
async def optimize_marketing_budget(
    campaign_types: List[str] = Body(..., description="Types of marketing campaigns to optimize")
):
    """
    Optimize marketing budget allocation
    """
    try:
        logger.info(f"Optimizing marketing budget for {len(campaign_types)} campaign types")
        
        result = await advanced_optimization_instance.optimize_marketing_budget(campaign_types)
        
        return {
            "success": "error" not in result,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error optimizing marketing budget: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resource-scheduling", tags=["Advanced Optimization"])
async def optimize_resource_scheduling(
    resource_types: List[str] = Body(..., description="Types of resources to schedule")
):
    """
    Optimize resource scheduling and allocation
    """
    try:
        logger.info(f"Optimizing resource scheduling for {len(resource_types)} resource types")
        
        result = await advanced_optimization_instance.optimize_resource_scheduling(resource_types)
        
        return {
            "success": "error" not in result,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error optimizing resource scheduling: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/comprehensive", tags=["Advanced Optimization"])
async def run_comprehensive_optimization():
    """
    Run comprehensive optimization across all business areas
    """
    try:
        logger.info("Running comprehensive business optimization")
        
        result = await advanced_optimization_instance.run_comprehensive_optimization()
        
        return {
            "success": "error" not in result,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error running comprehensive optimization: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health", tags=["Advanced Optimization"])
async def optimization_health_check():
    """
    Health check for optimization service
    """
    try:
        return {
            "status": "healthy",
            "service": "Advanced Optimization",
            "features": {
                "pricing_optimization": "active",
                "inventory_optimization": "active",
                "marketing_optimization": "active",
                "resource_optimization": "active",
                "comprehensive_optimization": "active"
            },
            "algorithms_used": [
                "multi-objective_optimization",
                "linear_programming", 
                "portfolio_optimization",
                "genetic_algorithm"
            ],
            "timestamp": "2024-01-15T10:00:00Z"
        }
    except Exception as e:
        logger.error(f"Error in optimization health check: {e}")
        raise HTTPException(status_code=500, detail=str(e))