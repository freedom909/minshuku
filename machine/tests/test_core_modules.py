"""
Unit tests for core modules
"""
import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from machine.core.config import ConfigManager
from machine.core.monitoring import SystemMonitor
from machine.core.security import SecurityManager
from machine.core.middleware import monitoring_middleware


class TestConfigManager:
    """Test configuration management"""
    
    def test_config_initialization(self):
        """Test config manager initialization"""
        config = ConfigManager()
        assert config is not None
        assert hasattr(config, 'settings')
        assert hasattr(config, 'feature_flags')
    
    def test_get_setting(self):
        """Test getting settings"""
        config = ConfigManager()
        
        # Test existing setting
        result = config.get_setting('database.host')
        assert result is not None
        
        # Test non-existent setting with default
        result = config.get_setting('non.existent', 'default_value')
        assert result == 'default_value'
    
    def test_update_setting(self):
        """Test updating settings"""
        config = ConfigManager()
        
        # Update a setting
        config.update_setting('test.setting', 'new_value')
        result = config.get_setting('test.setting')
        assert result == 'new_value'
    
    def test_feature_flag_management(self):
        """Test feature flag functionality"""
        config = ConfigManager()
        
        # Enable feature
        config.enable_feature('ai_optimization')
        assert config.is_feature_enabled('ai_optimization') is True
        
        # Disable feature
        config.disable_feature('ai_optimization')
        assert config.is_feature_enabled('ai_optimization') is False


class TestSystemMonitor:
    """Test system monitoring"""
    
    def test_monitor_initialization(self):
        """Test monitor initialization"""
        monitor = SystemMonitor()
        assert monitor is not None
        assert hasattr(monitor, 'metrics')
        assert hasattr(monitor, 'alerts')
    
    @pytest.mark.asyncio
    async def test_collect_metrics(self):
        """Test metric collection"""
        monitor = SystemMonitor()
        
        metrics = await monitor.collect_metrics()
        
        assert isinstance(metrics, dict)
        assert 'cpu_usage' in metrics
        assert 'memory_usage' in metrics
        assert 'disk_usage' in metrics
        assert 'network_io' in metrics
        
        # Validate metric ranges
        assert 0 <= metrics['cpu_usage'] <= 100
        assert 0 <= metrics['memory_usage'] <= 100
    
    def test_alert_management(self):
        """Test alert functionality"""
        monitor = SystemMonitor()
        
        # Add alert
        monitor.add_alert('high_cpu', 'CPU usage above threshold', 'warning')
        alerts = monitor.get_alerts()
        
        assert len(alerts) > 0
        assert alerts[0]['type'] == 'warning'
        assert 'high_cpu' in alerts[0]['message']
        
        # Clear alerts
        monitor.clear_alerts()
        assert len(monitor.get_alerts()) == 0


class TestSecurityManager:
    """Test security functionality"""
    
    def test_security_initialization(self):
        """Test security manager initialization"""
        security = SecurityManager()
        assert security is not None
    
    def test_password_hashing(self):
        """Test password hashing and verification"""
        security = SecurityManager()
        
        password = "test_password_123"
        hashed = security.hash_password(password)
        
        # Verify hash is different from original
        assert hashed != password
        
        # Verify password matches hash
        assert security.verify_password(password, hashed) is True
        
        # Verify wrong password fails
        assert security.verify_password("wrong_password", hashed) is False
    
    def test_jwt_token_creation(self):
        """Test JWT token creation"""
        security = SecurityManager()
        
        payload = {"user_id": 123, "username": "test_user"}
        token = security.create_access_token(payload)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_token_verification(self):
        """Test JWT token verification"""
        security = SecurityManager()
        
        payload = {"user_id": 123, "username": "test_user"}
        token = security.create_access_token(payload)
        
        # Verify valid token
        decoded = security.verify_token(token)
        assert decoded is not None
        assert decoded['user_id'] == 123
        assert decoded['username'] == 'test_user'
        
        # Verify invalid token
        with pytest.raises(Exception):
            security.verify_token("invalid_token")


class TestMiddleware:
    """Test middleware functionality"""
    
    @pytest.mark.asyncio
    async def test_monitoring_middleware(self):
        """Test monitoring middleware"""
        
        # Mock request and call_next
        mock_request = Mock()
        mock_request.method = 'GET'
        mock_request.url.path = '/api/test'
        
        mock_response = Mock()
        mock_response.status_code = 200
        
        async def mock_call_next(request):
            return mock_response
        
        # Test middleware
        response = await monitoring_middleware(mock_request, mock_call_next)
        
        assert response == mock_response


if __name__ == "__main__":
    pytest.main([__file__, "-v"])