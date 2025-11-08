# machine/core/config.py
"""Configuration Management for Machine AI Service"""

import os
from typing import Dict, Any, Optional
from pydantic import BaseSettings

class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    app_name: str = "Machine AI Service"
    app_version: str = "2.0.0"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = 9000
    workers: int = 4
    
    # Database
    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_user: str = "root"
    mysql_password: str = "password"
    mysql_database: str = "minshuku"
    
    # Neo4j
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "password"
    
    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: Optional[str] = None
    
    # AI Services
    gemini_api_key: str = "your-gemini-api-key"
    openai_api_key: Optional[str] = None
    
    # Monitoring
    enable_monitoring: bool = True
    metrics_port: int = 9090
    
    # Security
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    cors_origins: list = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Rate Limiting
    rate_limit_per_minute: int = 60
    rate_limit_per_hour: int = 1000
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "minshuku.log"
    
    # ML Settings
    ml_model_dir: str = "ml_models"
    enable_auto_retraining: bool = True
    retraining_interval_hours: int = 24
    
    # Feature Flags
    enable_chatbot: bool = True
    enable_recommendations: bool = True
    enable_analytics: bool = True
    enable_automation: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()

def get_settings() -> Settings:
    """Get application settings"""
    return settings

def update_settings(new_settings: Dict[str, Any]) -> None:
    """Update settings dynamically"""
    for key, value in new_settings.items():
        if hasattr(settings, key):
            setattr(settings, key, value)

def get_feature_flags() -> Dict[str, bool]:
    """Get current feature flags"""
    return {
        "chatbot": settings.enable_chatbot,
        "recommendations": settings.enable_recommendations,
        "analytics": settings.enable_analytics,
        "automation": settings.enable_automation,
        "monitoring": settings.enable_monitoring,
        "auto_retraining": settings.enable_auto_retraining
    }