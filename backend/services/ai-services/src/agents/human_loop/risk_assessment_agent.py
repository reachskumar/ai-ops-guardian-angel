"""
Risk Assessment Agent - AI for intelligent risk scoring and multi-dimensional analysis
Provides comprehensive risk evaluation for decisions and changes
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import json
from enum import Enum
import numpy as np

from ...agents.base_agent import BaseAgent, AgentTask, AgentCapabilities, AgentRecommendation
from ...config.settings import AgentType, RiskLevel, settings


class RiskCategory(str, Enum):
    SECURITY = "security"
    OPERATIONAL = "operational"
    FINANCIAL = "financial"
    COMPLIANCE = "compliance"
    REPUTATION = "reputation"
    TECHNICAL = "technical"


class RiskAssessmentAgent(BaseAgent):
    """
    Advanced AI agent for comprehensive risk assessment and scoring.
    
    Capabilities:
    - Multi-dimensional risk analysis
    - Dynamic risk scoring algorithms
    - Risk correlation and dependencies
    - Scenario-based risk modeling
    - Risk mitigation recommendations
    - Risk monitoring and alerting
    - Compliance risk assessment
    - Business impact analysis
    """
    
    def __init__(self):
        capabilities = AgentCapabilities(
            supported_tasks=[
                "comprehensive_risk_assessment",
                "calculate_risk_score",
                "analyze_risk_factors",
                "assess_business_impact",
                "evaluate_mitigation_strategies",
                "monitor_risk_trends",
                "compliance_risk_analysis",
                "scenario_modeling",
                "risk_correlation_analysis",
                "generate_risk_reports"
            ],
            required_tools=["risk_calculator", "impact_analyzer", "scenario_modeler"],
            max_concurrent_tasks=5,
            average_response_time=90.0
        )
        
        super().__init__(
            agent_type=AgentType.RISK_ASSESSMENT,
            name="Risk Assessment Agent", 
            description="AI-powered comprehensive risk assessment and analysis",
            capabilities=capabilities
        )
        
        # Risk scoring weights by category
        self.risk_weights = {
            RiskCategory.SECURITY: 0.25,
            RiskCategory.OPERATIONAL: 0.20,
            RiskCategory.FINANCIAL: 0.20,
            RiskCategory.COMPLIANCE: 0.15,
            RiskCategory.REPUTATION: 0.10,
            RiskCategory.TECHNICAL: 0.10
        }
        
        # Risk scoring matrices
        self.probability_impact_matrix = {
            ('very_low', 'very_low'): 1,
            ('very_low', 'low'): 2,
            ('very_low', 'medium'): 3,
            ('very_low', 'high'): 4,
            ('very_low', 'very_high'): 5,
            ('low', 'very_low'): 2,
            ('low', 'low'): 4,
            ('low', 'medium'): 6,
            ('low', 'high'): 8,
            ('low', 'very_high'): 10,
            ('medium', 'very_low'): 3,
            ('medium', 'low'): 6,
            ('medium', 'medium'): 9,
            ('medium', 'high'): 12,
            ('medium', 'very_high'): 15,
            ('high', 'very_low'): 4,
            ('high', 'low'): 8,
            ('high', 'medium'): 12,
            ('high', 'high'): 16,
            ('high', 'very_high'): 20,
            ('very_high', 'very_low'): 5,
            ('very_high', 'low'): 10,
            ('very_high', 'medium'): 15,
            ('very_high', 'high'): 20,
            ('very_high', 'very_high'): 25
        }
        
        # Historical risk data for trend analysis
        self.risk_history = []
        
        self.logger.info("Risk Assessment Agent initialized")
    
    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        """Execute risk assessment tasks"""
        task_type = task.task_type
        context = task.context
        
        self.logger.info(f"Executing risk assessment task: {task_type}")
        
        if task_type == "comprehensive_risk_assessment":
            return await self._comprehensive_risk_assessment(context)
        elif task_type == "calculate_risk_score":
            return await self._calculate_risk_score(context)
        elif task_type == "analyze_risk_factors":
            return await self._analyze_risk_factors(context)
        elif task_type == "assess_business_impact":
            return await self._assess_business_impact(context)
        elif task_type == "evaluate_mitigation_strategies":
            return await self._evaluate_mitigation_strategies(context)
        elif task_type == "monitor_risk_trends":
            return await self._monitor_risk_trends(context)
        elif task_type == "compliance_risk_analysis":
            return await self._compliance_risk_analysis(context)
        elif task_type == "scenario_modeling":
            return await self._scenario_modeling(context)
        elif task_type == "risk_correlation_analysis":
            return await self._risk_correlation_analysis(context)
        elif task_type == "generate_risk_reports":
            return await self._generate_risk_reports(context)
        else:
            raise ValueError(f"Unsupported risk assessment task: {task_type}")
    
    async def _generate_recommendation_logic(
        self, 
        context: Dict[str, Any], 
        task_type: str
    ) -> Dict[str, Any]:
        """Generate risk assessment recommendations"""
        
        if task_type == "comprehensive_risk_assessment":
            assessment_result = await self._comprehensive_risk_assessment(context)
            
            overall_risk_score = assessment_result.get('overall_risk_score', 50)
            high_risk_factors = assessment_result.get('high_risk_factors', 0)
            critical_risks = assessment_result.get('critical_risks', [])
            
            # Determine risk level
            if overall_risk_score >= 80 or len(critical_risks) > 0:
                risk_level = RiskLevel.CRITICAL
            elif overall_risk_score >= 60 or high_risk_factors > 3:
                risk_level = RiskLevel.HIGH
            elif overall_risk_score >= 40 or high_risk_factors > 0:
                risk_level = RiskLevel.MEDIUM
            else:
                risk_level = RiskLevel.LOW
            
            return {
                "title": f"Comprehensive Risk Assessment - {overall_risk_score:.1f}/100 risk score",
                "description": f"Risk analysis reveals {len(critical_risks)} critical risks and {high_risk_factors} high-risk factors requiring attention",
                "reasoning": f"""
                Comprehensive risk assessment analysis:
                
                **Overall Risk Score**: {overall_risk_score:.1f}/100
                **Risk Level**: {risk_level.value.upper()}
                **Critical Risks**: {len(critical_risks)}
                **High-Risk Factors**: {high_risk_factors}
                
                **Risk Category Breakdown**:
                {self._format_risk_categories(assessment_result.get('category_scores', {}))}
                
                **Top Risk Factors**:
                {self._format_top_risks(assessment_result.get('top_risks', []))}
                
                **Immediate Risk Mitigation Required**:
                1. Address all critical risk factors immediately
                2. Implement monitoring for high-risk areas
                3. Develop contingency plans for identified scenarios
                4. Establish risk monitoring dashboards
                5. Schedule regular risk reassessments
                
                **Risk Management Strategy**:
                - **Avoid**: {len([r for r in critical_risks if r.get('strategy') == 'avoid'])} risks
                - **Mitigate**: {len([r for r in critical_risks if r.get('strategy') == 'mitigate'])} risks
                - **Transfer**: {len([r for r in critical_risks if r.get('strategy') == 'transfer'])} risks
                - **Accept**: {len([r for r in critical_risks if r.get('strategy') == 'accept'])} risks
                
                **Business Impact Assessment**:
                - Financial Impact: {assessment_result.get('financial_impact', 'Medium')}
                - Operational Impact: {assessment_result.get('operational_impact', 'Medium')}
                - Reputational Impact: {assessment_result.get('reputational_impact', 'Low')}
                """,
                "confidence": 0.90,
                "impact": f"Comprehensive risk mitigation strategy implementation",
                "risk_level": risk_level,
                "estimated_duration": "2-8 weeks risk mitigation implementation",
                "resources_affected": assessment_result.get('affected_areas', []),
                "alternatives": [
                    "Phased risk mitigation approach",
                    "Risk transfer through insurance",
                    "Third-party risk management services"
                ],
                "prerequisites": [
                    "Risk management framework establishment",
                    "Stakeholder risk tolerance definition",
                    "Risk monitoring tools deployment"
                ],
                "rollback_plan": "Risk mitigation measures can be adjusted based on ongoing assessment results"
            }
        
        return {
            "title": "Risk Assessment Complete",
            "description": "Comprehensive risk assessment completed with mitigation recommendations",
            "reasoning": "Analyzed multiple risk dimensions and provided strategic recommendations",
            "confidence": 0.85,
            "impact": "Enhanced risk management and decision-making capability",
            "risk_level": RiskLevel.MEDIUM
        }
    
    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze data for comprehensive risk insights"""
        try:
            assets = data.get('assets', [])
            threats = data.get('threats', [])
            vulnerabilities = data.get('vulnerabilities', [])
            controls = data.get('controls', [])
            
            # Calculate inherent risk
            inherent_risk = await self._calculate_inherent_risk(assets, threats, vulnerabilities)
            
            # Calculate residual risk
            residual_risk = await self._calculate_residual_risk(inherent_risk, controls)
            
            # Analyze risk trends
            risk_trends = await self._analyze_risk_trends_data(data)
            
            # Generate risk scenarios
            scenarios = await self._generate_risk_scenarios(assets, threats)
            
            return {
                'inherent_risk': inherent_risk,
                'residual_risk': residual_risk,
                'risk_trends': risk_trends,
                'risk_scenarios': scenarios,
                'risk_appetite_alignment': await self._assess_risk_appetite_alignment(residual_risk),
                'analysis_timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            self.logger.error(f"Risk assessment data analysis failed: {str(e)}")
            raise
    
    # Core Risk Assessment Methods
    
    async def _comprehensive_risk_assessment(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive multi-dimensional risk assessment"""
        try:
            assessment_scope = context.get('scope', {})
            risk_factors = context.get('risk_factors', [])
            
            self.logger.info("Performing comprehensive risk assessment")
            
            # Assess each risk category
            category_scores = {}
            all_risks = []
            
            for category in RiskCategory:
                category_assessment = await self._assess_risk_category(category, risk_factors, assessment_scope)
                category_scores[category.value] = category_assessment['score']
                all_risks.extend(category_assessment['risks'])
            
            # Calculate overall weighted risk score
            overall_risk_score = sum(
                score * self.risk_weights[RiskCategory(category)]
                for category, score in category_scores.items()
            )
            
            # Identify top risks
            sorted_risks = sorted(all_risks, key=lambda x: x.get('score', 0), reverse=True)
            top_risks = sorted_risks[:10]
            critical_risks = [r for r in all_risks if r.get('level') == 'critical']
            high_risk_factors = len([r for r in all_risks if r.get('level') == 'high'])
            
            # Assess business impact
            business_impact = await self._assess_comprehensive_business_impact(all_risks)
            
            # Generate mitigation recommendations
            mitigation_recommendations = await self._generate_mitigation_recommendations(top_risks)
            
            return {
                'overall_risk_score': overall_risk_score,
                'category_scores': category_scores,
                'total_risks_identified': len(all_risks),
                'critical_risks': critical_risks,
                'high_risk_factors': high_risk_factors,
                'top_risks': top_risks,
                'financial_impact': business_impact.get('financial', 'Medium'),
                'operational_impact': business_impact.get('operational', 'Medium'),
                'reputational_impact': business_impact.get('reputational', 'Low'),
                'affected_areas': await self._identify_affected_areas(all_risks),
                'mitigation_recommendations': mitigation_recommendations,
                'risk_monitoring_plan': await self._create_risk_monitoring_plan(top_risks),
                'next_assessment_date': await self._calculate_next_assessment_date(overall_risk_score)
            }
            
        except Exception as e:
            self.logger.error(f"Comprehensive risk assessment failed: {str(e)}")
            raise
    
    async def _assess_risk_category(self, category: RiskCategory, risk_factors: List[Dict[str, Any]], scope: Dict[str, Any]) -> Dict[str, Any]:
        """Assess risk for a specific category"""
        category_risks = [rf for rf in risk_factors if rf.get('category') == category.value]
        
        if not category_risks:
            return {'score': 10, 'risks': []}  # Default low risk if no factors
        
        category_score = 0
        assessed_risks = []
        
        for risk_factor in category_risks:
            risk_assessment = await self._assess_individual_risk(risk_factor, scope)
            assessed_risks.append(risk_assessment)
            category_score += risk_assessment['score']
        
        # Average score for the category
        avg_category_score = category_score / len(category_risks) if category_risks else 0
        
        return {
            'score': min(100, avg_category_score),
            'risks': assessed_risks
        }
    
    async def _assess_individual_risk(self, risk_factor: Dict[str, Any], scope: Dict[str, Any]) -> Dict[str, Any]:
        """Assess an individual risk factor"""
        probability = risk_factor.get('probability', 'medium')
        impact = risk_factor.get('impact', 'medium')
        
        # Calculate base risk score using probability-impact matrix
        base_score = self.probability_impact_matrix.get((probability, impact), 9) * 4  # Scale to 0-100
        
        # Apply contextual adjustments
        if scope.get('environment') == 'production':
            base_score *= 1.2
        if scope.get('critical_system', False):
            base_score *= 1.3
        if risk_factor.get('historical_occurrence', False):
            base_score *= 1.1
        
        # Determine risk level
        if base_score >= 80:
            level = 'critical'
        elif base_score >= 60:
            level = 'high'
        elif base_score >= 40:
            level = 'medium'
        else:
            level = 'low'
        
        return {
            'id': risk_factor.get('id', 'unknown'),
            'name': risk_factor.get('name', 'Unknown Risk'),
            'category': risk_factor.get('category', 'technical'),
            'probability': probability,
            'impact': impact,
            'score': min(100, base_score),
            'level': level,
            'description': risk_factor.get('description', ''),
            'mitigation_strategy': await self._determine_mitigation_strategy(base_score, risk_factor)
        }
    
    def _format_risk_categories(self, category_scores: Dict[str, float]) -> str:
        """Format risk category scores for display"""
        if not category_scores:
            return "No risk categories assessed"
        
        formatted = []
        for category, score in category_scores.items():
            formatted.append(f"- {category.replace('_', ' ').title()}: {score:.1f}/100")
        
        return "\n".join(formatted)
    
    def _format_top_risks(self, top_risks: List[Dict[str, Any]]) -> str:
        """Format top risks for display"""
        if not top_risks:
            return "No significant risks identified"
        
        formatted = []
        for risk in top_risks[:5]:  # Show top 5
            name = risk.get('name', 'Unknown')
            score = risk.get('score', 0)
            level = risk.get('level', 'unknown')
            formatted.append(f"- {name}: {score:.1f}/100 ({level})")
        
        return "\n".join(formatted)
    
    # Method stubs for completeness
    async def _calculate_risk_score(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _analyze_risk_factors(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _assess_business_impact(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _evaluate_mitigation_strategies(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _monitor_risk_trends(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _compliance_risk_analysis(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _scenario_modeling(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _risk_correlation_analysis(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _generate_risk_reports(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _calculate_inherent_risk(self, assets, threats, vulns) -> Dict[str, Any]: return {}
    async def _calculate_residual_risk(self, inherent, controls) -> Dict[str, Any]: return {}
    async def _analyze_risk_trends_data(self, data) -> Dict[str, Any]: return {}
    async def _generate_risk_scenarios(self, assets, threats) -> List[Dict[str, Any]]: return []
    async def _assess_risk_appetite_alignment(self, risk) -> str: return "Aligned"
    async def _assess_comprehensive_business_impact(self, risks) -> Dict[str, str]: return {'financial': 'Medium', 'operational': 'Medium', 'reputational': 'Low'}
    async def _generate_mitigation_recommendations(self, risks) -> List[str]: return []
    async def _identify_affected_areas(self, risks) -> List[str]: return []
    async def _create_risk_monitoring_plan(self, risks) -> Dict[str, Any]: return {}
    async def _calculate_next_assessment_date(self, score) -> str: return "2024-12-31"
    async def _determine_mitigation_strategy(self, score, factor) -> str: return "mitigate" if score > 50 else "monitor" 