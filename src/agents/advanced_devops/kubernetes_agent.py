"""
Kubernetes Agent
K8s cluster management and scaling with advanced features
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
import json
import logging
from pathlib import Path

from agents.base_agent import BaseAgent, AgentTask, AgentCapabilities, AgentRecommendation
from tools.k8s.kubernetes_manager import KubernetesManager
from tools.k8s.cluster_optimizer import ClusterOptimizer
from tools.k8s.service_mesh import ServiceMeshManager

logger = logging.getLogger(__name__)


class KubernetesAgent(BaseAgent):
    """
    Advanced Kubernetes Agent for K8s cluster management and scaling
    """
    
    def __init__(self):
        super().__init__(
            name="Kubernetes Agent",
            description="K8s cluster management and scaling with advanced features",
            capabilities=[
                AgentCapabilities.K8S_MANAGEMENT,
                AgentCapabilities.CLUSTER_OPTIMIZATION,
                AgentCapabilities.SERVICE_MESH,
                AgentCapabilities.AUTO_SCALING,
                AgentCapabilities.CLUSTER_MONITORING
            ]
        )
        
        self.k8s_manager = KubernetesManager()
        self.cluster_optimizer = ClusterOptimizer()
        self.service_mesh = ServiceMeshManager()
        self.cluster_history = []
        
    async def process_task(self, task: AgentTask) -> AgentRecommendation:
        """Process Kubernetes cluster tasks"""
        
        try:
            if task.task_type == "deploy_application":
                return await self._deploy_application(task)
            elif task.task_type == "scale_deployment":
                return await self._scale_deployment(task)
            elif task.task_type == "optimize_cluster":
                return await self._optimize_cluster(task)
            elif task.task_type == "configure_service_mesh":
                return await self._configure_service_mesh(task)
            elif task.task_type == "monitor_cluster":
                return await self._monitor_cluster(task)
            elif task.task_type == "backup_cluster":
                return await self._backup_cluster(task)
            elif task.task_type == "upgrade_cluster":
                return await self._upgrade_cluster(task)
            else:
                return AgentRecommendation(
                    success=False,
                    message=f"Unknown task type: {task.task_type}",
                    data={}
                )
                
        except Exception as e:
            logger.error(f"Error in KubernetesAgent: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Kubernetes error: {str(e)}",
                data={}
            )
    
    async def _deploy_application(self, task: AgentTask) -> AgentRecommendation:
        """Deploy application to Kubernetes cluster"""
        
        try:
            app_config = task.data.get("app_config", {})
            deployment_config = task.data.get("deployment_config", {})
            
            # Deploy application
            deployment_info = await self.k8s_manager.deploy_application(
                app_config=app_config,
                deployment_config=deployment_config
            )
            
            # Record deployment
            deployment_record = {
                "app_name": app_config.get("name"),
                "namespace": deployment_config.get("namespace", "default"),
                "deployment_id": deployment_info["deployment_id"],
                "replicas": deployment_config.get("replicas", 1),
                "deployment_date": datetime.now().isoformat(),
                "status": deployment_info["status"]
            }
            
            self.cluster_history.append(deployment_record)
            
            return AgentRecommendation(
                success=True,
                message=f"Application {app_config.get('name')} deployed successfully",
                data={
                    "app_name": app_config.get("name"),
                    "deployment_id": deployment_info["deployment_id"],
                    "namespace": deployment_config.get("namespace", "default"),
                    "status": deployment_info["status"],
                    "endpoints": deployment_info.get("endpoints", []),
                    "resources": deployment_info.get("resources", {})
                }
            )
            
        except Exception as e:
            logger.error(f"Application deployment error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Application deployment failed: {str(e)}",
                data={}
            )
    
    async def _scale_deployment(self, task: AgentTask) -> AgentRecommendation:
        """Scale Kubernetes deployment"""
        
        try:
            deployment_name = task.data.get("deployment_name")
            namespace = task.data.get("namespace", "default")
            target_replicas = task.data.get("target_replicas")
            scaling_config = task.data.get("scaling_config", {})
            
            # Scale deployment
            scaling_info = await self.k8s_manager.scale_deployment(
                deployment_name=deployment_name,
                namespace=namespace,
                target_replicas=target_replicas,
                scaling_config=scaling_config
            )
            
            return AgentRecommendation(
                success=True,
                message=f"Deployment {deployment_name} scaled to {target_replicas} replicas",
                data={
                    "deployment_name": deployment_name,
                    "current_replicas": scaling_info["current_replicas"],
                    "target_replicas": target_replicas,
                    "scaling_time": scaling_info.get("scaling_time"),
                    "status": scaling_info["status"]
                }
            )
            
        except Exception as e:
            logger.error(f"Deployment scaling error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Deployment scaling failed: {str(e)}",
                data={}
            )
    
    async def _optimize_cluster(self, task: AgentTask) -> AgentRecommendation:
        """Optimize Kubernetes cluster performance and resource usage"""
        
        try:
            cluster_config = task.data.get("cluster_config", {})
            optimization_config = task.data.get("optimization_config", {})
            
            # Optimize cluster
            optimization_results = await self.cluster_optimizer.optimize_cluster(
                cluster_config=cluster_config,
                optimization_config=optimization_config
            )
            
            return AgentRecommendation(
                success=True,
                message="Cluster optimization completed",
                data={
                    "optimization_results": optimization_results,
                    "resource_savings": optimization_results.get("resource_savings", {}),
                    "performance_improvements": optimization_results.get("performance_improvements", {}),
                    "recommendations": optimization_results.get("recommendations", [])
                }
            )
            
        except Exception as e:
            logger.error(f"Cluster optimization error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Cluster optimization failed: {str(e)}",
                data={}
            )
    
    async def _configure_service_mesh(self, task: AgentTask) -> AgentRecommendation:
        """Configure service mesh for microservices"""
        
        try:
            service_mesh_config = task.data.get("service_mesh_config", {})
            mesh_type = task.data.get("mesh_type", "istio")
            
            # Configure service mesh
            mesh_info = await self.service_mesh.configure_service_mesh(
                mesh_type=mesh_type,
                service_mesh_config=service_mesh_config
            )
            
            return AgentRecommendation(
                success=True,
                message=f"Service mesh {mesh_type} configured successfully",
                data={
                    "mesh_type": mesh_type,
                    "mesh_id": mesh_info["mesh_id"],
                    "status": mesh_info["status"],
                    "services_configured": mesh_info.get("services_configured", 0),
                    "traffic_rules": mesh_info.get("traffic_rules", [])
                }
            )
            
        except Exception as e:
            logger.error(f"Service mesh configuration error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Service mesh configuration failed: {str(e)}",
                data={}
            )
    
    async def _monitor_cluster(self, task: AgentTask) -> AgentRecommendation:
        """Monitor Kubernetes cluster health and performance"""
        
        try:
            monitoring_config = task.data.get("monitoring_config", {})
            
            # Monitor cluster
            monitoring_results = await self.k8s_manager.monitor_cluster(
                monitoring_config=monitoring_config
            )
            
            return AgentRecommendation(
                success=True,
                message="Cluster monitoring completed",
                data={
                    "monitoring_results": monitoring_results,
                    "node_count": monitoring_results.get("node_count", 0),
                    "pod_count": monitoring_results.get("pod_count", 0),
                    "cluster_health": monitoring_results.get("cluster_health", "unknown"),
                    "resource_usage": monitoring_results.get("resource_usage", {})
                }
            )
            
        except Exception as e:
            logger.error(f"Cluster monitoring error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Cluster monitoring failed: {str(e)}",
                data={}
            )
    
    async def _backup_cluster(self, task: AgentTask) -> AgentRecommendation:
        """Backup Kubernetes cluster state and data"""
        
        try:
            backup_config = task.data.get("backup_config", {})
            backup_type = task.data.get("backup_type", "full")
            
            # Backup cluster
            backup_info = await self.k8s_manager.backup_cluster(
                backup_type=backup_type,
                backup_config=backup_config
            )
            
            return AgentRecommendation(
                success=True,
                message="Cluster backup completed",
                data={
                    "backup_id": backup_info["backup_id"],
                    "backup_type": backup_type,
                    "backup_size": backup_info.get("backup_size"),
                    "backup_location": backup_info.get("backup_location"),
                    "status": backup_info["status"]
                }
            )
            
        except Exception as e:
            logger.error(f"Cluster backup error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Cluster backup failed: {str(e)}",
                data={}
            )
    
    async def _upgrade_cluster(self, task: AgentTask) -> AgentRecommendation:
        """Upgrade Kubernetes cluster version"""
        
        try:
            target_version = task.data.get("target_version")
            upgrade_config = task.data.get("upgrade_config", {})
            
            # Upgrade cluster
            upgrade_info = await self.k8s_manager.upgrade_cluster(
                target_version=target_version,
                upgrade_config=upgrade_config
            )
            
            return AgentRecommendation(
                success=True,
                message=f"Cluster upgraded to version {target_version}",
                data={
                    "target_version": target_version,
                    "upgrade_id": upgrade_info["upgrade_id"],
                    "upgrade_time": upgrade_info.get("upgrade_time"),
                    "status": upgrade_info["status"],
                    "rollback_available": upgrade_info.get("rollback_available", False)
                }
            )
            
        except Exception as e:
            logger.error(f"Cluster upgrade error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Cluster upgrade failed: {str(e)}",
                data={}
            )
    
    def get_cluster_history(self) -> List[Dict]:
        """Get cluster operation history"""
        return self.cluster_history
    
    def get_deployment_status(self, deployment_name: str, namespace: str = "default") -> Optional[Dict]:
        """Get status of a specific deployment"""
        for record in self.cluster_history:
            if record.get("app_name") == deployment_name and record.get("namespace") == namespace:
                return {
                    "deployment_name": deployment_name,
                    "namespace": namespace,
                    "status": record["status"],
                    "replicas": record.get("replicas", 0),
                    "last_updated": record["deployment_date"]
                }
        return None 