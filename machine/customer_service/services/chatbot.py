# customer_service/services/chatbot.py
"""Intelligent Chatbot for Customer Support and Query Handling"""

import google.generativeai as genai
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

from machine.core.db_connection import GEMINI_API_KEY, DEFAULT_GEMINI_MODEL, mysql_pool, neo4j_query
from machine.core.neo4j_client import get_listing_by_id

logger = logging.getLogger(__name__)

class QueryType(Enum):
    """Types of customer queries"""
    BOOKING = "booking"
    LISTING = "listing"
    PAYMENT = "payment"
    SUPPORT = "support"
    GENERAL = "general"
    REVIEW = "review"

class Chatbot:
    """Intelligent chatbot for customer service"""
    
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(DEFAULT_GEMINI_MODEL)
        self.conversation_history = {}
        self.query_classifier_prompt = """
        Classify the following customer query into one of these categories:
        - booking: Questions about reservations, availability, booking process
        - listing: Questions about property details, amenities, location
        - payment: Questions about pricing, billing, refunds
        - support: Technical issues, account problems, complaints
        - review: Questions about reviews, ratings, feedback
        - general: General inquiries, greetings, other questions
        
        Query: "{query}"
        
        Respond with ONLY the category name (booking, listing, payment, support, review, or general).
        """
    
    async def classify_query(self, query: str) -> str:
        """Classify the type of customer query"""
        try:
            prompt = self.query_classifier_prompt.format(query=query)
            response = self.model.generate_content(prompt)
            category = response.text.strip().lower()
            
            # Validate category
            valid_categories = [qtype.value for qtype in QueryType]
            if category not in valid_categories:
                return QueryType.GENERAL.value
                
            return category
        except Exception as e:
            logger.error(f"Error classifying query: {e}")
            return QueryType.GENERAL.value
    
    async def get_listing_info(self, listing_id: str) -> Dict:
        """Get detailed information about a listing"""
        try:
            # Get from Neo4j
            listing = get_listing_by_id(listing_id)
            if not listing:
                return {"error": "Listing not found"}
            
            # Get additional info from MySQL
            conn = mysql_pool.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT l.*, 
                       COUNT(DISTINCT b.id) as total_bookings,
                       AVG(r.rating) as avg_rating
                FROM listings l
                LEFT JOIN bookings b ON l.id = b.listing_id
                LEFT JOIN reviews r ON l.id = r.listing_id
                WHERE l.id = %s
                GROUP BY l.id
            """, (listing_id,))
            
            mysql_data = cursor.fetchone()
            cursor.close()
            conn.close()
            
            # Combine data
            listing_info = {**listing, **mysql_data} if mysql_data else listing
            return listing_info
            
        except Exception as e:
            logger.error(f"Error getting listing info: {e}")
            return {"error": str(e)}
    
    async def handle_booking_query(self, query: str, user_id: str = None) -> Dict:
        """Handle booking-related queries"""
        try:
            prompt = f"""
            You are a customer service agent for a vacation rental platform.
            
            User Query: "{query}"
            
            Provide a helpful, friendly response about booking-related matters including:
            - Availability and reservations
            - Booking process
            - Cancellation policies
            - Date changes
            - Group bookings
            
            Keep the response concise and helpful.
            """
            
            response = self.model.generate_content(prompt)
            return {
                "response": response.text,
                "query_type": QueryType.BOOKING.value,
                "suggested_actions": ["check_availability", "view_calendar", "contact_host"]
            }
        except Exception as e:
            logger.error(f"Error handling booking query: {e}")
            return {"error": str(e)}
    
    async def handle_listing_query(self, query: str, listing_id: str = None) -> Dict:
        """Handle listing-related queries"""
        try:
            listing_info = {}
            if listing_id:
                listing_info = await self.get_listing_info(listing_id)
            
            prompt = f"""
            You are a customer service agent for a vacation rental platform.
            
            User Query: "{query}"
            
            Listing Information: {json.dumps(listing_info, default=str) if listing_info else "Not specified"}
            
            Provide detailed information about the property including:
            - Amenities and features
            - Location and neighborhood
            - Property rules and policies
            - Photos and descriptions
            - Guest capacity and layout
            
            Be informative and highlight key features.
            """
            
            response = self.model.generate_content(prompt)
            return {
                "response": response.text,
                "query_type": QueryType.LISTING.value,
                "listing_info": listing_info if listing_id else None,
                "suggested_actions": ["view_photos", "read_reviews", "contact_host"]
            }
        except Exception as e:
            logger.error(f"Error handling listing query: {e}")
            return {"error": str(e)}
    
    async def handle_payment_query(self, query: str) -> Dict:
        """Handle payment-related queries"""
        try:
            prompt = f"""
            You are a customer service agent for a vacation rental platform.
            
            User Query: "{query}"
            
            Provide clear information about:
            - Pricing and fees
            - Payment methods
            - Refund policies
            - Security deposits
            - Billing questions
            
            Be transparent about costs and policies.
            """
            
            response = self.model.generate_content(prompt)
            return {
                "response": response.text,
                "query_type": QueryType.PAYMENT.value,
                "suggested_actions": ["view_invoice", "contact_support", "payment_help"]
            }
        except Exception as e:
            logger.error(f"Error handling payment query: {e}")
            return {"error": str(e)}
    
    async def handle_support_query(self, query: str) -> Dict:
        """Handle technical support queries"""
        try:
            prompt = f"""
            You are a technical support agent for a vacation rental platform.
            
            User Query: "{query}"
            
            Provide helpful troubleshooting steps for:
            - Account issues
            - Website/app problems
            - Technical errors
            - Feature questions
            - Security concerns
            
            Offer clear steps and escalation options.
            """
            
            response = self.model.generate_content(prompt)
            return {
                "response": response.text,
                "query_type": QueryType.SUPPORT.value,
                "suggested_actions": ["clear_cache", "update_app", "contact_support"]
            }
        except Exception as e:
            logger.error(f"Error handling support query: {e}")
            return {"error": str(e)}
    
    async def handle_review_query(self, query: str) -> Dict:
        """Handle review-related queries"""
        try:
            prompt = f"""
            You are a customer service agent for a vacation rental platform.
            
            User Query: "{query}"
            
            Provide information about:
            - Writing reviews
            - Review policies
            - Rating system
            - Responding to reviews
            - Review guidelines
            
            Encourage honest and constructive feedback.
            """
            
            response = self.model.generate_content(prompt)
            return {
                "response": response.text,
                "query_type": QueryType.REVIEW.value,
                "suggested_actions": ["write_review", "read_guidelines", "contact_host"]
            }
        except Exception as e:
            logger.error(f"Error handling review query: {e}")
            return {"error": str(e)}
    
    async def handle_general_query(self, query: str) -> Dict:
        """Handle general inquiries"""
        try:
            prompt = f"""
            You are a friendly customer service agent for a vacation rental platform.
            
            User Query: "{query}"
            
            Provide a warm, helpful response to general inquiries.
            Be welcoming and offer assistance with:
            - Platform overview
            - Getting started
            - General questions
            - Greetings and introductions
            
            Keep it friendly and inviting.
            """
            
            response = self.model.generate_content(prompt)
            return {
                "response": response.text,
                "query_type": QueryType.GENERAL.value,
                "suggested_actions": ["explore_listings", "create_account", "contact_support"]
            }
        except Exception as e:
            logger.error(f"Error handling general query: {e}")
            return {"error": str(e)}
    
    async def process_query(self, query: str, user_id: str = None, context: Dict = None) -> Dict:
        """Main method to process customer queries"""
        try:
            # Classify the query
            query_type = await self.classify_query(query)
            
            # Extract listing ID if mentioned
            listing_id = None
            if context and context.get("listing_id"):
                listing_id = context.get("listing_id")
            else:
                # Try to extract listing ID from query
                import re
                listing_pattern = r'(?:listing|property)\s*(?:id|#)?\s*([a-zA-Z0-9-]+)'
                matches = re.findall(listing_pattern, query, re.IGNORECASE)
                if matches:
                    listing_id = matches[0]
            
            # Handle based on query type
            if query_type == QueryType.BOOKING.value:
                result = await self.handle_booking_query(query, user_id)
            elif query_type == QueryType.LISTING.value:
                result = await self.handle_listing_query(query, listing_id)
            elif query_type == QueryType.PAYMENT.value:
                result = await self.handle_payment_query(query)
            elif query_type == QueryType.SUPPORT.value:
                result = await self.handle_support_query(query)
            elif query_type == QueryType.REVIEW.value:
                result = await self.handle_review_query(query)
            else:
                result = await self.handle_general_query(query)
            
            # Add metadata
            result.update({
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id,
                "original_query": query,
                "query_classification": query_type
            })
            
            # Store conversation history
            if user_id:
                if user_id not in self.conversation_history:
                    self.conversation_history[user_id] = []
                self.conversation_history[user_id].append({
                    "query": query,
                    "response": result.get("response"),
                    "timestamp": result["timestamp"]
                })
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return {
                "error": "Sorry, I encountered an error processing your query. Please try again.",
                "timestamp": datetime.now().isoformat()
            }
    
    async def get_conversation_history(self, user_id: str) -> List[Dict]:
        """Get conversation history for a user"""
        return self.conversation_history.get(user_id, [])
    
    async def clear_conversation_history(self, user_id: str) -> bool:
        """Clear conversation history for a user"""
        if user_id in self.conversation_history:
            del self.conversation_history[user_id]
            return True
        return False

# Global chatbot instance
chatbot_instance = Chatbot()