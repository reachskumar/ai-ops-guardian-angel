"""
Zero-Trust Security Engine
Implements comprehensive zero-trust architecture with behavioral analytics
"""

import asyncio
import json
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import uuid

class ThreatLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ActionType(Enum):
    ALLOW = "allow"
    DENY = "deny"
    MONITOR = "monitor"
    CHALLENGE = "challenge"

@dataclass
class User:
    id: str
    email: str
    role: str
    department: str
    last_login: datetime
    risk_score: float
    behavioral_baseline: Dict[str, Any]

@dataclass
class Device:
    id: str
    type: str
    os: str
    version: str
    last_seen: datetime
    is_managed: bool
    risk_score: float
    fingerprint: str

@dataclass
class AccessRequest:
    id: str
    user_id: str
    device_id: str
    resource: str
    action: str
    timestamp: datetime
    source_ip: str
    user_agent: str
    geolocation: Dict[str, str]

@dataclass
class SecurityPolicy:
    id: str
    name: str
    conditions: List[Dict[str, Any]]
    action: ActionType
    priority: int
    enabled: bool

class ZeroTrustEngine:
    """Core zero-trust security engine"""
    
    def __init__(self):
        self.users = {}
        self.devices = {}
        self.policies = []
        self.active_sessions = {}
        self.threat_intel = {}
        self.behavioral_analyzer = BehavioralAnalyzer()
        self.threat_hunter = ThreatHunter()
        self._initialize_default_policies()
    
    def _initialize_default_policies(self):
        """Initialize default zero-trust policies"""
        self.policies = [
            SecurityPolicy(
                id="policy_001",
                name="High-Risk User Access",
                conditions=[
                    {"type": "user_risk_score", "operator": ">", "value": 0.8},
                    {"type": "resource_sensitivity", "operator": "==", "value": "high"}
                ],
                action=ActionType.CHALLENGE,
                priority=1,
                enabled=True
            ),
            SecurityPolicy(
                id="policy_002", 
                name="Unmanaged Device Block",
                conditions=[
                    {"type": "device_managed", "operator": "==", "value": False},
                    {"type": "resource_type", "operator": "==", "value": "production"}
                ],
                action=ActionType.DENY,
                priority=2,
                enabled=True
            ),
            SecurityPolicy(
                id="policy_003",
                name="Anomalous Behavior Detection",
                conditions=[
                    {"type": "behavioral_anomaly", "operator": ">", "value": 0.7}
                ],
                action=ActionType.MONITOR,
                priority=3,
                enabled=True
            ),
            SecurityPolicy(
                id="policy_004",
                name="Geographic Anomaly",
                conditions=[
                    {"type": "geolocation_anomaly", "operator": "==", "value": True}
                ],
                action=ActionType.CHALLENGE,
                priority=4,
                enabled=True
            )
        ]
    
    async def evaluate_access_request(self, request: AccessRequest) -> Dict[str, Any]:
        """Evaluate access request against zero-trust policies"""
        try:
            # Get user and device context
            user = self.users.get(request.user_id)
            device = self.devices.get(request.device_id)
            
            if not user or not device:
                return {
                    "decision": ActionType.DENY.value,
                    "reason": "User or device not found",
                    "risk_score": 1.0,
                    "request_id": request.id
                }
            
            # Calculate risk scores
            risk_analysis = await self._calculate_risk_score(request, user, device)
            
            # Evaluate policies
            policy_results = await self._evaluate_policies(request, user, device, risk_analysis)
            
            # Make final decision
            final_decision = self._make_access_decision(policy_results, risk_analysis)
            
            # Log and monitor
            await self._log_access_attempt(request, final_decision, risk_analysis)
            
            return {
                "decision": final_decision["action"],
                "reason": final_decision["reason"],
                "risk_score": risk_analysis["total_risk_score"],
                "request_id": request.id,
                "policy_matches": policy_results,
                "additional_security_measures": final_decision.get("additional_measures", []),
                "session_duration_minutes": final_decision.get("session_duration", 480),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "decision": ActionType.DENY.value,
                "reason": f"Security evaluation error: {str(e)}",
                "risk_score": 1.0,
                "request_id": request.id
            }
    
    async def _calculate_risk_score(self, request: AccessRequest, 
                                   user: User, device: Device) -> Dict[str, Any]:
        """Calculate comprehensive risk score"""
        risk_factors = {}
        
        # User risk factors
        risk_factors["user_base_risk"] = user.risk_score
        risk_factors["user_role_risk"] = self._calculate_role_risk(user.role)
        
        # Device risk factors
        risk_factors["device_risk"] = device.risk_score
        risk_factors["device_managed"] = 0.0 if device.is_managed else 0.3
        
        # Behavioral analysis
        behavioral_risk = await self.behavioral_analyzer.analyze_behavior(request, user)
        risk_factors["behavioral_risk"] = behavioral_risk["anomaly_score"]
        
        # Geographic analysis
        geo_risk = await self._analyze_geolocation(request, user)
        risk_factors["geographic_risk"] = geo_risk["risk_score"]
        
        # Time-based analysis
        time_risk = self._analyze_time_patterns(request, user)
        risk_factors["time_pattern_risk"] = time_risk
        
        # Network analysis
        network_risk = await self._analyze_network_context(request)
        risk_factors["network_risk"] = network_risk
        
        # Calculate weighted total
        weights = {
            "user_base_risk": 0.2,
            "user_role_risk": 0.1,
            "device_risk": 0.2,
            "device_managed": 0.1,
            "behavioral_risk": 0.25,
            "geographic_risk": 0.1,
            "time_pattern_risk": 0.03,
            "network_risk": 0.02
        }
        
        total_risk = sum(risk_factors[factor] * weights[factor] 
                        for factor in risk_factors.keys())
        
        return {
            "total_risk_score": min(1.0, total_risk),
            "risk_factors": risk_factors,
            "risk_breakdown": weights,
            "threat_level": self._determine_threat_level(total_risk)
        }
    
    def _calculate_role_risk(self, role: str) -> float:
        """Calculate risk based on user role"""
        role_risks = {
            "admin": 0.8,
            "developer": 0.6,
            "manager": 0.4,
            "user": 0.2,
            "guest": 0.9
        }
        return role_risks.get(role.lower(), 0.5)
    
    async def _analyze_geolocation(self, request: AccessRequest, user: User) -> Dict[str, Any]:
        """Analyze geographic risk factors"""
        try:
            user_country = user.behavioral_baseline.get("typical_countries", ["US"])
            request_country = request.geolocation.get("country", "Unknown")
            
            # Check if location is unusual
            is_unusual_location = request_country not in user_country
            
            # Check if it's a high-risk country
            high_risk_countries = ["CN", "RU", "KP", "IR"]  # Example list
            is_high_risk_country = request_country in high_risk_countries
            
            risk_score = 0.0
            if is_unusual_location:
                risk_score += 0.4
            if is_high_risk_country:
                risk_score += 0.6
            
            return {
                "risk_score": min(1.0, risk_score),
                "is_unusual_location": is_unusual_location,
                "is_high_risk_country": is_high_risk_country,
                "user_typical_countries": user_country,
                "request_country": request_country
            }
        except Exception:
            return {"risk_score": 0.5, "error": "Failed to analyze geolocation"}
    
    def _analyze_time_patterns(self, request: AccessRequest, user: User) -> float:
        """Analyze time-based access patterns"""
        try:
            current_hour = request.timestamp.hour
            typical_hours = user.behavioral_baseline.get("typical_access_hours", [9, 10, 11, 14, 15, 16])
            
            if current_hour in typical_hours:
                return 0.0
            elif current_hour < 6 or current_hour > 22:
                return 0.3  # High risk for very early/late access
            else:
                return 0.1  # Medium risk for somewhat unusual hours
        except Exception:
            return 0.2
    
    async def _analyze_network_context(self, request: AccessRequest) -> float:
        """Analyze network-based risk factors"""
        try:
            # Check if IP is in threat intelligence
            ip_reputation = await self._check_ip_reputation(request.source_ip)
            
            # Check for VPN/Proxy usage
            is_vpn = await self._detect_vpn_usage(request.source_ip)
            
            risk_score = 0.0
            if ip_reputation == "malicious":
                risk_score += 0.8
            elif ip_reputation == "suspicious":
                risk_score += 0.4
            
            if is_vpn:
                risk_score += 0.2
            
            return min(1.0, risk_score)
        except Exception:
            return 0.1
    
    async def _check_ip_reputation(self, ip_address: str) -> str:
        """Check IP reputation against threat intelligence"""
        # Mock implementation - would integrate with real threat intel feeds
        malicious_ips = ["192.168.1.100", "10.0.0.50"]  # Example
        suspicious_ips = ["203.0.113.1", "198.51.100.1"]  # Example
        
        if ip_address in malicious_ips:
            return "malicious"
        elif ip_address in suspicious_ips:
            return "suspicious"
        else:
            return "clean"
    
    async def _detect_vpn_usage(self, ip_address: str) -> bool:
        """Detect if IP is from VPN/proxy service"""
        # Mock implementation - would use real VPN detection service
        vpn_ranges = ["192.168.0.0/16", "10.0.0.0/8"]  # Example
        return any(ip_address.startswith(range_prefix.split('/')[0][:7]) 
                  for range_prefix in vpn_ranges)
    
    async def _evaluate_policies(self, request: AccessRequest, user: User, 
                                device: Device, risk_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Evaluate access request against security policies"""
        policy_results = []
        
        for policy in sorted(self.policies, key=lambda p: p.priority):
            if not policy.enabled:
                continue
            
            matches = await self._evaluate_policy_conditions(
                policy, request, user, device, risk_analysis
            )
            
            if matches:
                policy_results.append({
                    "policy_id": policy.id,
                    "policy_name": policy.name,
                    "action": policy.action.value,
                    "priority": policy.priority,
                    "conditions_met": matches
                })
        
        return policy_results
    
    async def _evaluate_policy_conditions(self, policy: SecurityPolicy, 
                                        request: AccessRequest, user: User,
                                        device: Device, risk_analysis: Dict[str, Any]) -> bool:
        """Evaluate if policy conditions are met"""
        for condition in policy.conditions:
            condition_type = condition["type"]
            operator = condition["operator"]
            expected_value = condition["value"]
            
            # Get actual value based on condition type
            actual_value = await self._get_condition_value(
                condition_type, request, user, device, risk_analysis
            )
            
            # Evaluate condition
            if not self._evaluate_condition(actual_value, operator, expected_value):
                return False
        
        return True
    
    async def _get_condition_value(self, condition_type: str, request: AccessRequest,
                                 user: User, device: Device, risk_analysis: Dict[str, Any]) -> Any:
        """Get value for policy condition evaluation"""
        if condition_type == "user_risk_score":
            return user.risk_score
        elif condition_type == "device_managed":
            return device.is_managed
        elif condition_type == "behavioral_anomaly":
            return risk_analysis["risk_factors"]["behavioral_risk"]
        elif condition_type == "geolocation_anomaly":
            geo_analysis = await self._analyze_geolocation(request, user)
            return geo_analysis["is_unusual_location"]
        elif condition_type == "resource_sensitivity":
            return self._get_resource_sensitivity(request.resource)
        elif condition_type == "resource_type":
            return self._get_resource_type(request.resource)
        else:
            return None
    
    def _get_resource_sensitivity(self, resource: str) -> str:
        """Get resource sensitivity level"""
        # Mock implementation
        if "admin" in resource or "config" in resource:
            return "high"
        elif "user" in resource:
            return "medium"
        else:
            return "low"
    
    def _get_resource_type(self, resource: str) -> str:
        """Get resource type"""
        # Mock implementation
        if "prod" in resource:
            return "production"
        elif "staging" in resource:
            return "staging"
        else:
            return "development"
    
    def _evaluate_condition(self, actual_value: Any, operator: str, expected_value: Any) -> bool:
        """Evaluate a single condition"""
        if operator == "==":
            return actual_value == expected_value
        elif operator == "!=":
            return actual_value != expected_value
        elif operator == ">":
            return actual_value > expected_value
        elif operator == "<":
            return actual_value < expected_value
        elif operator == ">=":
            return actual_value >= expected_value
        elif operator == "<=":
            return actual_value <= expected_value
        else:
            return False
    
    def _make_access_decision(self, policy_results: List[Dict[str, Any]], 
                            risk_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Make final access decision based on policy evaluation"""
        # If any DENY policy matches, deny access
        for result in policy_results:
            if result["action"] == ActionType.DENY.value:
                return {
                    "action": ActionType.DENY.value,
                    "reason": f"Denied by policy: {result['policy_name']}"
                }
        
        # Check for CHALLENGE policies
        challenge_policies = [r for r in policy_results if r["action"] == ActionType.CHALLENGE.value]
        if challenge_policies:
            return {
                "action": ActionType.CHALLENGE.value,
                "reason": f"Additional verification required: {challenge_policies[0]['policy_name']}",
                "additional_measures": ["mfa", "device_verification"]
            }
        
        # Check overall risk score
        total_risk = risk_analysis["total_risk_score"]
        if total_risk > 0.8:
            return {
                "action": ActionType.DENY.value,
                "reason": f"High risk score: {total_risk:.2f}"
            }
        elif total_risk > 0.6:
            return {
                "action": ActionType.CHALLENGE.value,
                "reason": f"Elevated risk score: {total_risk:.2f}",
                "additional_measures": ["mfa"],
                "session_duration": 240  # Shorter session
            }
        else:
            return {
                "action": ActionType.ALLOW.value,
                "reason": "Access granted - low risk"
            }
    
    def _determine_threat_level(self, risk_score: float) -> ThreatLevel:
        """Determine threat level based on risk score"""
        if risk_score >= 0.8:
            return ThreatLevel.CRITICAL
        elif risk_score >= 0.6:
            return ThreatLevel.HIGH
        elif risk_score >= 0.4:
            return ThreatLevel.MEDIUM
        else:
            return ThreatLevel.LOW
    
    async def _log_access_attempt(self, request: AccessRequest, 
                                decision: Dict[str, Any], risk_analysis: Dict[str, Any]):
        """Log access attempt for audit and analysis"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "request_id": request.id,
            "user_id": request.user_id,
            "device_id": request.device_id,
            "resource": request.resource,
            "action": request.action,
            "decision": decision["action"],
            "reason": decision["reason"],
            "risk_score": risk_analysis["total_risk_score"],
            "threat_level": risk_analysis["threat_level"].value,
            "source_ip": request.source_ip,
            "geolocation": request.geolocation
        }
        
        # In a real implementation, this would go to a SIEM or log aggregation system
        print(f"SECURITY_LOG: {json.dumps(log_entry)}")

class BehavioralAnalyzer:
    """Analyzes user behavior patterns for anomaly detection"""
    
    def __init__(self):
        self.behavioral_models = {}
    
    async def analyze_behavior(self, request: AccessRequest, user: User) -> Dict[str, Any]:
        """Analyze user behavior for anomalies"""
        try:
            baseline = user.behavioral_baseline
            
            # Analyze access patterns
            time_anomaly = self._analyze_time_anomaly(request, baseline)
            resource_anomaly = self._analyze_resource_anomaly(request, baseline)
            frequency_anomaly = self._analyze_frequency_anomaly(request, user)
            
            # Calculate overall anomaly score
            anomaly_score = (time_anomaly + resource_anomaly + frequency_anomaly) / 3
            
            return {
                "anomaly_score": anomaly_score,
                "time_anomaly": time_anomaly,
                "resource_anomaly": resource_anomaly,
                "frequency_anomaly": frequency_anomaly,
                "baseline_comparison": {
                    "typical_access_times": baseline.get("typical_access_hours", []),
                    "typical_resources": baseline.get("typical_resources", []),
                    "typical_frequency": baseline.get("daily_access_count", 50)
                }
            }
        except Exception as e:
            return {"anomaly_score": 0.5, "error": str(e)}
    
    def _analyze_time_anomaly(self, request: AccessRequest, baseline: Dict[str, Any]) -> float:
        """Analyze time-based access anomalies"""
        typical_hours = baseline.get("typical_access_hours", [9, 10, 11, 14, 15, 16])
        current_hour = request.timestamp.hour
        
        if current_hour not in typical_hours:
            # Calculate how far from typical hours
            distances = [abs(current_hour - hour) for hour in typical_hours]
            min_distance = min(distances)
            return min(1.0, min_distance / 12.0)  # Normalize by 12 hours
        return 0.0
    
    def _analyze_resource_anomaly(self, request: AccessRequest, baseline: Dict[str, Any]) -> float:
        """Analyze resource access anomalies"""
        typical_resources = baseline.get("typical_resources", [])
        
        if not typical_resources:
            return 0.3  # Medium risk for new users
        
        # Check if resource is in typical access list
        if request.resource not in typical_resources:
            return 0.7  # High anomaly for unusual resource access
        return 0.0
    
    def _analyze_frequency_anomaly(self, request: AccessRequest, user: User) -> float:
        """Analyze access frequency anomalies"""
        # Mock implementation - would analyze recent access patterns
        typical_daily_count = user.behavioral_baseline.get("daily_access_count", 50)
        
        # This would check actual recent access count
        current_daily_count = 75  # Mock current count
        
        if current_daily_count > typical_daily_count * 2:
            return 0.8  # High anomaly for excessive access
        elif current_daily_count > typical_daily_count * 1.5:
            return 0.4  # Medium anomaly
        return 0.0

class ThreatHunter:
    """Advanced threat hunting capabilities"""
    
    def __init__(self):
        self.threat_patterns = self._load_threat_patterns()
        self.indicators = {}
    
    def _load_threat_patterns(self) -> List[Dict[str, Any]]:
        """Load threat hunting patterns"""
        return [
            {
                "name": "Credential Stuffing",
                "pattern": "multiple_failed_logins_different_users",
                "threshold": 10,
                "timeframe_minutes": 5
            },
            {
                "name": "Privilege Escalation",
                "pattern": "rapid_role_changes",
                "threshold": 3,
                "timeframe_minutes": 60
            },
            {
                "name": "Data Exfiltration",
                "pattern": "unusual_data_access_volume",
                "threshold": 1000,  # MB
                "timeframe_minutes": 30
            }
        ]
    
    async def hunt_threats(self, access_logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Hunt for threats in access logs"""
        detected_threats = []
        
        for pattern in self.threat_patterns:
            threat_instances = await self._detect_pattern(pattern, access_logs)
            if threat_instances:
                detected_threats.extend(threat_instances)
        
        return {
            "detected_threats": detected_threats,
            "threat_count": len(detected_threats),
            "high_priority_threats": [t for t in detected_threats if t["severity"] == "high"],
            "recommendations": self._generate_threat_recommendations(detected_threats)
        }
    
    async def _detect_pattern(self, pattern: Dict[str, Any], 
                            logs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect specific threat pattern in logs"""
        threats = []
        
        if pattern["name"] == "Credential Stuffing":
            # Look for multiple failed logins
            failed_logins = [log for log in logs if log.get("decision") == "deny"]
            if len(failed_logins) >= pattern["threshold"]:
                threats.append({
                    "threat_type": pattern["name"],
                    "severity": "high",
                    "description": f"Detected {len(failed_logins)} failed login attempts",
                    "indicators": failed_logins[:5],  # Sample of events
                    "recommended_actions": ["Block suspicious IPs", "Enable account lockout"]
                })
        
        return threats
    
    def _generate_threat_recommendations(self, threats: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations based on detected threats"""
        recommendations = []
        
        threat_types = [t["threat_type"] for t in threats]
        
        if "Credential Stuffing" in threat_types:
            recommendations.append("Implement rate limiting for login attempts")
            recommendations.append("Enable CAPTCHA for suspicious login patterns")
        
        if "Privilege Escalation" in threat_types:
            recommendations.append("Review and audit privilege changes")
            recommendations.append("Implement approval workflows for role changes")
        
        return recommendations

# Global instances
zero_trust_engine = ZeroTrustEngine()
behavioral_analyzer = BehavioralAnalyzer()
threat_hunter = ThreatHunter()