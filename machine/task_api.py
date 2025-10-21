import yaml
from fastapi import FastAPI
from core.task_runner import execute_task
from core.task_validator import validate_task_execution
from core.db_helper import save_task_log

app = FastAPI()

@app.post("/runTask/{taskName}")
def run_task(taskName: str, listingId: str):
    # 1️⃣ 读取 YAML 定义
    with open(f"ai_tasks/{taskName}.yaml", "r", encoding="utf-8") as f:
        task_def = yaml.safe_load(f)
    
    # 2️⃣ 执行 AI 任务
    execution_result = execute_task(task_def, {"listingId": listingId})

    # 3️⃣ 任务执行完成后，自动检查
    validation_report = validate_task_execution(task_def, execution_result)

    # 4️⃣ 写入数据库日志或文件
    save_task_log(taskName, listingId, execution_result, validation_report)

    return {
        "status": "ok",
        "task": taskName,
        "listingId": listingId,
        "validation": validation_report
    }
