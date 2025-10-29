from fastapi import FastAPI
import logging

from customer_service.routers import description_router, title_router
from recommendation.routers import recommend_router
from analytics.routers import trend_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Machine AI Service")

# Include routers
app.include_router(description_router.router, prefix="/api", tags=["Description"])
app.include_router(title_router.router, prefix="/api", tags=["Title"])
app.include_router(recommend_router, prefix="/recommend", tags=["Recommendation"])
app.include_router(trend_router.router, prefix="/analytics", tags=["Analytics"])

@app.get("/")
def root():
    return {"message": "✅ MACHINE AI Service is running!"}
