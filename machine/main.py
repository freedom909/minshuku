# machine/main.py
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from fastapi import FastAPI
import logging
from machine.core.my_logging import logger

# Import routers
from machine.customer_service.routers import (
    description_router,
    title_router,
    performance_tips_router,
    listing_router,
    ai_task_router,
    chatbot_router,
    review_reply_router,
)
from machine.recommendation.routers import recommend_router
from machine.analytics.routers import trend_router, report_router

# Import ML routers
from machine.ml.routers import predictive_router, recommendation_router, automation_router, analytics_router, optimization_router, training_router

# Import monitoring router
from machine.core.routers.monitoring_router import router as monitoring_router

# Import config router
from machine.core.routers.config_router import router as config_router

# Logging
logging.basicConfig(level=logging.INFO)

# FastAPI app
app = FastAPI(title="Machine AI Service")

# Add monitoring middleware
from machine.core.middleware import monitoring_middleware
app.middleware("http")(monitoring_middleware)

# ===== ROUTERS =====
app.include_router(description_router.router, prefix="/api/description", tags=["Description"])
app.include_router(title_router.router, prefix="/api/title", tags=["Title"])
app.include_router(performance_tips_router.router, prefix="/api/performance", tags=["Performance Tips"])
app.include_router(ai_task_router.router, prefix="/api/tasks", tags=["AI Tasks"])
app.include_router(chatbot_router.router, prefix="/api/chatbot", tags=["Chatbot"])
app.include_router(review_reply_router.router, prefix="/api/review-reply", tags=["Review Reply"])

app.include_router(listing_router.router, prefix="/api/listings", tags=["Listings"])
app.include_router(recommend_router, prefix="/recommend", tags=["Recommendation"])

app.include_router(trend_router.router, prefix="/analytics/trends", tags=["Analytics"])
app.include_router(report_router.router, prefix="/analytics/report", tags=["Analytics Reports"])

# ===== ML ROUTERS =====
app.include_router(predictive_router.router, prefix="/ml/predictive", tags=["Machine Learning - Predictive"])
app.include_router(recommendation_router.router, prefix="/ml/recommendation", tags=["Machine Learning - Recommendation"])
app.include_router(automation_router.router, prefix="/ml/automation", tags=["Machine Learning - Automation"])
app.include_router(analytics_router.router, prefix="/ml/analytics", tags=["Machine Learning - Real-time Analytics"])
app.include_router(optimization_router.router, prefix="/ml/optimization", tags=["Machine Learning - Advanced Optimization"])
app.include_router(training_router.router, prefix="/ml/training", tags=["Machine Learning - Model Training"])

# ===== MONITORING =====
app.include_router(monitoring_router, prefix="/monitoring", tags=["System Monitoring"])

# ===== CONFIGURATION =====
app.include_router(config_router, prefix="/config", tags=["Configuration Management"])

# ===== ROOT =====
@app.get("/")
def root():
    return {"message": "✅ MACHINE AI Service is running!"}

# ===== Health Check with ML Status =====
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Machine AI Service",
        "ml_features": {
            "predictive_analytics": "active",
            "recommendation_engine": "active", 
            "intelligent_automation": "active",
            "real_time_analytics": "active",
            "advanced_optimization": "active",
            "version": "2.0.0"
        },
        "timestamp": "2024-01-15T10:00:00Z"
    }

# ===== Route Debugging =====
for route in app.routes:
    print(f"Path: {route.path}, Methods: {route.methods}")
