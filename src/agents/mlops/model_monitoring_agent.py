"""
Model Monitoring Agent
ML model performance monitoring and drift detection
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import json
import logging
from pathlib import Path

from agents.base_agent import BaseAgent, AgentTask, AgentCapabilities, AgentRecommendation
from tools.ml.model_monitor import ModelMonitor
from tools.ml.drift_detector import DriftDetector
from tools.ml.performance_analyzer import PerformanceAnalyzer

logger = logging.getLogger(__name__)


class ModelMonitoringAgent(BaseAgent):
    """
    Advanced Model Monitoring Agent for ML model performance monitoring and drift detection
    """
    
    def __init__(self):
        super().__init__(
            name="Model Monitoring Agent",
            description="ML model performance monitoring and drift detection with advanced analytics",
            capabilities=[
                AgentCapabilities.MODEL_MONITORING,
                AgentCapabilities.DRIFT_DETECTION,
                AgentCapabilities.PERFORMANCE_ANALYSIS,
                AgentCapabilities.MODEL_ALERTING,
                AgentCapabilities.MODEL_RETRAINING
            ]
        )
        
        self.model_monitor = ModelMonitor()
        self.drift_detector = DriftDetector()
        self.performance_analyzer = PerformanceAnalyzer()
        self.monitoring_history = []
        
    async def process_task(self, task: AgentTask) -> AgentRecommendation:
        """Process model monitoring tasks"""
        
        try:
            if task.task_type == "monitor_model":
                return await self._monitor_model(task)
            elif task.task_type == "detect_drift":
                return await self._detect_drift(task)
            elif task.task_type == "analyze_performance":
                return await self._analyze_performance(task)
            elif task.task_type == "set_alerts":
                return await self._set_alerts(task)
            elif task.task_type == "trigger_retraining":
                return await self._trigger_retraining(task)
            elif task.task_type == "generate_report":
                return await self._generate_report(task)
            else:
                return AgentRecommendation(
                    success=False,
                    message=f"Unknown task type: {task.task_type}",
                    data={}
                )
                
        except Exception as e:
            logger.error(f"Error in ModelMonitoringAgent: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Monitoring error: {str(e)}",
                data={}
            )
    
    async def _monitor_model(self, task: AgentTask) -> AgentRecommendation:
        """Monitor model performance and health"""
        
        try:
            model_id = task.data.get("model_id")
            monitoring_config = task.data.get("monitoring_config", {})
            
            # Monitor model
            monitoring_results = await self.model_monitor.monitor_model(
                model_id=model_id,
                monitoring_config=monitoring_config
            )
            
            # Record monitoring event
            monitoring_record = {
                "model_id": model_id,
                "timestamp": datetime.now().isoformat(),
                "performance_metrics": monitoring_results.get("performance_metrics", {}),
                "health_status": monitoring_results.get("health_status", "unknown"),
                "alerts": monitoring_results.get("alerts", []),
                "drift_score": monitoring_results.get("drift_score", 0)
            }
            
            self.monitoring_history.append(monitoring_record)
            
            return AgentRecommendation(
                success=True,
                message=f"Model {model_id} monitoring completed",
                data={
                    "model_id": model_id,
                    "monitoring_results": monitoring_results,
                    "health_status": monitoring_results.get("health_status"),
                    "performance_metrics": monitoring_results.get("performance_metrics", {}),
                    "alerts_count": len(monitoring_results.get("alerts", []))
                }
            )
            
        except Exception as e:
            logger.error(f"Model monitoring error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Model monitoring failed: {str(e)}",
                data={}
            )
    
    async def _detect_drift(self, task: AgentTask) -> AgentRecommendation:
        """Detect data drift in model performance"""
        
        try:
            model_id = task.data.get("model_id")
            reference_data = task.data.get("reference_data")
            current_data = task.data.get("current_data")
            drift_config = task.data.get("drift_config", {})
            
            # Detect drift
            drift_results = await self.drift_detector.detect_drift(
                model_id=model_id,
                reference_data=reference_data,
                current_data=current_data,
                drift_config=drift_config
            )
            
            return AgentRecommendation(
                success=True,
                message="Drift detection completed",
                data={
                    "model_id": model_id,
                    "drift_score": drift_results.get("drift_score", 0),
                    "drift_detected": drift_results.get("drift_detected", False),
                    "drift_details": drift_results.get("drift_details", {}),
                    "recommendations": drift_results.get("recommendations", [])
                }
            )
            
        except Exception as e:
            logger.error(f"Drift detection error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Drift detection failed: {str(e)}",
                data={}
            )
    
    async def _analyze_performance(self, task: AgentTask) -> AgentRecommendation:
        """Analyze model performance in detail"""
        
        try:
            model_id = task.data.get("model_id")
            analysis_config = task.data.get("analysis_config", {})
            time_range = task.data.get("time_range", "30d")
            
            # Analyze performance
            analysis_results = await self.performance_analyzer.analyze_performance(
                model_id=model_id,
                analysis_config=analysis_config,
                time_range=time_range
            )
            
            return AgentRecommendation(
                success=True,
                message="Performance analysis completed",
                data={
                    "model_id": model_id,
                    "analysis_results": analysis_results,
                    "performance_trends": analysis_results.get("trends", {}),
                    "bottlenecks": analysis_results.get("bottlenecks", []),
                    "optimization_suggestions": analysis_results.get("suggestions", [])
                }
            )
            
        except Exception as e:
            logger.error(f"Performance analysis error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Performance analysis failed: {str(e)}",
                data={}
            )
    
    async def _set_alerts(self, task: AgentTask) -> AgentRecommendation:
        """Set up monitoring alerts for models"""
        
        try:
            model_id = task.data.get("model_id")
            alert_config = task.data.get("alert_config", {})
            
            # Set alerts
            alert_info = await self.model_monitor.set_alerts(
                model_id=model_id,
                alert_config=alert_config
            )
            
            return AgentRecommendation(
                success=True,
                message=f"Alerts set for model {model_id}",
                data={
                    "model_id": model_id,
                    "alert_id": alert_info["alert_id"],
                    "alert_config": alert_config,
                    "notification_channels": alert_info.get("notification_channels", [])
                }
            )
            
        except Exception as e:
            logger.error(f"Alert setting error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Alert setting failed: {str(e)}",
                data={}
            )
    
    async def _trigger_retraining(self, task: AgentTask) -> AgentRecommendation:
        """Trigger model retraining based on monitoring results"""
        
        try:
            model_id = task.data.get("model_id")
            retraining_config = task.data.get("retraining_config", {})
            trigger_reason = task.data.get("trigger_reason", "performance_degradation")
            
            # Trigger retraining
            retraining_info = await self.model_monitor.trigger_retraining(
                model_id=model_id,
                retraining_config=retraining_config,
                trigger_reason=trigger_reason
            )
            
            return AgentRecommendation(
                success=True,
                message=f"Retraining triggered for model {model_id}",
                data={
                    "model_id": model_id,
                    "retraining_id": retraining_info["retraining_id"],
                    "trigger_reason": trigger_reason,
                    "estimated_completion": retraining_info.get("estimated_completion"),
                    "status": retraining_info["status"]
                }
            )
            
        except Exception as e:
            logger.error(f"Retraining trigger error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Retraining trigger failed: {str(e)}",
                data={}
            )
    
    async def _generate_report(self, task: AgentTask) -> AgentRecommendation:
        """Generate comprehensive monitoring report"""
        
        try:
            model_id = task.data.get("model_id")
            report_config = task.data.get("report_config", {})
            report_type = task.data.get("report_type", "comprehensive")
            
            # Generate report
            report_data = await self.model_monitor.generate_report(
                model_id=model_id,
                report_config=report_config,
                report_type=report_type
            )
            
            return AgentRecommendation(
                success=True,
                message="Monitoring report generated",
                data={
                    "model_id": model_id,
                    "report_id": report_data["report_id"],
                    "report_type": report_type,
                    "report_summary": report_data.get("summary", {}),
                    "report_url": report_data.get("report_url"),
                    "generated_at": datetime.now().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Report generation error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Report generation failed: {str(e)}",
                data={}
            )
    
    def get_monitoring_history(self, model_id: Optional[str] = None) -> List[Dict]:
        """Get monitoring history for a specific model or all models"""
        if model_id:
            return [record for record in self.monitoring_history if record["model_id"] == model_id]
        return self.monitoring_history
    
    def get_model_health_status(self, model_id: str) -> Optional[Dict]:
        """Get current health status of a specific model"""
        for record in reversed(self.monitoring_history):
            if record["model_id"] == model_id:
                return {
                    "model_id": model_id,
                    "health_status": record["health_status"],
                    "last_monitored": record["timestamp"],
                    "drift_score": record.get("drift_score", 0),
                    "alerts_count": len(record.get("alerts", []))
                }
        return None
    
    def get_performance_trends(self, model_id: str, days: int = 30) -> List[Dict]:
        """Get performance trends for a model over specified days"""
        cutoff_date = datetime.now() - timedelta(days=days)
        trends = []
        
        for record in self.monitoring_history:
            if record["model_id"] == model_id:
                record_date = datetime.fromisoformat(record["timestamp"])
                if record_date >= cutoff_date:
                    trends.append({
                        "timestamp": record["timestamp"],
                        "performance_metrics": record["performance_metrics"],
                        "drift_score": record.get("drift_score", 0)
                    })
        
        return sorted(trends, key=lambda x: x["timestamp"]) 