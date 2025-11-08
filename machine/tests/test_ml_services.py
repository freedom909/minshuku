"""
Unit tests for machine learning services
"""
import pytest
import asyncio
import numpy as np
import pandas as pd
from unittest.mock import Mock, patch, AsyncMock
from machine.ml.predictive_analytics import PredictiveAnalytics
from machine.ml.recommendation_engine import RecommendationEngine
from machine.ml.intelligent_automation import IntelligentAutomation
from machine.ml.real_time_analytics import RealTimeAnalytics
from machine.ml.advanced_optimization import AdvancedOptimization
from machine.ml.model_training import ModelTrainingManager


class TestPredictiveAnalytics:
    """Test predictive analytics functionality"""
    
    def test_initialization(self):
        """Test predictive analytics initialization"""
        analytics = PredictiveAnalytics()
        assert analytics is not None
        assert hasattr(analytics, 'models')
        assert hasattr(analytics, 'model_versions')
    
    @pytest.mark.asyncio
    async def test_demand_prediction(self):
        """Test demand prediction functionality"""
        analytics = PredictiveAnalytics()
        
        # Mock data for prediction
        test_data = {
            'listing_id': 'listing-001',
            'historical_data': [100, 120, 110, 130, 140],
            'seasonal_factors': [1.1, 1.0, 0.9, 1.2],
            'market_trends': [1.05, 1.08, 1.12]
        }
        
        with patch.object(analytics, '_train_model', new_callable=AsyncMock) as mock_train:
            mock_train.return_value = {'accuracy': 0.85, 'model_id': 'test_model'}
            
            prediction = await analytics.predict_demand(test_data)
            
            assert prediction is not None
            assert 'predicted_demand' in prediction
            assert 'confidence_interval' in prediction
            assert 'model_used' in prediction
    
    @pytest.mark.asyncio
    async def test_price_optimization(self):
        """Test price optimization"""
        analytics = PredictiveAnalytics()
        
        test_listing = {
            'current_price': 100,
            'competitor_prices': [95, 105, 110, 90],
            'demand_factors': [1.1, 1.2, 0.9],
            'seasonality': 1.05
        }
        
        with patch.object(analytics, '_calculate_optimal_price') as mock_calc:
            mock_calc.return_value = {
                'optimal_price': 108.5,
                'expected_revenue_increase': 0.15,
                'risk_level': 'low'
            }
            
            result = await analytics.optimize_pricing(test_listing)
            
            assert result['optimal_price'] == 108.5
            assert result['expected_revenue_increase'] == 0.15
            assert result['risk_level'] == 'low'


class TestRecommendationEngine:
    """Test recommendation engine functionality"""
    
    def test_initialization(self):
        """Test recommendation engine initialization"""
        engine = RecommendationEngine()
        assert engine is not None
        assert hasattr(engine, 'user_profiles')
        assert hasattr(engine, 'listing_features')
    
    @pytest.mark.asyncio
    async def test_user_recommendations(self):
        """Test user-based recommendations"""
        engine = RecommendationEngine()
        
        test_user = {
            'user_id': 'user-001',
            'preferences': {
                'price_range': [50, 200],
                'location_preference': ['Tokyo', 'Osaka'],
                'amenities': ['wifi', 'parking']
            },
            'booking_history': ['listing-001', 'listing-003']
        }
        
        with patch.object(engine, '_calculate_similarity') as mock_sim:
            mock_sim.return_value = [
                {'listing_id': 'listing-002', 'score': 0.85},
                {'listing_id': 'listing-004', 'score': 0.78},
                {'listing_id': 'listing-005', 'score': 0.72}
            ]
            
            recommendations = await engine.get_user_recommendations(test_user)
            
            assert len(recommendations) == 3
            assert recommendations[0]['score'] == 0.85
            assert 'listing_id' in recommendations[0]
    
    @pytest.mark.asyncio
    async def test_content_based_recommendations(self):
        """Test content-based recommendations"""
        engine = RecommendationEngine()
        
        test_listing = {
            'listing_id': 'listing-001',
            'features': {
                'price': 120,
                'location': 'Tokyo',
                'amenities': ['wifi', 'parking', 'breakfast'],
                'rating': 4.5
            }
        }
        
        with patch.object(engine, '_find_similar_listings') as mock_find:
            mock_find.return_value = [
                {'listing_id': 'listing-002', 'similarity': 0.92},
                {'listing_id': 'listing-003', 'similarity': 0.88}
            ]
            
            similar = await engine.get_similar_listings(test_listing)
            
            assert len(similar) == 2
            assert similar[0]['similarity'] > 0.8


class TestIntelligentAutomation:
    """Test intelligent automation functionality"""
    
    def test_initialization(self):
        """Test automation initialization"""
        automation = IntelligentAutomation()
        assert automation is not None
        assert hasattr(automation, 'workflows')
        assert hasattr(automation, 'automation_rules')
    
    @pytest.mark.asyncio
    async def test_automated_response_generation(self):
        """Test automated response generation"""
        automation = IntelligentAutomation()
        
        test_query = {
            'query_type': 'booking_inquiry',
            'user_message': 'I want to book a room for 2 people next weekend',
            'user_context': {
                'previous_bookings': 2,
                'preferred_locations': ['Tokyo']
            }
        }
        
        with patch.object(automation, '_generate_ai_response') as mock_gen:
            mock_gen.return_value = {
                'response': 'I can help you book a room! Here are some available options in Tokyo...',
                'confidence': 0.92,
                'suggested_actions': ['show_available_listings', 'check_availability']
            }
            
            response = await automation.generate_automated_response(test_query)
            
            assert response['confidence'] >= 0.9
            assert len(response['suggested_actions']) > 0
    
    @pytest.mark.asyncio
    async def test_workflow_execution(self):
        """Test workflow execution"""
        automation = IntelligentAutomation()
        
        test_workflow = {
            'workflow_id': 'new_listing_optimization',
            'steps': [
                {'action': 'analyze_title', 'params': {'listing_id': 'test-001'}},
                {'action': 'optimize_description', 'params': {'listing_id': 'test-001'}},
                {'action': 'generate_images', 'params': {'listing_id': 'test-001'}}
            ]
        }
        
        with patch.object(automation, '_execute_workflow_step', new_callable=AsyncMock) as mock_step:
            mock_step.return_value = {'status': 'completed', 'result': 'success'}
            
            result = await automation.execute_workflow(test_workflow)
            
            assert result['status'] == 'completed'
            assert len(result['step_results']) == 3


class TestRealTimeAnalytics:
    """Test real-time analytics functionality"""
    
    def test_initialization(self):
        """Test real-time analytics initialization"""
        analytics = RealTimeAnalytics()
        assert analytics is not None
        assert hasattr(analytics, 'metrics_buffer')
        assert hasattr(analytics, 'alert_thresholds')
    
    @pytest.mark.asyncio
    async def test_user_behavior_tracking(self):
        """Test user behavior tracking"""
        analytics = RealTimeAnalytics()
        
        test_event = {
            'user_id': 'user-001',
            'event_type': 'listing_view',
            'listing_id': 'listing-001',
            'timestamp': '2024-01-15T10:00:00Z',
            'session_duration': 45,
            'actions_taken': ['view_images', 'read_reviews']
        }
        
        result = await analytics.track_user_behavior(test_event)
        
        assert result['status'] == 'tracked'
        assert 'session_metrics' in result
        assert 'engagement_score' in result
    
    @pytest.mark.asyncio
    async def test_conversion_funnel_analysis(self):
        """Test conversion funnel analysis"""
        analytics = RealTimeAnalytics()
        
        test_data = {
            'time_period': 'last_24_hours',
            'funnel_steps': ['visitors', 'searches', 'bookings', 'confirmations'],
            'conversion_data': {
                'visitors': 1000,
                'searches': 850,
                'bookings': 120,
                'confirmations': 115
            }
        }
        
        analysis = await analytics.analyze_conversion_funnel(test_data)
        
        assert 'conversion_rates' in analysis
        assert 'bottleneck_analysis' in analysis
        assert 'improvement_suggestions' in analysis


class TestAdvancedOptimization:
    """Test advanced optimization functionality"""
    
    def test_initialization(self):
        """Test optimization initialization"""
        optimization = AdvancedOptimization()
        assert optimization is not None
        assert hasattr(optimization, 'optimization_algorithms')
    
    @pytest.mark.asyncio
    async def test_pricing_strategy_optimization(self):
        """Test pricing strategy optimization"""
        optimization = AdvancedOptimization()
        
        test_scenario = {
            'listing_id': 'listing-001',
            'current_price': 100,
            'market_conditions': {
                'competitor_prices': [95, 105, 110, 90],
                'demand_level': 'high',
                'seasonality_factor': 1.2
            },
            'business_goals': ['maximize_revenue', 'maintain_occupancy']
        }
        
        with patch.object(optimization, '_run_genetic_algorithm') as mock_ga:
            mock_ga.return_value = {
                'optimal_price': 108.5,
                'expected_revenue_increase': 0.18,
                'risk_adjustment': 0.05
            }
            
            result = await optimization.optimize_pricing_strategy(test_scenario)
            
            assert result['optimal_price'] == 108.5
            assert result['expected_revenue_increase'] > 0
    
    @pytest.mark.asyncio
    async def test_inventory_allocation_optimization(self):
        """Test inventory allocation optimization"""
        optimization = AdvancedOptimization()
        
        test_inventory = {
            'available_units': 50,
            'listing_demand': [
                {'listing_id': '001', 'demand': 20, 'revenue_per_unit': 100},
                {'listing_id': '002', 'demand': 15, 'revenue_per_unit': 120},
                {'listing_id': '003', 'demand': 25, 'revenue_per_unit': 90}
            ],
            'constraints': {
                'min_allocation_per_listing': 5,
                'max_allocation_per_listing': 30
            }
        }
        
        result = await optimization.optimize_inventory_allocation(test_inventory)
        
        assert 'optimal_allocation' in result
        assert 'total_expected_revenue' in result
        assert 'constraint_satisfaction' in result


class TestModelTrainingManager:
    """Test model training functionality"""
    
    def test_initialization(self):
        """Test training manager initialization"""
        manager = ModelTrainingManager()
        assert manager is not None
        assert hasattr(manager, 'training_history')
        assert hasattr(manager, 'model_registry')
    
    @pytest.mark.asyncio
    async def test_pricing_model_training(self):
        """Test pricing model training"""
        manager = ModelTrainingManager()
        
        # Mock training data
        mock_data = pd.DataFrame({
            'price': [100, 120, 110, 130, 140],
            'demand': [50, 45, 55, 40, 35],
            'competitor_price': [95, 105, 100, 125, 135],
            'seasonality': [1.0, 1.1, 0.9, 1.2, 1.0]
        })
        
        with patch.object(manager, '_get_training_data', new_callable=AsyncMock) as mock_data:
            mock_data.return_value = mock_data
            
            result = await manager.train_pricing_model(mock_data)
            
            assert 'model_id' in result
            assert 'training_metrics' in result
            assert 'model_version' in result
    
    @pytest.mark.asyncio
    async def test_model_evaluation(self):
        """Test model evaluation"""
        manager = ModelTrainingManager()
        
        # Mock model and test data
        mock_model = Mock()
        mock_model.predict.return_value = np.array([100, 110, 120])
        
        X_test = np.random.rand(10, 5)
        y_test = np.random.rand(10) * 200 + 50
        
        evaluation = await manager._evaluate_model(mock_model, X_test, y_test)
        
        assert 'mae' in evaluation
        assert 'mse' in evaluation
        assert 'r2' in evaluation


if __name__ == "__main__":
    pytest.main([__file__, "-v"])