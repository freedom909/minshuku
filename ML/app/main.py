from fastapi import FastAPI
from app.routers import title, description, review

app = FastAPI(title="AI Services for Host Listings")

app.include_router(title.router)
app.include_router(description.router)
app.include_router(review.router)
