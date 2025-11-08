# machine/ml/routers/training_router.py
"""Model Training Router for ML API"""

from fastapi import APIRouter, HTTPException, Query, Body
from typing import Dict, List, Optional, Any
import logging

from machine.ml.model_training import model_training_manager

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/train/pricing", tags=["Model Training"])
async def train_pricing_model(
    training_data: Dict = Body(None, description="Training data for pricing model")
):
    """
    Train pricing prediction model
    """
    try:
        logger.info("Starting pricing model training")
        
        result = await model_training_manager.train_pricing_model(training_data or {})
        
        return {
            "success": "error" not in result,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error training pricing model: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/train/recommendation", tags=["Model Training"])
async def train_recommendation_model(
    training_data: Dict = Body(None, description="Training data for recommendation model")
):
    """
    Train recommendation model
    """
    try:
        logger.info("Starting recommendation model training")
        
        result = await model_training_manager.train_recommendation_model(training_data or {})
        
        return {
            "success": "error" not in result,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error training recommendation model: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/evaluate", tags=["Model Training"])
async def evaluate_all_models():
    """
    Evaluate all trained models
    """
    try:
        logger.info("Evaluating all models")
        
        result = await model_training_manager.evaluate_all_models()
        
        return {
            "success": "error" not in result,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error evaluating models: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/retrain", tags=["Model Training"])
async def retrain_models(
    model_types: List[str] = Body(..., description="List of model types to retrain")
):
    """
    Retrain specified models with latest data
    """
    try:
        logger.info(f"Retraining models: {model_types}")
        
        result = await model_training_manager.retrain_models(model_types)
        
        return {
            "success": "error" not in result,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error retraining models: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", tags=["Model Training"])
async def get_training_history():
    """
    Get model training history
    """
    try:
        logger.info("Getting training history")
        
        result = await model_training_manager.get_training_history()
        
        return {
            "success": "error" not in result,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error getting training history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health", tags=["Model Training"])
async def training_health_check():
    """
    Health check for model training service
    """
    try:
        return {
            "status": "healthy",
            "service": "Model Training Manager",
            "features": {
                "pricing_model_training": "active",
                "recommendation_model_training": "active",
                "model_evaluation": "active",
                "automatic_retraining": "active"
            },
            "supported_algorithms": [
                "RandomForest",
                "GradientBoosting", 
                "NeuralNetworks"
            ],
            "timestamp": "2024-01-15T10:00:00Z"
        }
    except Exception as e:
        logger.error(f"Error in training health check: {e}")
        raise HTTPException(status_code=500, detail=str(e))