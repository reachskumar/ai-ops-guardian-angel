"""
Secrets Detection Agent
Scans repositories and configurations for exposed secrets using Gitleaks and TruffleHog
"""

import asyncio
import json
import subprocess
import os
import re
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass
import boto3
from github import Github

@dataclass
class SecretFinding:
    """Secret detection finding"""
    secret_type: str
    secret_value: str
    file_path: str
    line_number: int
    commit_hash: Optional[str]
    author: Optional[str]
    confidence: float
    description: str
    remediation: str

@dataclass
class SecretsScanResult:
    """Secrets scan result"""
    repository: str
    scan_timestamp: datetime
    findings: List[SecretFinding]
    total_findings: int
    critical_findings: int
    high_findings: int
    medium_findings: int
    scan_tool: str
    scan_duration: float

class SecretsDetectionAgent:
    """Secrets Detection Agent using Gitleaks and TruffleHog"""
    
    def __init__(self):
        self.name = "SecretsDetectionAgent"
        self.description = "Scans repositories and configurations for exposed secrets"
        self.supported_tools = ["gitleaks", "trufflehog"]
        self.github_token = os.getenv('GITHUB_TOKEN')
        self.github_client = Github(self.github_token) if self.github_token else None
        
    async def scan_repository(self, repo_path: str, tool: str = "gitleaks") -> SecretsScanResult:
        """Scan a repository for secrets"""
        try:
            start_time = datetime.now()
            
            if tool == "gitleaks":
                result = await self._scan_with_gitleaks(repo_path)
            elif tool == "trufflehog":
                result = await self._scan_with_trufflehog(repo_path)
            else:
                raise ValueError(f"Unsupported tool: {tool}")
            
            scan_duration = (datetime.now() - start_time).total_seconds()
            result.scan_duration = scan_duration
            
            return result
            
        except Exception as e:
            raise Exception(f"Secrets scan failed: {str(e)}")
    
    async def _scan_with_gitleaks(self, repo_path: str) -> SecretsScanResult:
        """Scan using Gitleaks"""
        try:
            # Run Gitleaks scan
            cmd = [
                "gitleaks", "detect", "--source", repo_path,
                "--report-format", "json",
                "--report-path", "/tmp/gitleaks_report.json"
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
            
            # Read the report file
            if os.path.exists("/tmp/gitleaks_report.json"):
                with open("/tmp/gitleaks_report.json", "r") as f:
                    scan_data = json.load(f)
            else:
                scan_data = []
            
            findings = []
            for finding in scan_data:
                secret_finding = SecretFinding(
                    secret_type=finding.get("RuleID", "unknown"),
                    secret_value=finding.get("Secret", ""),
                    file_path=finding.get("File", ""),
                    line_number=finding.get("StartLine", 0),
                    commit_hash=finding.get("Commit", ""),
                    author=finding.get("Author", ""),
                    confidence=0.9,  # Gitleaks has high confidence
                    description=finding.get("Description", ""),
                    remediation=self._get_remediation_for_secret_type(finding.get("RuleID", ""))
                )
                findings.append(secret_finding)
            
            # Categorize by severity
            critical_findings = len([f for f in findings if self._is_critical_secret(f.secret_type)])
            high_findings = len([f for f in findings if self._is_high_secret(f.secret_type)])
            medium_findings = len([f for f in findings if self._is_medium_secret(f.secret_type)])
            
            return SecretsScanResult(
                repository=repo_path,
                scan_timestamp=datetime.now(),
                findings=findings,
                total_findings=len(findings),
                critical_findings=critical_findings,
                high_findings=high_findings,
                medium_findings=medium_findings,
                scan_tool="gitleaks",
                scan_duration=0
            )
            
        except Exception as e:
            raise Exception(f"Gitleaks scan error: {str(e)}")
    
    async def _scan_with_trufflehog(self, repo_path: str) -> SecretsScanResult:
        """Scan using TruffleHog"""
        try:
            # Run TruffleHog scan
            cmd = [
                "trufflehog", "--json", "--no-update",
                "--exclude-paths", ".git,node_modules,vendor",
                repo_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
            
            findings = []
            for line in result.stdout.split('\n'):
                if line.strip():
                    try:
                        finding_data = json.loads(line)
                        secret_finding = SecretFinding(
                            secret_type=finding_data.get("reason", "unknown"),
                            secret_value=finding_data.get("raw", ""),
                            file_path=finding_data.get("path", ""),
                            line_number=finding_data.get("line", 0),
                            commit_hash=finding_data.get("commit", ""),
                            author=None,
                            confidence=0.8,  # TruffleHog confidence
                            description=finding_data.get("reason", ""),
                            remediation=self._get_remediation_for_secret_type(finding_data.get("reason", ""))
                        )
                        findings.append(secret_finding)
                    except json.JSONDecodeError:
                        continue
            
            # Categorize by severity
            critical_findings = len([f for f in findings if self._is_critical_secret(f.secret_type)])
            high_findings = len([f for f in findings if self._is_high_secret(f.secret_type)])
            medium_findings = len([f for f in findings if self._is_medium_secret(f.secret_type)])
            
            return SecretsScanResult(
                repository=repo_path,
                scan_timestamp=datetime.now(),
                findings=findings,
                total_findings=len(findings),
                critical_findings=critical_findings,
                high_findings=high_findings,
                medium_findings=medium_findings,
                scan_tool="trufflehog",
                scan_duration=0
            )
            
        except Exception as e:
            raise Exception(f"TruffleHog scan error: {str(e)}")
    
    def _is_critical_secret(self, secret_type: str) -> bool:
        """Check if secret type is critical"""
        critical_types = [
            "aws-access-key-id", "aws-secret-access-key", "aws-session-token",
            "private-key", "ssh-private-key", "api-key", "password",
            "database-url", "connection-string"
        ]
        return any(crit_type in secret_type.lower() for crit_type in critical_types)
    
    def _is_high_secret(self, secret_type: str) -> bool:
        """Check if secret type is high severity"""
        high_types = [
            "token", "secret", "key", "credential", "auth",
            "password", "pwd", "passwd"
        ]
        return any(high_type in secret_type.lower() for high_type in high_types)
    
    def _is_medium_secret(self, secret_type: str) -> bool:
        """Check if secret type is medium severity"""
        medium_types = [
            "config", "setting", "env", "environment",
            "url", "endpoint", "host", "port"
        ]
        return any(medium_type in secret_type.lower() for medium_type in medium_types)
    
    def _get_remediation_for_secret_type(self, secret_type: str) -> str:
        """Get remediation steps for secret type"""
        remediation_map = {
            "aws-access-key-id": "1. Immediately rotate the AWS access key\n2. Remove the key from the repository\n3. Check AWS CloudTrail for unauthorized usage\n4. Update any hardcoded references",
            "aws-secret-access-key": "1. Immediately rotate the AWS secret key\n2. Remove the key from the repository\n3. Check AWS CloudTrail for unauthorized usage\n4. Update any hardcoded references",
            "private-key": "1. Immediately revoke the private key\n2. Generate a new key pair\n3. Update all systems using the old key\n4. Remove the key from the repository",
            "api-key": "1. Immediately revoke the API key\n2. Generate a new API key\n3. Update all applications using the old key\n4. Remove the key from the repository",
            "password": "1. Immediately change the password\n2. Check for unauthorized access\n3. Remove the password from the repository\n4. Use environment variables or secrets management",
            "database-url": "1. Immediately rotate database credentials\n2. Update connection strings\n3. Remove the URL from the repository\n4. Use environment variables or secrets management"
        }
        
        for key, remediation in remediation_map.items():
            if key in secret_type.lower():
                return remediation
        
        return "1. Remove the secret from the repository\n2. Rotate the credential\n3. Use environment variables or secrets management\n4. Add the file to .gitignore"
    
    async def scan_github_repository(self, repo_name: str, tool: str = "gitleaks") -> SecretsScanResult:
        """Scan a GitHub repository for secrets"""
        try:
            if not self.github_client:
                raise Exception("GitHub token not configured")
            
            # Clone the repository temporarily
            temp_dir = f"/tmp/scan_{repo_name.replace('/', '_')}"
            os.makedirs(temp_dir, exist_ok=True)
            
            # Clone repository
            repo = self.github_client.get_repo(repo_name)
            clone_url = repo.clone_url
            
            clone_cmd = ["git", "clone", "--depth", "1", clone_url, temp_dir]
            subprocess.run(clone_cmd, check=True)
            
            # Scan the repository
            result = await self.scan_repository(temp_dir, tool)
            result.repository = repo_name
            
            # Clean up
            subprocess.run(["rm", "-rf", temp_dir])
            
            return result
            
        except Exception as e:
            raise Exception(f"GitHub repository scan failed: {str(e)}")
    
    async def scan_config_files(self, config_path: str) -> SecretsScanResult:
        """Scan configuration files for secrets"""
        try:
            findings = []
            
            # Common config file patterns
            config_patterns = [
                "*.env", "*.config", "*.conf", "*.ini", "*.yaml", "*.yml",
                "*.json", "*.xml", "*.properties", "*.toml"
            ]
            
            for pattern in config_patterns:
                for file_path in self._find_files(config_path, pattern):
                    file_findings = await self._scan_config_file(file_path)
                    findings.extend(file_findings)
            
            return SecretsScanResult(
                repository=config_path,
                scan_timestamp=datetime.now(),
                findings=findings,
                total_findings=len(findings),
                critical_findings=len([f for f in findings if self._is_critical_secret(f.secret_type)]),
                high_findings=len([f for f in findings if self._is_high_secret(f.secret_type)]),
                medium_findings=len([f for f in findings if self._is_medium_secret(f.secret_type)]),
                scan_tool="config_scanner",
                scan_duration=0
            )
            
        except Exception as e:
            raise Exception(f"Config file scan failed: {str(e)}")
    
    async def _scan_config_file(self, file_path: str) -> List[SecretFinding]:
        """Scan a single config file for secrets"""
        findings = []
        
        try:
            with open(file_path, 'r') as f:
                content = f.read()
            
            # Common secret patterns
            secret_patterns = {
                "aws-access-key-id": r"AKIA[0-9A-Z]{16}",
                "aws-secret-access-key": r"[0-9a-zA-Z/+]{40}",
                "api-key": r"api[_-]?key[=:]\s*['\"]?[0-9a-zA-Z]{32,}",
                "password": r"password[=:]\s*['\"]?[^\s'\"]+",
                "private-key": r"-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----",
                "database-url": r"(mysql|postgresql|mongodb)://[^'\"]+",
                "token": r"token[=:]\s*['\"]?[0-9a-zA-Z]{32,}"
            }
            
            for secret_type, pattern in secret_patterns.items():
                matches = re.finditer(pattern, content, re.IGNORECASE)
                for match in matches:
                    line_number = content[:match.start()].count('\n') + 1
                    
                    finding = SecretFinding(
                        secret_type=secret_type,
                        secret_value=match.group(),
                        file_path=file_path,
                        line_number=line_number,
                        commit_hash=None,
                        author=None,
                        confidence=0.7,
                        description=f"Potential {secret_type} found in {file_path}",
                        remediation=self._get_remediation_for_secret_type(secret_type)
                    )
                    findings.append(finding)
            
        except Exception as e:
            print(f"Error scanning {file_path}: {str(e)}")
        
        return findings
    
    def _find_files(self, directory: str, pattern: str) -> List[str]:
        """Find files matching pattern in directory"""
        import glob
        return glob.glob(os.path.join(directory, "**", pattern), recursive=True)
    
    def generate_secrets_report(self, results: List[SecretsScanResult]) -> str:
        """Generate a comprehensive secrets detection report"""
        if not results:
            return "No secrets scan results available."
        
        total_findings = sum(r.total_findings for r in results)
        critical_findings = sum(r.critical_findings for r in results)
        high_findings = sum(r.high_findings for r in results)
        
        report = f"""🔐 **Secrets Detection Report**
        
**📊 Scan Summary:**
• **Total Repositories Scanned:** {len(results)}
• **Total Secrets Found:** {total_findings}
• **Critical Secrets:** {critical_findings}
• **High Severity Secrets:** {high_findings}

**🚨 Critical Findings:**"""
        
        critical_secrets = []
        for result in results:
            for finding in result.findings:
                if self._is_critical_secret(finding.secret_type):
                    critical_secrets.append({
                        'repo': result.repository,
                        'file': finding.file_path,
                        'line': finding.line_number,
                        'type': finding.secret_type,
                        'description': finding.description
                    })
        
        if critical_secrets:
            for secret in critical_secrets[:5]:  # Show top 5 critical
                report += f"""
• **{secret['repo']}** - {secret['type']}
  - File: {secret['file']}:{secret['line']}
  - {secret['description']}"""
        else:
            report += "\n✅ No critical secrets found!"
        
        report += f"""

**🔧 Immediate Actions Required:**
• Rotate all exposed credentials immediately
• Remove secrets from repository history
• Implement pre-commit hooks for secret detection
• Use environment variables and secrets management
• Set up automated secret scanning in CI/CD

**📈 Scan Details:**"""
        
        for result in results:
            report += f"""
• **{result.repository}** ({result.scan_tool})
  - Total Findings: {result.total_findings}
  - Critical: {result.critical_findings}, High: {result.high_findings}
  - Scan Time: {result.scan_duration:.2f}s"""
        
        return report

# Global instance
secrets_detection_agent = SecretsDetectionAgent() 