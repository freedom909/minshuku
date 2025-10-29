import yaml

def load_yaml_task(task_name: str):
    path = f"ai_tasks/{task_name}.yaml"
    try:
        with open(path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        return {"error": f"Task file {task_name}.yaml not found"}

def log_time(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"{func.__name__} took {end_time - start_time} seconds")
        return result
    return wrapper

def format_response(data: dict) -> dict:
    """Format response data to ensure consistent structure."""
    return {"status": "success", "data": data}
