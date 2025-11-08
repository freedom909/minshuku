#!/usr/bin/env python3
"""
Comprehensive test suite for the analytics system
"""

import pytest
import asyncio
from datetime import datetime, timedelta
from machine.analytics.services.report_service import (
    generate_report, 
    _calculate_performance_metrics,
    _generate_report_summary,
    _analyze_trends_and_recommendations,
    _validate_and_parse_date,
    get_cache_stats
)


class TestAnalyticsSystem:
    """Test suite for analytics system functionality"""
    
    def test_date_validation(self):
        """Test date validation and parsing"""
        # Valid dates
        date = _validate_and_parse_date("2023-12-25")
        assert date.year == 2023
        assert date.month == 12
        assert date.day == 25
        
        # Invalid dates
        with pytest.raises(ValueError):
            _validate_and_parse_date("2023-13-01")  # Invalid month
        
        with pytest.raises(ValueError):
            _validate_and_parse_date("2023-12-32")  # Invalid day
        
        with pytest.raises(ValueError):
            _validate_and_parse_date("2023/12/25")  # Wrong format
    
    def test_performance_metrics_calculation(self):
        """Test performance metrics calculation"""
        # Test case 1: High-performing listing
        listing_data = {
            'price': 100,
            'numOfBeds': 2,
            'listingStatus': 'available',
            'isFeatured': 1
        }
        graph_data = {
            'avg_graph_rating': 4.8,
            'total_reviews': 25
        }
        
        metrics = _calculate_performance_metrics(listing_data, graph_data)
        
        assert metrics['rating_score'] == 4.8
        assert metrics['review_count'] == 25
        assert metrics['price_per_bed'] == 50.0
        assert metrics['status_score'] == 1
        assert metrics['featured_bonus'] == 1.2
        assert metrics['overall_performance'] >= 80  # Should be A grade
        assert metrics['performance_grade'] == 'A'
        
        # Test case 2: Low-performing listing
        listing_data2 = {
            'price': 300,
            'numOfBeds': 1,
            'listingStatus': 'unavailable',
            'isFeatured': 0
        }
        graph_data2 = {
            'avg_graph_rating': 2.5,
            'total_reviews': 2
        }
        
        metrics2 = _calculate_performance_metrics(listing_data2, graph_data2)
        
        assert metrics2['overall_performance'] < 60  # Should be C or D grade
        assert metrics2['status_score'] == 0.5
        assert metrics2['featured_bonus'] == 1.0
    
    def test_report_summary_generation(self):
        """Test report summary generation"""
        # Mock data
        mock_listings = [
            {
                'id': 'listing-001',
                'title': 'Test Listing 1',
                'price': 100,
                'numOfBeds': 2,
                'locationType': 'apartment',
                'listingStatus': 'available',
                'isFeatured': 1,
                'performance_metrics': {
                    'overall_performance': 85.0,
                    'performance_grade': 'A',
                    'rating_score': 4.5
                }
            },
            {
                'id': 'listing-002',
                'title': 'Test Listing 2',
                'price': 150,
                'numOfBeds': 3,
                'locationType': 'house',
                'listingStatus': 'available',
                'isFeatured': 0,
                'performance_metrics': {
                    'overall_performance': 65.0,
                    'performance_grade': 'B',
                    'rating_score': 3.8
                }
            }
        ]
        
        summary = _generate_report_summary(mock_listings)
        
        assert summary['total_listings'] == 2
        assert summary['avg_performance'] == 75.0  # (85 + 65) / 2
        assert summary['performance_distribution']['A'] == 1
        assert summary['performance_distribution']['B'] == 1
        assert summary['avg_price'] == 125.0  # (100 + 150) / 2
        assert summary['available_count'] == 2
        assert summary['featured_count'] == 1
        assert summary['featured_percentage'] == 50.0
    
    def test_trend_analysis(self):
        """Test trend analysis and recommendations"""
        mock_listings = [
            {
                'title': 'High Performer',
                'price': 100,
                'listingStatus': 'available',
                'locationType': 'apartment',
                'isFeatured': 1,
                'avg_graph_rating': 4.8,
                'total_reviews': 20,
                'performance_metrics': {
                    'overall_performance': 88.0,
                    'performance_grade': 'A',
                    'rating_score': 4.8,
                    'price_per_bed': 50.0
                }
            },
            {
                'title': 'Low Performer',
                'price': 300,
                'listingStatus': 'unavailable',
                'locationType': 'house',
                'isFeatured': 0,
                'avg_graph_rating': 2.5,
                'total_reviews': 2,
                'performance_metrics': {
                    'overall_performance': 35.0,
                    'performance_grade': 'D',
                    'rating_score': 2.5,
                    'price_per_bed': 100.0
                }
            }
        ]
        
        analysis = _analyze_trends_and_recommendations(mock_listings)
        
        # Check structure
        assert 'trends' in analysis
        assert 'recommendations' in analysis
        assert 'opportunities' in analysis
        assert 'risks' in analysis
        assert 'insights' in analysis
        
        # Check specific analysis
        assert analysis['trends']['status_distribution']['available'] == 1
        assert analysis['trends']['status_distribution']['unavailable'] == 1
        assert analysis['trends']['avg_performance'] == 61.5  # (88 + 35) / 2
        
        # Should have recommendations for low performer
        assert any("需要优化" in rec for rec in analysis['recommendations'])
        
        # Should identify opportunities from high performer
        assert any("最佳房源" in opp for opp in analysis['opportunities'])
    
    @pytest.mark.asyncio
    async def test_generate_report_invalid_type(self):
        """Test report generation with invalid report type"""
        with pytest.raises(ValueError):
            await generate_report("invalid_type", None, None, None)
    
    @pytest.mark.asyncio
    async def test_generate_report_date_validation(self):
        """Test report generation with invalid dates"""
        with pytest.raises(ValueError):
            await generate_report("listing", None, "2023-13-01", "2023-12-31")
    
    def test_cache_management(self):
        """Test cache management functionality"""
        stats = get_cache_stats()
        
        # Should return valid cache statistics
        assert 'total_entries' in stats
        assert 'cache_duration_minutes' in stats
        assert stats['cache_duration_minutes'] == 5.0  # 5 minutes


class TestIntegrationScenarios:
    """Integration test scenarios for the analytics system"""
    
    @pytest.mark.asyncio
    async def test_complete_analytics_workflow(self):
        """Test complete analytics workflow from data to insights"""
        # This is a high-level integration test
        # In a real scenario, this would test against actual databases
        
        # Test data validation
        try:
            _validate_and_parse_date("2023-12-25")
            assert True  # Should not raise exception
        except ValueError:
            pytest.fail("Valid date parsing failed")
        
        # Test performance metrics calculation
        test_listing = {
            'price': 120,
            'numOfBeds': 2,
            'listingStatus': 'available',
            'isFeatured': 0
        }
        test_graph = {
            'avg_graph_rating': 4.2,
            'total_reviews': 15
        }
        
        metrics = _calculate_performance_metrics(test_listing, test_graph)
        
        # Validate metrics structure
        required_fields = ['rating_score', 'review_count', 'price_per_bed', 
                          'status_score', 'featured_bonus', 'overall_performance', 
                          'performance_grade']
        
        for field in required_fields:
            assert field in metrics, f"Missing field: {field}"
        
        # Validate metric values
        assert 0 <= metrics['overall_performance'] <= 100
        assert metrics['performance_grade'] in ['A', 'B', 'C', 'D']
        
        # Test summary generation
        mock_data = [{
            'id': 'test-001',
            'title': 'Test Property',
            'price': 100,
            'listingStatus': 'available',
            'isFeatured': 1,
            'performance_metrics': {
                'overall_performance': 75.0,
                'performance_grade': 'B'
            }
        }]
        
        summary = _generate_report_summary(mock_data)
        
        assert summary['total_listings'] == 1
        assert summary['avg_performance'] == 75.0
        assert summary['performance_distribution']['B'] == 1


def test_error_handling():
    """Test error handling in various scenarios"""
    
    # Test empty data handling
    empty_summary = _generate_report_summary([])
    assert empty_summary['message'] == "No data available for summary"
    
    empty_analysis = _analyze_trends_and_recommendations([])
    assert empty_analysis['message'] == "No data available for trend analysis"
    
    # Test invalid input handling
    try:
        _validate_and_parse_date("invalid-date")
        pytest.fail("Should have raised ValueError")
    except ValueError:
        pass  # Expected behavior


if __name__ == "__main__":
    # Run basic tests
    test_system = TestAnalyticsSystem()
    
    print("Running date validation tests...")
    test_system.test_date_validation()
    
    print("Running performance metrics tests...")
    test_system.test_performance_metrics_calculation()
    
    print("Running report summary tests...")
    test_system.test_report_summary_generation()
    
    print("Running trend analysis tests...")
    test_system.test_trend_analysis()
    
    print("Running cache management tests...")
    test_system.test_cache_management()
    
    print("All tests passed! ✅")
    print("\nAnalytics system is functioning correctly.")