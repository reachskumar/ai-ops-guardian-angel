"""
Root Cause Analysis (RCA) Agent
Analyzes incidents and provides intelligent root cause analysis using logs, metrics, and traces
"""

import asyncio
import json
import re
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
import boto3
import openai

@dataclass
class IncidentData:
    """Incident information"""
    incident_id: str
    title: str
    description: str
    severity: str  # critical, high, medium, low
    start_time: datetime
    end_time: Optional[datetime]
    affected_services: List[str]
    impact: str
    status: str  # open, investigating, resolved, closed

@dataclass
class LogEntry:
    """Log entry for analysis"""
    timestamp: datetime
    level: str  # error, warning, info, debug
    service: str
    message: str
    trace_id: Optional[str]
    span_id: Optional[str]
    metadata: Dict[str, Any]

@dataclass
class MetricData:
    """Metric data point"""
    timestamp: datetime
    metric_name: str
    value: float
    unit: str
    dimensions: Dict[str, str]

@dataclass
class RCAResult:
    """RCA analysis result"""
    incident_id: str
    analysis_timestamp: datetime
    root_cause: str
    confidence: float
    contributing_factors: List[str]
    evidence: List[str]
    recommendations: List[str]
    prevention_measures: List[str]
    estimated_impact: str
    time_to_resolution: Optional[timedelta]

class RCAAgent:
    """Root Cause Analysis Agent using AI and data analysis"""
    
    def __init__(self):
        self.name = "RCAAgent"
        self.description = "Performs intelligent root cause analysis for incidents"
        self.cloudwatch_client = boto3.client('cloudwatch')
        self.logs_client = boto3.client('logs')
        self.openai_client = openai.OpenAI()
        
    async def analyze_incident(self, incident: IncidentData, logs: List[LogEntry], metrics: List[MetricData]) -> RCAResult:
        """Perform comprehensive RCA analysis"""
        try:
            # Analyze logs for error patterns
            error_patterns = await self._analyze_error_patterns(logs)
            
            # Analyze metrics for anomalies
            metric_anomalies = await self._analyze_metric_anomalies(metrics)
            
            # Analyze service dependencies
            dependency_analysis = await self._analyze_service_dependencies(incident.affected_services)
            
            # Generate AI-powered analysis
            ai_analysis = await self._generate_ai_analysis(incident, error_patterns, metric_anomalies, dependency_analysis)
            
            # Compile RCA result
            rca_result = RCAResult(
                incident_id=incident.incident_id,
                analysis_timestamp=datetime.now(),
                root_cause=ai_analysis['root_cause'],
                confidence=ai_analysis['confidence'],
                contributing_factors=ai_analysis['contributing_factors'],
                evidence=ai_analysis['evidence'],
                recommendations=ai_analysis['recommendations'],
                prevention_measures=ai_analysis['prevention_measures'],
                estimated_impact=ai_analysis['estimated_impact'],
                time_to_resolution=ai_analysis.get('time_to_resolution')
            )
            
            return rca_result
            
        except Exception as e:
            raise Exception(f"RCA analysis failed: {str(e)}")
    
    async def _analyze_error_patterns(self, logs: List[LogEntry]) -> Dict[str, Any]:
        """Analyze logs for error patterns and correlations"""
        try:
            # Group logs by service and time
            service_logs = {}
            for log in logs:
                if log.service not in service_logs:
                    service_logs[log.service] = []
                service_logs[log.service].append(log)
            
            # Analyze error patterns
            error_patterns = {
                'error_frequency': {},
                'error_correlation': {},
                'critical_errors': [],
                'error_timeline': {}
            }
            
            for service, service_logs_list in service_logs.items():
                # Count errors by level
                error_counts = {}
                for log in service_logs_list:
                    level = log.level.lower()
                    error_counts[level] = error_counts.get(level, 0) + 1
                
                error_patterns['error_frequency'][service] = error_counts
                
                # Find critical errors
                critical_errors = [log for log in service_logs_list if log.level.lower() == 'error']
                error_patterns['critical_errors'].extend(critical_errors)
                
                # Build error timeline
                timeline = {}
                for log in service_logs_list:
                    hour = log.timestamp.replace(minute=0, second=0, microsecond=0)
                    if hour not in timeline:
                        timeline[hour] = {'error': 0, 'warning': 0, 'info': 0}
                    timeline[hour][log.level.lower()] += 1
                
                error_patterns['error_timeline'][service] = timeline
            
            # Find correlations between services
            if len(service_logs) > 1:
                error_patterns['error_correlation'] = await self._find_service_correlations(service_logs)
            
            return error_patterns
            
        except Exception as e:
            raise Exception(f"Error pattern analysis failed: {str(e)}")
    
    async def _analyze_metric_anomalies(self, metrics: List[MetricData]) -> Dict[str, Any]:
        """Analyze metrics for anomalies and trends"""
        try:
            # Group metrics by name
            metric_groups = {}
            for metric in metrics:
                if metric.metric_name not in metric_groups:
                    metric_groups[metric.metric_name] = []
                metric_groups[metric.metric_name].append(metric)
            
            anomalies = {
                'cpu_spikes': [],
                'memory_leaks': [],
                'latency_spikes': [],
                'throughput_drops': [],
                'error_rate_spikes': []
            }
            
            for metric_name, metric_list in metric_groups.items():
                # Sort by timestamp
                metric_list.sort(key=lambda x: x.timestamp)
                
                # Calculate baseline and detect anomalies
                values = [m.value for m in metric_list]
                if len(values) > 10:  # Need enough data points
                    baseline = sum(values) / len(values)
                    std_dev = (sum((v - baseline) ** 2 for v in values) / len(values)) ** 0.5
                    
                    # Detect anomalies (2 standard deviations from baseline)
                    for metric in metric_list:
                        if abs(metric.value - baseline) > 2 * std_dev:
                            anomaly = {
                                'metric_name': metric_name,
                                'timestamp': metric.timestamp,
                                'value': metric.value,
                                'baseline': baseline,
                                'deviation': abs(metric.value - baseline) / std_dev
                            }
                            
                            # Categorize anomaly
                            if 'cpu' in metric_name.lower():
                                anomalies['cpu_spikes'].append(anomaly)
                            elif 'memory' in metric_name.lower():
                                anomalies['memory_leaks'].append(anomaly)
                            elif 'latency' in metric_name.lower():
                                anomalies['latency_spikes'].append(anomaly)
                            elif 'throughput' in metric_name.lower():
                                anomalies['throughput_drops'].append(anomaly)
                            elif 'error' in metric_name.lower():
                                anomalies['error_rate_spikes'].append(anomaly)
            
            return anomalies
            
        except Exception as e:
            raise Exception(f"Metric anomaly analysis failed: {str(e)}")
    
    async def _analyze_service_dependencies(self, affected_services: List[str]) -> Dict[str, Any]:
        """Analyze service dependencies and failure propagation"""
        try:
            # This would typically query a service mesh or dependency graph
            # For now, we'll create a mock analysis
            dependency_analysis = {
                'service_dependencies': {},
                'failure_propagation': [],
                'critical_paths': [],
                'bottlenecks': []
            }
            
            # Mock service dependency mapping
            service_dependencies = {
                'web-frontend': ['api-gateway', 'user-service'],
                'api-gateway': ['auth-service', 'user-service', 'order-service'],
                'user-service': ['database', 'cache'],
                'order-service': ['database', 'payment-service'],
                'payment-service': ['external-payment-gateway'],
                'database': [],
                'cache': []
            }
            
            # Find dependencies for affected services
            for service in affected_services:
                if service in service_dependencies:
                    dependency_analysis['service_dependencies'][service] = service_dependencies[service]
                    
                    # Check if any dependencies are also affected
                    for dep in service_dependencies[service]:
                        if dep in affected_services:
                            dependency_analysis['failure_propagation'].append({
                                'from': dep,
                                'to': service,
                                'type': 'dependency_failure'
                            })
            
            return dependency_analysis
            
        except Exception as e:
            raise Exception(f"Service dependency analysis failed: {str(e)}")
    
    async def _find_service_correlations(self, service_logs: Dict[str, List[LogEntry]]) -> List[Dict[str, Any]]:
        """Find correlations between service errors"""
        try:
            correlations = []
            services = list(service_logs.keys())
            
            for i, service1 in enumerate(services):
                for service2 in services[i+1:]:
                    # Find overlapping error timestamps
                    service1_errors = [log.timestamp for log in service_logs[service1] if log.level.lower() == 'error']
                    service2_errors = [log.timestamp for log in service_logs[service2] if log.level.lower() == 'error']
                    
                    # Check for temporal correlation (within 5 minutes)
                    correlation_count = 0
                    for ts1 in service1_errors:
                        for ts2 in service2_errors:
                            if abs((ts1 - ts2).total_seconds()) < 300:  # 5 minutes
                                correlation_count += 1
                    
                    if correlation_count > 0:
                        correlations.append({
                            'service1': service1,
                            'service2': service2,
                            'correlation_strength': correlation_count,
                            'correlation_type': 'temporal'
                        })
            
            return correlations
            
        except Exception as e:
            raise Exception(f"Service correlation analysis failed: {str(e)}")
    
    async def _generate_ai_analysis(self, incident: IncidentData, error_patterns: Dict, metric_anomalies: Dict, dependency_analysis: Dict) -> Dict[str, Any]:
        """Generate AI-powered root cause analysis"""
        try:
            # Prepare context for AI analysis
            context = f"""
Incident: {incident.title}
Description: {incident.description}
Severity: {incident.severity}
Affected Services: {', '.join(incident.affected_services)}
Impact: {incident.impact}

Error Patterns:
- Critical Errors: {len(error_patterns['critical_errors'])}
- Error Frequency: {error_patterns['error_frequency']}
- Service Correlations: {len(error_patterns['error_correlation'])}

Metric Anomalies:
- CPU Spikes: {len(metric_anomalies['cpu_spikes'])}
- Memory Leaks: {len(metric_anomalies['memory_leaks'])}
- Latency Spikes: {len(metric_anomalies['latency_spikes'])}
- Error Rate Spikes: {len(metric_anomalies['error_rate_spikes'])}

Service Dependencies:
- Failure Propagation: {len(dependency_analysis['failure_propagation'])}
- Critical Paths: {len(dependency_analysis['critical_paths'])}
"""
            
            # Generate AI analysis
            prompt = f"""
Based on the following incident data, provide a comprehensive root cause analysis:

{context}

Please provide:
1. Most likely root cause (with confidence level 0-1)
2. Contributing factors
3. Supporting evidence
4. Immediate recommendations
5. Prevention measures
6. Estimated impact assessment

Format the response as JSON with the following structure:
{{
    "root_cause": "description",
    "confidence": 0.85,
    "contributing_factors": ["factor1", "factor2"],
    "evidence": ["evidence1", "evidence2"],
    "recommendations": ["rec1", "rec2"],
    "prevention_measures": ["measure1", "measure2"],
    "estimated_impact": "description"
}}
"""
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            # Parse AI response
            ai_response = response.choices[0].message.content
            try:
                analysis = json.loads(ai_response)
            except json.JSONDecodeError:
                # Fallback analysis if JSON parsing fails
                analysis = {
                    "root_cause": "Unable to determine specific root cause from available data",
                    "confidence": 0.5,
                    "contributing_factors": ["Insufficient data for detailed analysis"],
                    "evidence": ["Error patterns and metric anomalies detected"],
                    "recommendations": ["Implement comprehensive monitoring", "Add more detailed logging"],
                    "prevention_measures": ["Improve system resilience", "Add circuit breakers"],
                    "estimated_impact": "Moderate to high impact based on severity"
                }
            
            return analysis
            
        except Exception as e:
            raise Exception(f"AI analysis generation failed: {str(e)}")
    
    async def get_cloudwatch_logs(self, log_group: str, start_time: datetime, end_time: datetime) -> List[LogEntry]:
        """Retrieve logs from CloudWatch"""
        try:
            logs = []
            
            # Query CloudWatch logs
            response = self.logs_client.filter_log_events(
                logGroupName=log_group,
                startTime=int(start_time.timestamp() * 1000),
                endTime=int(end_time.timestamp() * 1000),
                filterPattern='{ $.level = "ERROR" || $.level = "WARN" }'
            )
            
            for event in response['events']:
                # Parse log message
                try:
                    log_data = json.loads(event['message'])
                    log_entry = LogEntry(
                        timestamp=datetime.fromtimestamp(event['timestamp'] / 1000),
                        level=log_data.get('level', 'info'),
                        service=log_data.get('service', 'unknown'),
                        message=log_data.get('message', ''),
                        trace_id=log_data.get('trace_id'),
                        span_id=log_data.get('span_id'),
                        metadata=log_data.get('metadata', {})
                    )
                    logs.append(log_entry)
                except json.JSONDecodeError:
                    # Handle non-JSON logs
                    log_entry = LogEntry(
                        timestamp=datetime.fromtimestamp(event['timestamp'] / 1000),
                        level='info',
                        service='unknown',
                        message=event['message'],
                        trace_id=None,
                        span_id=None,
                        metadata={}
                    )
                    logs.append(log_entry)
            
            return logs
            
        except Exception as e:
            raise Exception(f"Failed to retrieve CloudWatch logs: {str(e)}")
    
    async def get_cloudwatch_metrics(self, namespace: str, metric_name: str, start_time: datetime, end_time: datetime) -> List[MetricData]:
        """Retrieve metrics from CloudWatch"""
        try:
            metrics = []
            
            # Query CloudWatch metrics
            response = self.cloudwatch_client.get_metric_statistics(
                Namespace=namespace,
                MetricName=metric_name,
                StartTime=start_time,
                EndTime=end_time,
                Period=300,  # 5-minute periods
                Statistics=['Average', 'Maximum', 'Minimum']
            )
            
            for datapoint in response['Datapoints']:
                metric_data = MetricData(
                    timestamp=datapoint['Timestamp'],
                    metric_name=metric_name,
                    value=datapoint['Average'],
                    unit=datapoint['Unit'],
                    dimensions={'namespace': namespace}
                )
                metrics.append(metric_data)
            
            return metrics
            
        except Exception as e:
            raise Exception(f"Failed to retrieve CloudWatch metrics: {str(e)}")
    
    def generate_rca_report(self, rca_result: RCAResult) -> str:
        """Generate a comprehensive RCA report"""
        report = f"""🔍 **Root Cause Analysis Report**

**📋 Incident Details:**
• **Incident ID:** {rca_result.incident_id}
• **Analysis Time:** {rca_result.analysis_timestamp.strftime('%Y-%m-%d %H:%M:%S')}
• **Confidence Level:** {rca_result.confidence:.1%}

**🎯 Root Cause:**
{rca_result.root_cause}

**🔗 Contributing Factors:**"""
        
        for factor in rca_result.contributing_factors:
            report += f"\n• {factor}"
        
        report += f"""

**📊 Supporting Evidence:**"""
        
        for evidence in rca_result.evidence:
            report += f"\n• {evidence}"
        
        report += f"""

**🔧 Immediate Recommendations:**"""
        
        for rec in rca_result.recommendations:
            report += f"\n• {rec}"
        
        report += f"""

**🛡️ Prevention Measures:**"""
        
        for measure in rca_result.prevention_measures:
            report += f"\n• {measure}"
        
        report += f"""

**📈 Impact Assessment:**
{rca_result.estimated_impact}

**⏱️ Time to Resolution:**"""
        
        if rca_result.time_to_resolution:
            hours = rca_result.time_to_resolution.total_seconds() / 3600
            report += f"\n• {hours:.1f} hours"
        else:
            report += "\n• Not available"
        
        return report

# Global instance
rca_agent = RCAAgent() 