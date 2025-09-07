# syntax=docker/dockerfile:1

FROM python:3.12-slim
# Set environment variables
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt

# Run uvicorn so container stays alive
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]