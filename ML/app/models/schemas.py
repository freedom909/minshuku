# app/models/schemas.py
from pydantic import BaseModel

class ListingRequest(BaseModel):
    listing_id: str

class ReviewRequest(BaseModel):
    review: str
