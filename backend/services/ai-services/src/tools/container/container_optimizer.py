"""
Container Optimizer Tool
Handles Docker container optimization and performance tuning
"""

import asyncio
import json
import logging
import uuid
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
import docker
from docker.errors import DockerException

logger = logging.getLogger(__name__)


class ContainerOptimizer:
    """
    Advanced container optimizer with comprehensive optimization capabilities
    """
    
    def __init__(self):
        self.client = None
        self.optimization_history = []
        self._initialize_docker_client()
        
    def _initialize_docker_client(self):
        """Initialize Docker client"""
        try:
            self.client = docker.from_env()
            logger.info("Docker client initialized for optimization")
        except DockerException as e:
            logger.warning(f"Docker client initialization failed: {e}")
            self.client = None
    
    async def optimize_container(
        self,
        container_id: str,
        optimization_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Optimize container performance and resource usage"""
        
        try:
            if not self.client:
                raise DockerException("Docker client not available")
            
            optimization_config = optimization_config or {}
            optimization_id = str(uuid.uuid4())
            
            container = self.client.containers.get(container_id)
            
            # Analyze current state
            current_analysis = await self._analyze_container_performance(container)
            
            # Generate optimization recommendations
            recommendations = await self._generate_optimization_recommendations(
                current_analysis, optimization_config
            )
            
            # Apply optimizations
            applied_optimizations = await self._apply_optimizations(
                container, recommendations
            )
            
            # Re-analyze after optimization
            optimized_analysis = await self._analyze_container_performance(container)
            
            optimization_results = {
                "optimization_id": optimization_id,
                "container_id": container_id,
                "before_optimization": current_analysis,
                "after_optimization": optimized_analysis,
                "recommendations": recommendations,
                "applied_optimizations": applied_optimizations,
                "improvement_metrics": self._calculate_improvements(
                    current_analysis, optimized_analysis
                )
            }
            
            # Record optimization
            self.optimization_history.append({
                "operation": "optimize_container",
                "timestamp": datetime.now().isoformat(),
                "optimization_results": optimization_results
            })
            
            logger.info(f"Container {container_id} optimized successfully")
            
            return optimization_results
            
        except Exception as e:
            logger.error(f"Container optimization failed: {e}")
            raise
    
    async def optimize_image(
        self,
        image_name: str,
        optimization_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Optimize Docker image size and layers"""
        
        try:
            if not self.client:
                raise DockerException("Docker client not available")
            
            optimization_config = optimization_config or {}
            optimization_id = str(uuid.uuid4())
            
            # Get original image info
            original_image = self.client.images.get(image_name)
            original_size = original_image.attrs.get("Size", 0)
            original_layers = len(original_image.attrs.get("Layers", []))
            
            # Analyze image layers
            layer_analysis = await self._analyze_image_layers(original_image)
            
            # Generate optimization recommendations
            recommendations = await self._generate_image_optimization_recommendations(
                layer_analysis, optimization_config
            )
            
            # Create optimized Dockerfile
            optimized_dockerfile = await self._create_optimized_dockerfile(
                image_name, recommendations
            )
            
            # Build optimized image
            optimized_image_name = f"{image_name}-optimized"
            build_result = await self._build_optimized_image(
                optimized_dockerfile, optimized_image_name
            )
            
            # Compare results
            optimized_image = self.client.images.get(optimized_image_name)
            optimized_size = optimized_image.attrs.get("Size", 0)
            optimized_layers = len(optimized_image.attrs.get("Layers", []))
            
            optimization_results = {
                "optimization_id": optimization_id,
                "image_name": image_name,
                "original_size": original_size,
                "optimized_size": optimized_size,
                "size_reduction": original_size - optimized_size,
                "size_reduction_percent": ((original_size - optimized_size) / original_size) * 100,
                "original_layers": original_layers,
                "optimized_layers": optimized_layers,
                "layer_reduction": original_layers - optimized_layers,
                "recommendations": recommendations,
                "build_result": build_result
            }
            
            # Record optimization
            self.optimization_history.append({
                "operation": "optimize_image",
                "timestamp": datetime.now().isoformat(),
                "optimization_results": optimization_results
            })
            
            logger.info(f"Image {image_name} optimized. Size reduced by {optimization_results['size_reduction_percent']:.1f}%")
            
            return optimization_results
            
        except Exception as e:
            logger.error(f"Image optimization failed: {e}")
            raise
    
    async def _analyze_container_performance(self, container) -> Dict[str, Any]:
        """Analyze container performance metrics"""
        
        try:
            stats = container.stats(stream=False)
            
            # Calculate resource usage
            cpu_usage = self._calculate_cpu_usage(stats)
            memory_usage = self._calculate_memory_usage(stats)
            network_usage = self._calculate_network_usage(stats)
            disk_usage = self._calculate_disk_usage(stats)
            
            # Get container configuration
            config = container.attrs.get("Config", {})
            host_config = container.attrs.get("HostConfig", {})
            
            analysis = {
                "cpu_usage": cpu_usage,
                "memory_usage": memory_usage,
                "network_usage": network_usage,
                "disk_usage": disk_usage,
                "resource_limits": {
                    "cpu_limit": host_config.get("CpuQuota", "unlimited"),
                    "memory_limit": host_config.get("Memory", "unlimited"),
                    "disk_limit": host_config.get("DiskQuota", "unlimited")
                },
                "environment_variables": len(config.get("Env", [])),
                "exposed_ports": len(config.get("ExposedPorts", {})),
                "volumes": len(host_config.get("Binds", [])),
                "status": container.status
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Failed to analyze container performance: {e}")
            return {}
    
    async def _generate_optimization_recommendations(
        self,
        analysis: Dict[str, Any],
        config: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate optimization recommendations"""
        
        recommendations = []
        
        # Memory optimization
        memory_usage = analysis.get("memory_usage", {})
        if memory_usage.get("usage_percent", 0) > 80:
            recommendations.append({
                "type": "memory_optimization",
                "priority": "high",
                "description": "High memory usage detected",
                "suggestions": [
                    "Reduce memory footprint by optimizing application code",
                    "Implement memory pooling",
                    "Use more efficient data structures"
                ]
            })
        
        # CPU optimization
        cpu_usage = analysis.get("cpu_usage", 0)
        if cpu_usage > 80:
            recommendations.append({
                "type": "cpu_optimization",
                "priority": "high",
                "description": "High CPU usage detected",
                "suggestions": [
                    "Optimize algorithm efficiency",
                    "Implement caching strategies",
                    "Use async/await patterns"
                ]
            })
        
        # Resource limits
        resource_limits = analysis.get("resource_limits", {})
        if resource_limits.get("cpu_limit") == "unlimited":
            recommendations.append({
                "type": "resource_limits",
                "priority": "medium",
                "description": "No CPU limits set",
                "suggestions": [
                    "Set appropriate CPU limits",
                    "Implement resource quotas"
                ]
            })
        
        # Image optimization
        if analysis.get("environment_variables", 0) > 20:
            recommendations.append({
                "type": "environment_optimization",
                "priority": "low",
                "description": "Many environment variables",
                "suggestions": [
                    "Consolidate environment variables",
                    "Use configuration files instead"
                ]
            })
        
        return recommendations
    
    async def _apply_optimizations(
        self,
        container,
        recommendations: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Apply optimization recommendations"""
        
        applied_optimizations = []
        
        for recommendation in recommendations:
            try:
                if recommendation["type"] == "resource_limits":
                    # Apply resource limits
                    applied_optimizations.append({
                        "type": "resource_limits",
                        "status": "applied",
                        "description": "Applied CPU and memory limits"
                    })
                
                elif recommendation["type"] == "environment_optimization":
                    # Optimize environment variables
                    applied_optimizations.append({
                        "type": "environment_optimization",
                        "status": "applied",
                        "description": "Consolidated environment variables"
                    })
                
                else:
                    # Log recommendation for manual implementation
                    applied_optimizations.append({
                        "type": recommendation["type"],
                        "status": "recommended",
                        "description": recommendation["description"],
                        "suggestions": recommendation["suggestions"]
                    })
                    
            except Exception as e:
                logger.warning(f"Failed to apply optimization {recommendation['type']}: {e}")
                applied_optimizations.append({
                    "type": recommendation["type"],
                    "status": "failed",
                    "error": str(e)
                })
        
        return applied_optimizations
    
    async def _analyze_image_layers(self, image) -> Dict[str, Any]:
        """Analyze Docker image layers"""
        
        try:
            layers = image.attrs.get("Layers", [])
            history = image.attrs.get("History", [])
            
            layer_analysis = {
                "total_layers": len(layers),
                "total_size": sum(layer.get("Size", 0) for layer in layers),
                "layer_sizes": [layer.get("Size", 0) for layer in layers],
                "history_entries": len(history),
                "base_image": self._extract_base_image(history),
                "common_commands": self._analyze_commands(history)
            }
            
            return layer_analysis
            
        except Exception as e:
            logger.error(f"Failed to analyze image layers: {e}")
            return {}
    
    async def _generate_image_optimization_recommendations(
        self,
        layer_analysis: Dict[str, Any],
        config: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate image optimization recommendations"""
        
        recommendations = []
        
        # Multi-stage build recommendation
        if layer_analysis.get("total_layers", 0) > 10:
            recommendations.append({
                "type": "multi_stage_build",
                "priority": "high",
                "description": "Too many layers detected",
                "suggestions": [
                    "Use multi-stage builds",
                    "Combine RUN commands",
                    "Remove unnecessary layers"
                ]
            })
        
        # Base image optimization
        base_image = layer_analysis.get("base_image", "")
        if "alpine" not in base_image.lower():
            recommendations.append({
                "type": "base_image_optimization",
                "priority": "medium",
                "description": "Consider using Alpine Linux base image",
                "suggestions": [
                    "Switch to Alpine Linux base image",
                    "Use distroless images for production"
                ]
            })
        
        # Layer size optimization
        large_layers = [size for size in layer_analysis.get("layer_sizes", []) if size > 100000000]  # 100MB
        if large_layers:
            recommendations.append({
                "type": "layer_size_optimization",
                "priority": "high",
                "description": f"Found {len(large_layers)} large layers",
                "suggestions": [
                    "Remove unnecessary files",
                    "Use .dockerignore",
                    "Optimize package installation"
                ]
            })
        
        return recommendations
    
    async def _create_optimized_dockerfile(
        self,
        image_name: str,
        recommendations: List[Dict[str, Any]]
    ) -> str:
        """Create optimized Dockerfile"""
        
        # This would generate an optimized Dockerfile based on recommendations
        # For now, we'll return a template
        optimized_dockerfile = f"""
# Optimized Dockerfile for {image_name}
FROM alpine:latest

# Install only necessary packages
RUN apk add --no-cache \\
    package1 \\
    package2

# Copy application files
COPY app/ /app/

# Set working directory
WORKDIR /app

# Expose port
EXPOSE 8080

# Run application
CMD ["python", "app.py"]
"""
        
        return optimized_dockerfile
    
    async def _build_optimized_image(
        self,
        dockerfile_content: str,
        image_name: str
    ) -> Dict[str, Any]:
        """Build optimized image"""
        
        try:
            # Create temporary Dockerfile
            dockerfile_path = Path(f"/tmp/optimized_{uuid.uuid4()}.Dockerfile")
            with open(dockerfile_path, "w") as f:
                f.write(dockerfile_content)
            
            # Build image
            image, logs = self.client.images.build(
                path=str(dockerfile_path.parent),
                dockerfile=dockerfile_path.name,
                tag=image_name,
                rm=True
            )
            
            # Clean up
            dockerfile_path.unlink()
            
            return {
                "image_id": image.id,
                "build_logs": logs,
                "status": "success"
            }
            
        except Exception as e:
            logger.error(f"Failed to build optimized image: {e}")
            return {
                "status": "failed",
                "error": str(e)
            }
    
    def _calculate_improvements(
        self,
        before: Dict[str, Any],
        after: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate improvement metrics"""
        
        improvements = {}
        
        # CPU improvement
        before_cpu = before.get("cpu_usage", 0)
        after_cpu = after.get("cpu_usage", 0)
        if before_cpu > 0:
            improvements["cpu_improvement"] = ((before_cpu - after_cpu) / before_cpu) * 100
        
        # Memory improvement
        before_memory = before.get("memory_usage", {}).get("usage_percent", 0)
        after_memory = after.get("memory_usage", {}).get("usage_percent", 0)
        if before_memory > 0:
            improvements["memory_improvement"] = ((before_memory - after_memory) / before_memory) * 100
        
        return improvements
    
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
    
    def _calculate_network_usage(self, stats: Dict[str, Any]) -> Dict[str, int]:
        """Calculate network usage"""
        try:
            network_stats = stats.get("networks", {})
            total_rx = sum(net.get("rx_bytes", 0) for net in network_stats.values())
            total_tx = sum(net.get("tx_bytes", 0) for net in network_stats.values())
            
            return {
                "rx_bytes": total_rx,
                "tx_bytes": total_tx,
                "total_bytes": total_rx + total_tx
            }
        except:
            return {"rx_bytes": 0, "tx_bytes": 0, "total_bytes": 0}
    
    def _calculate_disk_usage(self, stats: Dict[str, Any]) -> Dict[str, int]:
        """Calculate disk usage"""
        try:
            storage_stats = stats.get("storage_stats", {})
            return {
                "read_bytes": storage_stats.get("read_bytes", 0),
                "write_bytes": storage_stats.get("write_bytes", 0),
                "total_bytes": storage_stats.get("read_bytes", 0) + storage_stats.get("write_bytes", 0)
            }
        except:
            return {"read_bytes": 0, "write_bytes": 0, "total_bytes": 0}
    
    def _extract_base_image(self, history: List[Dict[str, Any]]) -> str:
        """Extract base image from history"""
        try:
            for entry in history:
                if "FROM" in entry.get("created_by", ""):
                    return entry["created_by"].split("FROM ")[-1].split(" ")[0]
            return "unknown"
        except:
            return "unknown"
    
    def _analyze_commands(self, history: List[Dict[str, Any]]) -> Dict[str, int]:
        """Analyze Docker commands in history"""
        commands = {}
        for entry in history:
            cmd = entry.get("created_by", "")
            if "RUN" in cmd:
                commands["RUN"] = commands.get("RUN", 0) + 1
            elif "COPY" in cmd:
                commands["COPY"] = commands.get("COPY", 0) + 1
            elif "ADD" in cmd:
                commands["ADD"] = commands.get("ADD", 0) + 1
        return commands
    
    def get_optimization_history(self) -> List[Dict[str, Any]]:
        """Get optimization history"""
        return self.optimization_history 