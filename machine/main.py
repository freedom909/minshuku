from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import listing_router, description_router, review_router

app = FastAPI(title="Machine REST Service")

# Enable CORS so Node.js subgraph can call it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(listing_router.router, prefix="/listing", tags=["Listing"])
app.include_router(description_router.router, prefix="/description", tags=["Description"])
app.include_router(review_router.router, prefix="/review", tags=["Review"])

@app.get("/")
def root():
    return {"status": "ok", "service": "machine"}
