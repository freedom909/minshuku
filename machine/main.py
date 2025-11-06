import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
print("Python module search paths:", sys.path)

from fastapi import FastAPI
import logging
from machine.core.my_logging import logger

from machine.customer_service.routers import description_router, title_router, performance_tips_router, listing_router, ai_task_router
from machine.recommendation.routers import recommend_router
from machine.analytics.routers import trend_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Machine AI Service")

# Include routers
app.include_router(description_router.router, prefix="/api", tags=["Description"])
app.include_router(title_router.router, prefix="/api", tags=["Title"])
app.include_router(performance_tips_router.router, prefix="/api", tags=["Performance Tips"])
app.include_router(recommend_router, prefix="/recommend", tags=["Recommendation"])
app.include_router(trend_router.router, prefix="/analytics", tags=["Analytics"])
app.include_router(description_router.router, prefix="/description") 
app.include_router(description_router.router)
app.include_router(listing_router.router)
app.include_router(ai_task_router.router, prefix="/api", tags=["AI Tasks"])
@app.get("/")
def root():
    return {"message": "✅ MACHINE AI Service is running!"}

# Print all routes
for route in app.routes:
    print(f"Path: {route.path}, Methods: {route.methods}")
