from fastapi import FastAPI
from app.api.routes import router
from app.api.health import health_router

app = FastAPI(
    title="Verification Service",
    version="1.0.0"
)

app.include_router(health_router, prefix="/health", tags=["health"])
app.include_router(router, prefix="/verification", tags=["verification"])
