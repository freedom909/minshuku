from pydantic import BaseModel, Field

class SuggestRequest(BaseModel):
     listing_id: str = Field(..., alias="listingId")

class SuggestResponse(BaseModel):
    suggestion: str = Field(..., alias="suggestion")
    confidence: float = Field(..., alias="confidence")
    isSuitable: bool = Field(..., alias="isSuitable")
