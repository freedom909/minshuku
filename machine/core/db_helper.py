# core/db_helper.py

from datetime import datetime
import json

def save_task_log(task_name, listing_id, result, validation_report):
    with open("logs/ai_task_log.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "task_name": task_name,
            "listing_id": listing_id,
            "result": result,
            "validation": validation_report
        }, ensure_ascii=False) + "\n")

