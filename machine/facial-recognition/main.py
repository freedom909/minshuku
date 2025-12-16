from fastapi import FastAPI, UploadFile, File
from insightface.app import FaceAnalysis
import numpy as np
import cv2

app = FastAPI()

face_app = FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
face_app.prepare(ctx_id=0)

@app.post("/verify-face")
async def verify_face(file: UploadFile = File(...)):
    data = await file.read()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

    faces = face_app.get(img)
    if len(faces) == 0:
        return {"verified": False}

    return {"verified": True}
