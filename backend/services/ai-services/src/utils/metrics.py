"""
Metrics and monitoring utilities for AI agents
Tracks performance, success rates, and system health
"""

import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from collections import defaultdict, deque
import threading
from enum import Enum


class MetricType(str, Enum):
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    TIMER = "timer"


@dataclass
class MetricValue:
    """Represents a single metric value"""
    value: float
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    labels: Dict[str, str] = field(default_factory=dict)


class AgentMetrics:
    """Metrics collection for individual agents"""
    
    def __init__(self, agent_type: str):
        self.agent_type = agent_type
        self.created_at = datetime.now(timezone.utc)
        self._lock = threading.Lock()
        
        # Task metrics
        self.tasks_started = 0
        self.tasks_completed = 0
        self.tasks_failed = 0
        self.task_success_rate = 0.0
        
        # Timing metrics
        self.response_times: deque = deque(maxlen=100)  # Last 100 response times
        self.avg_response_time = 0.0
        self.min_response_time = float('inf')
        self.max_response_time = 0.0
        
        # Error tracking
        self.error_counts: Dict[str, int] = defaultdict(int)
        self.recent_errors: deque = deque(maxlen=50)  # Last 50 errors
        
        # Recommendation metrics
        self.recommendations_generated = 0
        self.recommendation_confidence_scores: deque = deque(maxlen=100)
        self.avg_confidence = 0.0
        
        # Performance metrics
        self.memory_usage = 0.0
        self.cpu_usage = 0.0
        self.active_tasks = 0
        
        # Custom metrics
        self.custom_metrics: Dict[str, List[MetricValue]] = defaultdict(list)
        
        # Health status
        self.health_score = 1.0  # 0.0 - 1.0
        self.last_health_check = datetime.now(timezone.utc)
    
    def task_started(self):
        """Record a task start"""
        with self._lock:
            self.tasks_started += 1
            self.active_tasks += 1
            self._update_success_rate()
    
    def task_completed(self, duration: float = None):
        """Record a task completion"""
        with self._lock:
            self.tasks_completed += 1
            self.active_tasks = max(0, self.active_tasks - 1)
            
            if duration is not None:
                self.response_times.append(duration)
                self._update_timing_stats()
            
            self._update_success_rate()
            self._update_health_score()
    
    def task_failed(self, error_type: str = "unknown", duration: float = None):
        """Record a task failure"""
        with self._lock:
            self.tasks_failed += 1
            self.active_tasks = max(0, self.active_tasks - 1)
            self.error_counts[error_type] += 1
            
            error_info = {
                'type': error_type,
                'timestamp': datetime.now(timezone.utc),
                'agent_type': self.agent_type
            }
            self.recent_errors.append(error_info)
            
            if duration is not None:
                self.response_times.append(duration)
                self._update_timing_stats()
            
            self._update_success_rate()
            self._update_health_score()
    
    def recommendation_generated(self, confidence: float):
        """Record a recommendation generation"""
        with self._lock:
            self.recommendations_generated += 1
            self.recommendation_confidence_scores.append(confidence)
            
            if self.recommendation_confidence_scores:
                self.avg_confidence = sum(self.recommendation_confidence_scores) / len(self.recommendation_confidence_scores)
    
    def record_custom_metric(self, name: str, value: float, labels: Dict[str, str] = None):
        """Record a custom metric"""
        with self._lock:
            metric_value = MetricValue(value=value, labels=labels or {})
            self.custom_metrics[name].append(metric_value)
            
            # Keep only last 1000 values per metric
            if len(self.custom_metrics[name]) > 1000:
                self.custom_metrics[name] = self.custom_metrics[name][-1000:]
    
    def update_resource_usage(self, memory_mb: float, cpu_percent: float):
        """Update resource usage metrics"""
        with self._lock:
            self.memory_usage = memory_mb
            self.cpu_usage = cpu_percent
    
    def _update_timing_stats(self):
        """Update timing statistics"""
        if self.response_times:
            self.avg_response_time = sum(self.response_times) / len(self.response_times)
            self.min_response_time = min(self.response_times)
            self.max_response_time = max(self.response_times)
    
    def _update_success_rate(self):
        """Update task success rate"""
        total_tasks = self.tasks_completed + self.tasks_failed
        if total_tasks > 0:
            self.task_success_rate = self.tasks_completed / total_tasks
        else:
            self.task_success_rate = 1.0
    
    def _update_health_score(self):
        """Update overall health score"""
        # Base health on success rate, error frequency, and response times
        health_factors = []
        
        # Success rate factor (0.4 weight)
        health_factors.append(self.task_success_rate * 0.4)
        
        # Error frequency factor (0.3 weight)
        recent_error_rate = len([e for e in self.recent_errors 
                               if (datetime.now(timezone.utc) - e['timestamp']).seconds < 3600]) / 50
        error_factor = max(0, 1 - recent_error_rate) * 0.3
        health_factors.append(error_factor)
        
        # Response time factor (0.3 weight)
        if self.response_times:
            # Normalize response time (assume 0-60 seconds is normal range)
            normalized_response_time = min(1, self.avg_response_time / 60)
            response_factor = max(0, 1 - normalized_response_time) * 0.3
            health_factors.append(response_factor)
        else:
            health_factors.append(0.3)  # Default if no data
        
        self.health_score = sum(health_factors)
        self.last_health_check = datetime.now(timezone.utc)
    
    def get_summary(self) -> Dict[str, Any]:
        """Get a summary of all metrics"""
        with self._lock:
            return {
                'agent_type': self.agent_type,
                'uptime_seconds': (datetime.now(timezone.utc) - self.created_at).total_seconds(),
                'tasks': {
                    'started': self.tasks_started,
                    'completed': self.tasks_completed,
                    'failed': self.tasks_failed,
                    'active': self.active_tasks,
                    'success_rate': round(self.task_success_rate, 3)
                },
                'performance': {
                    'avg_response_time': round(self.avg_response_time, 2),
                    'min_response_time': round(self.min_response_time, 2) if self.min_response_time != float('inf') else None,
                    'max_response_time': round(self.max_response_time, 2),
                    'memory_usage_mb': round(self.memory_usage, 2),
                    'cpu_usage_percent': round(self.cpu_usage, 2)
                },
                'recommendations': {
                    'generated': self.recommendations_generated,
                    'avg_confidence': round(self.avg_confidence, 3)
                },
                'health': {
                    'score': round(self.health_score, 3),
                    'last_check': self.last_health_check.isoformat()
                },
                'errors': {
                    'total_by_type': dict(self.error_counts),
                    'recent_count': len(self.recent_errors)
                },
                'custom_metrics': {
                    name: len(values) for name, values in self.custom_metrics.items()
                }
            }
    
    def get_recent_metrics(self, minutes: int = 5) -> Dict[str, Any]:
        """Get metrics for the last N minutes"""
        cutoff_time = datetime.now(timezone.utc).timestamp() - (minutes * 60)
        
        recent_response_times = [
            rt for rt in self.response_times 
            if rt > cutoff_time
        ]
        
        recent_errors = [
            err for err in self.recent_errors 
            if err['timestamp'].timestamp() > cutoff_time
        ]
        
        return {
            'timeframe_minutes': minutes,
            'recent_response_times': recent_response_times,
            'recent_errors': len(recent_errors),
            'avg_recent_response_time': sum(recent_response_times) / len(recent_response_times) if recent_response_times else 0
        }


class SystemMetrics:
    """System-wide metrics for all agents"""
    
    def __init__(self):
        self.agents: Dict[str, AgentMetrics] = {}
        self.system_start_time = datetime.now(timezone.utc)
        self._lock = threading.Lock()
    
    def register_agent(self, agent_type: str) -> AgentMetrics:
        """Register a new agent and return its metrics instance"""
        with self._lock:
            if agent_type not in self.agents:
                self.agents[agent_type] = AgentMetrics(agent_type)
            return self.agents[agent_type]
    
    def get_agent_metrics(self, agent_type: str) -> Optional[AgentMetrics]:
        """Get metrics for a specific agent"""
        return self.agents.get(agent_type)
    
    def get_system_summary(self) -> Dict[str, Any]:
        """Get system-wide metrics summary"""
        with self._lock:
            total_tasks = sum(agent.tasks_started for agent in self.agents.values())
            total_completed = sum(agent.tasks_completed for agent in self.agents.values())
            total_failed = sum(agent.tasks_failed for agent in self.agents.values())
            
            overall_success_rate = total_completed / max(1, total_completed + total_failed)
            
            avg_health_score = sum(agent.health_score for agent in self.agents.values()) / max(1, len(self.agents))
            
            return {
                'system_uptime_seconds': (datetime.now(timezone.utc) - self.system_start_time).total_seconds(),
                'total_agents': len(self.agents),
                'active_agents': len([a for a in self.agents.values() if a.active_tasks > 0]),
                'overall_stats': {
                    'total_tasks': total_tasks,
                    'total_completed': total_completed,
                    'total_failed': total_failed,
                    'success_rate': round(overall_success_rate, 3)
                },
                'system_health': {
                    'average_agent_health': round(avg_health_score, 3),
                    'healthy_agents': len([a for a in self.agents.values() if a.health_score > 0.8]),
                    'degraded_agents': len([a for a in self.agents.values() if 0.5 < a.health_score <= 0.8]),
                    'unhealthy_agents': len([a for a in self.agents.values() if a.health_score <= 0.5])
                },
                'agents': {
                    agent_type: agent.get_summary() 
                    for agent_type, agent in self.agents.items()
                }
            }
    
    def get_top_performers(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get top performing agents by various metrics"""
        agents_data = []
        
        for agent_type, agent in self.agents.items():
            agents_data.append({
                'agent_type': agent_type,
                'success_rate': agent.task_success_rate,
                'health_score': agent.health_score,
                'avg_response_time': agent.avg_response_time,
                'tasks_completed': agent.tasks_completed
            })
        
        # Sort by health score and success rate
        top_performers = sorted(
            agents_data, 
            key=lambda x: (x['health_score'], x['success_rate']), 
            reverse=True
        )
        
        return top_performers[:limit]
    
    def get_alerts(self) -> List[Dict[str, Any]]:
        """Get system alerts based on metrics"""
        alerts = []
        
        for agent_type, agent in self.agents.items():
            # Health score alerts
            if agent.health_score < 0.5:
                alerts.append({
                    'type': 'critical',
                    'agent': agent_type,
                    'message': f'Agent health critically low: {agent.health_score:.2f}',
                    'metric': 'health_score',
                    'value': agent.health_score
                })
            elif agent.health_score < 0.8:
                alerts.append({
                    'type': 'warning',
                    'agent': agent_type,
                    'message': f'Agent health degraded: {agent.health_score:.2f}',
                    'metric': 'health_score',
                    'value': agent.health_score
                })
            
            # Success rate alerts
            if agent.task_success_rate < 0.7 and (agent.tasks_completed + agent.tasks_failed) > 5:
                alerts.append({
                    'type': 'warning',
                    'agent': agent_type,
                    'message': f'Low success rate: {agent.task_success_rate:.2f}',
                    'metric': 'success_rate',
                    'value': agent.task_success_rate
                })
            
            # Response time alerts
            if agent.avg_response_time > 60:  # 60 seconds
                alerts.append({
                    'type': 'warning',
                    'agent': agent_type,
                    'message': f'High response time: {agent.avg_response_time:.1f}s',
                    'metric': 'response_time',
                    'value': agent.avg_response_time
                })
        
        return alerts


# Global system metrics instance
system_metrics = SystemMetrics() 