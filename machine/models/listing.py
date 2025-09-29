from pydantic import BaseModel

class SuggestRequest(BaseModel):
    listingId: str

class SuggestResponse(BaseModel):
    suggestion: str
    confidence: float
    isSuitable: bool
