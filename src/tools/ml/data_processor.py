"""
Data Processor Tool
Handles data preprocessing, transformation, and feature engineering
"""

import asyncio
import json
import logging
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Union, Tuple
import pickle

# Data Processing Libraries
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.feature_selection import SelectKBest, f_classif, f_regression
from sklearn.decomposition import PCA
from sklearn.ensemble import RandomForestClassifier
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)


class DataProcessor:
    """
    Advanced data processor with comprehensive preprocessing and transformation capabilities
    """
    
    def __init__(self):
        self.processors_dir = Path("data_processors")
        self.processors_dir.mkdir(exist_ok=True)
        self.processing_history = []
        self.preprocessors = {}
        
    async def preprocess_data(
        self,
        training_data: pd.DataFrame,
        validation_data: pd.DataFrame = None,
        preprocessing_config: Dict[str, Any] = None
    ) -> Dict[str, pd.DataFrame]:
        """Preprocess data for ML training"""
        
        try:
            preprocessing_config = preprocessing_config or {}
            processor_id = str(uuid.uuid4())
            
            # Initialize preprocessors
            self._initialize_preprocessors(preprocessing_config)
            
            # Process training data
            processed_train = await self._process_dataframe(training_data, is_training=True)
            
            # Process validation data if provided
            processed_val = None
            if validation_data is not None:
                processed_val = await self._process_dataframe(validation_data, is_training=False)
            
            # Create test split from training data
            if processed_train is not None:
                train_size = int(0.8 * len(processed_train))
                processed_test = processed_train.iloc[train_size:]
                processed_train = processed_train.iloc[:train_size]
            else:
                processed_test = None
            
            # Save processor state
            processor_info = {
                "processor_id": processor_id,
                "preprocessing_config": preprocessing_config,
                "created_at": datetime.now().isoformat(),
                "preprocessors": self.preprocessors
            }
            
            processor_path = self.processors_dir / f"{processor_id}.pkl"
            with open(processor_path, "wb") as f:
                pickle.dump(processor_info, f)
            
            self.processing_history.append(processor_info)
            
            result = {
                "train": processed_train,
                "validation": processed_val,
                "test": processed_test,
                "processor_id": processor_id
            }
            
            logger.info(f"Data preprocessing completed. Processor ID: {processor_id}")
            
            return result
            
        except Exception as e:
            logger.error(f"Data preprocessing failed: {e}")
            raise
    
    async def transform_data(
        self,
        data: pd.DataFrame,
        transformations: List[Dict[str, Any]],
        transformation_config: Dict[str, Any] = None
    ) -> pd.DataFrame:
        """Apply transformations to data"""
        
        try:
            transformation_config = transformation_config or {}
            transformed_data = data.copy()
            
            for transformation in transformations:
                transform_type = transformation.get("type")
                transform_params = transformation.get("params", {})
                
                if transform_type == "normalize":
                    transformed_data = await self._normalize_data(transformed_data, transform_params)
                elif transform_type == "standardize":
                    transformed_data = await self._standardize_data(transformed_data, transform_params)
                elif transform_type == "encode_categorical":
                    transformed_data = await self._encode_categorical(transformed_data, transform_params)
                elif transform_type == "handle_missing":
                    transformed_data = await self._handle_missing_values(transformed_data, transform_params)
                elif transform_type == "feature_selection":
                    transformed_data = await self._select_features(transformed_data, transform_params)
                elif transform_type == "dimensionality_reduction":
                    transformed_data = await self._reduce_dimensions(transformed_data, transform_params)
                else:
                    logger.warning(f"Unknown transformation type: {transform_type}")
            
            logger.info(f"Data transformation completed. Shape: {transformed_data.shape}")
            
            return transformed_data
            
        except Exception as e:
            logger.error(f"Data transformation failed: {e}")
            raise
    
    async def engineer_features(
        self,
        data: pd.DataFrame,
        feature_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Engineer new features from existing data"""
        
        try:
            feature_config = feature_config or {}
            engineered_data = data.copy()
            
            # Generate polynomial features
            if feature_config.get("polynomial_features", False):
                engineered_data = await self._add_polynomial_features(engineered_data)
            
            # Generate interaction features
            if feature_config.get("interaction_features", False):
                engineered_data = await self._add_interaction_features(engineered_data)
            
            # Generate time-based features
            if feature_config.get("time_features", False):
                engineered_data = await self._add_time_features(engineered_data)
            
            # Generate statistical features
            if feature_config.get("statistical_features", False):
                engineered_data = await self._add_statistical_features(engineered_data)
            
            # Calculate feature importance
            feature_importance = await self._calculate_feature_importance(engineered_data)
            
            result = {
                "engineered_features": engineered_data,
                "feature_importance": feature_importance,
                "original_features": list(data.columns),
                "new_features": list(set(engineered_data.columns) - set(data.columns))
            }
            
            logger.info(f"Feature engineering completed. New features: {len(result['new_features'])}")
            
            return result
            
        except Exception as e:
            logger.error(f"Feature engineering failed: {e}")
            raise
    
    def _initialize_preprocessors(self, config: Dict[str, Any]):
        """Initialize preprocessing components"""
        
        # Imputer for missing values
        if config.get("handle_missing", True):
            self.preprocessors["imputer"] = SimpleImputer(strategy="mean")
        
        # Scaler for numerical features
        if config.get("scale_features", True):
            scaler_type = config.get("scaler_type", "standard")
            if scaler_type == "standard":
                self.preprocessors["scaler"] = StandardScaler()
            elif scaler_type == "minmax":
                self.preprocessors["scaler"] = MinMaxScaler()
        
        # Encoder for categorical features
        if config.get("encode_categorical", True):
            self.preprocessors["encoder"] = LabelEncoder()
    
    async def _process_dataframe(self, data: pd.DataFrame, is_training: bool = True) -> pd.DataFrame:
        """Process a single dataframe"""
        
        if data is None or data.empty:
            return None
        
        processed_data = data.copy()
        
        # Handle missing values
        if "imputer" in self.preprocessors:
            if is_training:
                processed_data = pd.DataFrame(
                    self.preprocessors["imputer"].fit_transform(processed_data),
                    columns=processed_data.columns
                )
            else:
                processed_data = pd.DataFrame(
                    self.preprocessors["imputer"].transform(processed_data),
                    columns=processed_data.columns
                )
        
        # Scale numerical features
        if "scaler" in self.preprocessors:
            numerical_cols = processed_data.select_dtypes(include=[np.number]).columns
            if len(numerical_cols) > 0:
                if is_training:
                    processed_data[numerical_cols] = self.preprocessors["scaler"].fit_transform(
                        processed_data[numerical_cols]
                    )
                else:
                    processed_data[numerical_cols] = self.preprocessors["scaler"].transform(
                        processed_data[numerical_cols]
                    )
        
        # Encode categorical features
        if "encoder" in self.preprocessors:
            categorical_cols = processed_data.select_dtypes(include=['object']).columns
            for col in categorical_cols:
                if is_training:
                    processed_data[col] = self.preprocessors["encoder"].fit_transform(processed_data[col])
                else:
                    processed_data[col] = self.preprocessors["encoder"].transform(processed_data[col])
        
        return processed_data
    
    async def _normalize_data(self, data: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Normalize data using Min-Max scaling"""
        scaler = MinMaxScaler()
        numerical_cols = data.select_dtypes(include=[np.number]).columns
        data[numerical_cols] = scaler.fit_transform(data[numerical_cols])
        return data
    
    async def _standardize_data(self, data: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Standardize data using Z-score normalization"""
        scaler = StandardScaler()
        numerical_cols = data.select_dtypes(include=[np.number]).columns
        data[numerical_cols] = scaler.fit_transform(data[numerical_cols])
        return data
    
    async def _encode_categorical(self, data: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Encode categorical variables"""
        categorical_cols = data.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            le = LabelEncoder()
            data[col] = le.fit_transform(data[col])
        return data
    
    async def _handle_missing_values(self, data: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Handle missing values"""
        strategy = params.get("strategy", "mean")
        imputer = SimpleImputer(strategy=strategy)
        data = pd.DataFrame(imputer.fit_transform(data), columns=data.columns)
        return data
    
    async def _select_features(self, data: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Select top features"""
        k = params.get("k", 10)
        selector = SelectKBest(score_func=f_classif, k=k)
        selected_features = selector.fit_transform(data.iloc[:, :-1], data.iloc[:, -1])
        selected_cols = data.columns[:-1][selector.get_support()]
        return pd.DataFrame(selected_features, columns=selected_cols)
    
    async def _reduce_dimensions(self, data: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Reduce dimensionality using PCA"""
        n_components = params.get("n_components", 0.95)
        pca = PCA(n_components=n_components)
        reduced_data = pca.fit_transform(data)
        return pd.DataFrame(reduced_data, columns=[f"PC_{i}" for i in range(reduced_data.shape[1])])
    
    async def _add_polynomial_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Add polynomial features"""
        numerical_cols = data.select_dtypes(include=[np.number]).columns
        for col in numerical_cols:
            data[f"{col}_squared"] = data[col] ** 2
            data[f"{col}_cubed"] = data[col] ** 3
        return data
    
    async def _add_interaction_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Add interaction features"""
        numerical_cols = data.select_dtypes(include=[np.number]).columns
        for i, col1 in enumerate(numerical_cols):
            for col2 in numerical_cols[i+1:]:
                data[f"{col1}_{col2}_interaction"] = data[col1] * data[col2]
        return data
    
    async def _add_time_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Add time-based features"""
        # This would be implemented based on actual datetime columns
        # For now, we'll add some basic features
        return data
    
    async def _add_statistical_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Add statistical features"""
        numerical_cols = data.select_dtypes(include=[np.number]).columns
        for col in numerical_cols:
            data[f"{col}_rolling_mean"] = data[col].rolling(window=3, min_periods=1).mean()
            data[f"{col}_rolling_std"] = data[col].rolling(window=3, min_periods=1).std()
        return data
    
    async def _calculate_feature_importance(self, data: pd.DataFrame) -> Dict[str, float]:
        """Calculate feature importance"""
        if len(data.columns) < 2:
            return {}
        
        # Use a simple model to calculate feature importance
        X = data.iloc[:, :-1] if len(data.columns) > 1 else data
        y = data.iloc[:, -1] if len(data.columns) > 1 else pd.Series([0] * len(data))
        
        try:
            model = RandomForestClassifier(n_estimators=10, random_state=42)
            model.fit(X, y)
            importance = dict(zip(X.columns, model.feature_importances_))
        except:
            importance = {col: 1.0 for col in X.columns}
        
        return importance
    
    def get_processing_history(self) -> List[Dict[str, Any]]:
        """Get processing history"""
        return self.processing_history
    
    def get_processor_info(self, processor_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific processor"""
        for record in self.processing_history:
            if record["processor_id"] == processor_id:
                return record
        return None 