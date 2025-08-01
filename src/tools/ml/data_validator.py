"""
Data Validator Tool
Handles data validation and quality checks
"""

import asyncio
import json
import logging
import uuid
import numpy as np
import pandas as pd
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Union

logger = logging.getLogger(__name__)


class DataValidator:
    """
    Advanced data validator with comprehensive validation capabilities
    """
    
    def __init__(self):
        self.validation_dir = Path("data_validation")
        self.validation_dir.mkdir(exist_ok=True)
        self.validation_history = []
        
    async def validate_data(
        self,
        data: pd.DataFrame,
        validation_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Validate data quality and integrity"""
        
        try:
            validation_config = validation_config or {}
            validation_id = str(uuid.uuid4())
            
            # Perform data validation
            quality_checks = await self._perform_quality_checks(data, validation_config)
            integrity_checks = await self._perform_integrity_checks(data, validation_config)
            schema_validation = await self._validate_schema(data, validation_config)
            
            # Calculate overall validation score
            validation_score = await self._calculate_validation_score(
                quality_checks, integrity_checks, schema_validation
            )
            
            # Generate validation report
            report = await self._generate_validation_report(
                validation_id, quality_checks, integrity_checks, schema_validation, validation_score
            )
            
            validation_results = {
                "validation_id": validation_id,
                "validation_date": datetime.now().isoformat(),
                "quality_checks": quality_checks,
                "integrity_checks": integrity_checks,
                "schema_validation": schema_validation,
                "validation_score": validation_score,
                "report_path": report
            }
            
            # Record validation
            self.validation_history.append({
                "operation": "validate_data",
                "timestamp": datetime.now().isoformat(),
                "validation_results": validation_results
            })
            
            logger.info(f"Data validation completed. Score: {validation_score:.2f}")
            
            return validation_results
            
        except Exception as e:
            logger.error(f"Data validation failed: {e}")
            raise
    
    async def _perform_quality_checks(
        self,
        data: pd.DataFrame,
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform data quality checks"""
        
        try:
            quality_results = {}
            
            # Check for missing values
            missing_values = data.isnull().sum()
            quality_results["missing_values"] = {
                "total_missing": missing_values.sum(),
                "missing_percentage": (missing_values.sum() / (data.shape[0] * data.shape[1])) * 100,
                "columns_with_missing": missing_values[missing_values > 0].to_dict()
            }
            
            # Check for duplicates
            duplicates = data.duplicated().sum()
            quality_results["duplicates"] = {
                "total_duplicates": duplicates,
                "duplicate_percentage": (duplicates / len(data)) * 100
            }
            
            # Check data types
            data_types = data.dtypes.to_dict()
            quality_results["data_types"] = {
                "type_distribution": data_types,
                "object_columns": [col for col, dtype in data_types.items() if dtype == 'object'],
                "numeric_columns": [col for col, dtype in data_types.items() if np.issubdtype(dtype, np.number)]
            }
            
            # Check for outliers (for numeric columns)
            outlier_checks = {}
            for col in quality_results["data_types"]["numeric_columns"]:
                if col in data.columns:
                    Q1 = data[col].quantile(0.25)
                    Q3 = data[col].quantile(0.75)
                    IQR = Q3 - Q1
                    outliers = ((data[col] < (Q1 - 1.5 * IQR)) | (data[col] > (Q3 + 1.5 * IQR))).sum()
                    outlier_checks[col] = {
                        "outlier_count": outliers,
                        "outlier_percentage": (outliers / len(data)) * 100
                    }
            
            quality_results["outliers"] = outlier_checks
            
            return quality_results
            
        except Exception as e:
            logger.error(f"Quality checks failed: {e}")
            return {}
    
    async def _perform_integrity_checks(
        self,
        data: pd.DataFrame,
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Perform data integrity checks"""
        
        try:
            integrity_results = {}
            
            # Check for negative values in positive-only columns
            negative_checks = {}
            for col in data.select_dtypes(include=[np.number]).columns:
                if data[col].min() < 0:
                    negative_count = (data[col] < 0).sum()
                    negative_checks[col] = {
                        "negative_count": negative_count,
                        "negative_percentage": (negative_count / len(data)) * 100
                    }
            
            integrity_results["negative_values"] = negative_checks
            
            # Check for value ranges
            range_checks = {}
            for col in data.select_dtypes(include=[np.number]).columns:
                range_checks[col] = {
                    "min_value": data[col].min(),
                    "max_value": data[col].max(),
                    "mean_value": data[col].mean(),
                    "std_value": data[col].std()
                }
            
            integrity_results["value_ranges"] = range_checks
            
            # Check for consistency in categorical columns
            consistency_checks = {}
            for col in data.select_dtypes(include=['object']).columns:
                unique_values = data[col].nunique()
                consistency_checks[col] = {
                    "unique_values": unique_values,
                    "most_common": data[col].mode().iloc[0] if len(data[col].mode()) > 0 else None,
                    "most_common_count": data[col].value_counts().iloc[0] if len(data[col].value_counts()) > 0 else 0
                }
            
            integrity_results["categorical_consistency"] = consistency_checks
            
            return integrity_results
            
        except Exception as e:
            logger.error(f"Integrity checks failed: {e}")
            return {}
    
    async def _validate_schema(
        self,
        data: pd.DataFrame,
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Validate data schema"""
        
        try:
            schema_results = {}
            
            # Check expected columns
            expected_columns = config.get("expected_columns", [])
            if expected_columns:
                missing_columns = set(expected_columns) - set(data.columns)
                extra_columns = set(data.columns) - set(expected_columns)
                
                schema_results["column_validation"] = {
                    "expected_columns": expected_columns,
                    "actual_columns": list(data.columns),
                    "missing_columns": list(missing_columns),
                    "extra_columns": list(extra_columns),
                    "schema_match": len(missing_columns) == 0
                }
            
            # Check data types
            expected_types = config.get("expected_types", {})
            if expected_types:
                type_mismatches = {}
                for col, expected_type in expected_types.items():
                    if col in data.columns:
                        actual_type = str(data[col].dtype)
                        if actual_type != expected_type:
                            type_mismatches[col] = {
                                "expected": expected_type,
                                "actual": actual_type
                            }
                
                schema_results["type_validation"] = {
                    "expected_types": expected_types,
                    "type_mismatches": type_mismatches,
                    "type_match": len(type_mismatches) == 0
                }
            
            # Check data size
            schema_results["size_validation"] = {
                "rows": len(data),
                "columns": len(data.columns),
                "total_cells": len(data) * len(data.columns)
            }
            
            return schema_results
            
        except Exception as e:
            logger.error(f"Schema validation failed: {e}")
            return {}
    
    async def _calculate_validation_score(
        self,
        quality_checks: Dict[str, Any],
        integrity_checks: Dict[str, Any],
        schema_validation: Dict[str, Any]
    ) -> float:
        """Calculate overall validation score"""
        
        try:
            score = 100.0
            
            # Deduct points for quality issues
            missing_percentage = quality_checks.get("missing_values", {}).get("missing_percentage", 0)
            score -= missing_percentage * 0.5  # 0.5 points per percentage of missing data
            
            duplicate_percentage = quality_checks.get("duplicates", {}).get("duplicate_percentage", 0)
            score -= duplicate_percentage * 0.3  # 0.3 points per percentage of duplicates
            
            # Deduct points for integrity issues
            negative_checks = integrity_checks.get("negative_values", {})
            for col, check in negative_checks.items():
                score -= check.get("negative_percentage", 0) * 0.2
            
            # Deduct points for schema issues
            column_validation = schema_validation.get("column_validation", {})
            if not column_validation.get("schema_match", True):
                score -= 10  # 10 points for schema mismatch
            
            type_validation = schema_validation.get("type_validation", {})
            if not type_validation.get("type_match", True):
                score -= 5  # 5 points for type mismatch
            
            return max(score, 0.0)
            
        except Exception as e:
            logger.error(f"Validation score calculation failed: {e}")
            return 50.0
    
    async def _generate_validation_report(
        self,
        validation_id: str,
        quality_checks: Dict[str, Any],
        integrity_checks: Dict[str, Any],
        schema_validation: Dict[str, Any],
        validation_score: float
    ) -> str:
        """Generate validation report"""
        
        try:
            report_dir = self.validation_dir / validation_id
            report_dir.mkdir(exist_ok=True)
            
            # Create report content
            report_content = f"""
# Data Validation Report

## Validation Details
- **Validation ID**: {validation_id}
- **Validation Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Overall Validation Score
- **Score**: {validation_score:.2f}/100
- **Status**: {"Pass" if validation_score >= 80 else "Warning" if validation_score >= 60 else "Fail"}

## Quality Checks
- **Missing Values**: {quality_checks.get('missing_values', {}).get('missing_percentage', 0):.2f}%
- **Duplicates**: {quality_checks.get('duplicates', {}).get('duplicate_percentage', 0):.2f}%
- **Data Types**: {len(quality_checks.get('data_types', {}).get('object_columns', []))} object, {len(quality_checks.get('data_types', {}).get('numeric_columns', []))} numeric

## Integrity Checks
- **Negative Values**: {len(integrity_checks.get('negative_values', {}))} columns affected
- **Value Ranges**: {len(integrity_checks.get('value_ranges', {}))} numeric columns analyzed

## Schema Validation
- **Rows**: {schema_validation.get('size_validation', {}).get('rows', 0)}
- **Columns**: {schema_validation.get('size_validation', {}).get('columns', 0)}
- **Schema Match**: {schema_validation.get('column_validation', {}).get('schema_match', True)}
"""
            
            with open(report_dir / "validation_report.md", "w") as f:
                f.write(report_content)
            
            return str(report_dir)
            
        except Exception as e:
            logger.error(f"Failed to generate validation report: {e}")
            return ""
    
    def get_validation_history(self) -> List[Dict[str, Any]]:
        """Get validation history"""
        return self.validation_history 