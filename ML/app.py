from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline

app = FastAPI()

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
