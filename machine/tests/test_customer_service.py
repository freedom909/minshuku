"""
Unit tests for customer service modules
"""
import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from machine.customer_service.services.suggest_title import suggest_title_improvement
from machine.customer_service.services.suggest_description import suggest_description_improvement
from machine.customer_service.services.suggest_review_reply import suggest_review_reply


class TestTitleSuggestionService:
    """Test title suggestion functionality"""
    
    @pytest.mark.asyncio
    async def test_title_suggestion_basic(self):
        """Test basic title suggestion functionality"""
        test_listing = {
            "listingId": "listing-001",
            "currentTitle": "Nice apartment in Tokyo",
            "listingDetails": {
                "location": "Tokyo",
                "amenities": ["wifi", "parking", "breakfast"],
                "price": 120
            }
        }
        
        with patch('machine.customer_service.services.suggest_title.neo4j_query') as mock_query:
            mock_query.return_value = [{"title": "Nice apartment in Tokyo"}]
            
            result = suggest_title_improvement(test_listing["listingId"])
            
            assert result is not None
            assert "suggestions" in result
            assert isinstance(result["suggestions"], list)
            assert len(result["suggestions"]) > 0
    
    @pytest.mark.asyncio
    async def test_title_suggestion_empty_input(self):
        """Test title suggestion with empty input"""
        result = suggest_title_improvement("")
        
        assert "error" in result
        assert "listing ID" in result["error"].lower()
    
    @pytest.mark.asyncio
    async def test_title_suggestion_invalid_listing(self):
        """Test title suggestion for non-existent listing"""
        with patch('machine.customer_service.services.suggest_title.neo4j_query') as mock_query:
            mock_query.return_value = []
            
            result = suggest_title_improvement("non-existent-listing")
            
            assert "error" in result
            assert "not found" in result["error"].lower()


class TestDescriptionSuggestionService:
    """Test description suggestion functionality"""
    
    @pytest.mark.asyncio
    async def test_description_suggestion_basic(self):
        """Test basic description suggestion functionality"""
        test_data = {
            "listingId": "listing-001",
            "currentDescription": "A nice apartment in Tokyo with basic amenities.",
            "listingDetails": {
                "location": "Tokyo",
                "amenities": ["wifi", "parking", "breakfast"],
                "price": 120,
                "roomType": "apartment"
            }
        }
        
        with patch('machine.customer_service.services.suggest_description.get_listing_by_id') as mock_query:
            mock_query.return_value = {
                "title": "Nice apartment in Tokyo",
                "description": "A nice apartment in Tokyo with basic amenities.",
                "location": "Tokyo"
            }
            
            result = suggest_description_improvement(test_data["listingId"])
            
            assert result is not None
            assert "improved_description" in result
            assert "key_improvements" in result
            assert "readability_score" in result
    
    @pytest.mark.asyncio
    async def test_description_suggestion_short_input(self):
        """Test description suggestion with very short input"""
        test_data = {
            "listingId": "listing-002",
            "currentDescription": "Good place.",
            "listingDetails": {
                "location": "Osaka",
                "amenities": ["wifi"],
                "price": 80
            }
        }
        
        with patch('machine.customer_service.services.suggest_description.get_listing_by_id') as mock_query:
            mock_query.return_value = {
                "title": "Good place",
                "description": "Good place.",
                "location": "Osaka"
            }
            
            result = suggest_description_improvement(test_data["listingId"])
            
            # Should still provide suggestions even for short descriptions
            assert "improved_description" in result
            assert len(result["improved_description"]) > len(test_data["currentDescription"])
    
    @pytest.mark.asyncio
    async def test_description_suggestion_missing_data(self):
        """Test description suggestion with missing listing data"""
        with patch('machine.customer_service.services.suggest_description.get_listing_by_id') as mock_query:
            mock_query.return_value = None
            
            result = suggest_description_improvement("non-existent-listing")
            
            assert "error" in result
            assert "not found" in result["error"].lower()


class TestReviewReplySuggestionService:
    """Test review reply suggestion functionality"""
    
    def test_positive_review_reply(self):
        """Test reply generation for positive reviews"""
        review_data = {
            "reviewId": "review-001",
            "reviewContent": "Amazing stay! The room was clean, staff was friendly, and location was perfect.",
            "reviewRating": 5.0,
            "reviewerName": "HappyTraveler"
        }
        
        result = suggest_review_reply(review_data)
        
        assert "suggested_replies" in result
        assert "sentiment_analysis" in result
        assert "key_points_addressed" in result
        assert "confidence_score" in result
        
        assert result["sentiment_analysis"] == "positive"
        assert result["confidence_score"] >= 0.8
        assert len(result["suggested_replies"]) == 3
        assert "HappyTraveler" in result["suggested_replies"][0] or "感谢" in result["suggested_replies"][0]
    
    def test_neutral_review_reply(self):
        """Test reply generation for neutral reviews"""
        review_data = {
            "reviewId": "review-002",
            "reviewContent": "The room was okay. Clean but a bit small. Location was convenient.",
            "reviewRating": 3.5,
            "reviewerName": "AverageGuest"
        }
        
        result = suggest_review_reply(review_data)
        
        assert result["sentiment_analysis"] == "neutral"
        assert "clean" in str(result["key_points_addressed"]).lower() or "卫生" in str(result["key_points_addressed"])
        assert "small" in str(result["key_points_addressed"]).lower() or "小" in str(result["key_points_addressed"])
    
    def test_negative_review_reply(self):
        """Test reply generation for negative reviews"""
        review_data = {
            "reviewId": "review-003",
            "reviewContent": "Very disappointed. Room was dirty, staff was rude, and WiFi didn't work.",
            "reviewRating": 1.0,
            "reviewerName": "UnhappyCustomer"
        }
        
        result = suggest_review_reply(review_data)
        
        assert result["sentiment_analysis"] == "negative"
        assert "dirty" in str(result["key_points_addressed"]).lower() or "脏" in str(result["key_points_addressed"])
        assert "rude" in str(result["key_points_addressed"]).lower() or "粗鲁" in str(result["key_points_addressed"])
        assert "wifi" in str(result["key_points_addressed"]).lower()
    
    def test_missing_required_fields(self):
        """Test reply generation with missing required fields"""
        review_data = {
            "reviewId": "review-004"
            # Missing reviewContent and other required fields
        }
        
        result = suggest_review_reply(review_data)
        
        assert "error" in result
        assert "missing" in result["error"].lower() or "required" in result["error"].lower()
    
    def test_empty_review_content(self):
        """Test reply generation with empty review content"""
        review_data = {
            "reviewId": "review-005",
            "reviewContent": "",
            "reviewRating": 4.0,
            "reviewerName": "TestUser"
        }
        
        result = suggest_review_reply(review_data)
        
        # Should handle empty content gracefully
        assert "suggested_replies" in result
        assert len(result["suggested_replies"]) > 0
    
    def test_review_with_special_characters(self):
        """Test reply generation with special characters in review"""
        review_data = {
            "reviewId": "review-006",
            "reviewContent": "Great stay! 👍 The room was perfect 💯 and staff was amazing 🌟",
            "reviewRating": 5.0,
            "reviewerName": "EmojiUser"
        }
        
        result = suggest_review_reply(review_data)
        
        assert result["sentiment_analysis"] == "positive"
        assert result["confidence_score"] >= 0.7
    
    def test_high_rating_low_confidence(self):
        """Test reply generation for high rating but potentially fake review"""
        review_data = {
            "reviewId": "review-007",
            "reviewContent": "Good",
            "reviewRating": 5.0,
            "reviewerName": "BriefReviewer"
        }
        
        result = suggest_review_reply(review_data)
        
        # High rating but brief content might have lower confidence
        assert result["sentiment_analysis"] == "positive"
        assert result["confidence_score"] <= 0.9  # Might be lower due to brief content


class TestChatbotService:
    """Test chatbot functionality"""
    
    @pytest.mark.asyncio
    async def test_chatbot_initialization(self):
        """Test chatbot service initialization"""
        from machine.customer_service.services.chatbot_service import ChatbotService
        
        chatbot = ChatbotService()
        assert chatbot is not None
        assert hasattr(chatbot, 'conversation_history')
        assert hasattr(chatbot, 'response_templates')
    
    @pytest.mark.asyncio
    async def test_query_classification(self):
        """Test query classification functionality"""
        from machine.customer_service.services.chatbot_service import ChatbotService
        
        chatbot = ChatbotService()
        
        test_queries = [
            ("I want to book a room", "booking_inquiry"),
            ("What's the price for this listing?", "pricing_inquiry"),
            ("Can I cancel my booking?", "cancellation_inquiry"),
            ("Hello, how are you?", "general_greeting")
        ]
        
        for query, expected_type in test_queries:
            classification = await chatbot.classify_query(query)
            assert classification == expected_type
    
    @pytest.mark.asyncio
    async def test_response_generation(self):
        """Test automated response generation"""
        from machine.customer_service.services.chatbot_service import ChatbotService
        
        chatbot = ChatbotService()
        
        test_scenarios = [
            {
                "query": "I need help booking a room in Tokyo",
                "expected_elements": ["Tokyo", "booking", "help"]
            },
            {
                "query": "What are your cancellation policies?",
                "expected_elements": ["cancellation", "policy"]
            }
        ]
        
        for scenario in test_scenarios:
            response = await chatbot.generate_response(scenario["query"])
            
            assert "response" in response
            assert "confidence" in response
            
            # Check if expected elements are in the response
            response_text = response["response"].lower()
            for element in scenario["expected_elements"]:
                assert element.lower() in response_text


class TestPerformanceTipsService:
    """Test performance tips functionality"""
    
    @pytest.mark.asyncio
    async def test_performance_tips_generation(self):
        """Test performance tips generation"""
        from machine.customer_service.services.performance_tips import generate_performance_tips
        
        test_listing = {
            "listingId": "listing-001",
            "currentPerformance": {
                "views": 150,
                "bookings": 12,
                "conversion_rate": 0.08
            },
            "competitorAnalysis": {
                "avg_conversion_rate": 0.12,
                "top_performers": ["listing-002", "listing-003"]
            }
        }
        
        tips = await generate_performance_tips(test_listing)
        
        assert "tips" in tips
        assert "priority" in tips
        assert "expected_improvement" in tips
        
        assert len(tips["tips"]) > 0
        assert tips["priority"] in ["high", "medium", "low"]
        assert tips["expected_improvement"] > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])