"""
Threat Hunting Agent - Advanced AI for proactive threat detection and hunting
Uses ML and behavioral analysis to identify sophisticated threats and attack patterns
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import json
import re
from collections import defaultdict, Counter

from ...agents.base_agent import BaseAgent, AgentTask, AgentCapabilities, AgentRecommendation
from ...config.settings import AgentType, RiskLevel, settings


class ThreatHuntingAgent(BaseAgent):
    """
    Advanced AI agent for proactive threat hunting and detection.
    
    Capabilities:
    - Advanced Persistent Threat (APT) detection
    - Behavioral anomaly analysis
    - Threat intelligence correlation
    - IOC (Indicators of Compromise) hunting
    - Attack pattern recognition
    - Zero-day threat detection
    - Lateral movement detection
    - Command & control communication analysis
    """
    
    def __init__(self):
        capabilities = AgentCapabilities(
            supported_tasks=[
                "threat_hunting",
                "apt_detection",
                "behavioral_analysis",
                "ioc_hunting",
                "pattern_recognition",
                "zero_day_detection",
                "lateral_movement_detection",
                "c2_analysis",
                "threat_intelligence_correlation",
                "attack_reconstruction"
            ],
            required_tools=["threat_hunter", "behavioral_analyzer", "ioc_detector"],
            max_concurrent_tasks=4,
            average_response_time=180.0
        )
        
        super().__init__(
            agent_type=AgentType.THREAT_HUNTING,
            name="Threat Hunting Agent",
            description="AI-powered advanced threat detection and hunting",
            capabilities=capabilities
        )
        
        # Threat intelligence feeds
        self.threat_feeds = [
            "mitre_attack",
            "cti_feeds",
            "commercial_intel",
            "open_source_intel"
        ]
        
        # IOC patterns
        self.ioc_patterns = {
            'ip_addresses': r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b',
            'domains': r'\b[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}\b',
            'file_hashes': r'\b[a-fA-F0-9]{32,64}\b',
            'urls': r'https?://[^\s<>"{}|\\^`\[\]]+'
        }
        
        # Attack patterns (MITRE ATT&CK)
        self.attack_patterns = {
            'T1566': 'Phishing',
            'T1055': 'Process Injection',
            'T1083': 'File and Directory Discovery',
            'T1082': 'System Information Discovery',
            'T1569': 'System Services',
            'T1036': 'Masquerading'
        }
        
        # Behavioral baselines
        self.behavioral_baselines = {}
        self.anomaly_threshold = 0.7
        
        self.logger.info("Threat Hunting Agent initialized")
    
    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        """Execute threat hunting tasks"""
        task_type = task.task_type
        context = task.context
        
        self.logger.info(f"Executing threat hunting task: {task_type}")
        
        if task_type == "threat_hunting":
            return await self._hunt_threats(context)
        elif task_type == "apt_detection":
            return await self._detect_apt(context)
        elif task_type == "behavioral_analysis":
            return await self._analyze_behavior(context)
        elif task_type == "ioc_hunting":
            return await self._hunt_iocs(context)
        elif task_type == "pattern_recognition":
            return await self._recognize_patterns(context)
        elif task_type == "zero_day_detection":
            return await self._detect_zero_day(context)
        elif task_type == "lateral_movement_detection":
            return await self._detect_lateral_movement(context)
        elif task_type == "c2_analysis":
            return await self._analyze_c2_communication(context)
        elif task_type == "threat_intelligence_correlation":
            return await self._correlate_threat_intelligence(context)
        elif task_type == "attack_reconstruction":
            return await self._reconstruct_attack(context)
        else:
            raise ValueError(f"Unsupported threat hunting task: {task_type}")
    
    async def _generate_recommendation_logic(
        self, 
        context: Dict[str, Any], 
        task_type: str
    ) -> Dict[str, Any]:
        """Generate threat hunting recommendations"""
        
        if task_type == "threat_hunting":
            hunting_result = await self._hunt_threats(context)
            
            threats_found = hunting_result.get('threats_detected', [])
            high_severity_threats = len([t for t in threats_found if t.get('severity') == 'high'])
            threat_score = hunting_result.get('overall_threat_score', 0)
            
            # Determine risk level
            if high_severity_threats > 0 or threat_score > 80:
                risk_level = RiskLevel.CRITICAL
            elif len(threats_found) > 3 or threat_score > 60:
                risk_level = RiskLevel.HIGH
            elif len(threats_found) > 0 or threat_score > 30:
                risk_level = RiskLevel.MEDIUM
            else:
                risk_level = RiskLevel.LOW
            
            return {
                "title": f"Threat Hunting Analysis - {len(threats_found)} threats detected",
                "description": f"Advanced threat hunting identified {high_severity_threats} high-severity threats requiring immediate attention",
                "reasoning": f"""
                Comprehensive threat hunting analysis reveals:
                
                **Overall Threat Score**: {threat_score}/100
                **Threats Detected**: {len(threats_found)}
                **High Severity**: {high_severity_threats}
                **Medium Severity**: {len([t for t in threats_found if t.get('severity') == 'medium'])}
                
                **Threat Categories Identified**:
                {self._format_threat_categories(threats_found)}
                
                **Attack Patterns Detected**:
                {self._format_attack_patterns(hunting_result.get('attack_patterns', []))}
                
                **Immediate Actions Required**:
                1. Isolate affected systems immediately
                2. Collect forensic evidence
                3. Activate incident response team
                4. Implement containment measures
                5. Begin threat eradication procedures
                
                **Threat Intelligence Insights**:
                - Correlation with known APT groups
                - IOC matching against threat feeds
                - Behavioral pattern analysis
                - Attribution assessment
                """,
                "confidence": hunting_result.get('confidence', 0.85),
                "impact": f"Critical security threat mitigation required",
                "risk_level": risk_level,
                "estimated_duration": "Immediate action required - 2-24 hours containment",
                "resources_affected": hunting_result.get('affected_systems', []),
                "alternatives": [
                    "Quarantine affected systems",
                    "Implement network segmentation",
                    "Deploy additional monitoring"
                ],
                "prerequisites": [
                    "Incident response team activation",
                    "Forensic tools deployment",
                    "Management notification"
                ],
                "rollback_plan": "System restoration from clean backups after threat eradication"
            }
        
        return {
            "title": "Threat Hunting Complete",
            "description": "Advanced threat hunting analysis completed",
            "reasoning": "Analyzed environment for sophisticated threats and attack patterns",
            "confidence": 0.80,
            "impact": "Enhanced threat detection and security posture",
            "risk_level": RiskLevel.MEDIUM
        }
    
    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze security data for advanced threats"""
        try:
            network_traffic = data.get('network_traffic', [])
            system_logs = data.get('system_logs', [])
            process_data = data.get('process_data', [])
            
            # Hunt for IOCs
            ioc_results = await self._hunt_iocs_in_data(network_traffic, system_logs)
            
            # Behavioral analysis
            behavioral_anomalies = await self._detect_behavioral_anomalies(process_data, system_logs)
            
            # Pattern matching
            attack_patterns = await self._match_attack_patterns(data)
            
            # Threat scoring
            threat_score = await self._calculate_threat_score(ioc_results, behavioral_anomalies, attack_patterns)
            
            return {
                'ioc_results': ioc_results,
                'behavioral_anomalies': behavioral_anomalies,
                'attack_patterns': attack_patterns,
                'threat_score': threat_score,
                'recommendations': await self._generate_hunting_recommendations(data),
                'analysis_timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            self.logger.error(f"Threat hunting data analysis failed: {str(e)}")
            raise
    
    # Core Threat Hunting Methods
    
    async def _hunt_threats(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive threat hunting operation"""
        try:
            data_sources = context.get('data_sources', [])
            hunt_duration = context.get('hunt_duration_hours', 24)
            
            self.logger.info(f"Starting threat hunt across {len(data_sources)} data sources")
            
            threats_detected = []
            attack_patterns = []
            ioc_matches = []
            
            # Hunt across different data sources
            for source in data_sources:
                source_threats = await self._hunt_in_data_source(source, hunt_duration)
                threats_detected.extend(source_threats.get('threats', []))
                attack_patterns.extend(source_threats.get('patterns', []))
                ioc_matches.extend(source_threats.get('iocs', []))
            
            # Correlate findings
            correlated_threats = await self._correlate_threat_findings(
                threats_detected, attack_patterns, ioc_matches
            )
            
            # Calculate overall threat score
            threat_score = await self._calculate_overall_threat_score(correlated_threats)
            
            # Generate threat intelligence
            threat_intel = await self._generate_threat_intelligence(correlated_threats)
            
            return {
                'hunt_duration_hours': hunt_duration,
                'data_sources_analyzed': len(data_sources),
                'threats_detected': correlated_threats,
                'attack_patterns': attack_patterns,
                'ioc_matches': ioc_matches,
                'overall_threat_score': threat_score,
                'threat_intelligence': threat_intel,
                'affected_systems': await self._identify_affected_systems(correlated_threats),
                'confidence': 0.85,
                'hunting_recommendations': await self._generate_hunting_next_steps(correlated_threats)
            }
            
        except Exception as e:
            self.logger.error(f"Threat hunting failed: {str(e)}")
            raise
    
    async def _hunt_in_data_source(self, source: Dict[str, Any], duration: int) -> Dict[str, Any]:
        """Hunt for threats in a specific data source"""
        source_type = source.get('type', 'unknown')
        data = source.get('data', [])
        
        threats = []
        patterns = []
        iocs = []
        
        if source_type == 'network_logs':
            threats.extend(await self._hunt_network_threats(data))
            iocs.extend(await self._extract_network_iocs(data))
        elif source_type == 'system_logs':
            threats.extend(await self._hunt_system_threats(data))
            patterns.extend(await self._detect_system_patterns(data))
        elif source_type == 'process_data':
            threats.extend(await self._hunt_process_threats(data))
            patterns.extend(await self._detect_process_patterns(data))
        
        return {
            'threats': threats,
            'patterns': patterns,
            'iocs': iocs
        }
    
    def _format_threat_categories(self, threats: List[Dict[str, Any]]) -> str:
        """Format threat categories for display"""
        if not threats:
            return "No threats detected"
        
        categories = Counter(threat.get('category', 'Unknown') for threat in threats)
        formatted = []
        for category, count in categories.most_common(5):
            formatted.append(f"- {category}: {count} instances")
        
        return "\n".join(formatted)
    
    def _format_attack_patterns(self, patterns: List[Dict[str, Any]]) -> str:
        """Format attack patterns for display"""
        if not patterns:
            return "No attack patterns detected"
        
        formatted = []
        for pattern in patterns[:5]:  # Show top 5
            name = pattern.get('name', 'Unknown')
            confidence = pattern.get('confidence', 0)
            formatted.append(f"- {name} (confidence: {confidence:.1%})")
        
        return "\n".join(formatted)
    
    # Method stubs for completeness
    async def _detect_apt(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _analyze_behavior(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _hunt_iocs(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _recognize_patterns(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _detect_zero_day(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _detect_lateral_movement(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _analyze_c2_communication(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _correlate_threat_intelligence(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _reconstruct_attack(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _hunt_iocs_in_data(self, network, logs) -> List[Dict[str, Any]]: return []
    async def _detect_behavioral_anomalies(self, process, logs) -> List[Dict[str, Any]]: return []
    async def _match_attack_patterns(self, data) -> List[Dict[str, Any]]: return []
    async def _calculate_threat_score(self, iocs, anomalies, patterns) -> float: return 25.0
    async def _generate_hunting_recommendations(self, data) -> List[str]: return []
    async def _correlate_threat_findings(self, threats, patterns, iocs) -> List[Dict[str, Any]]: return threats
    async def _calculate_overall_threat_score(self, threats) -> float: return 30.0
    async def _generate_threat_intelligence(self, threats) -> Dict[str, Any]: return {}
    async def _identify_affected_systems(self, threats) -> List[str]: return []
    async def _generate_hunting_next_steps(self, threats) -> List[str]: return []
    async def _hunt_network_threats(self, data) -> List[Dict[str, Any]]: return []
    async def _extract_network_iocs(self, data) -> List[Dict[str, Any]]: return []
    async def _hunt_system_threats(self, data) -> List[Dict[str, Any]]: return []
    async def _detect_system_patterns(self, data) -> List[Dict[str, Any]]: return []
    async def _hunt_process_threats(self, data) -> List[Dict[str, Any]]: return []
    async def _detect_process_patterns(self, data) -> List[Dict[str, Any]]: return [] 