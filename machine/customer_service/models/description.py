from pydantic import BaseModel

class DescriptionRequest(BaseModel):
    listingId: str

class DescriptionResponse(BaseModel):
    suggestion: str