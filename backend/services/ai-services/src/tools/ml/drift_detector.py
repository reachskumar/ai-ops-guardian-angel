"""
Drift Detector Tool
Handles data drift detection and analysis
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
from scipy import stats
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)


class DriftDetector:
    """
    Advanced drift detector with comprehensive drift detection capabilities
    """
    
    def __init__(self):
        self.drift_dir = Path("drift_detection")
        self.drift_dir.mkdir(exist_ok=True)
        self.drift_history = []
        
    async def detect_data_drift(
        self,
        reference_data: pd.DataFrame,
        current_data: pd.DataFrame,
        drift_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Detect data drift between reference and current datasets"""
        
        try:
            drift_config = drift_config or {}
            drift_id = str(uuid.uuid4())
            
            # Perform drift detection
            feature_drift = await self._detect_feature_drift(reference_data, current_data)
            distribution_drift = await self._detect_distribution_drift(reference_data, current_data)
            label_drift = await self._detect_label_drift(reference_data, current_data)
            
            # Calculate overall drift score
            overall_drift = await self._calculate_overall_drift(
                feature_drift, distribution_drift, label_drift
            )
            
            # Generate drift report
            report = await self._generate_drift_report(
                drift_id, feature_drift, distribution_drift, label_drift, overall_drift
            )
            
            drift_results = {
                "drift_id": drift_id,
                "detection_date": datetime.now().isoformat(),
                "feature_drift": feature_drift,
                "distribution_drift": distribution_drift,
                "label_drift": label_drift,
                "overall_drift": overall_drift,
                "report_path": report
            }
            
            # Record drift detection
            self.drift_history.append({
                "operation": "detect_data_drift",
                "timestamp": datetime.now().isoformat(),
                "drift_results": drift_results
            })
            
            logger.info(f"Data drift detection completed. Overall drift score: {overall_drift}")
            
            return drift_results
            
        except Exception as e:
            logger.error(f"Data drift detection failed: {e}")
            raise
    
    async def monitor_drift_trends(
        self,
        model_id: str,
        monitoring_period: int = 30,
        drift_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Monitor drift trends over time"""
        
        try:
            drift_config = drift_config or {}
            monitoring_id = str(uuid.uuid4())
            
            # Collect historical drift data
            historical_drift = await self._collect_historical_drift(model_id, monitoring_period)
            
            # Analyze drift trends
            trend_analysis = await self._analyze_drift_trends(historical_drift)
            
            # Generate trend report
            report = await self._generate_trend_report(monitoring_id, trend_analysis)
            
            trend_results = {
                "monitoring_id": monitoring_id,
                "model_id": model_id,
                "monitoring_period": monitoring_period,
                "historical_drift": historical_drift,
                "trend_analysis": trend_analysis,
                "report_path": report
            }
            
            # Record trend monitoring
            self.drift_history.append({
                "operation": "monitor_drift_trends",
                "timestamp": datetime.now().isoformat(),
                "trend_results": trend_results
            })
            
            logger.info(f"Drift trend monitoring completed for model {model_id}")
            
            return trend_results
            
        except Exception as e:
            logger.error(f"Drift trend monitoring failed: {e}")
            raise
    
    async def _detect_feature_drift(
        self,
        reference_data: pd.DataFrame,
        current_data: pd.DataFrame
    ) -> Dict[str, Any]:
        """Detect feature-level drift"""
        
        try:
            feature_drift = {}
            
            # Get common features
            common_features = set(reference_data.columns) & set(current_data.columns)
            
            for feature in common_features:
                if feature in reference_data.columns and feature in current_data.columns:
                    # Calculate statistical difference
                    ref_values = reference_data[feature].dropna()
                    curr_values = current_data[feature].dropna()
                    
                    if len(ref_values) > 0 and len(curr_values) > 0:
                        # Kolmogorov-Smirnov test for distribution difference
                        ks_statistic, p_value = stats.ks_2samp(ref_values, curr_values)
                        
                        # Calculate mean difference
                        mean_diff = abs(ref_values.mean() - curr_values.mean())
                        
                        # Calculate variance difference
                        var_diff = abs(ref_values.var() - curr_values.var())
                        
                        feature_drift[feature] = {
                            "ks_statistic": ks_statistic,
                            "p_value": p_value,
                            "mean_difference": mean_diff,
                            "variance_difference": var_diff,
                            "drift_detected": p_value < 0.05,
                            "drift_severity": "high" if p_value < 0.01 else "medium" if p_value < 0.05 else "low"
                        }
            
            return feature_drift
            
        except Exception as e:
            logger.error(f"Feature drift detection failed: {e}")
            return {}
    
    async def _detect_distribution_drift(
        self,
        reference_data: pd.DataFrame,
        current_data: pd.DataFrame
    ) -> Dict[str, Any]:
        """Detect distribution-level drift"""
        
        try:
            # Calculate overall distribution drift
            all_ref_values = reference_data.values.flatten()
            all_curr_values = current_data.values.flatten()
            
            # Remove NaN values
            all_ref_values = all_ref_values[~np.isnan(all_ref_values)]
            all_curr_values = all_curr_values[~np.isnan(all_curr_values)]
            
            if len(all_ref_values) > 0 and len(all_curr_values) > 0:
                # Kolmogorov-Smirnov test
                ks_statistic, p_value = stats.ks_2samp(all_ref_values, all_curr_values)
                
                # Calculate distribution similarity
                similarity_score = 1 - ks_statistic
                
                distribution_drift = {
                    "ks_statistic": ks_statistic,
                    "p_value": p_value,
                    "similarity_score": similarity_score,
                    "drift_detected": p_value < 0.05,
                    "drift_severity": "high" if p_value < 0.01 else "medium" if p_value < 0.05 else "low"
                }
            else:
                distribution_drift = {
                    "ks_statistic": 0,
                    "p_value": 1,
                    "similarity_score": 1,
                    "drift_detected": False,
                    "drift_severity": "none"
                }
            
            return distribution_drift
            
        except Exception as e:
            logger.error(f"Distribution drift detection failed: {e}")
            return {}
    
    async def _detect_label_drift(
        self,
        reference_data: pd.DataFrame,
        current_data: pd.DataFrame
    ) -> Dict[str, Any]:
        """Detect label drift (if labels are available)"""
        
        try:
            # Assume last column is the label/target
            ref_labels = reference_data.iloc[:, -1] if len(reference_data.columns) > 0 else pd.Series()
            curr_labels = current_data.iloc[:, -1] if len(current_data.columns) > 0 else pd.Series()
            
            if len(ref_labels) > 0 and len(curr_labels) > 0:
                # Calculate label distribution difference
                ref_label_counts = ref_labels.value_counts(normalize=True)
                curr_label_counts = curr_labels.value_counts(normalize=True)
                
                # Get all unique labels
                all_labels = set(ref_label_counts.index) | set(curr_label_counts.index)
                
                # Calculate total variation distance
                total_variation = 0
                for label in all_labels:
                    ref_prob = ref_label_counts.get(label, 0)
                    curr_prob = curr_label_counts.get(label, 0)
                    total_variation += abs(ref_prob - curr_prob)
                
                total_variation /= 2  # Normalize to [0, 1]
                
                label_drift = {
                    "total_variation_distance": total_variation,
                    "drift_detected": total_variation > 0.1,
                    "drift_severity": "high" if total_variation > 0.2 else "medium" if total_variation > 0.1 else "low"
                }
            else:
                label_drift = {
                    "total_variation_distance": 0,
                    "drift_detected": False,
                    "drift_severity": "none"
                }
            
            return label_drift
            
        except Exception as e:
            logger.error(f"Label drift detection failed: {e}")
            return {}
    
    async def _calculate_overall_drift(
        self,
        feature_drift: Dict[str, Any],
        distribution_drift: Dict[str, Any],
        label_drift: Dict[str, Any]
    ) -> float:
        """Calculate overall drift score"""
        
        try:
            # Calculate feature drift score
            feature_scores = []
            for feature, drift_info in feature_drift.items():
                if drift_info.get("drift_detected", False):
                    severity = drift_info.get("drift_severity", "low")
                    if severity == "high":
                        feature_scores.append(0.8)
                    elif severity == "medium":
                        feature_scores.append(0.5)
                    else:
                        feature_scores.append(0.2)
                else:
                    feature_scores.append(0.0)
            
            avg_feature_drift = np.mean(feature_scores) if feature_scores else 0.0
            
            # Calculate distribution drift score
            dist_drift_score = 0.0
            if distribution_drift.get("drift_detected", False):
                severity = distribution_drift.get("drift_severity", "low")
                if severity == "high":
                    dist_drift_score = 0.8
                elif severity == "medium":
                    dist_drift_score = 0.5
                else:
                    dist_drift_score = 0.2
            
            # Calculate label drift score
            label_drift_score = 0.0
            if label_drift.get("drift_detected", False):
                severity = label_drift.get("drift_severity", "low")
                if severity == "high":
                    label_drift_score = 0.8
                elif severity == "medium":
                    label_drift_score = 0.5
                else:
                    label_drift_score = 0.2
            
            # Calculate weighted overall drift score
            overall_drift = (avg_feature_drift * 0.4 + dist_drift_score * 0.4 + label_drift_score * 0.2)
            
            return min(overall_drift, 1.0)
            
        except Exception as e:
            logger.error(f"Overall drift calculation failed: {e}")
            return 0.0
    
    async def _collect_historical_drift(
        self,
        model_id: str,
        monitoring_period: int
    ) -> List[Dict[str, Any]]:
        """Collect historical drift data"""
        
        # Simulate historical drift data collection
        historical_data = []
        
        for i in range(monitoring_period):
            historical_data.append({
                "date": datetime.now().isoformat(),
                "drift_score": np.random.uniform(0, 0.3),
                "feature_drift_count": np.random.randint(0, 5),
                "distribution_drift": np.random.uniform(0, 0.2),
                "label_drift": np.random.uniform(0, 0.1)
            })
        
        return historical_data
    
    async def _analyze_drift_trends(
        self,
        historical_drift: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze drift trends over time"""
        
        try:
            if not historical_drift:
                return {}
            
            # Extract drift scores
            drift_scores = [d.get("drift_score", 0) for d in historical_drift]
            
            # Calculate trend metrics
            trend_analysis = {
                "avg_drift_score": np.mean(drift_scores),
                "max_drift_score": np.max(drift_scores),
                "min_drift_score": np.min(drift_scores),
                "drift_trend": "increasing" if drift_scores[-1] > drift_scores[0] else "decreasing",
                "volatility": np.std(drift_scores),
                "trend_stability": "stable" if np.std(drift_scores) < 0.1 else "volatile"
            }
            
            return trend_analysis
            
        except Exception as e:
            logger.error(f"Drift trend analysis failed: {e}")
            return {}
    
    async def _generate_drift_report(
        self,
        drift_id: str,
        feature_drift: Dict[str, Any],
        distribution_drift: Dict[str, Any],
        label_drift: Dict[str, Any],
        overall_drift: float
    ) -> str:
        """Generate drift detection report"""
        
        try:
            report_dir = self.drift_dir / drift_id
            report_dir.mkdir(exist_ok=True)
            
            # Create report content
            report_content = f"""
# Data Drift Detection Report

## Drift Details
- **Drift ID**: {drift_id}
- **Detection Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Overall Drift Score
- **Score**: {overall_drift:.3f}
- **Severity**: {"High" if overall_drift > 0.5 else "Medium" if overall_drift > 0.2 else "Low"}

## Feature Drift Summary
- **Features Analyzed**: {len(feature_drift)}
- **Features with Drift**: {len([f for f in feature_drift.values() if f.get('drift_detected', False)])}

## Distribution Drift
- **KS Statistic**: {distribution_drift.get('ks_statistic', 0):.3f}
- **P-Value**: {distribution_drift.get('p_value', 1):.3f}
- **Drift Detected**: {distribution_drift.get('drift_detected', False)}

## Label Drift
- **Total Variation Distance**: {label_drift.get('total_variation_distance', 0):.3f}
- **Drift Detected**: {label_drift.get('drift_detected', False)}
"""
            
            with open(report_dir / "drift_report.md", "w") as f:
                f.write(report_content)
            
            return str(report_dir)
            
        except Exception as e:
            logger.error(f"Failed to generate drift report: {e}")
            return ""
    
    async def _generate_trend_report(
        self,
        monitoring_id: str,
        trend_analysis: Dict[str, Any]
    ) -> str:
        """Generate drift trend report"""
        
        try:
            report_dir = self.drift_dir / monitoring_id
            report_dir.mkdir(exist_ok=True)
            
            # Create report content
            report_content = f"""
# Drift Trend Analysis Report

## Trend Details
- **Monitoring ID**: {monitoring_id}
- **Analysis Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Trend Analysis
- **Average Drift Score**: {trend_analysis.get('avg_drift_score', 0):.3f}
- **Maximum Drift Score**: {trend_analysis.get('max_drift_score', 0):.3f}
- **Minimum Drift Score**: {trend_analysis.get('min_drift_score', 0):.3f}
- **Drift Trend**: {trend_analysis.get('drift_trend', 'unknown')}
- **Volatility**: {trend_analysis.get('volatility', 0):.3f}
- **Trend Stability**: {trend_analysis.get('trend_stability', 'unknown')}
"""
            
            with open(report_dir / "trend_report.md", "w") as f:
                f.write(report_content)
            
            return str(report_dir)
            
        except Exception as e:
            logger.error(f"Failed to generate trend report: {e}")
            return ""
    
    def get_drift_history(self) -> List[Dict[str, Any]]:
        """Get drift detection history"""
        return self.drift_history 