# import yaml
# import requests
# from datetime import datetime
# import os

# # ---------- 📘 Utilities ----------

# LOG_PATH = os.path.join("ai_tasks", "task_log.txt")

# def save_task_log(message: str):
#     """Append a timestamped message to the task log file."""
#     os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
#     with open(LOG_PATH, "a", encoding="utf-8") as f:
#         f.write(f"[{datetime.now().isoformat()}] {message}\n")
#     print(message)  # Optional: also print to console

# # ---------- 🧩 Core Executor ----------

# def execute_task(task_def: dict, context: dict = None):
#     """
#     Execute a YAML-defined task.
#     Each step in the YAML can have:
#       - action: description (for logging)
#       - type: "api" | "log" | "compute"
#       - method: "GET" | "POST" (if API)
#       - url: endpoint (if API)
#       - body: data to send
#     """
#     task_name = task_def.get("name", "Unnamed Task")
#     steps = task_def.get("steps", [])
#     context = context or {}

#     save_task_log(f"🚀 Starting task: {task_name}")

#     for i, step in enumerate(steps, start=1):
#         action = step.get("action", f"Step {i}")
#         step_type = step.get("type", "log")
#         save_task_log(f"▶️ {i}/{len(steps)} - {action}")

#         try:
#             # --- API Call ---
#             if step_type == "api":
#                 method = step.get("method", "GET").upper()
#                 url = step.get("url")
#                 body = step.get("body", {})

#                 # Inject context (e.g. listingId)
#                 if context:
#                     for k, v in context.items():
#                         if isinstance(body, dict):
#                             body[k] = v

#                 if method == "POST":
#                     res = requests.post(url, json=body)
#                 else:
#                     res = requests.get(url, params=body)

#                 save_task_log(f"📡 {method} {url} -> {res.status_code}")
#                 save_task_log(f"🧾 Response: {res.text[:200]}")

#             # --- Log message only ---
#             elif step_type == "log":
#                 msg = step.get("message", "(no message)")
#                 save_task_log(f"🪶 Log: {msg}")

#             # --- Simple computation or simulation ---
#             elif step_type == "compute":
#                 expression = step.get("expression")
#                 if expression:
#                     result = eval(expression, {}, context)
#                     save_task_log(f"🧮 Computed: {expression} = {result}")

#             else:
#                 save_task_log(f"⚠️ Unknown step type: {step_type}")

#         except Exception as e:
#             save_task_log(f"❌ Error in step {i}: {e}")

#     save_task_log(f"✅ Finished task: {task_name}")

# # ---------- ✅ Validation ----------

# def validate_task_execution(task_name: str) -> bool:
#     """Check whether a task finished successfully (based on logs)."""
#     if not os.path.exists(LOG_PATH):
#         return False
#     with open(LOG_PATH, "r", encoding="utf-8") as f:
#         logs = f.read()
#     return f"✅ Finished task: {task_name}" in logs

# # ---------- 🧪 Local Test ----------
# if __name__ == "__main__":
#     # Example run (assumes ai_tasks/task-1.yaml exists)
#     with open("ai_tasks/task-1.yaml", "r", encoding="utf-8") as f:
#         task_def = yaml.safe_load(f)
#     execute_task(task_def, {"listingId": 12345})
#     ok = validate_task_execution(task_def["name"])
#     print("Validation:", "✅ OK" if ok else "⚠️ Failed")

# task_runner.py

import yaml
import os
from datetime import datetime

TASKS_DIR = os.path.join(os.path.dirname(__file__), "tasks")
LOG_FILE = os.path.join(os.path.dirname(__file__), "task_log.txt")

def execute_task(task_name: str, listing_id: str):
    """Parse and execute a YAML-defined AI task."""
    yaml_path = os.path.join(TASKS_DIR, f"{task_name}.yaml")

    if not os.path.exists(yaml_path):
        raise FileNotFoundError(f"Task definition not found: {yaml_path}")

    with open(yaml_path, "r", encoding="utf-8") as f:
        task_data = yaml.safe_load(f)

    print(f"🧠 Executing task: {task_name} for listing {listing_id}")
    print(f"Steps: {task_data.get('steps', [])}")

    # Simulated execution (replace with AI logic later)
    results = []
    for i, step in enumerate(task_data.get("steps", [])):
        step_result = f"Executed step {i+1}: {step}"
        print(step_result)
        results.append(step_result)

    save_task_log(task_name, listing_id, results)
    return {"status": "ok", "task": task_name, "listingId": listing_id, "results": results}


def save_task_log(task_name, listing_id, results):
    """Save execution log to local file."""
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"\n[{datetime.now()}] Task: {task_name}, Listing: {listing_id}\n")
        for line in results:
            f.write(f"  - {line}\n")


def validate_task_execution(task_data):
    """Optional: validate YAML task structure."""
    if "steps" not in task_data:
        raise ValueError("Task must include a 'steps' field.")
