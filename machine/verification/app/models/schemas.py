from pydantic import BaseModel, HttpUrl

class FaceVerifyRequest(BaseModel):
    id_image_url: HttpUrl
    selfie_image_url: HttpUrl

class FaceVerifyResponse(BaseModel):
    verified: bool
    reason: str | None
