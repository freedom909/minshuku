# customer_service/routers/chatbot_router.py
"""Chatbot Router for Customer Support API"""

from fastapi import APIRouter, HTTPException, Query, Body
from typing import Dict, List, Optional, Any
import logging

from machine.customer_service.services.chatbot import chatbot_instance

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/chat", tags=["Chatbot"])
async def chat_with_bot(
    message: str = Body(..., description="User message to the chatbot"),
    user_id: str = Body(None, description="User ID for conversation tracking"),
    context: Dict = Body(None, description="Additional context for the query")
):
    """
    Send a message to the chatbot and get a response
    """
    try:
        logger.info(f"Chat request from user {user_id}: {message}")
        
        result = await chatbot_instance.process_query(
            query=message,
            user_id=user_id,
            context=context
        )
        
        return {
            "success": "error" not in result,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/history", tags=["Chatbot"])
async def get_chat_history(
    user_id: str = Query(..., description="User ID to get conversation history for")
):
    """
    Get conversation history for a specific user
    """
    try:
        history = await chatbot_instance.get_conversation_history(user_id)
        
        return {
            "success": True,
            "data": {
                "user_id": user_id,
                "conversation_count": len(history),
                "history": history
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting chat history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/chat/history", tags=["Chatbot"])
async def clear_chat_history(
    user_id: str = Query(..., description="User ID to clear conversation history for")
):
    """
    Clear conversation history for a specific user
    """
    try:
        success = await chatbot_instance.clear_conversation_history(user_id)
        
        return {
            "success": success,
            "message": f"Conversation history cleared for user {user_id}" if success else f"No history found for user {user_id}"
        }
        
    except Exception as e:
        logger.error(f"Error clearing chat history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/classify", tags=["Chatbot"])
async def classify_query(
    query: str = Body(..., description="Query to classify")
):
    """
    Classify a customer query into categories
    """
    try:
        query_type = await chatbot_instance.classify_query(query)
        
        return {
            "success": True,
            "data": {
                "query": query,
                "classification": query_type,
                "description": {
                    "booking": "Questions about reservations, availability, booking process",
                    "listing": "Questions about property details, amenities, location",
                    "payment": "Questions about pricing, billing, refunds",
                    "support": "Technical issues, account problems, complaints",
                    "review": "Questions about reviews, ratings, feedback",
                    "general": "General inquiries, greetings, other questions"
                }[query_type]
            }
        }
        
    except Exception as e:
        logger.error(f"Error classifying query: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/listing-info", tags=["Chatbot"])
async def get_listing_info_for_chat(
    listing_id: str = Query(..., description="Listing ID to get information for")
):
    """
    Get detailed listing information for chatbot responses
    """
    try:
        listing_info = await chatbot_instance.get_listing_info(listing_id)
        
        return {
            "success": "error" not in listing_info,
            "data": listing_info
        }
        
    except Exception as e:
        logger.error(f"Error getting listing info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/batch", tags=["Chatbot"])
async def batch_chat_processing(
    messages: List[Dict] = Body(..., description="List of messages to process")
):
    """
    Process multiple chat messages in batch
    """
    try:
        results = []
        
        for message_data in messages:
            result = await chatbot_instance.process_query(
                query=message_data.get("message", ""),
                user_id=message_data.get("user_id"),
                context=message_data.get("context", {})
            )
            results.append(result)
        
        return {
            "success": True,
            "data": {
                "processed_count": len(results),
                "results": results
            }
        }
        
    except Exception as e:
        logger.error(f"Error in batch chat processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/health", tags=["Chatbot"])
async def chatbot_health_check():
    """
    Health check for chatbot service
    """
    try:
        # Test query classification
        test_query = "Hello, I need help with booking"
        query_type = await chatbot_instance.classify_query(test_query)
        
        return {
            "status": "healthy",
            "service": "Customer Service Chatbot",
            "test_query": test_query,
            "classification": query_type,
            "active_conversations": len(chatbot_instance.conversation_history),
            "timestamp": "2024-01-15T10:00:00Z"
        }
        
    except Exception as e:
        logger.error(f"Chatbot health check failed: {e}")
        raise HTTPException(status_code=500, detail="Chatbot service is unhealthy")