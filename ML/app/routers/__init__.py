from fastapi import APIRouter
from .ai_tasks import router as ai_tasks_router
from .description import router as description_router
from .review import router as review_router
from .title import router as title_router
from .listing import router as listing_router

# 创建主路由
main_router = APIRouter()

# 包含所有子路由
main_router.include_router(ai_tasks_router, prefix="/ai-tasks", tags=["AI Tasks"])
main_router.include_router(description_router, prefix="/description", tags=["Description"])
main_router.include_router(review_router, prefix="/review", tags=["Review"])
main_router.include_router(title_router, prefix="/title", tags=["Title"])
main_router.include_router(listing_router, prefix="/listing", tags=["Listing"])