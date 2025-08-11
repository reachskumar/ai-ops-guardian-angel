"""
Integration Management API endpoints (FastAPI router)
Tenant-scoped: configure, test, and manage integrations; secrets stored via SecretsProvider (Vault/env).
"""

import json
import subprocess
import requests
from typing import Dict, Any, Optional
from dataclasses import dataclass
from ..utils.secrets_provider import SecretsProvider

try:
    from fastapi import APIRouter, HTTPException
    from pydantic import BaseModel
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    class APIRouter:
        def __init__(self, *args, **kwargs):
            pass
    class BaseModel: ...
    class HTTPException(Exception):
        def __init__(self, status_code: int, detail: str):
            self.status_code = status_code
            self.detail = detail

@dataclass
class IntegrationTestResult:
    """Integration test result"""
    success: bool
    message: str
    details: Dict[str, Any]

class IntegrationManager:
    """Manages external tool integrations"""
    
    def __init__(self):
        self.integrations = {}
    
    async def test_integration(self, integration_id: str, config: Dict[str, Any]) -> IntegrationTestResult:
        """Test an integration configuration"""
        try:
            if integration_id == 'trivy':
                return await self._test_trivy(config)
            elif integration_id == 'gitleaks':
                return await self._test_gitleaks(config)
            elif integration_id == 'scoutsuite':
                return await self._test_scoutsuite(config)
            elif integration_id == 'github':
                return await self._test_github(config)
            elif integration_id == 'jenkins':
                return await self._test_jenkins(config)
            elif integration_id == 'argocd':
                return await self._test_argocd(config)
            elif integration_id == 'prometheus':
                return await self._test_prometheus(config)
            elif integration_id == 'grafana':
                return await self._test_grafana(config)
            elif integration_id == 'slack':
                return await self._test_slack(config)
            elif integration_id == 'teams':
                return await self._test_teams(config)
            elif integration_id == 'mongodb':
                return await self._test_mongodb(config)
            elif integration_id == 'redis':
                return await self._test_redis(config)
            else:
                return IntegrationTestResult(
                    success=False,
                    message=f"Unknown integration: {integration_id}",
                    details={}
                )
        except Exception as e:
            return IntegrationTestResult(
                success=False,
                message=f"Integration test failed: {str(e)}",
                details={'error': str(e)}
            )
    
    async def _test_trivy(self, config: Dict[str, Any]) -> IntegrationTestResult:
        """Test Trivy integration"""
        try:
            trivy_path = config.get('trivy_path', 'trivy')
            
            # Test Trivy installation
            result = subprocess.run(
                [trivy_path, '--version'],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                return IntegrationTestResult(
                    success=True,
                    message="Trivy integration successful",
                    details={'version': result.stdout.strip()}
                )
            else:
                return IntegrationTestResult(
                    success=False,
                    message="Trivy not found or not accessible",
                    details={'error': result.stderr}
                )
        except Exception as e:
            return IntegrationTestResult(
                success=False,
                message=f"Trivy test failed: {str(e)}",
                details={'error': str(e)}
            )
    
    async def _test_gitleaks(self, config: Dict[str, Any]) -> IntegrationTestResult:
        """Test Gitleaks integration"""
        try:
            gitleaks_path = config.get('gitleaks_path', 'gitleaks')
            
            # Test Gitleaks installation
            result = subprocess.run(
                [gitleaks_path, 'version'],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                return IntegrationTestResult(
                    success=True,
                    message="Gitleaks integration successful",
                    details={'version': result.stdout.strip()}
                )
            else:
                return IntegrationTestResult(
                    success=False,
                    message="Gitleaks not found or not accessible",
                    details={'error': result.stderr}
                )
        except Exception as e:
            return IntegrationTestResult(
                success=False,
                message=f"Gitleaks test failed: {str(e)}",
                details={'error': str(e)}
            )
    
    async def _test_scoutsuite(self, config: Dict[str, Any]) -> IntegrationTestResult:
        """Test ScoutSuite integration"""
        try:
            aws_access_key = config.get('aws_access_key')
            aws_secret_key = config.get('aws_secret_key')
            
            if not aws_access_key or not aws_secret_key:
                return IntegrationTestResult(
                    success=False,
                    message="AWS credentials required for ScoutSuite",
                    details={}
                )
            
            # Test AWS credentials
            import boto3
            from botocore.exceptions import ClientError
            
            session = boto3.Session(
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key
            )
            
            # Test with a simple API call
            sts = session.client('sts')
            response = sts.get_caller_identity()
            
            return IntegrationTestResult(
                success=True,
                message="ScoutSuite AWS credentials valid",
                details={'account_id': response['Account']}
            )
        except ClientError as e:
            return IntegrationTestResult(
                success=False,
                message="Invalid AWS credentials",
                details={'error': str(e)}
            )
        except Exception as e:
            return IntegrationTestResult(
                success=False,
                message=f"ScoutSuite test failed: {str(e)}",
                details={'error': str(e)}
            )
    
    async def _test_github(self, config: Dict[str, Any]) -> IntegrationTestResult:
        """Test GitHub integration"""
        try:
            github_token = config.get('github_token')
            organization = config.get('organization')
            
            if not github_token:
                return IntegrationTestResult(
                    success=False,
                    message="GitHub token required",
                    details={}
                )
            
            # Test GitHub API
            headers = {
                'Authorization': f'token {github_token}',
                'Accept': 'application/vnd.github.v3+json'
            }
            
            if organization:
                url = f'https://api.github.com/orgs/{organization}'
            else:
                url = 'https://api.github.com/user'
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return IntegrationTestResult(
                    success=True,
                    message="GitHub integration successful",
                    details={'user': response.json().get('login')}
                )
            else:
                return IntegrationTestResult(
                    success=False,
                    message="GitHub authentication failed",
                    details={'status_code': response.status_code}
                )
        except Exception as e:
            return IntegrationTestResult(
                success=False,
                message=f"GitHub test failed: {str(e)}",
                details={'error': str(e)}
            )
    
    async def _test_jenkins(self, config: Dict[str, Any]) -> IntegrationTestResult:
        """Test Jenkins integration"""
        try:
            jenkins_url = config.get('jenkins_url')
            username = config.get('username')
            api_token = config.get('api_token')
            
            if not all([jenkins_url, username, api_token]):
                return IntegrationTestResult(
                    success=False,
                    message="Jenkins URL, username, and API token required",
                    details={}
                )
            
            # Test Jenkins API
            auth = (username, api_token)
            url = f"{jenkins_url}/api/json"
            
            response = requests.get(url, auth=auth, timeout=10)
            
            if response.status_code == 200:
                return IntegrationTestResult(
                    success=True,
                    message="Jenkins integration successful",
                    details={'version': response.json().get('version')}
                )
            else:
                return IntegrationTestResult(
                    success=False,
                    message="Jenkins authentication failed",
                    details={'status_code': response.status_code}
                )
        except Exception as e:
            return IntegrationTestResult(
                success=False,
                message=f"Jenkins test failed: {str(e)}",
                details={'error': str(e)}
            )
    
    async def _test_argocd(self, config: Dict[str, Any]) -> IntegrationTestResult:
        """Test ArgoCD integration"""
        try:
            argocd_url = config.get('argocd_url')
            api_token = config.get('api_token')
            
            if not all([argocd_url, api_token]):
                return IntegrationTestResult(
                    success=False,
                    message="ArgoCD URL and API token required",
                    details={}
                )
            
            # Test ArgoCD API
            headers = {
                'Authorization': f'Bearer {api_token}',
                'Content-Type': 'application/json'
            }
            
            url = f"{argocd_url}/api/v1/version"
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return IntegrationTestResult(
                    success=True,
                    message="ArgoCD integration successful",
                    details={'version': response.json().get('Version')}
                )
            else:
                return IntegrationTestResult(
                    success=False,
                    message="ArgoCD authentication failed",
                    details={'status_code': response.status_code}
                )
        except Exception as e:
            return IntegrationTestResult(
                success=False,
                message=f"ArgoCD test failed: {str(e)}",
                details={'error': str(e)}
            )
    
    async def _test_prometheus(self, config: Dict[str, Any]) -> IntegrationTestResult:
        """Test Prometheus integration"""
        try:
            prometheus_url = config.get('prometheus_url')
            
            if not prometheus_url:
                return IntegrationTestResult(
                    success=False,
                    message="Prometheus URL required",
                    details={}
                )
            
            # Test Prometheus API
            url = f"{prometheus_url}/api/v1/status/config"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                return IntegrationTestResult(
                    success=True,
                    message="Prometheus integration successful",
                    details={'status': 'connected'}
                )
            else:
                return IntegrationTestResult(
                    success=False,
                    message="Prometheus connection failed",
                    details={'status_code': response.status_code}
                )
        except Exception as e:
            return IntegrationTestResult(
                success=False,
                message=f"Prometheus test failed: {str(e)}",
                details={'error': str(e)}
            )
    
    async def _test_grafana(self, config: Dict[str, Any]) -> IntegrationTestResult:
        """Test Grafana integration"""
        try:
            grafana_url = config.get('grafana_url')
            api_key = config.get('api_key')
            
            if not all([grafana_url, api_key]):
                return IntegrationTestResult(
                    success=False,
                    message="Grafana URL and API key required",
                    details={}
                )
            
            # Test Grafana API
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            url = f"{grafana_url}/api/health"
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return IntegrationTestResult(
                    success=True,
                    message="Grafana integration successful",
                    details={'status': 'connected'}
                )
            else:
                return IntegrationTestResult(
                    success=False,
                    message="Grafana authentication failed",
                    details={'status_code': response.status_code}
                )
        except Exception as e:
            return IntegrationTestResult(
                success=False,
                message=f"Grafana test failed: {str(e)}",
                details={'error': str(e)}
            )
    
    async def _test_slack(self, config: Dict[str, Any]) -> IntegrationTestResult:
        """Test Slack integration"""
        try:
            slack_token = config.get('slack_token')
            channel_id = config.get('channel_id')
            
            if not slack_token:
                return IntegrationTestResult(
                    success=False,
                    message="Slack token required",
                    details={}
                )
            
            # Test Slack API
            headers = {
                'Authorization': f'Bearer {slack_token}',
                'Content-Type': 'application/json'
            }
            
            url = 'https://slack.com/api/auth.test'
            response = requests.post(url, headers=headers, timeout=10)
            
            if response.status_code == 200 and response.json().get('ok'):
                return IntegrationTestResult(
                    success=True,
                    message="Slack integration successful",
                    details={'team': response.json().get('team')}
                )
            else:
                return IntegrationTestResult(
                    success=False,
                    message="Slack authentication failed",
                    details={'error': response.json().get('error')}
                )
        except Exception as e:
            return IntegrationTestResult(
                success=False,
                message=f"Slack test failed: {str(e)}",
                details={'error': str(e)}
            )
    
    async def _test_teams(self, config: Dict[str, Any]) -> IntegrationTestResult:
        """Test Microsoft Teams integration"""
        try:
            teams_webhook_url = config.get('teams_webhook_url')
            
            if not teams_webhook_url:
                return IntegrationTestResult(
                    success=False,
                    message="Teams webhook URL required",
                    details={}
                )
            
            # Test Teams webhook
            payload = {
                "text": "Integration test message from AI-Ops platform"
            }
            
            response = requests.post(teams_webhook_url, json=payload, timeout=10)
            
            if response.status_code == 200:
                return IntegrationTestResult(
                    success=True,
                    message="Teams integration successful",
                    details={'status': 'connected'}
                )
            else:
                return IntegrationTestResult(
                    success=False,
                    message="Teams webhook test failed",
                    details={'status_code': response.status_code}
                )
        except Exception as e:
            return IntegrationTestResult(
                success=False,
                message=f"Teams test failed: {str(e)}",
                details={'error': str(e)}
            )
    
    async def _test_mongodb(self, config: Dict[str, Any]) -> IntegrationTestResult:
        """Test MongoDB integration"""
        try:
            connection_string = config.get('connection_string')
            database_name = config.get('database_name')
            
            if not connection_string:
                return IntegrationTestResult(
                    success=False,
                    message="MongoDB connection string required",
                    details={}
                )
            
            # Test MongoDB connection
            from pymongo import MongoClient
            
            client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            
            return IntegrationTestResult(
                success=True,
                message="MongoDB integration successful",
                details={'database': database_name or 'default'}
            )
        except Exception as e:
            return IntegrationTestResult(
                success=False,
                message=f"MongoDB test failed: {str(e)}",
                details={'error': str(e)}
            )
    
    async def _test_redis(self, config: Dict[str, Any]) -> IntegrationTestResult:
        """Test Redis integration"""
        try:
            redis_url = config.get('redis_url')
            
            if not redis_url:
                return IntegrationTestResult(
                    success=False,
                    message="Redis URL required",
                    details={}
                )
            
            # Test Redis connection
            import redis
            
            r = redis.from_url(redis_url)
            r.ping()
            
            return IntegrationTestResult(
                success=True,
                message="Redis integration successful",
                details={'status': 'connected'}
            )
        except Exception as e:
            return IntegrationTestResult(
                success=False,
                message=f"Redis test failed: {str(e)}",
                details={'error': str(e)}
            )

integration_manager = IntegrationManager()

router = APIRouter(prefix="/integrations", tags=["integrations"]) if FASTAPI_AVAILABLE else None

class TestRequest(BaseModel):
    integration: str
    config: Dict[str, Any] = {}

if FASTAPI_AVAILABLE:
    class SaveRequest(BaseModel):
        provider: str
        secrets: Dict[str, str]

    class TicketRequest(BaseModel):
        provider: str  # jira or servicenow
        project_or_table: str
        summary: str
        description: str
        severity: Optional[str] = None
        change_request: Optional[bool] = False

    class RepoSecretRequest(BaseModel):
        repo: str
        secrets: Dict[str, str]

    @router.post("/{tenant_id}/test")
    async def test_integration_endpoint(tenant_id: str, body: TestRequest):
        try:
            result = await integration_manager.test_integration(body.integration, body.config)
            return {"success": result.success, "message": result.message, "details": result.details}
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Integration test failed: {str(e)}")

    @router.get("/{tenant_id}")
    async def list_integrations_endpoint(tenant_id: str):
        return {"success": True, "integrations": list(integration_manager.integrations.keys())}

    @router.post("/{tenant_id}/save")
    async def save_integration_secrets(tenant_id: str, body: SaveRequest):
        sp = SecretsProvider(backend="vault" if os.getenv("VAULT_ADDR") else "env")
        for k, v in body.secrets.items():
            if not sp.set(tenant_id, f"{body.provider}_{k}", v):
                raise HTTPException(status_code=500, detail=f"Failed to save secret: {k}")
        return {"success": True}

    @router.delete("/{tenant_id}/{provider}")
    async def delete_integration_secrets(tenant_id: str, provider: str):
        # For simplicity assume fixed keys per provider are known client-side; here we delete common patterns
        sp = SecretsProvider(backend="vault" if os.getenv("VAULT_ADDR") else "env")
        deleted_any = False
        for suffix in ["token", "api_key", "url", "installation_id", "repo", "kubeconfig", "role_arn"]:
            if sp.delete(tenant_id, f"{provider}_{suffix}"):
                deleted_any = True
        return {"success": True, "deleted": deleted_any}

    @router.post("/{tenant_id}/itsm/ticket")
    async def create_ticket(tenant_id: str, body: TicketRequest):
        sp = SecretsProvider(backend="vault" if os.getenv("VAULT_ADDR") else "env")
        if body.provider == "jira":
            base = sp.get(tenant_id, "jira_url")
            user = sp.get(tenant_id, "jira_user")
            token = sp.get(tenant_id, "jira_token")
            if not all([base, user, token]):
                raise HTTPException(status_code=400, detail="Missing Jira credentials")
            url = f"{base}/rest/api/3/issue"
            auth = (user, token)
            payload = {
                "fields": {
                    "project": {"key": body.project_or_table},
                    "summary": body.summary,
                    "description": body.description,
                    "issuetype": {"name": "Task" if not body.change_request else "Change"}
                }
            }
            r = requests.post(url, auth=auth, json=payload, timeout=20)
            if r.status_code >= 300:
                raise HTTPException(status_code=400, detail=f"Jira error: {r.text}")
            return {"success": True, "id": r.json().get("key")}
        elif body.provider == "servicenow":
            base = sp.get(tenant_id, "snow_url")
            user = sp.get(tenant_id, "snow_user")
            token = sp.get(tenant_id, "snow_token")
            if not all([base, user, token]):
                raise HTTPException(status_code=400, detail="Missing ServiceNow credentials")
            table = body.project_or_table
            url = f"{base}/api/now/table/{table}"
            headers = {"Accept": "application/json"}
            r = requests.post(url, auth=(user, token), headers=headers, json={
                "short_description": body.summary,
                "description": body.description,
                "severity": body.severity or "3"
            }, timeout=20)
            if r.status_code >= 300:
                raise HTTPException(status_code=400, detail=f"ServiceNow error: {r.text}")
            return {"success": True, "id": r.json().get("result", {}).get("sys_id")}
        else:
            raise HTTPException(status_code=400, detail="Unsupported ITSM provider")

    @router.post("/{tenant_id}/github/repo-secrets")
    async def set_repo_secrets(tenant_id: str, body: RepoSecretRequest):
        """Placeholder endpoint to set repo secrets via GitHub App in future."""
        # In a production version, use GitHub App token + REST to set secrets at repo level
        return {"success": True, "repo": body.repo, "count": len(body.secrets)}
