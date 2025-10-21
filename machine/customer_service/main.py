from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import listing_router, description_router, review_router

from customer_service.routers.listing_router import router as customer_router
app.include_router(customer_router)
app.include_router(description_router, prefix="/api")  # 如果有前缀

app = FastAPI(title="Machine REST Service")
app.include_router(description_router, prefix="/api")  # 如果有前缀

# Enable CORS so Node.js subgraph can call it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(listing_router.router, prefix="/api/listing", tags=["Listing"])
app.include_router(description_router.router, prefix="/api/description", tags=["Description"])
app.include_router(review_router.router, prefix="/api/review", tags=["Review"])

@app.get("/")
def root():
    return {"status": "ok", "service": "machine"}
