from fastapi import FastAPI, UploadFile, File
import numpy as np
import cv2
from insightface.app import FaceAnalysis

app = FastAPI()

from insightface.app import FaceAnalysis

face_app = FaceAnalysis(
    name="buffalo_l",
    root="/models",
    providers=["CPUExecutionProvider"]
)
face_app.prepare(ctx_id=0)
# face_app.prepare(ctx_id=0, det_size=(640, 640))


def read_image(file: UploadFile):
    image_bytes = file.file.read()
    npimg = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(npimg, cv2.IMREAD_COLOR)


@app.post("/verify")
async def verify(face1: UploadFile = File(...), face2: UploadFile = File(...)):
    img1 = read_image(face1)
    img2 = read_image(face2)

    faces1 = face_app.get(img1)
    faces2 = face_app.get(img2)

    if not faces1 or not faces2:
        return {"verified": False, "reason": "No face detected"}

    emb1 = faces1[0].embedding
    emb2 = faces2[0].embedding

    similarity = np.dot(emb1, emb2) / (
        np.linalg.norm(emb1) * np.linalg.norm(emb2)
    )

    return {
        "verified": similarity > 0.35,
        "similarity": float(similarity)
    }
