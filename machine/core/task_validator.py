# core/task_validator.py

def validate_task_execution(task_def: dict, result: dict) -> dict:
    """
    检查AI任务的执行结果是否符合YAML定义
    """

    report = {
        "task_name": task_def.get("task_name"),
        "checks": [],
        "passed": True
    }

    # 检查输出schema
    output_schema = task_def.get("output", {}).get("schema", {})
    for field, rule in output_schema.items():
        if field not in result:
            report["checks"].append(f"❌ Missing output field: {field}")
            report["passed"] = False
        else:
            report["checks"].append(f"✅ Found field '{field}'")

    # 检查数据类型
    for field, rule in output_schema.items():
        expected_type = rule.get("type")
        if expected_type == "list" and not isinstance(result[field], list):
            report["checks"].append(f"❌ {field} should be a list")
            report["passed"] = False

    # 检查日志消息规范
    log_message = task_def.get("logging", {}).get("message")
    if not log_message:
        report["checks"].append("⚠️ No logging message defined")
    else:
        report["checks"].append("✅ Logging message template exists")

    # 最终报告
    if report["passed"]:
        report["summary"] = "✅ All checks passed"
    else:
        report["summary"] = "⚠️ Some checks failed"

    return report
