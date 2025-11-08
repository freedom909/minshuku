# customer_service/routers/review_reply_router.py
"""Review Reply Router - 评论回复建议API路由"""

from fastapi import APIRouter, HTTPException, Body
from typing import Dict, List, Optional, Any
import logging

from machine.customer_service.services.suggest_review_reply import suggest_review_reply

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/suggest", tags=["Review Reply"])
async def suggest_review_reply_endpoint(
    review_data: Dict = Body(..., description="评论数据")
):
    """
    生成评论回复建议 (POST)
    
    Request Body:
    ```json
    {
        "reviewId": "review-001",
        "reviewContent": "房间很干净，服务很好", 
        "reviewRating": 4.5,
        "reviewerName": "旅行者",
        "listingId": "listing-001"  # 可选
    }
    ```
    """
    try:
        logger.info(f"Received review reply suggestion request: {review_data.get('reviewId')}")
        
        result = suggest_review_reply(review_data)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "success": True,
            "data": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in review reply suggestion: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health", tags=["Review Reply"])
async def review_reply_health_check():
    """评论回复服务健康检查"""
    try:
        # 简单的健康检查测试
        test_data = {
            "reviewId": "health-check",
            "reviewContent": "测试评论",
            "reviewRating": 5.0,
            "reviewerName": "测试用户"
        }
        
        result = suggest_review_reply(test_data)
        
        return {
            "status": "healthy",
            "service": "Review Reply Suggestion",
            "features": {
                "sentiment_analysis": "active",
                "key_point_extraction": "active", 
                "reply_generation": "active"
            },
            "test_result": "success" if "error" not in result else "failed",
            "timestamp": "2024-01-15T10:00:00Z"
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/demo", tags=["Review Reply"])
async def review_reply_demo():
    """评论回复建议演示端点"""
    try:
        demo_cases = [
            {
                "reviewId": "demo-positive",
                "reviewContent": "这次入住体验非常棒！房间干净整洁，服务人员热情周到，地理位置也很方便，下次还会选择这里。",
                "reviewRating": 4.9,
                "reviewerName": "满意顾客"
            },
            {
                "reviewId": "demo-neutral", 
                "reviewContent": "整体还不错，房间设施基本齐全，但WiFi信号不太稳定，卫生可以再加强一些。",
                "reviewRating": 3.7,
                "reviewerName": "普通旅客"
            },
            {
                "reviewId": "demo-negative",
                "reviewContent": "非常失望的一次体验。房间有异味，空调噪音大，服务态度也不好，不会推荐给朋友。",
                "reviewRating": 2.1,
                "reviewerName": "失望客人"
            }
        ]
        
        demo_results = []
        for case in demo_cases:
            result = suggest_review_reply(case)
            demo_results.append({
                "input": case,
                "output": result
            })
        
        return {
            "success": True,
            "demo_cases": demo_results,
            "message": "评论回复建议演示完成"
        }
        
    except Exception as e:
        logger.error(f"Demo endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))