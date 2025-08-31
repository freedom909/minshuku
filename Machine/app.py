from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
from typing import List
from pydantic import BaseModel

app = FastAPI()

class ListingRequest(BaseModel):
    listingId: str

class ReviewRequest(BaseModel):
    reviewId: str
    listingId: str

@app.post("/generate-description")
async def generate_description(req: ListingRequest):
    # Dummy AI logic
    return {"suggestions": [
        f"Beautiful listing {req.listingId} with cozy vibes",
        f"Spacious and bright listing {req.listingId}"
    ]}

@app.post("/suggest-title")
async def suggest_title(req: ListingRequest):
    return {"suggestions": [
        f"Luxury Home near {req.listingId}",
        f"Affordable Stay at {req.listingId}"
    ]}

@app.post("/generate-reply")
async def generate_reply(req: ReviewRequest):
    return {"reply": f"Thank you for your feedback on listing {req.listingId}, review {req.reviewId}!"}    
# Optional: allow frontend/backend cross-origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or limit to localhost/frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load sentiment analysis model (this might take a few seconds at startup)
classifier = pipeline("sentiment-analysis")

@app.get("/classify/")
async def classify(text: str):
    result = classifier(text)[0]
    return {
        "label": result["label"],
        "score": result["score"]
    }
