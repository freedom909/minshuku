#!/usr/bin/env python3
"""
Analytics System Configuration

Configuration management for the analytics system including:
- Performance settings
- Cache configuration
- Database settings
- Feature flags
- Security settings
"""

import os
from typing import Dict, Any, Optional
from datetime import timedelta


class AnalyticsConfig:
    """Analytics system configuration manager"""
    
    # Performance Settings
    CACHE_DURATION_MINUTES = int(os.getenv("ANALYTICS_CACHE_DURATION", "5"))
    CACHE_MAX_ENTRIES = int(os.getenv("ANALYTICS_CACHE_MAX_ENTRIES", "1000"))
    QUERY_TIMEOUT_SECONDS = int(os.getenv("ANALYTICS_QUERY_TIMEOUT", "30"))
    BATCH_PROCESSING_LIMIT = int(os.getenv("ANALYTICS_BATCH_LIMIT", "100"))
    
    # Database Settings
    MYSQL_POOL_SIZE = int(os.getenv("MYSQL_POOL_SIZE", "10"))
    MYSQL_POOL_RECYCLE = int(os.getenv("MYSQL_POOL_RECYCLE", "3600"))
    NEO4J_CONNECTION_TIMEOUT = int(os.getenv("NEO4J_CONNECTION_TIMEOUT", "30"))
    
    # Feature Flags
    ENABLE_PREDICTIVE_ANALYTICS = os.getenv("ENABLE_PREDICTIVE_ANALYTICS", "true").lower() == "true"
    ENABLE_BATCH_PROCESSING = os.getenv("ENABLE_BATCH_PROCESSING", "true").lower() == "true"
    ENABLE_DATA_EXPORT = os.getenv("ENABLE_DATA_EXPORT", "true").lower() == "true"
    ENABLE_REAL_TIME_MONITORING = os.getenv("ENABLE_REAL_TIME_MONITORING", "true").lower() == "true"
    
    # Security Settings
    MAX_REQUEST_SIZE_MB = int(os.getenv("MAX_REQUEST_SIZE_MB", "10"))
    RATE_LIMIT_REQUESTS_PER_MINUTE = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    ENABLE_REQUEST_LOGGING = os.getenv("ENABLE_REQUEST_LOGGING", "true").lower() == "true"
    
    # Reporting Settings
    DEFAULT_REPORT_LIMIT = int(os.getenv("DEFAULT_REPORT_LIMIT", "50"))
    MAX_REPORT_LIMIT = int(os.getenv("MAX_REPORT_LIMIT", "1000"))
    REPORT_CHUNK_SIZE = int(os.getenv("REPORT_CHUNK_SIZE", "100"))
    
    @classmethod
    def get_cache_config(cls) -> Dict[str, Any]:
        """Get cache configuration"""
        return {
            "duration_minutes": cls.CACHE_DURATION_MINUTES,
            "max_entries": cls.CACHE_MAX_ENTRIES,
            "cleanup_interval": timedelta(minutes=cls.CACHE_DURATION_MINUTES // 2)
        }
    
    @classmethod
    def get_performance_config(cls) -> Dict[str, Any]:
        """Get performance configuration"""
        return {
            "query_timeout": cls.QUERY_TIMEOUT_SECONDS,
            "batch_limit": cls.BATCH_PROCESSING_LIMIT,
            "report_limit": cls.DEFAULT_REPORT_LIMIT,
            "max_report_limit": cls.MAX_REPORT_LIMIT
        }
    
    @classmethod
    def get_feature_flags(cls) -> Dict[str, bool]:
        """Get feature flags"""
        return {
            "predictive_analytics": cls.ENABLE_PREDICTIVE_ANALYTICS,
            "batch_processing": cls.ENABLE_BATCH_PROCESSING,
            "data_export": cls.ENABLE_DATA_EXPORT,
            "real_time_monitoring": cls.ENABLE_REAL_TIME_MONITORING
        }
    
    @classmethod
    def get_security_config(cls) -> Dict[str, Any]:
        """Get security configuration"""
        return {
            "max_request_size_mb": cls.MAX_REQUEST_SIZE_MB,
            "rate_limit_requests_per_minute": cls.RATE_LIMIT_REQUESTS_PER_MINUTE,
            "enable_request_logging": cls.ENABLE_REQUEST_LOGGING
        }
    
    @classmethod
    def validate_config(cls) -> Dict[str, str]:
        """Validate configuration and return any issues"""
        issues = []
        
        if cls.CACHE_DURATION_MINUTES < 1:
            issues.append("Cache duration must be at least 1 minute")
        
        if cls.CACHE_MAX_ENTRIES < 10:
            issues.append("Cache max entries must be at least 10")
        
        if cls.QUERY_TIMEOUT_SECONDS < 5:
            issues.append("Query timeout must be at least 5 seconds")
        
        if cls.BATCH_PROCESSING_LIMIT < 1:
            issues.append("Batch processing limit must be at least 1")
        
        if cls.MAX_REQUEST_SIZE_MB < 1:
            issues.append("Max request size must be at least 1MB")
        
        return {"valid": len(issues) == 0, "issues": issues}
    
    @classmethod
    def get_config_summary(cls) -> Dict[str, Any]:
        """Get comprehensive configuration summary"""
        return {
            "performance": cls.get_performance_config(),
            "cache": cls.get_cache_config(),
            "features": cls.get_feature_flags(),
            "security": cls.get_security_config(),
            "validation": cls.validate_config()
        }


# Performance optimization utilities
class PerformanceOptimizer:
    """Performance optimization utilities for analytics system"""
    
    @staticmethod
    def optimize_query(query: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize database query for performance"""
        optimized = {
            "original_query": query,
            "optimized_query": query,
            "suggestions": [],
            "estimated_cost": "low"
        }
        
        # Basic query optimization suggestions
        if "SELECT *" in query.upper():
            optimized["suggestions"].append("Consider specifying columns instead of using SELECT *")
            optimized["estimated_cost"] = "medium"
        
        if "ORDER BY" in query.upper() and "LIMIT" not in query.upper():
            optimized["suggestions"].append("Add LIMIT clause to ORDER BY queries")
        
        if len(params) > 10:
            optimized["suggestions"].append("Consider reducing number of parameters")
            optimized["estimated_cost"] = "high"
        
        return optimized
    
    @staticmethod
    def analyze_query_pattern(queries: list) -> Dict[str, Any]:
        """Analyze query patterns for optimization opportunities"""
        analysis = {
            "total_queries": len(queries),
            "query_types": {},
            "frequent_patterns": [],
            "optimization_opportunities": []
        }
        
        # Count query types
        for query in queries:
            query_upper = query.upper()
            if "SELECT" in query_upper:
                analysis["query_types"]["select"] = analysis["query_types"].get("select", 0) + 1
            elif "INSERT" in query_upper:
                analysis["query_types"]["insert"] = analysis["query_types"].get("insert", 0) + 1
            elif "UPDATE" in query_upper:
                analysis["query_types"]["update"] = analysis["query_types"].get("update", 0) + 1
            elif "DELETE" in query_upper:
                analysis["query_types"]["delete"] = analysis["query_types"].get("delete", 0) + 1
        
        # Identify patterns
        if analysis["query_types"].get("select", 0) > len(queries) * 0.8:
            analysis["frequent_patterns"].append("High percentage of SELECT queries")
        
        # Optimization suggestions
        if analysis["query_types"].get("select", 0) > 50:
            analysis["optimization_opportunities"].append("Consider implementing query caching")
        
        if any(len(query) > 1000 for query in queries):
            analysis["optimization_opportunities"].append("Some queries are very long - consider optimization")
        
        return analysis
    
    @staticmethod
    def get_performance_recommendations(system_metrics: Dict[str, Any]) -> list:
        """Get performance recommendations based on system metrics"""
        recommendations = []
        
        cache_hit_ratio = system_metrics.get("cache_hit_ratio", 0)
        if cache_hit_ratio < 0.7:
            recommendations.append("Low cache hit ratio - consider increasing cache duration")
        
        avg_response_time = system_metrics.get("avg_response_time", 0)
        if avg_response_time > 1.0:
            recommendations.append("High response time - optimize database queries")
        
        memory_usage = system_metrics.get("memory_usage_percent", 0)
        if memory_usage > 80:
            recommendations.append("High memory usage - consider reducing cache size")
        
        return recommendations


# Cache management utilities
class CacheManager:
    """Advanced cache management for analytics system"""
    
    def __init__(self, max_entries: int = 1000, default_ttl: int = 300):
        self.max_entries = max_entries
        self.default_ttl = default_ttl  # seconds
        self._cache = {}
        self._access_stats = {}
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set cache value with TTL"""
        if len(self._cache) >= self.max_entries:
            self._evict_least_used()
        
        expire_time = self._get_timestamp() + (ttl or self.default_ttl)
        self._cache[key] = {
            "value": value,
            "expire_time": expire_time,
            "created_time": self._get_timestamp()
        }
        
        self._access_stats[key] = self._access_stats.get(key, 0) + 1
        return True
    
    def get(self, key: str) -> Optional[Any]:
        """Get cache value if not expired"""
        if key not in self._cache:
            return None
        
        cache_entry = self._cache[key]
        
        # Check if expired
        if self._get_timestamp() > cache_entry["expire_time"]:
            del self._cache[key]
            return None
        
        # Update access stats
        self._access_stats[key] = self._access_stats.get(key, 0) + 1
        
        return cache_entry["value"]
    
    def delete(self, key: str) -> bool:
        """Delete cache entry"""
        if key in self._cache:
            del self._cache[key]
            if key in self._access_stats:
                del self._access_stats[key]
            return True
        return False
    
    def clear_expired(self) -> int:
        """Clear all expired entries and return count cleared"""
        current_time = self._get_timestamp()
        expired_keys = []
        
        for key, entry in self._cache.items():
            if current_time > entry["expire_time"]:
                expired_keys.append(key)
        
        for key in expired_keys:
            del self._cache[key]
            if key in self._access_stats:
                del self._access_stats[key]
        
        return len(expired_keys)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        current_time = self._get_timestamp()
        
        stats = {
            "total_entries": len(self._cache),
            "max_entries": self.max_entries,
            "utilization_percent": round((len(self._cache) / self.max_entries) * 100, 1),
            "expired_entries": 0,
            "access_stats": {}
        }
        
        # Count expired entries
        for entry in self._cache.values():
            if current_time > entry["expire_time"]:
                stats["expired_entries"] += 1
        
        # Get top accessed keys
        if self._access_stats:
            sorted_access = sorted(self._access_stats.items(), key=lambda x: x[1], reverse=True)
            stats["access_stats"] = dict(sorted_access[:10])  # Top 10
        
        return stats
    
    def _evict_least_used(self):
        """Evict least used entries when cache is full"""
        if not self._access_stats:
            # If no access stats, remove oldest
            sorted_entries = sorted(self._cache.items(), 
                                 key=lambda x: x[1]["created_time"])
            if sorted_entries:
                del self._cache[sorted_entries[0][0]]
        else:
            # Remove least accessed
            sorted_access = sorted(self._access_stats.items(), key=lambda x: x[1])
            for key, _ in sorted_access:
                if key in self._cache:
                    del self._cache[key]
                    if key in self._access_stats:
                        del self._access_stats[key]
                    break
    
    def _get_timestamp(self) -> int:
        """Get current timestamp in seconds"""
        import time
        return int(time.time())


# Configuration validation and setup
def setup_analytics_config() -> Dict[str, Any]:
    """Setup and validate analytics configuration"""
    config = AnalyticsConfig.get_config_summary()
    validation = config["validation"]
    
    if not validation["valid"]:
        print("⚠️ Configuration issues found:")
        for issue in validation["issues"]:
            print(f"   - {issue}")
    else:
        print("✅ Configuration validated successfully")
    
    return config


if __name__ == "__main__":
    # Test configuration
    print("🔧 Analytics System Configuration Test")
    print("=" * 50)
    
    config = setup_analytics_config()
    
    print("\n📊 Configuration Summary:")
    print(f"Cache Duration: {config['cache']['duration_minutes']} minutes")
    print(f"Batch Limit: {config['performance']['batch_limit']}")
    print(f"Predictive Analytics: {config['features']['predictive_analytics']}")
    
    # Test cache manager
    print("\n💾 Cache Manager Test:")
    cache = CacheManager(max_entries=10, default_ttl=60)
    
    # Add some test data
    cache.set("test_key_1", "value_1", 30)
    cache.set("test_key_2", "value_2", 60)
    
    stats = cache.get_stats()
    print(f"Cache entries: {stats['total_entries']}")
    print(f"Utilization: {stats['utilization_percent']}%")
    
    # Test performance optimizer
    print("\n⚡ Performance Optimizer Test:")
    queries = ["SELECT * FROM listings WHERE price > 100", "SELECT id, title FROM listings"]
    analysis = PerformanceOptimizer.analyze_query_pattern(queries)
    print(f"Query types: {analysis['query_types']}")
    
    print("\n✅ Configuration test completed successfully!")