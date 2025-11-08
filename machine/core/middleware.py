# machine/core/middleware.py
"""FastAPI Middleware for Request Monitoring"""

import time
from fastapi import Request
from fastapi.responses import Response
import logging

from machine.core.monitoring import system_monitor

logger = logging.getLogger(__name__)

async def monitoring_middleware(request: Request, call_next):
    """Middleware to monitor request timing and metrics"""
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration = time.time() - start_time
    
    try:
        # Track request metrics
        await system_monitor.track_request(
            endpoint=request.url.path,
            method=request.method,
            duration=duration,
            status_code=response.status_code,
            user_id=request.headers.get('user-id')  # Extract from headers if available
        )
        
        # Add timing header
        response.headers["X-Response-Time"] = str(duration)
        
    except Exception as e:
        logger.error(f"Error in monitoring middleware: {e}")
    
    return response