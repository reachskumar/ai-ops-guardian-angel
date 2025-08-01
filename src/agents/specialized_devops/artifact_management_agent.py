"""
Artifact Management Agent
Binary and artifact lifecycle management with advanced features
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
import json
import logging
from pathlib import Path

from agents.base_agent import BaseAgent, AgentTask, AgentCapabilities, AgentRecommendation
from tools.artifacts.artifact_manager import ArtifactManager
from tools.artifacts.version_control import VersionControl
from tools.artifacts.distribution import ArtifactDistribution

logger = logging.getLogger(__name__)


class ArtifactManagementAgent(BaseAgent):
    """
    Advanced Artifact Management Agent for binary and artifact lifecycle management
    """
    
    def __init__(self):
        super().__init__(
            name="Artifact Management Agent",
            description="Binary and artifact lifecycle management with advanced features",
            capabilities=[
                AgentCapabilities.ARTIFACT_MANAGEMENT,
                AgentCapabilities.VERSION_CONTROL,
                AgentCapabilities.ARTIFACT_DISTRIBUTION,
                AgentCapabilities.ARTIFACT_SECURITY,
                AgentCapabilities.ARTIFACT_OPTIMIZATION
            ]
        )
        
        self.artifact_manager = ArtifactManager()
        self.version_control = VersionControl()
        self.distribution = ArtifactDistribution()
        self.artifact_history = []
        
    async def process_task(self, task: AgentTask) -> AgentRecommendation:
        """Process artifact management tasks"""
        
        try:
            if task.task_type == "upload_artifact":
                return await self._upload_artifact(task)
            elif task.task_type == "download_artifact":
                return await self._download_artifact(task)
            elif task.task_type == "version_artifact":
                return await self._version_artifact(task)
            elif task.task_type == "distribute_artifact":
                return await self._distribute_artifact(task)
            elif task.task_type == "scan_artifact":
                return await self._scan_artifact(task)
            elif task.task_type == "optimize_artifact":
                return await self._optimize_artifact(task)
            elif task.task_type == "cleanup_artifacts":
                return await self._cleanup_artifacts(task)
            else:
                return AgentRecommendation(
                    success=False,
                    message=f"Unknown task type: {task.task_type}",
                    data={}
                )
                
        except Exception as e:
            logger.error(f"Error in ArtifactManagementAgent: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Artifact management error: {str(e)}",
                data={}
            )
    
    async def _upload_artifact(self, task: AgentTask) -> AgentRecommendation:
        """Upload artifact to repository"""
        
        try:
            artifact_path = task.data.get("artifact_path")
            artifact_name = task.data.get("artifact_name")
            artifact_type = task.data.get("artifact_type", "binary")
            metadata = task.data.get("metadata", {})
            
            # Upload artifact
            upload_info = await self.artifact_manager.upload_artifact(
                artifact_path=artifact_path,
                artifact_name=artifact_name,
                artifact_type=artifact_type,
                metadata=metadata
            )
            
            # Record upload
            upload_record = {
                "artifact_name": artifact_name,
                "artifact_id": upload_info["artifact_id"],
                "artifact_type": artifact_type,
                "file_size": upload_info.get("file_size"),
                "upload_date": datetime.now().isoformat(),
                "repository": upload_info.get("repository")
            }
            
            self.artifact_history.append(upload_record)
            
            return AgentRecommendation(
                success=True,
                message=f"Artifact {artifact_name} uploaded successfully",
                data={
                    "artifact_id": upload_info["artifact_id"],
                    "artifact_name": artifact_name,
                    "file_size": upload_info.get("file_size"),
                    "repository_url": upload_info.get("repository_url"),
                    "checksum": upload_info.get("checksum")
                }
            )
            
        except Exception as e:
            logger.error(f"Artifact upload error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Artifact upload failed: {str(e)}",
                data={}
            )
    
    async def _download_artifact(self, task: AgentTask) -> AgentRecommendation:
        """Download artifact from repository"""
        
        try:
            artifact_id = task.data.get("artifact_id")
            download_path = task.data.get("download_path")
            download_config = task.data.get("download_config", {})
            
            # Download artifact
            download_info = await self.artifact_manager.download_artifact(
                artifact_id=artifact_id,
                download_path=download_path,
                download_config=download_config
            )
            
            return AgentRecommendation(
                success=True,
                message=f"Artifact {artifact_id} downloaded successfully",
                data={
                    "artifact_id": artifact_id,
                    "download_path": download_path,
                    "file_size": download_info.get("file_size"),
                    "download_time": download_info.get("download_time"),
                    "checksum_verified": download_info.get("checksum_verified", False)
                }
            )
            
        except Exception as e:
            logger.error(f"Artifact download error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Artifact download failed: {str(e)}",
                data={}
            )
    
    async def _version_artifact(self, task: AgentTask) -> AgentRecommendation:
        """Create new version of artifact"""
        
        try:
            artifact_id = task.data.get("artifact_id")
            version_info = task.data.get("version_info", {})
            version_strategy = task.data.get("version_strategy", "semantic")
            
            # Version artifact
            version_info = await self.version_control.create_version(
                artifact_id=artifact_id,
                version_info=version_info,
                version_strategy=version_strategy
            )
            
            return AgentRecommendation(
                success=True,
                message=f"Artifact {artifact_id} versioned successfully",
                data={
                    "artifact_id": artifact_id,
                    "new_version": version_info["new_version"],
                    "version_strategy": version_strategy,
                    "changelog": version_info.get("changelog", ""),
                    "version_date": datetime.now().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Artifact versioning error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Artifact versioning failed: {str(e)}",
                data={}
            )
    
    async def _distribute_artifact(self, task: AgentTask) -> AgentRecommendation:
        """Distribute artifact to multiple locations"""
        
        try:
            artifact_id = task.data.get("artifact_id")
            distribution_targets = task.data.get("distribution_targets", [])
            distribution_config = task.data.get("distribution_config", {})
            
            # Distribute artifact
            distribution_info = await self.distribution.distribute_artifact(
                artifact_id=artifact_id,
                distribution_targets=distribution_targets,
                distribution_config=distribution_config
            )
            
            return AgentRecommendation(
                success=True,
                message=f"Artifact {artifact_id} distributed successfully",
                data={
                    "artifact_id": artifact_id,
                    "distribution_id": distribution_info["distribution_id"],
                    "targets_count": len(distribution_targets),
                    "successful_distributions": distribution_info.get("successful_distributions", 0),
                    "failed_distributions": distribution_info.get("failed_distributions", 0)
                }
            )
            
        except Exception as e:
            logger.error(f"Artifact distribution error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Artifact distribution failed: {str(e)}",
                data={}
            )
    
    async def _scan_artifact(self, task: AgentTask) -> AgentRecommendation:
        """Scan artifact for security vulnerabilities"""
        
        try:
            artifact_id = task.data.get("artifact_id")
            scan_config = task.data.get("scan_config", {})
            
            # Scan artifact
            scan_results = await self.artifact_manager.scan_artifact(
                artifact_id=artifact_id,
                scan_config=scan_config
            )
            
            return AgentRecommendation(
                success=True,
                message="Artifact security scan completed",
                data={
                    "artifact_id": artifact_id,
                    "scan_results": scan_results,
                    "vulnerabilities": scan_results.get("vulnerabilities", []),
                    "security_score": scan_results.get("security_score", 0),
                    "recommendations": scan_results.get("recommendations", [])
                }
            )
            
        except Exception as e:
            logger.error(f"Artifact scan error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Artifact scan failed: {str(e)}",
                data={}
            )
    
    async def _optimize_artifact(self, task: AgentTask) -> AgentRecommendation:
        """Optimize artifact size and performance"""
        
        try:
            artifact_id = task.data.get("artifact_id")
            optimization_config = task.data.get("optimization_config", {})
            
            # Optimize artifact
            optimization_results = await self.artifact_manager.optimize_artifact(
                artifact_id=artifact_id,
                optimization_config=optimization_config
            )
            
            return AgentRecommendation(
                success=True,
                message="Artifact optimization completed",
                data={
                    "artifact_id": artifact_id,
                    "optimization_results": optimization_results,
                    "size_reduction": optimization_results.get("size_reduction", 0),
                    "performance_improvement": optimization_results.get("performance_improvement", 0),
                    "optimization_suggestions": optimization_results.get("suggestions", [])
                }
            )
            
        except Exception as e:
            logger.error(f"Artifact optimization error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Artifact optimization failed: {str(e)}",
                data={}
            )
    
    async def _cleanup_artifacts(self, task: AgentTask) -> AgentRecommendation:
        """Clean up old or unused artifacts"""
        
        try:
            cleanup_config = task.data.get("cleanup_config", {})
            retention_policy = task.data.get("retention_policy", {})
            
            # Cleanup artifacts
            cleanup_results = await self.artifact_manager.cleanup_artifacts(
                cleanup_config=cleanup_config,
                retention_policy=retention_policy
            )
            
            return AgentRecommendation(
                success=True,
                message="Artifact cleanup completed",
                data={
                    "cleanup_results": cleanup_results,
                    "artifacts_removed": cleanup_results.get("artifacts_removed", 0),
                    "space_freed": cleanup_results.get("space_freed", 0),
                    "retention_policy_applied": cleanup_results.get("retention_policy_applied", {})
                }
            )
            
        except Exception as e:
            logger.error(f"Artifact cleanup error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Artifact cleanup failed: {str(e)}",
                data={}
            )
    
    def get_artifact_history(self) -> List[Dict]:
        """Get artifact operation history"""
        return self.artifact_history
    
    def get_artifact_info(self, artifact_id: str) -> Optional[Dict]:
        """Get information about a specific artifact"""
        for record in self.artifact_history:
            if record["artifact_id"] == artifact_id:
                return {
                    "artifact_id": artifact_id,
                    "artifact_name": record["artifact_name"],
                    "artifact_type": record["artifact_type"],
                    "file_size": record.get("file_size"),
                    "upload_date": record["upload_date"],
                    "repository": record.get("repository")
                }
        return None 