from fastapi import FastAPI
from app.routers import main_router

app = FastAPI(title="AI Service")
@app.get('/')
async def root():
    return {'message': 'Welcome to the AI Service'}

# Mount all endpoints
app.include_router(main_router, prefix="/api", tags=["API"])