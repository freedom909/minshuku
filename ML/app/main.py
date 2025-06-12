from fastapi import FastAPI
from app.routers import ai_tasks

app = FastAPI(title="AI Service")
@app.get('/')
async def root():
    return {'message': 'Welcome to the AI Service'}

# Mount all AI-related endpoints
app.include_router(ai_tasks.router, prefix="/ai", tags=["AI Tasks"])
