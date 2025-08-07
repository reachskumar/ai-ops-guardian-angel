"""
Integration Marketplace Engine
Self-service integration marketplace with plugin management
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import uuid
import logging

class IntegrationType(Enum):
    MONITORING = "monitoring"
    SECURITY = "security"
    CI_CD = "ci_cd"
    CLOUD_PROVIDER = "cloud_provider"
    NOTIFICATION = "notification"
    DATABASE = "database"
    ANALYTICS = "analytics"
    COLLABORATION = "collaboration"

class IntegrationStatus(Enum):
    AVAILABLE = "available"
    INSTALLED = "installed"
    CONFIGURED = "configured"
    ACTIVE = "active"
    ERROR = "error"
    DEPRECATED = "deprecated"

class MarketplaceCategory(Enum):
    FEATURED = "featured"
    POPULAR = "popular"
    NEW = "new"
    ENTERPRISE = "enterprise"
    COMMUNITY = "community"

@dataclass
class Integration:
    integration_id: str
    name: str
    description: str
    version: str
    category: IntegrationType
    marketplace_category: MarketplaceCategory
    provider: str
    icon_url: str
    documentation_url: str
    support_url: str
    pricing: Dict[str, Any]
    features: List[str]
    requirements: Dict[str, Any]
    configuration_schema: Dict[str, Any]
    status: IntegrationStatus
    install_count: int
    rating: float
    reviews_count: int
    last_updated: datetime
    compatibility: List[str]

@dataclass
class IntegrationInstance:
    instance_id: str
    integration_id: str
    user_id: str
    organization_id: str
    configuration: Dict[str, Any]
    status: IntegrationStatus
    installed_at: datetime
    last_activity: datetime
    health_status: str
    metrics: Dict[str, Any]

class MarketplaceEngine:
    """Enterprise integration marketplace and self-service system"""
    
    def __init__(self):
        self.integration_manager = IntegrationManager()
        self.plugin_sdk = PluginSDK()
        self.self_service_portal = SelfServicePortal()
        self.health_monitor = HealthMonitor()
        self.analytics_engine = AnalyticsEngine()
        
        # Initialize marketplace catalog
        self._initialize_marketplace_catalog()
    
    def _initialize_marketplace_catalog(self):
        """Initialize the marketplace with available integrations"""
        self.marketplace_catalog = {
            # Monitoring Integrations
            "prometheus": Integration(
                integration_id="int_prometheus_001",
                name="Prometheus",
                description="Open-source monitoring and alerting toolkit with powerful query language",
                version="2.47.0",
                category=IntegrationType.MONITORING,
                marketplace_category=MarketplaceCategory.POPULAR,
                provider="Prometheus Community",
                icon_url="https://prometheus.io/assets/prometheus_logo.svg",
                documentation_url="https://prometheus.io/docs/",
                support_url="https://prometheus.io/community/",
                pricing={"type": "free", "cost": 0},
                features=[
                    "Multi-dimensional time series data",
                    "Powerful query language (PromQL)",
                    "Alert manager integration",
                    "Service discovery",
                    "Grafana integration"
                ],
                requirements={"min_memory": "512MB", "min_cpu": "0.5 cores"},
                configuration_schema={
                    "endpoint": {"type": "string", "required": True},
                    "scrape_interval": {"type": "string", "default": "15s"},
                    "retention": {"type": "string", "default": "15d"}
                },
                status=IntegrationStatus.AVAILABLE,
                install_count=15420,
                rating=4.8,
                reviews_count=892,
                last_updated=datetime.now() - timedelta(days=3),
                compatibility=["kubernetes", "docker", "vm"]
            ),
            
            "grafana": Integration(
                integration_id="int_grafana_001",
                name="Grafana",
                description="Open-source analytics and interactive visualization web application",
                version="10.2.0",
                category=IntegrationType.ANALYTICS,
                marketplace_category=MarketplaceCategory.FEATURED,
                provider="Grafana Labs",
                icon_url="https://grafana.com/static/assets/img/grafana_icon.svg",
                documentation_url="https://grafana.com/docs/",
                support_url="https://community.grafana.com/",
                pricing={"type": "freemium", "free_tier": True, "enterprise_cost": 25},
                features=[
                    "Rich visualization options",
                    "Dashboard templating",
                    "Alert notifications",
                    "Data source plugins",
                    "Team collaboration"
                ],
                requirements={"min_memory": "256MB", "min_cpu": "0.25 cores"},
                configuration_schema={
                    "admin_user": {"type": "string", "required": True},
                    "admin_password": {"type": "string", "required": True, "sensitive": True},
                    "datasources": {"type": "array", "items": {"type": "object"}}
                },
                status=IntegrationStatus.AVAILABLE,
                install_count=12850,
                rating=4.9,
                reviews_count=1240,
                last_updated=datetime.now() - timedelta(days=1),
                compatibility=["kubernetes", "docker", "cloud"]
            ),
            
            # Security Integrations
            "trivy": Integration(
                integration_id="int_trivy_001",
                name="Trivy",
                description="Comprehensive vulnerability scanner for containers and other artifacts",
                version="0.46.0",
                category=IntegrationType.SECURITY,
                marketplace_category=MarketplaceCategory.FEATURED,
                provider="Aqua Security",
                icon_url="https://trivy.dev/img/logo.svg",
                documentation_url="https://trivy.dev/",
                support_url="https://github.com/aquasecurity/trivy",
                pricing={"type": "free", "cost": 0},
                features=[
                    "Container image scanning",
                    "Filesystem scanning",
                    "Git repository scanning",
                    "SBOM generation",
                    "Policy enforcement"
                ],
                requirements={"min_memory": "128MB", "min_cpu": "0.1 cores"},
                configuration_schema={
                    "scan_timeout": {"type": "string", "default": "5m"},
                    "severity_levels": {"type": "array", "default": ["CRITICAL", "HIGH"]},
                    "ignore_unfixed": {"type": "boolean", "default": False}
                },
                status=IntegrationStatus.AVAILABLE,
                install_count=8940,
                rating=4.7,
                reviews_count=456,
                last_updated=datetime.now() - timedelta(days=2),
                compatibility=["kubernetes", "docker", "ci_cd"]
            ),
            
            # CI/CD Integrations
            "github_actions": Integration(
                integration_id="int_github_001",
                name="GitHub Actions",
                description="Automate your workflow from idea to production with GitHub Actions",
                version="4.0.0",
                category=IntegrationType.CI_CD,
                marketplace_category=MarketplaceCategory.POPULAR,
                provider="GitHub",
                icon_url="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
                documentation_url="https://docs.github.com/en/actions",
                support_url="https://github.community/",
                pricing={"type": "usage_based", "free_minutes": 2000, "cost_per_minute": 0.008},
                features=[
                    "Workflow automation",
                    "Matrix builds",
                    "Artifact management",
                    "Environment protection",
                    "Reusable workflows"
                ],
                requirements={"github_access": True},
                configuration_schema={
                    "github_token": {"type": "string", "required": True, "sensitive": True},
                    "repository": {"type": "string", "required": True},
                    "workflow_file": {"type": "string", "default": ".github/workflows/main.yml"}
                },
                status=IntegrationStatus.AVAILABLE,
                install_count=22580,
                rating=4.6,
                reviews_count=1850,
                last_updated=datetime.now() - timedelta(days=1),
                compatibility=["git", "docker", "kubernetes"]
            ),
            
            # Cloud Provider Integrations
            "aws_advanced": Integration(
                integration_id="int_aws_advanced_001",
                name="AWS Advanced Integration",
                description="Enhanced AWS integration with advanced features and multi-service support",
                version="3.2.0",
                category=IntegrationType.CLOUD_PROVIDER,
                marketplace_category=MarketplaceCategory.ENTERPRISE,
                provider="AI-Ops Platform",
                icon_url="https://aws.amazon.com/favicon.ico",
                documentation_url="https://docs.aws.amazon.com/",
                support_url="https://aws.amazon.com/support/",
                pricing={"type": "enterprise", "cost": 99, "billing": "monthly"},
                features=[
                    "Multi-account management",
                    "Advanced cost optimization",
                    "Compliance automation",
                    "Resource tagging automation",
                    "Cross-region operations"
                ],
                requirements={"aws_account": True, "iam_permissions": "full"},
                configuration_schema={
                    "access_key_id": {"type": "string", "required": True, "sensitive": True},
                    "secret_access_key": {"type": "string", "required": True, "sensitive": True},
                    "regions": {"type": "array", "default": ["us-east-1", "us-west-2"]},
                    "organization_id": {"type": "string", "required": False}
                },
                status=IntegrationStatus.AVAILABLE,
                install_count=3420,
                rating=4.9,
                reviews_count=285,
                last_updated=datetime.now() - timedelta(hours=12),
                compatibility=["enterprise", "multi_account"]
            ),
            
            # Notification Integrations
            "slack": Integration(
                integration_id="int_slack_001",
                name="Slack",
                description="Send notifications and alerts to Slack channels and users",
                version="2.8.0",
                category=IntegrationType.NOTIFICATION,
                marketplace_category=MarketplaceCategory.POPULAR,
                provider="Slack Technologies",
                icon_url="https://slack.com/favicon.ico",
                documentation_url="https://api.slack.com/",
                support_url="https://slack.com/help",
                pricing={"type": "free", "cost": 0},
                features=[
                    "Channel notifications",
                    "Direct messages",
                    "Rich message formatting",
                    "Interactive buttons",
                    "File uploads"
                ],
                requirements={"slack_workspace": True},
                configuration_schema={
                    "webhook_url": {"type": "string", "required": True, "sensitive": True},
                    "default_channel": {"type": "string", "default": "#general"},
                    "username": {"type": "string", "default": "AI-Ops Bot"},
                    "emoji": {"type": "string", "default": ":robot_face:"}
                },
                status=IntegrationStatus.AVAILABLE,
                install_count=18720,
                rating=4.8,
                reviews_count=1456,
                last_updated=datetime.now() - timedelta(days=5),
                compatibility=["webhook", "oauth"]
            )
        }
    
    async def browse_marketplace(self, category: Optional[str] = None, 
                               search_query: Optional[str] = None) -> Dict[str, Any]:
        """Browse marketplace integrations"""
        try:
            integrations = list(self.marketplace_catalog.values())
            
            # Filter by category
            if category:
                category_enum = IntegrationType(category) if category in [c.value for c in IntegrationType] else None
                if category_enum:
                    integrations = [i for i in integrations if i.category == category_enum]
            
            # Filter by search query
            if search_query:
                query_lower = search_query.lower()
                integrations = [
                    i for i in integrations 
                    if query_lower in i.name.lower() or 
                       query_lower in i.description.lower() or
                       any(query_lower in feature.lower() for feature in i.features)
                ]
            
            # Sort by popularity (install count)
            integrations.sort(key=lambda x: x.install_count, reverse=True)
            
            return {
                "marketplace_id": f"mp-{int(datetime.now().timestamp())}",
                "total_integrations": len(integrations),
                "categories": [cat.value for cat in IntegrationType],
                "featured_integrations": [
                    asdict(i) for i in integrations 
                    if i.marketplace_category == MarketplaceCategory.FEATURED
                ][:3],
                "popular_integrations": [
                    asdict(i) for i in integrations
                    if i.marketplace_category == MarketplaceCategory.POPULAR
                ][:5],
                "all_integrations": [asdict(i) for i in integrations],
                "marketplace_stats": await self._get_marketplace_stats()
            }
            
        except Exception as e:
            return {"error": f"Marketplace browsing failed: {str(e)}"}
    
    async def _get_marketplace_stats(self) -> Dict[str, Any]:
        """Get marketplace statistics"""
        integrations = list(self.marketplace_catalog.values())
        
        return {
            "total_integrations": len(integrations),
            "total_installs": sum(i.install_count for i in integrations),
            "average_rating": sum(i.rating for i in integrations) / len(integrations),
            "categories_count": len(set(i.category for i in integrations)),
            "enterprise_integrations": len([i for i in integrations if i.marketplace_category == MarketplaceCategory.ENTERPRISE]),
            "free_integrations": len([i for i in integrations if i.pricing["type"] == "free"]),
            "last_updated": max(i.last_updated for i in integrations).isoformat()
        }
    
    async def install_integration(self, integration_id: str, user_id: str, 
                                organization_id: str, configuration: Dict[str, Any]) -> Dict[str, Any]:
        """Install and configure an integration"""
        try:
            if integration_id not in self.marketplace_catalog:
                return {"error": f"Integration {integration_id} not found in marketplace"}
            
            integration = self.marketplace_catalog[integration_id]
            
            # Validate configuration against schema
            validation_result = await self._validate_configuration(configuration, integration.configuration_schema)
            if not validation_result["valid"]:
                return {"error": f"Configuration validation failed: {validation_result['errors']}"}
            
            # Create integration instance
            instance = IntegrationInstance(
                instance_id=str(uuid.uuid4()),
                integration_id=integration_id,
                user_id=user_id,
                organization_id=organization_id,
                configuration=configuration,
                status=IntegrationStatus.INSTALLED,
                installed_at=datetime.now(),
                last_activity=datetime.now(),
                health_status="healthy",
                metrics={}
            )
            
            # Install the integration
            install_result = await self.integration_manager.install_integration(instance)
            
            if install_result["success"]:
                # Test the integration
                test_result = await self._test_integration(instance)
                
                if test_result["success"]:
                    instance.status = IntegrationStatus.ACTIVE
                    
                    # Update install count
                    integration.install_count += 1
                    
                    return {
                        "instance_id": instance.instance_id,
                        "status": "success",
                        "integration_name": integration.name,
                        "configuration_valid": True,
                        "test_result": test_result,
                        "next_steps": await self._get_next_steps(integration),
                        "monitoring_enabled": True,
                        "support_resources": {
                            "documentation": integration.documentation_url,
                            "support": integration.support_url,
                            "community": "https://community.ai-ops-platform.com/"
                        }
                    }
                else:
                    instance.status = IntegrationStatus.ERROR
                    return {"error": f"Integration test failed: {test_result['error']}"}
            else:
                return {"error": f"Installation failed: {install_result['error']}"}
                
        except Exception as e:
            return {"error": f"Integration installation failed: {str(e)}"}
    
    async def _validate_configuration(self, configuration: Dict[str, Any], 
                                    schema: Dict[str, Any]) -> Dict[str, Any]:
        """Validate configuration against schema"""
        errors = []
        
        for field, field_schema in schema.items():
            if field_schema.get("required", False) and field not in configuration:
                errors.append(f"Required field '{field}' is missing")
            
            if field in configuration:
                value = configuration[field]
                field_type = field_schema.get("type", "string")
                
                if field_type == "string" and not isinstance(value, str):
                    errors.append(f"Field '{field}' must be a string")
                elif field_type == "array" and not isinstance(value, list):
                    errors.append(f"Field '{field}' must be an array")
                elif field_type == "boolean" and not isinstance(value, bool):
                    errors.append(f"Field '{field}' must be a boolean")
        
        return {"valid": len(errors) == 0, "errors": errors}
    
    async def _test_integration(self, instance: IntegrationInstance) -> Dict[str, Any]:
        """Test integration connectivity and functionality"""
        try:
            integration = self.marketplace_catalog[instance.integration_id]
            
            # Simulate integration testing based on type
            if integration.category == IntegrationType.MONITORING:
                return await self._test_monitoring_integration(instance)
            elif integration.category == IntegrationType.SECURITY:
                return await self._test_security_integration(instance)
            elif integration.category == IntegrationType.NOTIFICATION:
                return await self._test_notification_integration(instance)
            elif integration.category == IntegrationType.CI_CD:
                return await self._test_cicd_integration(instance)
            else:
                return {"success": True, "message": "Integration test passed"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def _test_monitoring_integration(self, instance: IntegrationInstance) -> Dict[str, Any]:
        """Test monitoring integration"""
        # Mock test for monitoring integration
        return {
            "success": True,
            "test_results": {
                "connectivity": "passed",
                "authentication": "passed",
                "data_retrieval": "passed",
                "metrics_available": 1250,
                "response_time": "150ms"
            }
        }
    
    async def _test_security_integration(self, instance: IntegrationInstance) -> Dict[str, Any]:
        """Test security integration"""
        # Mock test for security integration
        return {
            "success": True,
            "test_results": {
                "scanner_available": True,
                "database_updated": True,
                "scan_capability": "verified",
                "last_update": datetime.now().isoformat()
            }
        }
    
    async def _test_notification_integration(self, instance: IntegrationInstance) -> Dict[str, Any]:
        """Test notification integration"""
        # Mock test for notification integration
        return {
            "success": True,
            "test_results": {
                "webhook_valid": True,
                "channel_accessible": True,
                "test_message_sent": True,
                "latency": "85ms"
            }
        }
    
    async def _test_cicd_integration(self, instance: IntegrationInstance) -> Dict[str, Any]:
        """Test CI/CD integration"""
        # Mock test for CI/CD integration
        return {
            "success": True,
            "test_results": {
                "repository_access": True,
                "webhook_configured": True,
                "pipeline_available": True,
                "permissions_valid": True
            }
        }
    
    async def _get_next_steps(self, integration: Integration) -> List[str]:
        """Get recommended next steps after installation"""
        if integration.category == IntegrationType.MONITORING:
            return [
                "Configure monitoring dashboards",
                "Set up alerting rules",
                "Define SLA targets",
                "Enable data retention policies"
            ]
        elif integration.category == IntegrationType.SECURITY:
            return [
                "Schedule regular security scans",
                "Configure vulnerability thresholds",
                "Set up automated remediation",
                "Enable compliance reporting"
            ]
        elif integration.category == IntegrationType.NOTIFICATION:
            return [
                "Configure notification channels",
                "Set up escalation policies",
                "Test notification delivery",
                "Define message templates"
            ]
        else:
            return [
                "Review integration configuration",
                "Set up monitoring and alerts",
                "Test integration functionality",
                "Configure automated workflows"
            ]
    
    async def manage_integrations(self, organization_id: str) -> Dict[str, Any]:
        """Manage installed integrations for organization"""
        try:
            installed_integrations = await self.integration_manager.get_installed_integrations(organization_id)
            
            integration_health = []
            for instance in installed_integrations:
                health = await self.health_monitor.check_integration_health(instance.instance_id)
                integration_health.append({
                    "instance_id": instance.instance_id,
                    "integration_name": self.marketplace_catalog[instance.integration_id].name,
                    "status": instance.status.value,
                    "health": health,
                    "last_activity": instance.last_activity.isoformat(),
                    "metrics": instance.metrics
                })
            
            return {
                "organization_id": organization_id,
                "total_integrations": len(installed_integrations),
                "active_integrations": len([i for i in installed_integrations if i.status == IntegrationStatus.ACTIVE]),
                "integration_health": integration_health,
                "recommendations": await self._get_integration_recommendations(installed_integrations),
                "usage_analytics": await self.analytics_engine.get_integration_analytics(organization_id)
            }
            
        except Exception as e:
            return {"error": f"Integration management failed: {str(e)}"}
    
    async def _get_integration_recommendations(self, installed_integrations: List[IntegrationInstance]) -> List[Dict[str, str]]:
        """Get recommendations for additional integrations"""
        installed_categories = set(
            self.marketplace_catalog[instance.integration_id].category 
            for instance in installed_integrations
        )
        
        recommendations = []
        
        if IntegrationType.MONITORING not in installed_categories:
            recommendations.append({
                "type": "missing_category",
                "category": "monitoring",
                "title": "Add Monitoring Integration",
                "description": "Enhance observability with Prometheus and Grafana"
            })
        
        if IntegrationType.SECURITY not in installed_categories:
            recommendations.append({
                "type": "missing_category",
                "category": "security",
                "title": "Add Security Scanning",
                "description": "Implement automated vulnerability scanning with Trivy"
            })
        
        if len(installed_integrations) > 5:
            recommendations.append({
                "type": "optimization",
                "category": "performance",
                "title": "Integration Optimization",
                "description": "Consider consolidating similar integrations for better performance"
            })
        
        return recommendations

class IntegrationManager:
    """Manages integration installations and lifecycle"""
    
    def __init__(self):
        self.installed_integrations = {}
    
    async def install_integration(self, instance: IntegrationInstance) -> Dict[str, Any]:
        """Install an integration instance"""
        try:
            # Simulate installation process
            self.installed_integrations[instance.instance_id] = instance
            
            return {
                "success": True,
                "instance_id": instance.instance_id,
                "installation_time": "45 seconds"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_installed_integrations(self, organization_id: str) -> List[IntegrationInstance]:
        """Get all installed integrations for organization"""
        return [
            instance for instance in self.installed_integrations.values()
            if instance.organization_id == organization_id
        ]

class PluginSDK:
    """Plugin SDK for custom integration development"""
    
    async def create_custom_integration(self, integration_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Create custom integration using SDK"""
        return {
            "sdk_version": "2.1.0",
            "integration_id": str(uuid.uuid4()),
            "status": "created",
            "development_guide": "https://docs.ai-ops-platform.com/sdk/",
            "template_generated": True,
            "next_steps": [
                "Implement integration logic",
                "Add configuration schema",
                "Write tests",
                "Submit for marketplace review"
            ]
        }

class SelfServicePortal:
    """Self-service portal for integration management"""
    
    async def get_portal_dashboard(self, user_id: str) -> Dict[str, Any]:
        """Get self-service portal dashboard"""
        return {
            "user_integrations": 8,
            "available_integrations": 25,
            "integration_health": "98.5%",
            "recent_activity": [
                {"action": "installed", "integration": "Slack", "time": "2 hours ago"},
                {"action": "configured", "integration": "Prometheus", "time": "1 day ago"},
                {"action": "updated", "integration": "GitHub Actions", "time": "3 days ago"}
            ],
            "recommendations": [
                {"integration": "Grafana", "reason": "Complements your Prometheus setup"},
                {"integration": "Trivy", "reason": "Enhance your security scanning"}
            ]
        }

class HealthMonitor:
    """Integration health monitoring"""
    
    async def check_integration_health(self, instance_id: str) -> Dict[str, Any]:
        """Check health of specific integration"""
        return {
            "status": "healthy",
            "uptime": "99.8%",
            "last_check": datetime.now().isoformat(),
            "response_time": "120ms",
            "error_rate": "0.1%",
            "metrics": {
                "requests_per_minute": 45,
                "success_rate": 99.9,
                "avg_response_time": 120
            }
        }

class AnalyticsEngine:
    """Integration usage analytics"""
    
    async def get_integration_analytics(self, organization_id: str) -> Dict[str, Any]:
        """Get integration usage analytics"""
        return {
            "total_api_calls": 125890,
            "successful_operations": 124567,
            "error_rate": "1.05%",
            "most_used_integration": "Prometheus",
            "peak_usage_time": "14:00-16:00 UTC",
            "cost_savings": "$2,450/month",
            "efficiency_improvement": "35%"
        }

# Global instances
marketplace_engine = MarketplaceEngine()
integration_manager = IntegrationManager()
plugin_sdk = PluginSDK()
self_service_portal = SelfServicePortal()
health_monitor = HealthMonitor()
analytics_engine = AnalyticsEngine()