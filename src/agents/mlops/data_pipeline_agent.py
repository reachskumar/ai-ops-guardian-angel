"""
Data Pipeline Agent
ETL and data processing automation with advanced features
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
import json
import logging
from pathlib import Path

from agents.base_agent import BaseAgent, AgentTask, AgentCapabilities, AgentRecommendation
from tools.ml.data_processor import DataProcessor
from tools.ml.pipeline_orchestrator import PipelineOrchestrator
from tools.ml.data_validator import DataValidator

logger = logging.getLogger(__name__)


class DataPipelineAgent(BaseAgent):
    """
    Advanced Data Pipeline Agent for ETL and data processing automation
    """
    
    def __init__(self):
        super().__init__(
            name="Data Pipeline Agent",
            description="ETL and data processing automation with advanced features",
            capabilities=[
                AgentCapabilities.DATA_PROCESSING,
                AgentCapabilities.ETL_AUTOMATION,
                AgentCapabilities.DATA_VALIDATION,
                AgentCapabilities.DATA_TRANSFORMATION,
                AgentCapabilities.PIPELINE_ORCHESTRATION
            ]
        )
        
        self.data_processor = DataProcessor()
        self.pipeline_orchestrator = PipelineOrchestrator()
        self.data_validator = DataValidator()
        self.pipeline_history = []
        
    async def process_task(self, task: AgentTask) -> AgentRecommendation:
        """Process data pipeline tasks"""
        
        try:
            if task.task_type == "create_pipeline":
                return await self._create_pipeline(task)
            elif task.task_type == "run_pipeline":
                return await self._run_pipeline(task)
            elif task.task_type == "validate_data":
                return await self._validate_data(task)
            elif task.task_type == "transform_data":
                return await self._transform_data(task)
            elif task.task_type == "schedule_pipeline":
                return await self._schedule_pipeline(task)
            elif task.task_type == "monitor_pipeline":
                return await self._monitor_pipeline(task)
            else:
                return AgentRecommendation(
                    success=False,
                    message=f"Unknown task type: {task.task_type}",
                    data={}
                )
                
        except Exception as e:
            logger.error(f"Error in DataPipelineAgent: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Pipeline error: {str(e)}",
                data={}
            )
    
    async def _create_pipeline(self, task: AgentTask) -> AgentRecommendation:
        """Create a new data pipeline"""
        
        try:
            pipeline_config = task.data.get("pipeline_config", {})
            data_sources = task.data.get("data_sources", [])
            transformations = task.data.get("transformations", [])
            output_config = task.data.get("output_config", {})
            
            # Create pipeline
            pipeline_info = await self.pipeline_orchestrator.create_pipeline(
                name=pipeline_config.get("name", "default_pipeline"),
                description=pipeline_config.get("description", ""),
                data_sources=data_sources,
                transformations=transformations,
                output_config=output_config,
                schedule=pipeline_config.get("schedule"),
                validation_rules=pipeline_config.get("validation_rules", [])
            )
            
            return AgentRecommendation(
                success=True,
                message=f"Pipeline {pipeline_info['pipeline_id']} created successfully",
                data={
                    "pipeline_id": pipeline_info["pipeline_id"],
                    "pipeline_config": pipeline_info["config"],
                    "status": pipeline_info["status"]
                }
            )
            
        except Exception as e:
            logger.error(f"Pipeline creation error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Pipeline creation failed: {str(e)}",
                data={}
            )
    
    async def _run_pipeline(self, task: AgentTask) -> AgentRecommendation:
        """Run a data pipeline"""
        
        try:
            pipeline_id = task.data.get("pipeline_id")
            run_config = task.data.get("run_config", {})
            
            # Run pipeline
            run_info = await self.pipeline_orchestrator.run_pipeline(
                pipeline_id=pipeline_id,
                run_config=run_config
            )
            
            # Record pipeline run
            run_record = {
                "pipeline_id": pipeline_id,
                "run_id": run_info["run_id"],
                "start_time": run_info["start_time"],
                "end_time": run_info.get("end_time"),
                "status": run_info["status"],
                "records_processed": run_info.get("records_processed", 0),
                "errors": run_info.get("errors", [])
            }
            
            self.pipeline_history.append(run_record)
            
            return AgentRecommendation(
                success=True,
                message=f"Pipeline {pipeline_id} run completed",
                data={
                    "run_id": run_info["run_id"],
                    "status": run_info["status"],
                    "records_processed": run_info.get("records_processed", 0),
                    "execution_time": run_info.get("execution_time", 0)
                }
            )
            
        except Exception as e:
            logger.error(f"Pipeline run error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Pipeline run failed: {str(e)}",
                data={}
            )
    
    async def _validate_data(self, task: AgentTask) -> AgentTask:
        """Validate data quality"""
        
        try:
            data = task.data.get("data")
            validation_rules = task.data.get("validation_rules", [])
            validation_config = task.data.get("validation_config", {})
            
            # Validate data
            validation_results = await self.data_validator.validate_data(
                data=data,
                validation_rules=validation_rules,
                validation_config=validation_config
            )
            
            return AgentRecommendation(
                success=True,
                message="Data validation completed",
                data={
                    "validation_results": validation_results,
                    "quality_score": validation_results.get("quality_score", 0),
                    "issues_found": len(validation_results.get("issues", [])),
                    "validation_date": datetime.now().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Data validation error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Data validation failed: {str(e)}",
                data={}
            )
    
    async def _transform_data(self, task: AgentTask) -> AgentRecommendation:
        """Transform data according to specifications"""
        
        try:
            data = task.data.get("data")
            transformations = task.data.get("transformations", [])
            transformation_config = task.data.get("transformation_config", {})
            
            # Transform data
            transformed_data = await self.data_processor.transform_data(
                data=data,
                transformations=transformations,
                transformation_config=transformation_config
            )
            
            return AgentRecommendation(
                success=True,
                message="Data transformation completed",
                data={
                    "transformed_data": transformed_data,
                    "transformation_count": len(transformations),
                    "transformation_date": datetime.now().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Data transformation error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Data transformation failed: {str(e)}",
                data={}
            )
    
    async def _schedule_pipeline(self, task: AgentTask) -> AgentRecommendation:
        """Schedule a pipeline for regular execution"""
        
        try:
            pipeline_id = task.data.get("pipeline_id")
            schedule_config = task.data.get("schedule_config", {})
            
            # Schedule pipeline
            schedule_info = await self.pipeline_orchestrator.schedule_pipeline(
                pipeline_id=pipeline_id,
                schedule_config=schedule_config
            )
            
            return AgentRecommendation(
                success=True,
                message=f"Pipeline {pipeline_id} scheduled successfully",
                data={
                    "schedule_id": schedule_info["schedule_id"],
                    "next_run": schedule_info.get("next_run"),
                    "schedule_config": schedule_config
                }
            )
            
        except Exception as e:
            logger.error(f"Pipeline scheduling error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Pipeline scheduling failed: {str(e)}",
                data={}
            )
    
    async def _monitor_pipeline(self, task: AgentTask) -> AgentRecommendation:
        """Monitor pipeline execution and health"""
        
        try:
            pipeline_id = task.data.get("pipeline_id")
            monitoring_config = task.data.get("monitoring_config", {})
            
            # Monitor pipeline
            monitoring_results = await self.pipeline_orchestrator.monitor_pipeline(
                pipeline_id=pipeline_id,
                monitoring_config=monitoring_config
            )
            
            return AgentRecommendation(
                success=True,
                message="Pipeline monitoring completed",
                data={
                    "pipeline_id": pipeline_id,
                    "monitoring_results": monitoring_results,
                    "health_status": monitoring_results.get("health_status", "unknown"),
                    "last_run": monitoring_results.get("last_run"),
                    "success_rate": monitoring_results.get("success_rate", 0)
                }
            )
            
        except Exception as e:
            logger.error(f"Pipeline monitoring error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Pipeline monitoring failed: {str(e)}",
                data={}
            )
    
    def get_pipeline_history(self) -> List[Dict]:
        """Get pipeline execution history"""
        return self.pipeline_history
    
    def get_pipeline_status(self, pipeline_id: str) -> Optional[Dict]:
        """Get status of a specific pipeline"""
        for record in self.pipeline_history:
            if record["pipeline_id"] == pipeline_id:
                return {
                    "pipeline_id": pipeline_id,
                    "last_run": record["start_time"],
                    "status": record["status"],
                    "records_processed": record["records_processed"]
                }
        return None 