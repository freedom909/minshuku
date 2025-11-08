# machine/core/monitoring.py
"""Monitoring and Observability Module"""

import asyncio
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
from collections import defaultdict, deque
import psutil
import gc

logger = logging.getLogger(__name__)

class SystemMonitor:
    """System monitoring and performance tracking"""
    
    def __init__(self):
        self.metrics_history = deque(maxlen=1000)
        self.alert_rules = self._initialize_alert_rules()
        self.alerts = deque(maxlen=100)
        self.request_stats = defaultdict(lambda: {"count": 0, "total_time": 0, "errors": 0})
    
    def _initialize_alert_rules(self) -> Dict:
        """Initialize alert rules"""
        return {
            "high_cpu": {"threshold": 80, "duration": 60, "severity": "warning"},
            "high_memory": {"threshold": 85, "duration": 60, "severity": "warning"},
            "high_disk": {"threshold": 90, "duration": 300, "severity": "critical"},
            "slow_response": {"threshold": 2.0, "duration": 30, "severity": "warning"},
            "high_error_rate": {"threshold": 0.05, "duration": 300, "severity": "critical"}
        }
    
    async def collect_system_metrics(self) -> Dict:
        """Collect comprehensive system metrics"""
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            
            # Memory metrics
            memory = psutil.virtual_memory()
            
            # Disk metrics
            disk = psutil.disk_usage('/')
            
            # Network metrics
            net_io = psutil.net_io_counters()
            
            # Process metrics
            process = psutil.Process()
            
            metrics = {
                "timestamp": datetime.now().isoformat(),
                "cpu": {
                    "percent": cpu_percent,
                    "count": cpu_count,
                    "load_avg": psutil.getloadavg() if hasattr(psutil, 'getloadavg') else [0, 0, 0]
                },
                "memory": {
                    "total": memory.total,
                    "available": memory.available,
                    "percent": memory.percent,
                    "used": memory.used
                },
                "disk": {
                    "total": disk.total,
                    "used": disk.used,
                    "free": disk.free,
                    "percent": disk.percent
                },
                "network": {
                    "bytes_sent": net_io.bytes_sent,
                    "bytes_recv": net_io.bytes_recv,
                    "packets_sent": net_io.packets_sent,
                    "packets_recv": net_io.packets_recv
                },
                "process": {
                    "memory_info": process.memory_info()._asdict(),
                    "cpu_percent": process.cpu_percent(),
                    "num_threads": process.num_threads()
                },
                "python": {
                    "memory_allocated": self._get_python_memory_stats(),
                    "gc_stats": gc.get_stats()
                }
            }
            
            # Store in history
            self.metrics_history.append(metrics)
            
            # Check alerts
            await self._check_alerts(metrics)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error collecting system metrics: {e}")
            return {"error": str(e)}
    
    async def track_request(self, endpoint: str, method: str, duration: float, 
                          status_code: int, user_id: str = None) -> None:
        """Track API request metrics"""
        try:
            key = f"{method}:{endpoint}"
            self.request_stats[key]["count"] += 1
            self.request_stats[key]["total_time"] += duration
            
            if status_code >= 400:
                self.request_stats[key]["errors"] += 1
            
            # Check for slow responses
            if duration > self.alert_rules["slow_response"]["threshold"]:
                await self._create_alert(
                    "slow_response",
                    f"Slow response detected: {endpoint} took {duration:.2f}s",
                    {"endpoint": endpoint, "duration": duration, "method": method}
                )
                
        except Exception as e:
            logger.error(f"Error tracking request: {e}")
    
    async def get_performance_summary(self, hours: int = 24) -> Dict:
        """Get performance summary for specified period"""
        try:
            # Filter metrics for the specified period
            cutoff_time = datetime.now() - timedelta(hours=hours)
            recent_metrics = [
                m for m in self.metrics_history 
                if datetime.fromisoformat(m["timestamp"]) > cutoff_time
            ]
            
            if not recent_metrics:
                return {"error": "No metrics available for the specified period"}
            
            # Calculate averages and trends
            cpu_avg = sum(m["cpu"]["percent"] for m in recent_metrics) / len(recent_metrics)
            memory_avg = sum(m["memory"]["percent"] for m in recent_metrics) / len(recent_metrics)
            
            # Calculate request statistics
            total_requests = sum(stats["count"] for stats in self.request_stats.values())
            error_rate = sum(stats["errors"] for stats in self.request_stats.values()) / total_requests if total_requests > 0 else 0
            
            avg_response_time = sum(
                stats["total_time"] / stats["count"] 
                for stats in self.request_stats.values() 
                if stats["count"] > 0
            ) / len([s for s in self.request_stats.values() if s["count"] > 0]) if self.request_stats else 0
            
            return {
                "summary_period_hours": hours,
                "metrics_collected": len(recent_metrics),
                "average_cpu_usage": round(cpu_avg, 2),
                "average_memory_usage": round(memory_avg, 2),
                "total_requests": total_requests,
                "error_rate": round(error_rate, 4),
                "average_response_time": round(avg_response_time, 3),
                "active_alerts": len(self.alerts),
                "top_endpoints": self._get_top_endpoints(10),
                "health_score": self._calculate_health_score(cpu_avg, memory_avg, error_rate)
            }
            
        except Exception as e:
            logger.error(f"Error getting performance summary: {e}")
            return {"error": str(e)}
    
    async def get_alerts(self, severity: str = None) -> List[Dict]:
        """Get current alerts"""
        try:
            alerts = list(self.alerts)
            
            if severity:
                alerts = [a for a in alerts if a["severity"] == severity]
            
            return alerts
            
        except Exception as e:
            logger.error(f"Error getting alerts: {e}")
            return []
    
    async def clear_alerts(self, alert_ids: List[str] = None) -> Dict:
        """Clear specified alerts or all alerts"""
        try:
            if alert_ids:
                # Remove specific alerts
                self.alerts = deque([a for a in self.alerts if a["id"] not in alert_ids], maxlen=100)
                cleared_count = len(alert_ids)
            else:
                # Clear all alerts
                cleared_count = len(self.alerts)
                self.alerts.clear()
            
            return {
                "cleared_alerts": cleared_count,
                "remaining_alerts": len(self.alerts)
            }
            
        except Exception as e:
            logger.error(f"Error clearing alerts: {e}")
            return {"error": str(e)}
    
    # Helper methods
    def _get_python_memory_stats(self) -> Dict:
        """Get Python-specific memory statistics"""
        try:
            import sys
            return {
                "total_allocated": sys.getsizeof([]),
                "gc_collections": gc.get_count(),
                "objects_tracked": len(gc.get_objects())
            }
        except:
            return {}
    
    async def _check_alerts(self, metrics: Dict) -> None:
        """Check metrics against alert rules"""
        try:
            # Check CPU
            if metrics["cpu"]["percent"] > self.alert_rules["high_cpu"]["threshold"]:
                await self._create_alert(
                    "high_cpu",
                    f"High CPU usage: {metrics['cpu']['percent']}%",
                    metrics["cpu"]
                )
            
            # Check memory
            if metrics["memory"]["percent"] > self.alert_rules["high_memory"]["threshold"]:
                await self._create_alert(
                    "high_memory", 
                    f"High memory usage: {metrics['memory']['percent']}%",
                    metrics["memory"]
                )
            
            # Check disk
            if metrics["disk"]["percent"] > self.alert_rules["high_disk"]["threshold"]:
                await self._create_alert(
                    "high_disk",
                    f"High disk usage: {metrics['disk']['percent']}%",
                    metrics["disk"]
                )
                
        except Exception as e:
            logger.error(f"Error checking alerts: {e}")
    
    async def _create_alert(self, alert_type: str, message: str, details: Dict) -> None:
        """Create a new alert"""
        alert = {
            "id": f"{alert_type}_{int(time.time())}",
            "type": alert_type,
            "message": message,
            "details": details,
            "severity": self.alert_rules[alert_type]["severity"],
            "timestamp": datetime.now().isoformat(),
            "acknowledged": False
        }
        
        self.alerts.append(alert)
        logger.warning(f"Alert created: {message}")
    
    def _get_top_endpoints(self, limit: int) -> List[Dict]:
        """Get top endpoints by request count"""
        endpoints = []
        for key, stats in self.request_stats.items():
            if stats["count"] > 0:
                method, endpoint = key.split(":", 1)
                endpoints.append({
                    "endpoint": endpoint,
                    "method": method,
                    "request_count": stats["count"],
                    "average_response_time": stats["total_time"] / stats["count"],
                    "error_count": stats["errors"],
                    "error_rate": stats["errors"] / stats["count"] if stats["count"] > 0 else 0
                })
        
        return sorted(endpoints, key=lambda x: x["request_count"], reverse=True)[:limit]
    
    def _calculate_health_score(self, cpu_avg: float, memory_avg: float, error_rate: float) -> float:
        """Calculate overall system health score (0-100)"""
        # Lower scores are better
        cpu_score = max(0, 100 - cpu_avg)  # 100% CPU = 0 score
        memory_score = max(0, 100 - memory_avg)  # 100% memory = 0 score
        error_score = max(0, 100 - (error_rate * 1000))  # 10% error rate = 0 score
        
        # Weighted average
        return (cpu_score * 0.4 + memory_score * 0.4 + error_score * 0.2)

# Global instance
system_monitor = SystemMonitor()