"""
Unit tests for API routers
"""
import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
from machine.main import app


class TestMainAPI:
    """Test main API endpoints"""
    
    def setup_method(self):
        """Setup test client"""
        self.client = TestClient(app)
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = self.client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "healthy"
        assert data["service"] == "Machine AI Service"
        assert "ml_features" in data
        assert "version" in data
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = self.client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "Machine AI Service" in data["message"]


class TestCustomerServiceAPIs:
    """Test customer service API endpoints"""
    
    def setup_method(self):
        """Setup test client"""
        self.client = TestClient(app)
    
    def test_title_suggestion_endpoint(self):
        """Test title suggestion endpoint"""
        test_data = {
            "listingId": "listing-001"
        }
        
        with patch('machine.customer_service.routers.title_router.suggest_title_improvement') as mock_suggest:
            mock_suggest.return_value = {
                "suggestions": ["优化标题1", "优化标题2"],
                "confidence_scores": [0.85, 0.78],
                "improvement_expected": "点击率提升15-25%"
            }
            
            response = self.client.post("/api/title/suggest", json=test_data)
            
            assert response.status_code == 200
            data = response.json()
            
            assert "suggestions" in data
            assert len(data["suggestions"]) == 2
    
    def test_description_suggestion_endpoint(self):
        """Test description suggestion endpoint"""
        test_data = {
            "listingId": "listing-001"
        }
        
        with patch('machine.customer_service.routers.description_router.suggest_description_improvement') as mock_suggest:
            mock_suggest.return_value = {
                "improved_description": "优化后的描述内容",
                "key_improvements": ["增加了情感化表达", "优化了结构"],
                "readability_score": 8.5
            }
            
            response = self.client.post("/api/description/suggest", json=test_data)
            
            assert response.status_code == 200
            data = response.json()
            
            assert "improved_description" in data
            assert "key_improvements" in data
    
    def test_review_reply_endpoint(self):
        """Test review reply suggestion endpoint"""
        test_data = {
            "reviewId": "review-001",
            "reviewContent": "Great stay! Amazing service.",
            "reviewRating": 5.0,
            "reviewerName": "HappyGuest"
        }
        
        with patch('machine.customer_service.routers.review_reply_router.suggest_review_reply') as mock_suggest:
            mock_suggest.return_value = {
                "suggested_replies": ["感谢您的评价！", "很高兴您喜欢我们的服务。"],
                "sentiment_analysis": "positive",
                "confidence_score": 0.92
            }
            
            response = self.client.post("/api/review-reply/suggest", json=test_data)
            
            assert response.status_code == 200
            data = response.json()
            
            assert "suggested_replies" in data
            assert data["sentiment_analysis"] == "positive"
    
    def test_chatbot_endpoint(self):
        """Test chatbot endpoint"""
        test_data = {
            "message": "Hello, I need help booking a room",
            "conversation_id": "conv-001"
        }
        
        with patch('machine.customer_service.routers.chatbot_router.ChatbotService') as mock_chatbot:
            mock_instance = Mock()
            mock_instance.process_message.return_value = {
                "response": "I can help you with booking!",
                "confidence": 0.88,
                "suggested_actions": ["show_available_listings"]
            }
            mock_chatbot.return_value = mock_instance
            
            response = self.client.post("/api/chatbot/chat", json=test_data)
            
            assert response.status_code == 200
            data = response.json()
            
            assert "response" in data
            assert "confidence" in data


class TestMLAPIs:
    """Test machine learning API endpoints"""
    
    def setup_method(self):
        """Setup test client"""
        self.client = TestClient(app)
    
    def test_predictive_analytics_endpoint(self):
        """Test predictive analytics endpoint"""
        test_data = {
            "listing_id": "listing-001",
            "prediction_type": "demand"
        }
        
        with patch('machine.ml.routers.predictive_router.PredictiveAnalytics') as mock_predictive:
            mock_instance = Mock()
            mock_instance.predict_demand.return_value = {
                "predicted_demand": 150,
                "confidence_interval": [120, 180],
                "model_used": "random_forest_v2"
            }
            mock_predictive.return_value = mock_instance
            
            response = self.client.post("/ml/predictive/demand", json=test_data)
            
            assert response.status_code == 200
            data = response.json()
            
            assert "predicted_demand" in data
            assert "confidence_interval" in data
    
    def test_recommendation_endpoint(self):
        """Test recommendation endpoint"""
        test_data = {
            "user_id": "user-001",
            "preferences": {
                "price_range": [50, 200],
                "location": "Tokyo"
            }
        }
        
        with patch('machine.ml.routers.recommendation_router.RecommendationEngine') as mock_recommendation:
            mock_instance = Mock()
            mock_instance.get_user_recommendations.return_value = [
                {"listing_id": "listing-001", "score": 0.92},
                {"listing_id": "listing-002", "score": 0.88}
            ]
            mock_recommendation.return_value = mock_instance
            
            response = self.client.post("/ml/recommendation/user", json=test_data)
            
            assert response.status_code == 200
            data = response.json()
            
            assert isinstance(data, list)
            assert len(data) == 2
            assert data[0]["score"] == 0.92
    
    def test_optimization_endpoint(self):
        """Test optimization endpoint"""
        test_data = {
            "optimization_type": "pricing",
            "listing_id": "listing-001",
            "parameters": {
                "current_price": 100,
                "market_conditions": {"demand": "high"}
            }
        }
        
        with patch('machine.ml.routers.optimization_router.AdvancedOptimization') as mock_optimization:
            mock_instance = Mock()
            mock_instance.optimize_pricing_strategy.return_value = {
                "optimal_price": 108.5,
                "expected_revenue_increase": 0.15,
                "risk_level": "low"
            }
            mock_optimization.return_value = mock_instance
            
            response = self.client.post("/ml/optimization/pricing", json=test_data)
            
            assert response.status_code == 200
            data = response.json()
            
            assert "optimal_price" in data
            assert "expected_revenue_increase" in data


class TestAnalyticsAPIs:
    """Test analytics API endpoints"""
    
    def setup_method(self):
        """Setup test client"""
        self.client = TestClient(app)
    
    def test_trend_analysis_endpoint(self):
        """Test trend analysis endpoint"""
        test_params = {
            "metric": "bookings",
            "time_period": "last_30_days",
            "granularity": "daily"
        }
        
        with patch('machine.analytics.routers.trend_router.analyze_trends') as mock_analyze:
            mock_analyze.return_value = {
                "trend_data": [
                    {"date": "2024-01-01", "value": 10},
                    {"date": "2024-01-02", "value": 12}
                ],
                "trend_direction": "up",
                "growth_rate": 0.2
            }
            
            response = self.client.get("/analytics/trends", params=test_params)
            
            assert response.status_code == 200
            data = response.json()
            
            assert "trend_data" in data
            assert "trend_direction" in data
    
    def test_report_generation_endpoint(self):
        """Test report generation endpoint"""
        test_data = {
            "report_type": "performance",
            "start_date": "2024-01-01",
            "end_date": "2024-01-31"
        }
        
        with patch('machine.analytics.routers.report_router.generate_report') as mock_report:
            mock_report.return_value = {
                "summary": {
                    "total_revenue": 50000,
                    "total_bookings": 250,
                    "avg_occupancy": 0.75
                },
                "insights": ["Revenue increased by 15%", "Occupancy remains stable"]
            }
            
            response = self.client.post("/analytics/report", json=test_data)
            
            assert response.status_code == 200
            data = response.json()
            
            assert "summary" in data
            assert "insights" in data


class TestMonitoringAPIs:
    """Test monitoring API endpoints"""
    
    def setup_method(self):
        """Setup test client"""
        self.client = TestClient(app)
    
    def test_metrics_endpoint(self):
        """Test metrics endpoint"""
        with patch('machine.core.routers.monitoring_router.SystemMonitor') as mock_monitor:
            mock_instance = Mock()
            mock_instance.collect_metrics.return_value = {
                "cpu_usage": 45.2,
                "memory_usage": 67.8,
                "disk_usage": 55.1,
                "response_time": 0.8
            }
            mock_monitor.return_value = mock_instance
            
            response = self.client.get("/monitoring/metrics")
            
            assert response.status_code == 200
            data = response.json()
            
            assert "cpu_usage" in data
            assert "memory_usage" in data
            assert "response_time" in data
    
    def test_alerts_endpoint(self):
        """Test alerts endpoint"""
        with patch('machine.core.routers.monitoring_router.SystemMonitor') as mock_monitor:
            mock_instance = Mock()
            mock_instance.get_alerts.return_value = [
                {
                    "type": "warning",
                    "message": "High CPU usage detected",
                    "timestamp": "2024-01-15T10:00:00Z"
                }
            ]
            mock_monitor.return_value = mock_instance
            
            response = self.client.get("/monitoring/alerts")
            
            assert response.status_code == 200
            data = response.json()
            
            assert isinstance(data, list)
            assert len(data) == 1
            assert data[0]["type"] == "warning"


class TestConfigurationAPIs:
    """Test configuration API endpoints"""
    
    def setup_method(self):
        """Setup test client"""
        self.client = TestClient(app)
    
    def test_settings_endpoint(self):
        """Test settings endpoint"""
        with patch('machine.core.routers.config_router.ConfigManager') as mock_config:
            mock_instance = Mock()
            mock_instance.get_all_settings.return_value = {
                "database": {"host": "localhost", "port": 5432},
                "api": {"timeout": 30, "rate_limit": 100}
            }
            mock_config.return_value = mock_instance
            
            response = self.client.get("/config/settings")
            
            assert response.status_code == 200
            data = response.json()
            
            assert "database" in data
            assert "api" in data
    
    def test_feature_flags_endpoint(self):
        """Test feature flags endpoint"""
        with patch('machine.core.routers.config_router.ConfigManager') as mock_config:
            mock_instance = Mock()
            mock_instance.get_feature_flags.return_value = {
                "ai_optimization": True,
                "real_time_analytics": False,
                "advanced_monitoring": True
            }
            mock_config.return_value = mock_instance
            
            response = self.client.get("/config/features")
            
            assert response.status_code == 200
            data = response.json()
            
            assert "ai_optimization" in data
            assert data["ai_optimization"] is True


class TestErrorHandling:
    """Test error handling in APIs"""
    
    def setup_method(self):
        """Setup test client"""
        self.client = TestClient(app)
    
    def test_invalid_endpoint(self):
        """Test response for invalid endpoint"""
        response = self.client.get("/invalid/endpoint")
        
        assert response.status_code == 404
    
    def test_invalid_json(self):
        """Test handling of invalid JSON"""
        response = self.client.post("/api/title/suggest", data="invalid json")
        
        assert response.status_code == 422
    
    def test_missing_required_fields(self):
        """Test handling of missing required fields"""
        test_data = {}  # Missing required fields
        
        response = self.client.post("/api/title/suggest", json=test_data)
        
        # Should return 422 for validation error
        assert response.status_code == 422


if __name__ == "__main__":
    pytest.main([__file__, "-v"])