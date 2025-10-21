from fastapi import FastAPI
from customer_service import title_router, review_router
from analytics import trend_router
from recommendation import recommend_router
from customer_service import suggest_title
from customer_service.routers.description_router import router as description_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
app.include_router(title_router, prefix="/customer")
app.include_router(review_router, prefix="/customer")
app.include_router(trend_router, prefix="/analytics")
app.include_router(recommend_router, prefix="/recommend")
app.include_router(suggest_title.router, prefix="/suggest", tags=["Suggest"])
app.include_router(description_router, prefix="/api")


@app.post("/runTask/{taskName}")
def run_task(taskName: str, listingId: int):
    with open(f"ai_tasks/{taskName}.yaml", "r", encoding="utf-8") as f:
        task_def = yaml.safe_load(f)
    execute_task(task_def, {"listingId": listingId})
    return {"status": "ok", "task": taskName, "listingId": listingId}
@app.get("/")
def root():
    return {"message": "MACHINE AI Service"}