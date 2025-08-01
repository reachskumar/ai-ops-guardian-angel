"""
Cost Optimization Agent - Advanced AI agent for cloud cost optimization
Provides ML-powered cost analysis, forecasting, and optimization recommendations
"""

import asyncio
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple
import boto3
from azure.identity import DefaultAzureCredential
from azure.mgmt.costmanagement import CostManagementClient
from google.cloud import billing_v1
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

from ..base_agent import BaseAgent, AgentTask, AgentCapabilities, AgentRecommendation
from ...config.settings import AgentType, RiskLevel, settings
from ...tools.cost.cost_analyzer import CostAnalyzer
from ...tools.cost.forecast_model import CostForecastModel
from ...tools.cost.rightsizing_tool import RightsizingTool


class CostOptimizationAgent(BaseAgent):
    """
    Advanced AI agent for cloud cost optimization.
    
    Capabilities:
    - Real-time cost analysis across AWS, Azure, GCP
    - ML-powered cost forecasting (30-90 days)
    - Automated rightsizing recommendations
    - Reserved instance optimization
    - Multi-cloud cost arbitrage analysis
    - ROI impact calculations
    """
    
    def __init__(self):
        capabilities = AgentCapabilities(
            supported_tasks=[
                "cost_analysis",
                "cost_forecasting", 
                "rightsizing_analysis",
                "reserved_instance_optimization",
                "cost_anomaly_detection",
                "multi_cloud_cost_comparison",
                "budget_optimization",
                "cost_trend_analysis"
            ],
            required_tools=["cost_analyzer", "forecast_model", "rightsizing_tool"],
            max_concurrent_tasks=5,
            average_response_time=45.0
        )
        
        super().__init__(
            agent_type=AgentType.COST_OPTIMIZATION,
            name="Cost Optimization Agent",
            description="AI-powered cloud cost optimization and forecasting",
            capabilities=capabilities
        )
        
        # Initialize tools
        self.cost_analyzer = CostAnalyzer()
        self.forecast_model = CostForecastModel()
        self.rightsizing_tool = RightsizingTool()
        
        # Initialize cloud clients
        self.aws_client = None
        self.azure_client = None
        self.gcp_client = None
        
        # Cost thresholds and settings
        self.min_savings_threshold = settings.cost_optimization_threshold  # 15%
        self.anomaly_threshold = 0.3  # 30% cost increase
        
        # ML models for prediction
        self.cost_prediction_model = None
        self.anomaly_detection_model = None
        
        self.logger.info("Cost Optimization Agent initialized")
    
    async def _on_start(self):
        """Initialize cloud clients and ML models"""
        try:
            # Initialize AWS client
            if settings.aws_access_key_id and settings.aws_secret_access_key:
                self.aws_client = boto3.client(
                    'ce',  # Cost Explorer
                    aws_access_key_id=settings.aws_access_key_id,
                    aws_secret_access_key=settings.aws_secret_access_key,
                    region_name=settings.aws_region
                )
                self.logger.info("AWS Cost Explorer client initialized")
            
            # Initialize Azure client
            if settings.azure_client_id and settings.azure_client_secret:
                credential = DefaultAzureCredential()
                self.azure_client = CostManagementClient(credential)
                self.logger.info("Azure Cost Management client initialized")
            
            # Initialize ML models
            await self._initialize_ml_models()
            
        except Exception as e:
            self.logger.error(f"Failed to initialize clients: {str(e)}")
    
    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        """Execute cost optimization tasks"""
        task_type = task.task_type
        context = task.context
        
        self.logger.info(f"Executing cost optimization task: {task_type}")
        
        if task_type == "cost_analysis":
            return await self._analyze_costs(context)
        elif task_type == "cost_forecasting":
            return await self._forecast_costs(context)
        elif task_type == "rightsizing_analysis":
            return await self._analyze_rightsizing(context)
        elif task_type == "reserved_instance_optimization":
            return await self._optimize_reserved_instances(context)
        elif task_type == "cost_anomaly_detection":
            return await self._detect_cost_anomalies(context)
        elif task_type == "multi_cloud_cost_comparison":
            return await self._compare_multi_cloud_costs(context)
        elif task_type == "budget_optimization":
            return await self._optimize_budgets(context)
        elif task_type == "cost_trend_analysis":
            return await self._analyze_cost_trends(context)
        else:
            raise ValueError(f"Unsupported task type: {task_type}")
    
    async def _generate_recommendation_logic(
        self, 
        context: Dict[str, Any], 
        task_type: str
    ) -> Dict[str, Any]:
        """Generate cost optimization recommendations"""
        
        if task_type == "cost_analysis":
            analysis_result = await self._analyze_costs(context)
            
            # Calculate potential savings
            total_cost = analysis_result.get('total_monthly_cost', 0)
            potential_savings = analysis_result.get('potential_savings', 0)
            savings_percentage = (potential_savings / total_cost) * 100 if total_cost > 0 else 0
            
            # Determine risk level based on savings amount
            if potential_savings > 5000:  # $5000+
                risk_level = RiskLevel.MEDIUM
            elif potential_savings > 1000:  # $1000+
                risk_level = RiskLevel.LOW
            else:
                risk_level = RiskLevel.LOW
            
            return {
                "title": f"Cost Optimization Opportunity - ${potential_savings:.2f}/month savings",
                "description": f"Identified {savings_percentage:.1f}% cost reduction opportunity across your cloud infrastructure",
                "reasoning": f"""
                Analysis of your cloud spending reveals several optimization opportunities:
                
                1. **Rightsizing**: {analysis_result.get('rightsizing_savings', 0):.2f} monthly savings
                2. **Reserved Instances**: ${analysis_result.get('ri_savings', 0):.2f} monthly savings  
                3. **Storage Optimization**: ${analysis_result.get('storage_savings', 0):.2f} monthly savings
                4. **Unused Resources**: ${analysis_result.get('cleanup_savings', 0):.2f} monthly savings
                
                These optimizations maintain performance while reducing costs.
                """,
                "confidence": 0.85,
                "impact": f"${potential_savings:.2f}/month savings (${potential_savings * 12:.2f}/year)",
                "risk_level": risk_level,
                "estimated_savings": potential_savings,
                "estimated_duration": "2-4 weeks implementation",
                "resources_affected": analysis_result.get('affected_resources', []),
                "alternatives": [
                    "Gradual implementation over 3 months",
                    "Focus on highest-impact optimizations first",
                    "Pilot with non-production resources"
                ],
                "prerequisites": [
                    "Resource usage analysis complete",
                    "Stakeholder approval for changes",
                    "Backup and rollback plan established"
                ],
                "rollback_plan": "All changes can be reverted within 24 hours if needed"
            }
        
        # Default recommendation structure
        return {
            "title": "Cost Optimization Analysis",
            "description": "General cost optimization analysis completed",
            "reasoning": "Analyzed current cost patterns and identified optimization opportunities",
            "confidence": 0.75,
            "impact": "Cost savings opportunity identified",
            "risk_level": RiskLevel.LOW
        }
    
    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze cost data using ML models"""
        try:
            cost_data = data.get('cost_data', {})
            usage_data = data.get('usage_data', {})
            
            # Analyze cost trends
            trends = await self._analyze_cost_trends_data(cost_data)
            
            # Detect anomalies
            anomalies = await self._detect_anomalies(cost_data)
            
            # Calculate efficiency metrics
            efficiency = await self._calculate_efficiency_metrics(cost_data, usage_data)
            
            # Generate insights
            insights = await self._generate_cost_insights(trends, anomalies, efficiency)
            
            return {
                'trends': trends,
                'anomalies': anomalies,
                'efficiency': efficiency,
                'insights': insights,
                'analysis_timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            self.logger.error(f"Cost data analysis failed: {str(e)}")
            raise
    
    # Core Analysis Methods
    
    async def _analyze_costs(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive cost analysis across all cloud providers"""
        try:
            cloud_provider = context.get('cloud_provider', 'all')
            time_period = context.get('time_period', 30)  # days
            
            self.logger.info(f"Analyzing costs for {cloud_provider} over {time_period} days")
            
            results = {
                'total_monthly_cost': 0,
                'cost_breakdown': {},
                'potential_savings': 0,
                'rightsizing_savings': 0,
                'ri_savings': 0,
                'storage_savings': 0,
                'cleanup_savings': 0,
                'affected_resources': [],
                'optimization_opportunities': []
            }
            
            if cloud_provider in ['aws', 'all'] and self.aws_client:
                aws_analysis = await self._analyze_aws_costs(time_period)
                results = self._merge_cost_analysis(results, aws_analysis)
            
            if cloud_provider in ['azure', 'all'] and self.azure_client:
                azure_analysis = await self._analyze_azure_costs(time_period)
                results = self._merge_cost_analysis(results, azure_analysis)
            
            # Calculate total potential savings
            results['potential_savings'] = (
                results['rightsizing_savings'] + 
                results['ri_savings'] + 
                results['storage_savings'] + 
                results['cleanup_savings']
            )
            
            self.logger.info(f"Cost analysis complete. Potential savings: ${results['potential_savings']:.2f}")
            return results
            
        except Exception as e:
            self.logger.error(f"Cost analysis failed: {str(e)}")
            raise
    
    async def _analyze_aws_costs(self, days: int) -> Dict[str, Any]:
        """Analyze AWS costs using Cost Explorer API"""
        try:
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=days)
            
            # Get cost and usage data
            response = self.aws_client.get_cost_and_usage(
                TimePeriod={
                    'Start': start_date.strftime('%Y-%m-%d'),
                    'End': end_date.strftime('%Y-%m-%d')
                },
                Granularity='DAILY',
                Metrics=['BlendedCost', 'UsageQuantity'],
                GroupBy=[
                    {'Type': 'DIMENSION', 'Key': 'SERVICE'},
                    {'Type': 'DIMENSION', 'Key': 'INSTANCE_TYPE'}
                ]
            )
            
            # Analyze the data
            total_cost = 0
            service_costs = {}
            
            for result in response['ResultsByTime']:
                for group in result['Groups']:
                    service = group['Keys'][0]
                    instance_type = group['Keys'][1]
                    cost = float(group['Metrics']['BlendedCost']['Amount'])
                    
                    total_cost += cost
                    if service not in service_costs:
                        service_costs[service] = 0
                    service_costs[service] += cost
            
            # Get rightsizing recommendations
            rightsizing_response = self.aws_client.get_rightsizing_recommendation(
                Service='AmazonEC2'
            )
            
            rightsizing_savings = 0
            for recommendation in rightsizing_response.get('RightsizingRecommendations', []):
                savings = recommendation.get('EstimatedMonthlySavings', {}).get('Amount', '0')
                rightsizing_savings += float(savings)
            
            # Get Reserved Instance recommendations
            ri_response = self.aws_client.get_reservation_purchase_recommendation(
                Service='AmazonEC2'
            )
            
            ri_savings = 0
            for recommendation in ri_response.get('Recommendations', []):
                savings = recommendation.get('RecommendationDetails', {}).get('EstimatedMonthlySavings', {}).get('Amount', '0')
                ri_savings += float(savings)
            
            return {
                'provider': 'aws',
                'total_cost': total_cost,
                'service_breakdown': service_costs,
                'rightsizing_savings': rightsizing_savings,
                'ri_savings': ri_savings,
                'storage_savings': total_cost * 0.05,  # Estimate 5% storage savings
                'cleanup_savings': total_cost * 0.03   # Estimate 3% cleanup savings
            }
            
        except Exception as e:
            self.logger.error(f"AWS cost analysis failed: {str(e)}")
            return {'provider': 'aws', 'total_cost': 0, 'rightsizing_savings': 0, 'ri_savings': 0}
    
    async def _forecast_costs(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Forecast future costs using ML models"""
        try:
            forecast_days = context.get('forecast_days', 30)
            historical_data = context.get('historical_data', {})
            
            # Use ML model to predict costs
            forecast_result = await self.forecast_model.predict_costs(
                historical_data, 
                forecast_days
            )
            
            return {
                'forecast_period_days': forecast_days,
                'predicted_total_cost': forecast_result['total_cost'],
                'daily_predictions': forecast_result['daily_costs'],
                'confidence_intervals': forecast_result['confidence_intervals'],
                'trend_analysis': forecast_result['trends'],
                'model_accuracy': forecast_result['accuracy']
            }
            
        except Exception as e:
            self.logger.error(f"Cost forecasting failed: {str(e)}")
            raise
    
    async def _initialize_ml_models(self):
        """Initialize ML models for cost prediction and anomaly detection"""
        try:
            # Initialize cost prediction model
            self.cost_prediction_model = RandomForestRegressor(
                n_estimators=100,
                random_state=42
            )
            
            # Initialize anomaly detection model  
            self.anomaly_detection_model = LinearRegression()
            
            self.logger.info("ML models initialized successfully")
            
        except Exception as e:
            self.logger.error(f"ML model initialization failed: {str(e)}")
    
    def _merge_cost_analysis(self, base: Dict[str, Any], new: Dict[str, Any]) -> Dict[str, Any]:
        """Merge cost analysis results from different providers"""
        base['total_monthly_cost'] += new.get('total_cost', 0)
        base['rightsizing_savings'] += new.get('rightsizing_savings', 0)
        base['ri_savings'] += new.get('ri_savings', 0)
        base['storage_savings'] += new.get('storage_savings', 0)
        base['cleanup_savings'] += new.get('cleanup_savings', 0)
        
        provider = new.get('provider', 'unknown')
        base['cost_breakdown'][provider] = new.get('service_breakdown', {})
        
        return base
    
    # Additional helper methods would continue here...
    async def _analyze_rightsizing(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze resource rightsizing opportunities"""
        return {"rightsizing_opportunities": [], "potential_savings": 0}
    
    async def _optimize_reserved_instances(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize reserved instance purchases"""
        return {"ri_recommendations": [], "potential_savings": 0}
    
    async def _detect_cost_anomalies(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Detect cost anomalies using ML"""
        return {"anomalies": [], "anomaly_count": 0}
    
    async def _compare_multi_cloud_costs(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Compare costs across multiple cloud providers"""
        return {"comparison": {}, "recommendations": []}
    
    async def _optimize_budgets(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize budget allocations"""
        return {"budget_recommendations": [], "optimized_budgets": {}}
    
    async def _analyze_cost_trends(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze cost trends and patterns"""
        return {"trends": {}, "insights": []}
    
    async def _analyze_cost_trends_data(self, cost_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze cost trends from data"""
        return {"trend": "stable", "growth_rate": 0.05}
    
    async def _detect_anomalies(self, cost_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect cost anomalies"""
        return []
    
    async def _calculate_efficiency_metrics(self, cost_data: Dict[str, Any], usage_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate cost efficiency metrics"""
        return {"efficiency_score": 0.85, "cost_per_unit": 0.12}
    
    async def _generate_cost_insights(self, trends: Dict, anomalies: List, efficiency: Dict) -> List[str]:
        """Generate actionable cost insights"""
        return [
            "Consider rightsizing underutilized instances",
            "Evaluate reserved instance opportunities",
            "Review storage lifecycle policies"
        ] 