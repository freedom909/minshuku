FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# System deps
RUN apt-get update && apt-get install -y \
    git curl \
    libgl1 libglib2.0-0 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 🔒 NumPy ABI safety
RUN pip install --no-cache-dir "numpy<2"

# 🔒 ABI-sensitive deps
RUN pip install --no-cache-dir \
    protobuf==3.20.* \
    onnxruntime==1.17.3 \
    insightface==0.7.2 \
    --no-deps

# App deps (⚠️ python-multipart 必须)
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    python-multipart \
    pillow \
    opencv-python \
    requests \
    tqdm

# 🔥 关键：提前下载 InsightFace 模型（build 阶段）
RUN python - <<EOF
from insightface.app import FaceAnalysis
FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
print("InsightFace model downloaded successfully")
EOF

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
