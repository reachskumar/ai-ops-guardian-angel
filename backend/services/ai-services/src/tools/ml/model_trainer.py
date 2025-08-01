"""
Model Trainer Tool
Handles ML model training, deployment, and lifecycle management
"""

import asyncio
import json
import logging
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
import pickle
import joblib

# ML Libraries
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, mean_squared_error
from sklearn.preprocessing import StandardScaler, LabelEncoder

logger = logging.getLogger(__name__)


class ModelTrainer:
    """
    Advanced ML model trainer with comprehensive training and deployment capabilities
    """
    
    def __init__(self):
        self.models_dir = Path("models")
        self.models_dir.mkdir(exist_ok=True)
        self.model_registry = {}
        self.training_history = []
        
    async def train_model(
        self,
        model_type: str = "random_forest",
        training_data: pd.DataFrame = None,
        validation_data: pd.DataFrame = None,
        hyperparameters: Dict[str, Any] = None,
        training_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Train a new ML model"""
        
        try:
            model_id = str(uuid.uuid4())
            model_info = {
                "model_id": model_id,
                "model_type": model_type,
                "training_date": datetime.now().isoformat(),
                "hyperparameters": hyperparameters or {},
                "training_config": training_config or {}
            }
            
            # Prepare data
            if training_data is not None:
                X_train, y_train = self._prepare_data(training_data)
                X_val, y_val = self._prepare_data(validation_data) if validation_data is not None else (None, None)
            else:
                # Generate synthetic data for demonstration
                X_train, y_train, X_val, y_val = self._generate_synthetic_data()
            
            # Initialize model
            model = self._create_model(model_type, hyperparameters)
            
            # Train model
            logger.info(f"Training {model_type} model {model_id}")
            model.fit(X_train, y_train)
            
            # Evaluate model
            train_score = model.score(X_train, y_train)
            val_score = model.score(X_val, y_val) if X_val is not None else None
            
            # Save model
            model_path = self.models_dir / f"{model_id}.joblib"
            joblib.dump(model, model_path)
            
            # Update model info
            model_info.update({
                "model_path": str(model_path),
                "train_score": train_score,
                "val_score": val_score,
                "features_count": X_train.shape[1],
                "training_samples": X_train.shape[0],
                "validation_samples": X_val.shape[0] if X_val is not None else 0
            })
            
            # Register model
            self.model_registry[model_id] = model_info
            self.training_history.append(model_info)
            
            logger.info(f"Model {model_id} trained successfully. Train score: {train_score:.4f}")
            
            return model_info
            
        except Exception as e:
            logger.error(f"Model training failed: {e}")
            raise
    
    async def deploy_model(
        self,
        model_id: str,
        deployment_type: str = "api",
        deployment_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Deploy a trained model"""
        
        try:
            if model_id not in self.model_registry:
                raise ValueError(f"Model {model_id} not found in registry")
            
            model_info = self.model_registry[model_id]
            deployment_id = str(uuid.uuid4())
            
            deployment_info = {
                "deployment_id": deployment_id,
                "model_id": model_id,
                "deployment_type": deployment_type,
                "deployment_date": datetime.now().isoformat(),
                "status": "deployed",
                "endpoint_url": f"http://localhost:8001/models/{model_id}/predict",
                "deployment_config": deployment_config or {}
            }
            
            # Load model
            model_path = Path(model_info["model_path"])
            if not model_path.exists():
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            # Create deployment directory
            deployment_dir = Path("deployments") / deployment_id
            deployment_dir.mkdir(parents=True, exist_ok=True)
            
            # Copy model to deployment
            deployed_model_path = deployment_dir / "model.joblib"
            joblib.dump(joblib.load(model_path), deployed_model_path)
            
            # Create deployment metadata
            deployment_metadata = {
                "model_info": model_info,
                "deployment_info": deployment_info,
                "created_at": datetime.now().isoformat()
            }
            
            with open(deployment_dir / "metadata.json", "w") as f:
                json.dump(deployment_metadata, f, indent=2)
            
            logger.info(f"Model {model_id} deployed successfully as {deployment_id}")
            
            return deployment_info
            
        except Exception as e:
            logger.error(f"Model deployment failed: {e}")
            raise
    
    async def tune_hyperparameters(
        self,
        model_type: str,
        training_data: pd.DataFrame,
        validation_data: pd.DataFrame,
        param_grid: Dict[str, List],
        cv_folds: int = 5,
        n_iter: int = 100
    ) -> Dict[str, Any]:
        """Perform hyperparameter tuning"""
        
        try:
            X_train, y_train = self._prepare_data(training_data)
            X_val, y_val = self._prepare_data(validation_data)
            
            # Create base model
            base_model = self._create_model(model_type)
            
            # Perform grid search
            grid_search = GridSearchCV(
                estimator=base_model,
                param_grid=param_grid,
                cv=cv_folds,
                scoring='accuracy',
                n_jobs=-1
            )
            
            grid_search.fit(X_train, y_train)
            
            # Get best parameters
            best_params = grid_search.best_params_
            best_score = grid_search.best_score_
            
            # Train final model with best parameters
            final_model = self._create_model(model_type, best_params)
            final_model.fit(X_train, y_train)
            
            # Evaluate on validation set
            val_score = final_model.score(X_val, y_val)
            
            tuning_results = {
                "best_hyperparameters": best_params,
                "best_cv_score": best_score,
                "validation_score": val_score,
                "param_grid": param_grid,
                "cv_folds": cv_folds,
                "n_iter": n_iter
            }
            
            logger.info(f"Hyperparameter tuning completed. Best score: {best_score:.4f}")
            
            return tuning_results
            
        except Exception as e:
            logger.error(f"Hyperparameter tuning failed: {e}")
            raise
    
    def _create_model(self, model_type: str, hyperparameters: Dict[str, Any] = None) -> Any:
        """Create a model instance based on type"""
        
        hyperparameters = hyperparameters or {}
        
        if model_type == "random_forest":
            return RandomForestClassifier(**hyperparameters)
        elif model_type == "random_forest_regressor":
            return RandomForestRegressor(**hyperparameters)
        elif model_type == "logistic_regression":
            return LogisticRegression(**hyperparameters)
        elif model_type == "linear_regression":
            return LinearRegression(**hyperparameters)
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
    
    def _prepare_data(self, data: pd.DataFrame) -> tuple:
        """Prepare data for training"""
        if data is None:
            return None, None
        
        # Assume last column is target
        X = data.iloc[:, :-1]
        y = data.iloc[:, -1]
        
        # Handle categorical variables
        for col in X.select_dtypes(include=['object']):
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col])
        
        return X, y
    
    def _generate_synthetic_data(self) -> tuple:
        """Generate synthetic data for demonstration"""
        np.random.seed(42)
        n_samples = 1000
        n_features = 10
        
        # Generate features
        X = np.random.randn(n_samples, n_features)
        
        # Generate target (binary classification)
        y = (X[:, 0] + X[:, 1] + np.random.randn(n_samples) * 0.1 > 0).astype(int)
        
        # Convert to DataFrame
        feature_names = [f"feature_{i}" for i in range(n_features)]
        df = pd.DataFrame(X, columns=feature_names)
        df['target'] = y
        
        # Split data
        train_data, val_data = train_test_split(df, test_size=0.2, random_state=42)
        
        return self._prepare_data(train_data) + self._prepare_data(val_data)
    
    def get_model_info(self, model_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific model"""
        return self.model_registry.get(model_id)
    
    def list_models(self) -> List[Dict[str, Any]]:
        """List all trained models"""
        return list(self.model_registry.values())
    
    def delete_model(self, model_id: str) -> bool:
        """Delete a model from registry"""
        try:
            if model_id in self.model_registry:
                model_info = self.model_registry[model_id]
                model_path = Path(model_info["model_path"])
                
                if model_path.exists():
                    model_path.unlink()
                
                del self.model_registry[model_id]
                logger.info(f"Model {model_id} deleted successfully")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to delete model {model_id}: {e}")
            return False 