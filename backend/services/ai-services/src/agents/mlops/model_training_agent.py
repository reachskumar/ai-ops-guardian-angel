"""
Model Training Agent
Automated ML model training and deployment with advanced features
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
import json
import logging
from pathlib import Path

from ..base_agent import BaseAgent, AgentTask, AgentCapabilities, AgentRecommendation
from ...config.settings import AgentType
from ...tools.ml.model_trainer import ModelTrainer
from ...tools.ml.data_processor import DataProcessor
from ...tools.ml.model_evaluator import ModelEvaluator

logger = logging.getLogger(__name__)


class ModelTrainingAgent(BaseAgent):
    """
    Advanced Model Training Agent for automated ML pipeline management
    """
    
    def __init__(self):
        capabilities = AgentCapabilities(
            supported_tasks=["train_model", "deploy_model", "tune_hyperparameters", "feature_engineering", "model_versioning"],
            required_tools=["model_trainer", "data_processor", "model_evaluator"],
            max_concurrent_tasks=3,
            average_response_time=45.0
        )
        
        super().__init__(
            agent_type=AgentType.MODEL_TRAINING,
            name="Model Training Agent",
            description="Automated ML model training and deployment with advanced features",
            capabilities=capabilities
        )
        
        self.model_trainer = ModelTrainer()
        self.data_processor = DataProcessor()
        self.model_evaluator = ModelEvaluator()
        self.training_history = []
        
    async def process_task(self, task: AgentTask) -> AgentRecommendation:
        """Process ML training tasks"""
        
        try:
            if task.task_type == "train_model":
                return await self._train_model(task)
            elif task.task_type == "deploy_model":
                return await self._deploy_model(task)
            elif task.task_type == "hyperparameter_tuning":
                return await self._tune_hyperparameters(task)
            elif task.task_type == "feature_engineering":
                return await self._engineer_features(task)
            elif task.task_type == "model_evaluation":
                return await self._evaluate_model(task)
            else:
                return AgentRecommendation(
                    success=False,
                    message=f"Unknown task type: {task.task_type}",
                    data={}
                )
                
        except Exception as e:
            logger.error(f"Error in ModelTrainingAgent: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Training error: {str(e)}",
                data={}
            )
    
    async def _train_model(self, task: AgentTask) -> AgentRecommendation:
        """Train a new ML model"""
        
        try:
            # Extract training parameters
            model_config = task.data.get("model_config", {})
            training_data = task.data.get("training_data")
            validation_data = task.data.get("validation_data")
            
            # Preprocess data
            processed_data = await self.data_processor.preprocess_data(
                training_data, 
                validation_data,
                model_config.get("preprocessing", {})
            )
            
            # Train model
            model_info = await self.model_trainer.train_model(
                model_type=model_config.get("model_type", "random_forest"),
                training_data=processed_data["train"],
                validation_data=processed_data["validation"],
                hyperparameters=model_config.get("hyperparameters", {}),
                training_config=model_config.get("training_config", {})
            )
            
            # Evaluate model
            evaluation_results = await self.model_evaluator.evaluate_model(
                model=model_info["model"],
                test_data=processed_data.get("test"),
                metrics=model_config.get("evaluation_metrics", ["accuracy", "precision", "recall", "f1"])
            )
            
            # Save training record
            training_record = {
                "model_id": model_info["model_id"],
                "model_type": model_config.get("model_type"),
                "training_date": datetime.now().isoformat(),
                "performance_metrics": evaluation_results,
                "hyperparameters": model_config.get("hyperparameters", {}),
                "data_info": {
                    "training_samples": len(processed_data["train"]),
                    "validation_samples": len(processed_data["validation"]),
                    "features": len(processed_data["train"].columns) if hasattr(processed_data["train"], 'columns') else 0
                }
            }
            
            self.training_history.append(training_record)
            
            return AgentRecommendation(
                success=True,
                message=f"Model {model_info['model_id']} trained successfully",
                data={
                    "model_id": model_info["model_id"],
                    "model_path": model_info["model_path"],
                    "performance_metrics": evaluation_results,
                    "training_record": training_record
                }
            )
            
        except Exception as e:
            logger.error(f"Model training error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Training failed: {str(e)}",
                data={}
            )
    
    async def _deploy_model(self, task: AgentTask) -> AgentRecommendation:
        """Deploy a trained model"""
        
        try:
            model_id = task.data.get("model_id")
            deployment_config = task.data.get("deployment_config", {})
            
            # Deploy model
            deployment_info = await self.model_trainer.deploy_model(
                model_id=model_id,
                deployment_type=deployment_config.get("deployment_type", "api"),
                deployment_config=deployment_config
            )
            
            return AgentRecommendation(
                success=True,
                message=f"Model {model_id} deployed successfully",
                data={
                    "deployment_id": deployment_info["deployment_id"],
                    "endpoint_url": deployment_info.get("endpoint_url"),
                    "deployment_status": deployment_info["status"]
                }
            )
            
        except Exception as e:
            logger.error(f"Model deployment error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Deployment failed: {str(e)}",
                data={}
            )
    
    async def _tune_hyperparameters(self, task: AgentTask) -> AgentRecommendation:
        """Perform hyperparameter tuning"""
        
        try:
            model_config = task.data.get("model_config", {})
            tuning_config = task.data.get("tuning_config", {})
            
            # Perform hyperparameter tuning
            best_params = await self.model_trainer.tune_hyperparameters(
                model_type=model_config.get("model_type"),
                training_data=task.data.get("training_data"),
                validation_data=task.data.get("validation_data"),
                param_grid=tuning_config.get("param_grid", {}),
                cv_folds=tuning_config.get("cv_folds", 5),
                n_iter=tuning_config.get("n_iter", 100)
            )
            
            return AgentRecommendation(
                success=True,
                message="Hyperparameter tuning completed",
                data={
                    "best_hyperparameters": best_params,
                    "tuning_config": tuning_config
                }
            )
            
        except Exception as e:
            logger.error(f"Hyperparameter tuning error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Tuning failed: {str(e)}",
                data={}
            )
    
    async def _engineer_features(self, task: AgentTask) -> AgentRecommendation:
        """Perform automated feature engineering"""
        
        try:
            data = task.data.get("data")
            feature_config = task.data.get("feature_config", {})
            
            # Engineer features
            engineered_features = await self.data_processor.engineer_features(
                data=data,
                feature_config=feature_config
            )
            
            return AgentRecommendation(
                success=True,
                message="Feature engineering completed",
                data={
                    "engineered_features": engineered_features,
                    "feature_importance": engineered_features.get("feature_importance", {}),
                    "feature_count": len(engineered_features.get("features", []))
                }
            )
            
        except Exception as e:
            logger.error(f"Feature engineering error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Feature engineering failed: {str(e)}",
                data={}
            )
    
    async def _evaluate_model(self, task: AgentTask) -> AgentRecommendation:
        """Evaluate a trained model"""
        
        try:
            model_id = task.data.get("model_id")
            test_data = task.data.get("test_data")
            evaluation_metrics = task.data.get("evaluation_metrics", ["accuracy", "precision", "recall", "f1"])
            
            # Load and evaluate model
            evaluation_results = await self.model_evaluator.evaluate_model(
                model_id=model_id,
                test_data=test_data,
                metrics=evaluation_metrics
            )
            
            return AgentRecommendation(
                success=True,
                message="Model evaluation completed",
                data={
                    "model_id": model_id,
                    "evaluation_results": evaluation_results,
                    "evaluation_date": datetime.now().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Model evaluation error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Evaluation failed: {str(e)}",
                data={}
            )
    
    def get_training_history(self) -> List[Dict]:
        """Get training history"""
        return self.training_history
    
    def get_model_performance(self, model_id: str) -> Optional[Dict]:
        """Get performance metrics for a specific model"""
        for record in self.training_history:
            if record["model_id"] == model_id:
                return record["performance_metrics"]
        return None 