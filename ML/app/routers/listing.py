from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from ..services.listing_updater import ListingUpdater

router = APIRouter()
listing_updater = ListingUpdater()

class ListingUpdateInput(BaseModel):
    listing_id: str
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None

@router.post("/update-listing")
async def update_listing(input_data: ListingUpdateInput):
    """
    更新 listing 的端点
    
    Args:
        input_data: 包含 listing_id 和要更新的字段的对象
    
    Returns:
        更新后的 listing 数据
    """
    try:
        # 构建更新数据字典，只包含非空值
        update_data = {k: v for k, v in input_data.dict().items() 
                      if k != "listing_id" and v is not None}
        
        # 调用服务更新 listing
        result = await listing_updater.update_listing(
            input_data.listing_id,
            update_data
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/update-listing")
async def update_listing_info():
    """
    提供 API 使用信息的端点
    """
    return {
        "message": "Send a POST request with a JSON body like:",
        "example": {
            "listing_id": "123",
            "title": "Updated Title",
            "description": "Updated Description",
            "price": 100.00
        }
    }