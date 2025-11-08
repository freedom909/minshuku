"""
Pytest configuration for machine tests
"""
import pytest
import asyncio
from unittest.mock import Mock, patch
import sys
import os

# Add the machine directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


@pytest.fixture
def mock_gemini_api():
    """Mock Gemini API for testing"""
    with patch('machine.core.db_connection.genai') as mock_genai:
        mock_model = Mock()
        mock_model.generate_content.return_value.text = "Mock AI response"
        mock_genai.GenerativeModel.return_value = mock_model
        yield mock_genai


@pytest.fixture
def mock_database():
    """Mock database connections for testing"""
    with patch('machine.core.db_connection.mysql_pool') as mock_mysql, \
         patch('machine.core.neo4j_client.driver') as mock_neo4j:
        
        # Mock MySQL connection
        mock_mysql_conn = Mock()
        mock_mysql.get_connection.return_value.__enter__.return_value = mock_mysql_conn
        mock_mysql_conn.cursor.return_value.__enter__.return_value.fetchall.return_value = []
        
        # Mock Neo4j connection
        mock_neo4j_session = Mock()
        mock_neo4j.session.return_value.__enter__.return_value = mock_neo4j_session
        mock_neo4j_session.run.return_value.data.return_value = []
        
        yield {"mysql": mock_mysql, "neo4j": mock_neo4j}


@pytest.fixture
def mock_ml_models():
    """Mock ML models for testing"""
    with patch('machine.ml.predictive_analytics.RandomForestRegressor') as mock_rf, \
         patch('machine.ml.recommendation_engine.cosine_similarity') as mock_cosine:
        
        mock_rf_instance = Mock()
        mock_rf.return_value = mock_rf_instance
        mock_rf_instance.predict.return_value = [100]
        
        mock_cosine.return_value = [[0.8, 0.6, 0.9]]
        
        yield {"random_forest": mock_rf, "cosine_similarity": mock_cosine}


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def test_client():
    """Create test client for API testing"""
    from fastapi.testclient import TestClient
    from machine.main import app
    
    with TestClient(app) as client:
        yield client


# Global test configuration
pytest_plugins = ['pytest_asyncio']


def pytest_configure(config):
    """Pytest configuration hook"""
    config.addinivalue_line(
        "markers", "slow: mark test as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test items based on configuration"""
    skip_slow = pytest.mark.skip(reason="slow tests skipped")
    skip_integration = pytest.mark.skip(reason="integration tests skipped")
    
    for item in items:
        if "slow" in item.keywords and config.getoption("--skip-slow"):
            item.add_marker(skip_slow)
        if "integration" in item.keywords and config.getoption("--skip-integration"):
            item.add_marker(skip_integration)