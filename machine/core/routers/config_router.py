# machine/core/routers/config_router.py
"""Configuration Management Router"""

from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List
import logging

from machine.core.config import settings, update_settings, get_feature_flags

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/settings", tags=["Configuration"])
async def get_settings():
    """
    Get current application settings
    """
    try:
        # Return safe settings (without sensitive data)
        safe_settings = {
            "app_name": settings.app_name,
            "app_version": settings.app_version,
            "debug": settings.debug,
            "host": settings.host,
            "port": settings.port,
            "workers": settings.workers,
            "enable_monitoring": settings.enable_monitoring,
            "cors_origins": settings.cors_origins,
            "rate_limit_per_minute": settings.rate_limit_per_minute,
            "rate_limit_per_hour": settings.rate_limit_per_hour,
            "log_level": settings.log_level,
            "feature_flags": get_feature_flags(),
            "ml_settings": {
                "model_dir": settings.ml_model_dir,
                "auto_retraining": settings.enable_auto_retraining,
                "retraining_interval": settings.retraining_interval_hours
            }
        }
        
        return {
            "success": True,
            "data": safe_settings
        }
        
    except Exception as e:
        logger.error(f"Error getting settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/settings", tags=["Configuration"])
async def update_application_settings(
    new_settings: Dict[str, Any] = Body(..., description="Settings to update")
):
    """
    Update application settings
    """
    try:
        logger.info(f"Updating settings: {list(new_settings.keys())}")
        
        # Define safe settings that can be updated
        safe_settings = {
            "debug", "host", "port", "workers", "enable_monitoring",
            "cors_origins", "rate_limit_per_minute", "rate_limit_per_hour",
            "log_level", "enable_chatbot", "enable_recommendations",
            "enable_analytics", "enable_automation", "enable_auto_retraining",
            "retraining_interval_hours"
        }
        
        # Filter and validate settings
        valid_settings = {}
        for key, value in new_settings.items():
            if key in safe_settings:
                valid_settings[key] = value
            else:
                logger.warning(f"Attempt to update restricted setting: {key}")
        
        # Update settings
        update_settings(valid_settings)
        
        return {
            "success": True,
            "message": "Settings updated successfully",
            "updated_settings": list(valid_settings.keys())
        }
        
    except Exception as e:
        logger.error(f"Error updating settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/features", tags=["Configuration"])
async def get_feature_status():
    """
    Get current feature flags status
    """
    try:
        feature_flags = get_feature_flags()
        
        return {
            "success": True,
            "data": {
                "feature_flags": feature_flags,
                "enabled_features": [k for k, v in feature_flags.items() if v],
                "disabled_features": [k for k, v in feature_flags.items() if not v]
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting feature status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/features/{feature_name}/enable", tags=["Configuration"])
async def enable_feature(feature_name: str):
    """
    Enable a specific feature
    """
    try:
        feature_map = {
            "chatbot": "enable_chatbot",
            "recommendations": "enable_recommendations", 
            "analytics": "enable_analytics",
            "automation": "enable_automation",
            "monitoring": "enable_monitoring",
            "auto_retraining": "enable_auto_retraining"
        }
        
        if feature_name not in feature_map:
            raise HTTPException(status_code=400, detail=f"Unknown feature: {feature_name}")
        
        setting_name = feature_map[feature_name]
        update_settings({setting_name: True})
        
        return {
            "success": True,
            "message": f"Feature '{feature_name}' enabled successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enabling feature: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/features/{feature_name}/disable", tags=["Configuration"])
async def disable_feature(feature_name: str):
    """
    Disable a specific feature
    """
    try:
        feature_map = {
            "chatbot": "enable_chatbot",
            "recommendations": "enable_recommendations",
            "analytics": "enable_analytics", 
            "automation": "enable_automation",
            "monitoring": "enable_monitoring",
            "auto_retraining": "enable_auto_retraining"
        }
        
        if feature_name not in feature_map:
            raise HTTPException(status_code=400, detail=f"Unknown feature: {feature_name}")
        
        setting_name = feature_map[feature_name]
        update_settings({setting_name: False})
        
        return {
            "success": True,
            "message": f"Feature '{feature_name}' disabled successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error disabling feature: {e}")
        raise HTTPException(status_code=500, detail=str(e))