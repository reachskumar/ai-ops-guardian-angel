"""
Docker Manager Tool
Handles Docker container and image operations
"""

import asyncio
import json
import logging
import uuid
import subprocess
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
import docker
from docker.errors import DockerException, ImageNotFound, ContainerError

logger = logging.getLogger(__name__)


class DockerManager:
    """
    Advanced Docker manager with comprehensive container and image operations
    """
    
    def __init__(self):
        self.client = None
        self.operations_history = []
        self._initialize_docker_client()
        
    def _initialize_docker_client(self):
        """Initialize Docker client"""
        try:
            self.client = docker.from_env()
            logger.info("Docker client initialized successfully")
        except DockerException as e:
            logger.warning(f"Docker client initialization failed: {e}")
            self.client = None
    
    async def build_image(
        self,
        dockerfile_path: str,
        image_name: str,
        build_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Build Docker image"""
        
        try:
            if not self.client:
                raise DockerException("Docker client not available")
            
            build_config = build_config or {}
            build_id = str(uuid.uuid4())
            
            # Prepare build context
            dockerfile_dir = Path(dockerfile_path).parent
            dockerfile_name = Path(dockerfile_path).name
            
            # Build parameters
            build_args = build_config.get("build_args", {})
            tags = [image_name] + build_config.get("additional_tags", [])
            
            logger.info(f"Building image {image_name} from {dockerfile_path}")
            
            # Build image
            start_time = time.time()
            image, build_logs = self.client.images.build(
                path=str(dockerfile_dir),
                dockerfile=dockerfile_name,
                tag=tags,
                buildargs=build_args,
                rm=True,
                decode=True
            )
            
            build_time = time.time() - start_time
            
            # Get image info
            image_info = self.client.images.get(image.id)
            
            build_info = {
                "build_id": build_id,
                "image_name": image_name,
                "image_id": image.id,
                "build_time": build_time,
                "image_size": image_info.attrs.get("Size", 0),
                "layers_count": len(image_info.attrs.get("Layers", [])),
                "tags": tags,
                "build_args": build_args,
                "build_logs": build_logs
            }
            
            # Record operation
            self.operations_history.append({
                "operation": "build_image",
                "timestamp": datetime.now().isoformat(),
                "build_info": build_info
            })
            
            logger.info(f"Image {image_name} built successfully in {build_time:.2f}s")
            
            return build_info
            
        except Exception as e:
            logger.error(f"Image build failed: {e}")
            raise
    
    async def deploy_container(
        self,
        image_name: str,
        container_name: str,
        deployment_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Deploy Docker container"""
        
        try:
            if not self.client:
                raise DockerException("Docker client not available")
            
            deployment_config = deployment_config or {}
            deployment_id = str(uuid.uuid4())
            
            # Container configuration
            ports = deployment_config.get("ports", {})
            environment = deployment_config.get("environment", {})
            volumes = deployment_config.get("volumes", {})
            command = deployment_config.get("command")
            restart_policy = deployment_config.get("restart_policy", "unless-stopped")
            
            logger.info(f"Deploying container {container_name} from image {image_name}")
            
            # Create and start container
            container = self.client.containers.run(
                image=image_name,
                name=container_name,
                ports=ports,
                environment=environment,
                volumes=volumes,
                command=command,
                restart_policy={"Name": restart_policy},
                detach=True
            )
            
            # Get container info
            container_info = container.attrs
            
            deployment_info = {
                "deployment_id": deployment_id,
                "container_id": container.id,
                "container_name": container_name,
                "image_name": image_name,
                "status": container.status,
                "ports": ports,
                "environment": environment,
                "created_at": container_info.get("Created"),
                "state": container_info.get("State", {})
            }
            
            # Record operation
            self.operations_history.append({
                "operation": "deploy_container",
                "timestamp": datetime.now().isoformat(),
                "deployment_info": deployment_info
            })
            
            logger.info(f"Container {container_name} deployed successfully")
            
            return deployment_info
            
        except Exception as e:
            logger.error(f"Container deployment failed: {e}")
            raise
    
    async def monitor_containers(
        self,
        container_ids: List[str],
        monitoring_config: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """Monitor container health and performance"""
        
        try:
            if not self.client:
                raise DockerException("Docker client not available")
            
            monitoring_config = monitoring_config or {}
            monitoring_results = []
            
            for container_id in container_ids:
                try:
                    container = self.client.containers.get(container_id)
                    stats = container.stats(stream=False)
                    
                    # Calculate resource usage
                    cpu_usage = self._calculate_cpu_usage(stats)
                    memory_usage = self._calculate_memory_usage(stats)
                    
                    # Determine health status
                    health_status = self._determine_health_status(container, stats)
                    
                    container_info = {
                        "container_id": container_id,
                        "name": container.name,
                        "status": container.status,
                        "health_status": health_status,
                        "cpu_usage": cpu_usage,
                        "memory_usage": memory_usage,
                        "created_at": container.attrs.get("Created"),
                        "image": container.attrs.get("Config", {}).get("Image")
                    }
                    
                    monitoring_results.append(container_info)
                    
                except Exception as e:
                    logger.warning(f"Failed to monitor container {container_id}: {e}")
                    monitoring_results.append({
                        "container_id": container_id,
                        "error": str(e),
                        "health_status": "unknown"
                    })
            
            return monitoring_results
            
        except Exception as e:
            logger.error(f"Container monitoring failed: {e}")
            raise
    
    async def scale_containers(
        self,
        service_name: str,
        target_replicas: int,
        scaling_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Scale containers based on demand"""
        
        try:
            if not self.client:
                raise DockerException("Docker client not available")
            
            scaling_config = scaling_config or {}
            scaling_id = str(uuid.uuid4())
            
            # Get existing containers for the service
            containers = self.client.containers.list(
                filters={"label": f"com.docker.swarm.service.name={service_name}"}
            )
            
            current_replicas = len(containers)
            
            if target_replicas > current_replicas:
                # Scale up
                containers_to_add = target_replicas - current_replicas
                for i in range(containers_to_add):
                    await self._create_service_container(service_name, scaling_config)
                    
            elif target_replicas < current_replicas:
                # Scale down
                containers_to_remove = current_replicas - target_replicas
                for i in range(containers_to_remove):
                    if containers:
                        container = containers.pop()
                        container.remove(force=True)
            
            scaling_info = {
                "scaling_id": scaling_id,
                "service_name": service_name,
                "current_replicas": target_replicas,
                "target_replicas": target_replicas,
                "scaling_time": time.time(),
                "status": "completed"
            }
            
            # Record operation
            self.operations_history.append({
                "operation": "scale_containers",
                "timestamp": datetime.now().isoformat(),
                "scaling_info": scaling_info
            })
            
            logger.info(f"Service {service_name} scaled to {target_replicas} replicas")
            
            return scaling_info
            
        except Exception as e:
            logger.error(f"Container scaling failed: {e}")
            raise
    
    async def cleanup_resources(
        self,
        cleanup_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Clean up unused containers and images"""
        
        try:
            if not self.client:
                raise DockerException("Docker client not available")
            
            cleanup_config = cleanup_config or {}
            cleanup_id = str(uuid.uuid4())
            
            # Clean up stopped containers
            stopped_containers = self.client.containers.list(
                filters={"status": "exited"}
            )
            containers_removed = len(stopped_containers)
            
            for container in stopped_containers:
                container.remove()
            
            # Clean up dangling images
            dangling_images = self.client.images.list(
                filters={"dangling": True}
            )
            images_removed = len(dangling_images)
            
            space_freed = 0
            for image in dangling_images:
                space_freed += image.attrs.get("Size", 0)
                image.remove()
            
            cleanup_results = {
                "cleanup_id": cleanup_id,
                "containers_removed": containers_removed,
                "images_removed": images_removed,
                "space_freed": space_freed,
                "cleanup_time": time.time()
            }
            
            # Record operation
            self.operations_history.append({
                "operation": "cleanup_resources",
                "timestamp": datetime.now().isoformat(),
                "cleanup_results": cleanup_results
            })
            
            logger.info(f"Cleanup completed. Removed {containers_removed} containers, {images_removed} images")
            
            return cleanup_results
            
        except Exception as e:
            logger.error(f"Resource cleanup failed: {e}")
            raise
    
    def _calculate_cpu_usage(self, stats: Dict[str, Any]) -> float:
        """Calculate CPU usage percentage"""
        try:
            cpu_delta = stats.get("cpu_stats", {}).get("cpu_usage", {}).get("total_usage", 0)
            system_delta = stats.get("cpu_stats", {}).get("system_cpu_usage", 0)
            
            if system_delta > 0:
                cpu_usage = (cpu_delta / system_delta) * 100
                return min(cpu_usage, 100.0)
            return 0.0
        except:
            return 0.0
    
    def _calculate_memory_usage(self, stats: Dict[str, Any]) -> Dict[str, int]:
        """Calculate memory usage"""
        try:
            memory_stats = stats.get("memory_stats", {})
            usage = memory_stats.get("usage", 0)
            limit = memory_stats.get("limit", 1)
            
            return {
                "usage_bytes": usage,
                "limit_bytes": limit,
                "usage_percent": (usage / limit) * 100 if limit > 0 else 0
            }
        except:
            return {"usage_bytes": 0, "limit_bytes": 0, "usage_percent": 0}
    
    def _determine_health_status(self, container, stats: Dict[str, Any]) -> str:
        """Determine container health status"""
        try:
            # Check container state
            state = container.attrs.get("State", {})
            
            if state.get("Status") == "running":
                # Check resource usage
                memory_usage = self._calculate_memory_usage(stats)
                cpu_usage = self._calculate_cpu_usage(stats)
                
                if memory_usage["usage_percent"] > 90 or cpu_usage > 90:
                    return "warning"
                elif memory_usage["usage_percent"] > 95 or cpu_usage > 95:
                    return "critical"
                else:
                    return "healthy"
            else:
                return "unhealthy"
                
        except:
            return "unknown"
    
    async def _create_service_container(self, service_name: str, config: Dict[str, Any]):
        """Create a new service container"""
        # This would be implemented based on the specific service configuration
        # For now, we'll just log the operation
        logger.info(f"Creating new container for service {service_name}")
    
    def get_operations_history(self) -> List[Dict[str, Any]]:
        """Get operations history"""
        return self.operations_history
    
    def get_container_info(self, container_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific container"""
        try:
            if not self.client:
                return None
            
            container = self.client.containers.get(container_id)
            return {
                "container_id": container_id,
                "name": container.name,
                "status": container.status,
                "image": container.attrs.get("Config", {}).get("Image"),
                "created_at": container.attrs.get("Created"),
                "ports": container.attrs.get("NetworkSettings", {}).get("Ports", {})
            }
        except Exception as e:
            logger.error(f"Failed to get container info for {container_id}: {e}")
            return None 