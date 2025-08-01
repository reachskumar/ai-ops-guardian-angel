"""
Model Evaluator Tool
Handles model performance evaluation and metrics calculation
"""

import asyncio
import json
import logging
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
import joblib
import pickle

# ML Libraries
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    mean_squared_error, mean_absolute_error, r2_score,
    confusion_matrix, classification_report, roc_auc_score,
    roc_curve, precision_recall_curve
)
from sklearn.model_selection import cross_val_score
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import LabelEncoder

logger = logging.getLogger(__name__)


class ModelEvaluator:
    """
    Advanced model evaluator with comprehensive performance analysis capabilities
    """
    
    def __init__(self):
        self.evaluations_dir = Path("model_evaluations")
        self.evaluations_dir.mkdir(exist_ok=True)
        self.evaluation_history = []
        
    async def evaluate_model(
        self,
        model_id: str = None,
        model: Any = None,
        test_data: pd.DataFrame = None,
        metrics: List[str] = None
    ) -> Dict[str, Any]:
        """Evaluate model performance"""
        
        try:
            evaluation_id = str(uuid.uuid4())
            metrics = metrics or ["accuracy", "precision", "recall", "f1"]
            
            # Load model if model_id provided
            if model is None and model_id is not None:
                model = await self._load_model(model_id)
            
            if model is None:
                raise ValueError("Either model or model_id must be provided")
            
            # Prepare test data
            if test_data is None:
                # Generate synthetic test data
                test_data = await self._generate_test_data()
            
            X_test, y_test = self._prepare_test_data(test_data)
            
            # Make predictions
            y_pred = model.predict(X_test)
            y_pred_proba = None
            
            # Get prediction probabilities if available
            if hasattr(model, 'predict_proba'):
                y_pred_proba = model.predict_proba(X_test)
            
            # Calculate metrics
            evaluation_results = await self._calculate_metrics(
                y_test, y_pred, y_pred_proba, metrics
            )
            
            # Generate evaluation report
            evaluation_report = await self._generate_evaluation_report(
                evaluation_id, model, X_test, y_test, y_pred, evaluation_results
            )
            
            # Save evaluation
            evaluation_info = {
                "evaluation_id": evaluation_id,
                "model_id": model_id,
                "evaluation_date": datetime.now().isoformat(),
                "metrics": metrics,
                "results": evaluation_results,
                "report_path": str(evaluation_report)
            }
            
            self.evaluation_history.append(evaluation_info)
            
            logger.info(f"Model evaluation completed. Evaluation ID: {evaluation_id}")
            
            return evaluation_results
            
        except Exception as e:
            logger.error(f"Model evaluation failed: {e}")
            raise
    
    async def compare_models(
        self,
        models: Dict[str, Any],
        test_data: pd.DataFrame,
        metrics: List[str] = None
    ) -> Dict[str, Any]:
        """Compare multiple models"""
        
        try:
            comparison_id = str(uuid.uuid4())
            metrics = metrics or ["accuracy", "precision", "recall", "f1"]
            
            X_test, y_test = self._prepare_test_data(test_data)
            comparison_results = {}
            
            for model_name, model in models.items():
                # Make predictions
                y_pred = model.predict(X_test)
                y_pred_proba = None
                
                if hasattr(model, 'predict_proba'):
                    y_pred_proba = model.predict_proba(X_test)
                
                # Calculate metrics
                model_metrics = await self._calculate_metrics(
                    y_test, y_pred, y_pred_proba, metrics
                )
                
                comparison_results[model_name] = model_metrics
            
            # Find best model for each metric
            best_models = {}
            for metric in metrics:
                best_model = max(comparison_results.keys(), 
                               key=lambda x: comparison_results[x].get(metric, 0))
                best_models[metric] = best_model
            
            comparison_summary = {
                "comparison_id": comparison_id,
                "comparison_date": datetime.now().isoformat(),
                "models_compared": list(models.keys()),
                "results": comparison_results,
                "best_models": best_models
            }
            
            logger.info(f"Model comparison completed. Comparison ID: {comparison_id}")
            
            return comparison_summary
            
        except Exception as e:
            logger.error(f"Model comparison failed: {e}")
            raise
    
    async def cross_validate_model(
        self,
        model: Any,
        data: pd.DataFrame,
        cv_folds: int = 5,
        metrics: List[str] = None
    ) -> Dict[str, Any]:
        """Perform cross-validation"""
        
        try:
            metrics = metrics or ["accuracy"]
            X, y = self._prepare_test_data(data)
            
            cv_results = {}
            
            for metric in metrics:
                if metric == "accuracy":
                    scores = cross_val_score(model, X, y, cv=cv_folds, scoring='accuracy')
                elif metric == "precision":
                    scores = cross_val_score(model, X, y, cv=cv_folds, scoring='precision_macro')
                elif metric == "recall":
                    scores = cross_val_score(model, X, y, cv=cv_folds, scoring='recall_macro')
                elif metric == "f1":
                    scores = cross_val_score(model, X, y, cv=cv_folds, scoring='f1_macro')
                else:
                    continue
                
                cv_results[metric] = {
                    "scores": scores.tolist(),
                    "mean": scores.mean(),
                    "std": scores.std(),
                    "min": scores.min(),
                    "max": scores.max()
                }
            
            logger.info(f"Cross-validation completed. Mean accuracy: {cv_results.get('accuracy', {}).get('mean', 0):.4f}")
            
            return cv_results
            
        except Exception as e:
            logger.error(f"Cross-validation failed: {e}")
            raise
    
    async def _calculate_metrics(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_pred_proba: np.ndarray = None,
        metrics: List[str] = None
    ) -> Dict[str, float]:
        """Calculate performance metrics"""
        
        metrics = metrics or ["accuracy"]
        results = {}
        
        for metric in metrics:
            try:
                if metric == "accuracy":
                    results[metric] = accuracy_score(y_true, y_pred)
                elif metric == "precision":
                    results[metric] = precision_score(y_true, y_pred, average='macro')
                elif metric == "recall":
                    results[metric] = recall_score(y_true, y_pred, average='macro')
                elif metric == "f1":
                    results[metric] = f1_score(y_true, y_pred, average='macro')
                elif metric == "mse":
                    results[metric] = mean_squared_error(y_true, y_pred)
                elif metric == "mae":
                    results[metric] = mean_absolute_error(y_true, y_pred)
                elif metric == "r2":
                    results[metric] = r2_score(y_true, y_pred)
                elif metric == "auc" and y_pred_proba is not None:
                    results[metric] = roc_auc_score(y_true, y_pred_proba[:, 1])
                else:
                    logger.warning(f"Unknown metric: {metric}")
            except Exception as e:
                logger.warning(f"Failed to calculate {metric}: {e}")
                results[metric] = 0.0
        
        return results
    
    async def _generate_evaluation_report(
        self,
        evaluation_id: str,
        model: Any,
        X_test: pd.DataFrame,
        y_test: np.ndarray,
        y_pred: np.ndarray,
        results: Dict[str, float]
    ) -> str:
        """Generate comprehensive evaluation report"""
        
        try:
            report_dir = self.evaluations_dir / evaluation_id
            report_dir.mkdir(exist_ok=True)
            
            # Create confusion matrix
            if len(np.unique(y_test)) <= 10:  # Classification task
                cm = confusion_matrix(y_test, y_pred)
                plt.figure(figsize=(8, 6))
                sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
                plt.title('Confusion Matrix')
                plt.ylabel('True Label')
                plt.xlabel('Predicted Label')
                plt.savefig(report_dir / 'confusion_matrix.png')
                plt.close()
            
            # Create metrics summary
            metrics_summary = {
                "evaluation_id": evaluation_id,
                "evaluation_date": datetime.now().isoformat(),
                "model_type": type(model).__name__,
                "test_samples": len(X_test),
                "features_count": X_test.shape[1],
                "metrics": results
            }
            
            with open(report_dir / 'metrics_summary.json', 'w') as f:
                json.dump(metrics_summary, f, indent=2)
            
            # Create detailed report
            report_content = f"""
# Model Evaluation Report

## Evaluation Details
- **Evaluation ID**: {evaluation_id}
- **Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **Model Type**: {type(model).__name__}
- **Test Samples**: {len(X_test)}
- **Features**: {X_test.shape[1]}

## Performance Metrics
"""
            
            for metric, value in results.items():
                report_content += f"- **{metric.upper()}**: {value:.4f}\n"
            
            report_content += f"""
## Model Information
- **Model Parameters**: {getattr(model, 'get_params', lambda: {})()}
- **Feature Names**: {list(X_test.columns) if hasattr(X_test, 'columns') else 'N/A'}

## Evaluation Files
- Metrics Summary: metrics_summary.json
- Confusion Matrix: confusion_matrix.png
"""
            
            with open(report_dir / 'evaluation_report.md', 'w') as f:
                f.write(report_content)
            
            return str(report_dir)
            
        except Exception as e:
            logger.error(f"Failed to generate evaluation report: {e}")
            return ""
    
    async def _load_model(self, model_id: str) -> Any:
        """Load model from registry"""
        try:
            models_dir = Path("models")
            model_path = models_dir / f"{model_id}.joblib"
            
            if not model_path.exists():
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            model = joblib.load(model_path)
            return model
            
        except Exception as e:
            logger.error(f"Failed to load model {model_id}: {e}")
            raise
    
    def _prepare_test_data(self, data: pd.DataFrame) -> tuple:
        """Prepare test data for evaluation"""
        if data is None or data.empty:
            # Generate synthetic test data
            data = self._generate_test_data()
        
        # Assume last column is target
        X = data.iloc[:, :-1]
        y = data.iloc[:, -1]
        
        # Handle categorical variables
        for col in X.select_dtypes(include=['object']):
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col])
        
        return X, y
    
    def _generate_test_data(self) -> pd.DataFrame:
        """Generate synthetic test data"""
        np.random.seed(42)
        n_samples = 200
        n_features = 5
        
        # Generate features
        X = np.random.randn(n_samples, n_features)
        
        # Generate target (binary classification)
        y = (X[:, 0] + X[:, 1] + np.random.randn(n_samples) * 0.1 > 0).astype(int)
        
        # Convert to DataFrame
        feature_names = [f"feature_{i}" for i in range(n_features)]
        df = pd.DataFrame(X, columns=feature_names)
        df['target'] = y
        
        return df
    
    def get_evaluation_history(self) -> List[Dict[str, Any]]:
        """Get evaluation history"""
        return self.evaluation_history
    
    def get_evaluation_info(self, evaluation_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific evaluation"""
        for record in self.evaluation_history:
            if record["evaluation_id"] == evaluation_id:
                return record
        return None 