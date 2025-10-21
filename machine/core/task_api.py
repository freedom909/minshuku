# task_api.py

from fastapi import FastAPI
from core.task_runner import execute_task, validate_task_execution
import yaml

app = FastAPI()

@app.post("/runTask/{taskName}")
def run_task(taskName: str, listingId: str):
    with open(f"ai_tasks/{taskName}.yaml", "r", encoding="utf-8") as f:
        task_def = yaml.safe_load(f)
    execute_task(task_def, {"listingId": listingId})
    return {"status": "ok", "task": taskName, "listingId": listingId}

@app.get("/tasks")
def list_tasks():
    import os
    files = [f for f in os.listdir("ai_tasks") if f.endswith(".yaml")]
    return {"tasks": files}


@app.get("/")
def root():
    return {"message": "✅ AI Task Runner is running! Visit /docs to try tasks."}
