"""
Unit tests for analytics services
"""
import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from machine.analytics.services.report_service import generate_report
from machine.analytics.services.booking_trends import analyze_booking_trends
from machine.analytics.services.review_sentiment import analyze_review_sentiment


class TestReportService:
    """Test report generation functionality"""
    
    @pytest.mark.asyncio
    async def test_report_generation_basic(self):
        """Test basic report generation"""
        report_params = {
            "report_type": "listing_performance",
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
            "listing_ids": ["listing-001", "listing-002"]
        }
        
        with patch('machine.analytics.services.report_service.get_performance_data') as mock_data:
            mock_data.return_value = {
                "listing-001": {
                    "views": 1000,
                    "bookings": 50,
                    "revenue": 5000,
                    "conversion_rate": 0.05
                },
                "listing-002": {
                    "views": 800,
                    "bookings": 40,
                    "revenue": 4000,
                    "conversion_rate": 0.05
                }
            }
            
            report = await generate_report(report_params)
            
            assert "summary" in report
            assert "detailed_data" in report
            assert "insights" in report
            assert "recommendations" in report
            
            assert report["summary"]["total_revenue"] == 9000
            assert report["summary"]["total_bookings"] == 90
    
    @pytest.mark.asyncio
    async def test_report_generation_invalid_type(self):
        """Test report generation with invalid report type"""
        report_params = {
            "report_type": "invalid_type",
            "start_date": "2024-01-01",
            "end_date": "2024-01-31"
        }
        
        with pytest.raises(ValueError):
            await generate_report(report_params)
    
    @pytest.mark.asyncio
    async def test_report_generation_date_validation(self):
        """Test report generation with invalid dates"""
        report_params = {
            "report_type": "listing_performance",
            "start_date": "2024-13-01",  # Invalid month
            "end_date": "2024-01-31"
        }
        
        with pytest.raises(ValueError):
            await generate_report(report_params)


class TestBookingTrendsAnalysis:
    """Test booking trends analysis functionality"""
    
    @pytest.mark.asyncio
    async def test_booking_trends_analysis(self):
        """Test booking trends analysis"""
        analysis_params = {
            "time_period": "last_30_days",
            "granularity": "daily",
            "metrics": ["bookings", "revenue", "occupancy"]
        }
        
        with patch('machine.analytics.services.booking_trends.get_booking_data') as mock_data:
            mock_data.return_value = [
                {"date": "2024-01-01", "bookings": 10, "revenue": 1000, "occupancy": 0.6},
                {"date": "2024-01-02", "bookings": 12, "revenue": 1200, "occupancy": 0.7},
                {"date": "2024-01-03", "bookings": 8, "revenue": 800, "occupancy": 0.5}
            ]
            
            trends = await analyze_booking_trends(analysis_params)
            
            assert "trend_data" in trends
            assert "insights" in trends
            assert "predictions" in trends
            assert "anomalies" in trends
            
            assert len(trends["trend_data"]) == 3
            assert "growth_rate" in trends["insights"]
    
    @pytest.mark.asyncio
    async def test_seasonal_analysis(self):
        """Test seasonal trends analysis"""
        analysis_params = {
            "time_period": "last_12_months",
            "granularity": "monthly",
            "include_seasonal": True
        }
        
        with patch('machine.analytics.services.booking_trends.get_booking_data') as mock_data:
            mock_data.return_value = [
                {"month": "2023-01", "bookings": 100, "revenue": 10000},
                {"month": "2023-02", "bookings": 120, "revenue": 12000},
                # ... more months
            ]
            
            trends = await analyze_booking_trends(analysis_params)
            
            assert "seasonal_patterns" in trends
            assert "peak_seasons" in trends["seasonal_patterns"]
            assert "low_seasons" in trends["seasonal_patterns"]


class TestReviewSentimentAnalysis:
    """Test review sentiment analysis functionality"""
    
    @pytest.mark.asyncio
    async def test_sentiment_analysis_positive(self):
        """Test sentiment analysis for positive reviews"""
        review_data = {
            "reviews": [
                {
                    "review_id": "review-001",
                    "content": "Amazing stay! The room was clean and staff was friendly.",
                    "rating": 5.0
                },
                {
                    "review_id": "review-002", 
                    "content": "Perfect location and great value for money.",
                    "rating": 4.5
                }
            ]
        }
        
        analysis = await analyze_review_sentiment(review_data)
        
        assert "overall_sentiment" in analysis
        assert "sentiment_distribution" in analysis
        assert "key_themes" in analysis
        assert "improvement_areas" in analysis
        
        assert analysis["overall_sentiment"] == "positive"
        assert analysis["sentiment_distribution"]["positive"] >= 0.8
    
    @pytest.mark.asyncio
    async def test_sentiment_analysis_mixed(self):
        """Test sentiment analysis for mixed reviews"""
        review_data = {
            "reviews": [
                {
                    "review_id": "review-003",
                    "content": "Good location but room was a bit small.",
                    "rating": 3.5
                },
                {
                    "review_id": "review-004",
                    "content": "Friendly staff but WiFi was slow.",
                    "rating": 3.0
                }
            ]
        }
        
        analysis = await analyze_review_sentiment(review_data)
        
        assert analysis["overall_sentiment"] == "neutral"
        assert "location" in str(analysis["key_themes"]).lower()
        assert "wifi" in str(analysis["improvement_areas"]).lower()
    
    @pytest.mark.asyncio
    async def test_sentiment_analysis_negative(self):
        """Test sentiment analysis for negative reviews"""
        review_data = {
            "reviews": [
                {
                    "review_id": "review-005",
                    "content": "Terrible experience. Room was dirty and staff was rude.",
                    "rating": 1.0
                }
            ]
        }
        
        analysis = await analyze_review_sentiment(review_data)
        
        assert analysis["overall_sentiment"] == "negative"
        assert "dirty" in str(analysis["key_themes"]).lower() or "脏" in str(analysis["key_themes"])
        assert "rude" in str(analysis["key_themes"]).lower() or "粗鲁" in str(analysis["key_themes"])


class TestPerformanceMetrics:
    """Test performance metrics calculation"""
    
    def test_conversion_rate_calculation(self):
        """Test conversion rate calculation"""
        from machine.analytics.services.report_service import _calculate_conversion_rate
        
        # Test basic conversion rate
        result = _calculate_conversion_rate(100, 10)
        assert result == 0.1
        
        # Test zero views
        result = _calculate_conversion_rate(0, 10)
        assert result == 0
        
        # Test zero bookings
        result = _calculate_conversion_rate(100, 0)
        assert result == 0
    
    def test_revenue_per_booking_calculation(self):
        """Test revenue per booking calculation"""
        from machine.analytics.services.report_service import _calculate_revenue_per_booking
        
        # Test basic calculation
        result = _calculate_revenue_per_booking(1000, 10)
        assert result == 100
        
        # Test zero bookings
        result = _calculate_revenue_per_booking(1000, 0)
        assert result == 0
    
    def test_occupancy_rate_calculation(self):
        """Test occupancy rate calculation"""
        from machine.analytics.services.report_service import _calculate_occupancy_rate
        
        # Test basic calculation
        result = _calculate_occupancy_rate(30, 10)
        assert result == 0.333
        
        # Test zero available units
        result = _calculate_occupancy_rate(0, 10)
        assert result == 0


class TestTrendAnalysis:
    """Test trend analysis functionality"""
    
    def test_growth_rate_calculation(self):
        """Test growth rate calculation"""
        from machine.analytics.services.booking_trends import _calculate_growth_rate
        
        # Test positive growth
        result = _calculate_growth_rate(100, 120)
        assert result == 0.2
        
        # Test negative growth
        result = _calculate_growth_rate(120, 100)
        assert result == -0.1667
        
        # Test zero previous value
        result = _calculate_growth_rate(0, 100)
        assert result == float('inf')
    
    def test_moving_average_calculation(self):
        """Test moving average calculation"""
        from machine.analytics.services.booking_trends import _calculate_moving_average
        
        data = [10, 12, 14, 16, 18]
        
        # Test window size 3
        result = _calculate_moving_average(data, 3)
        assert len(result) == 3
        assert result[0] == 12  # (10+12+14)/3
        assert result[1] == 14  # (12+14+16)/3
        assert result[2] == 16  # (14+16+18)/3


class TestAnomalyDetection:
    """Test anomaly detection functionality"""
    
    def test_anomaly_detection_basic(self):
        """Test basic anomaly detection"""
        from machine.analytics.services.booking_trends import _detect_anomalies
        
        data = [10, 12, 11, 13, 50]  # 50 is an anomaly
        
        anomalies = _detect_anomalies(data)
        
        assert len(anomalies) == 1
        assert anomalies[0]["index"] == 4
        assert anomalies[0]["value"] == 50
        assert anomalies[0]["deviation"] > 2  # Significant deviation


if __name__ == "__main__":
    pytest.main([__file__, "-v"])