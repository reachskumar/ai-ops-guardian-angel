"""
Docker Agent
Container orchestration and optimization with advanced features
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
import json
import logging
from pathlib import Path

from ..base_agent import BaseAgent, AgentTask, AgentCapabilities, AgentRecommendation
from ...config.settings import AgentType
from ...tools.container.docker_manager import DockerManager
from ...tools.container.container_optimizer import ContainerOptimizer
from ...tools.container.security_scanner import ContainerSecurityScanner

logger = logging.getLogger(__name__)


class DockerAgent(BaseAgent):
    """
    Advanced Docker Agent for container orchestration and optimization
    """
    
    def __init__(self):
        capabilities = AgentCapabilities(
            supported_tasks=["build_image", "deploy_container", "optimize_container", "scan_security", "monitor_containers"],
            required_tools=["docker_manager", "container_optimizer", "security_scanner"],
            max_concurrent_tasks=4,
            average_response_time=30.0
        )
        
        super().__init__(
            agent_type=AgentType.DOCKER,
            name="Docker Agent",
            description="Container orchestration and optimization with advanced features",
            capabilities=capabilities
        )
        
        self.docker_manager = DockerManager()
        self.container_optimizer = ContainerOptimizer()
        self.security_scanner = ContainerSecurityScanner()
        self.container_history = []
        
    async def process_task(self, task: AgentTask) -> AgentRecommendation:
        """Process Docker container tasks"""
        
        try:
            if task.task_type == "build_image":
                return await self._build_image(task)
            elif task.task_type == "deploy_container":
                return await self._deploy_container(task)
            elif task.task_type == "optimize_container":
                return await self._optimize_container(task)
            elif task.task_type == "scan_security":
                return await self._scan_security(task)
            elif task.task_type == "monitor_containers":
                return await self._monitor_containers(task)
            elif task.task_type == "scale_containers":
                return await self._scale_containers(task)
            elif task.task_type == "cleanup_containers":
                return await self._cleanup_containers(task)
            else:
                return AgentRecommendation(
                    success=False,
                    message=f"Unknown task type: {task.task_type}",
                    data={}
                )
                
        except Exception as e:
            logger.error(f"Error in DockerAgent: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Docker error: {str(e)}",
                data={}
            )
    
    async def _build_image(self, task: AgentTask) -> AgentRecommendation:
        """Build Docker image with optimizations"""
        
        try:
            dockerfile_path = task.data.get("dockerfile_path")
            image_name = task.data.get("image_name")
            build_config = task.data.get("build_config", {})
            
            # Build image
            build_info = await self.docker_manager.build_image(
                dockerfile_path=dockerfile_path,
                image_name=image_name,
                build_config=build_config
            )
            
            # Record build
            build_record = {
                "image_name": image_name,
                "build_id": build_info["build_id"],
                "build_time": build_info["build_time"],
                "image_size": build_info.get("image_size"),
                "layers_count": build_info.get("layers_count"),
                "build_date": datetime.now().isoformat()
            }
            
            self.container_history.append(build_record)
            
            return AgentRecommendation(
                success=True,
                message=f"Image {image_name} built successfully",
                data={
                    "image_name": image_name,
                    "build_id": build_info["build_id"],
                    "image_size": build_info.get("image_size"),
                    "build_time": build_info["build_time"],
                    "optimization_suggestions": build_info.get("optimization_suggestions", [])
                }
            )
            
        except Exception as e:
            logger.error(f"Image build error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Image build failed: {str(e)}",
                data={}
            )
    
    async def _deploy_container(self, task: AgentTask) -> AgentRecommendation:
        """Deploy container with advanced configuration"""
        
        try:
            image_name = task.data.get("image_name")
            container_name = task.data.get("container_name")
            deployment_config = task.data.get("deployment_config", {})
            
            # Deploy container
            deployment_info = await self.docker_manager.deploy_container(
                image_name=image_name,
                container_name=container_name,
                deployment_config=deployment_config
            )
            
            return AgentRecommendation(
                success=True,
                message=f"Container {container_name} deployed successfully",
                data={
                    "container_id": deployment_info["container_id"],
                    "container_name": container_name,
                    "status": deployment_info["status"],
                    "ports": deployment_info.get("ports", []),
                    "environment": deployment_info.get("environment", {})
                }
            )
            
        except Exception as e:
            logger.error(f"Container deployment error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Container deployment failed: {str(e)}",
                data={}
            )
    
    async def _optimize_container(self, task: AgentTask) -> AgentRecommendation:
        """Optimize container performance and resource usage"""
        
        try:
            container_id = task.data.get("container_id")
            optimization_config = task.data.get("optimization_config", {})
            
            # Optimize container
            optimization_results = await self.container_optimizer.optimize_container(
                container_id=container_id,
                optimization_config=optimization_config
            )
            
            return AgentRecommendation(
                success=True,
                message="Container optimization completed",
                data={
                    "container_id": container_id,
                    "optimization_results": optimization_results,
                    "resource_savings": optimization_results.get("resource_savings", {}),
                    "performance_improvements": optimization_results.get("performance_improvements", {}),
                    "recommendations": optimization_results.get("recommendations", [])
                }
            )
            
        except Exception as e:
            logger.error(f"Container optimization error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Container optimization failed: {str(e)}",
                data={}
            )
    
    async def _scan_security(self, task: AgentTask) -> AgentRecommendation:
        """Scan container for security vulnerabilities"""
        
        try:
            image_name = task.data.get("image_name")
            scan_config = task.data.get("scan_config", {})
            
            # Scan for security issues
            scan_results = await self.security_scanner.scan_container(
                image_name=image_name,
                scan_config=scan_config
            )
            
            return AgentRecommendation(
                success=True,
                message="Security scan completed",
                data={
                    "image_name": image_name,
                    "scan_results": scan_results,
                    "vulnerabilities": scan_results.get("vulnerabilities", []),
                    "security_score": scan_results.get("security_score", 0),
                    "recommendations": scan_results.get("recommendations", [])
                }
            )
            
        except Exception as e:
            logger.error(f"Security scan error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Security scan failed: {str(e)}",
                data={}
            )
    
    async def _monitor_containers(self, task: AgentTask) -> AgentRecommendation:
        """Monitor container health and performance"""
        
        try:
            container_ids = task.data.get("container_ids", [])
            monitoring_config = task.data.get("monitoring_config", {})
            
            # Monitor containers
            monitoring_results = await self.docker_manager.monitor_containers(
                container_ids=container_ids,
                monitoring_config=monitoring_config
            )
            
            return AgentRecommendation(
                success=True,
                message="Container monitoring completed",
                data={
                    "monitoring_results": monitoring_results,
                    "healthy_containers": len([c for c in monitoring_results if c.get("health_status") == "healthy"]),
                    "total_containers": len(monitoring_results),
                    "resource_usage": monitoring_results.get("resource_usage", {})
                }
            )
            
        except Exception as e:
            logger.error(f"Container monitoring error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Container monitoring failed: {str(e)}",
                data={}
            )
    
    async def _scale_containers(self, task: AgentTask) -> AgentRecommendation:
        """Scale containers based on demand"""
        
        try:
            service_name = task.data.get("service_name")
            target_replicas = task.data.get("target_replicas")
            scaling_config = task.data.get("scaling_config", {})
            
            # Scale containers
            scaling_results = await self.docker_manager.scale_containers(
                service_name=service_name,
                target_replicas=target_replicas,
                scaling_config=scaling_config
            )
            
            return AgentRecommendation(
                success=True,
                message=f"Service {service_name} scaled to {target_replicas} replicas",
                data={
                    "service_name": service_name,
                    "current_replicas": scaling_results["current_replicas"],
                    "target_replicas": target_replicas,
                    "scaling_time": scaling_results.get("scaling_time"),
                    "status": scaling_results["status"]
                }
            )
            
        except Exception as e:
            logger.error(f"Container scaling error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Container scaling failed: {str(e)}",
                data={}
            )
    
    async def _cleanup_containers(self, task: AgentTask) -> AgentRecommendation:
        """Clean up unused containers and images"""
        
        try:
            cleanup_config = task.data.get("cleanup_config", {})
            
            # Cleanup containers and images
            cleanup_results = await self.docker_manager.cleanup_resources(
                cleanup_config=cleanup_config
            )
            
            return AgentRecommendation(
                success=True,
                message="Container cleanup completed",
                data={
                    "cleanup_results": cleanup_results,
                    "containers_removed": cleanup_results.get("containers_removed", 0),
                    "images_removed": cleanup_results.get("images_removed", 0),
                    "space_freed": cleanup_results.get("space_freed", 0)
                }
            )
            
        except Exception as e:
            logger.error(f"Container cleanup error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Container cleanup failed: {str(e)}",
                data={}
            )
    
    def get_container_history(self) -> List[Dict]:
        """Get container operation history"""
        return self.container_history
    
    def get_container_status(self, container_id: str) -> Optional[Dict]:
        """Get status of a specific container"""
        # This would typically query the Docker daemon
        return None 