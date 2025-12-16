FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    libgl1 libglib2.0-0 \
 && rm -rf /var/lib/apt/lists/*

RUN pip install \
    insightface \
    opencv-python \
    fastapi uvicorn

WORKDIR /app
COPY . /app

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
