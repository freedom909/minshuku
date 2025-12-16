from fastapi import APIRouter
from app.models.schemas import FaceVerifyRequest, FaceVerifyResponse
from app.services.face_service import verify_face

router = APIRouter()

@router.post("/face", response_model=FaceVerifyResponse)
def face_verification(payload: FaceVerifyRequest):
    result = verify_face(
        id_image_url=payload.id_image_url,
        selfie_image_url=payload.selfie_image_url
    )

    return FaceVerifyResponse(
        verified=result,
        reason=None if result else "Face mismatch"
    )
