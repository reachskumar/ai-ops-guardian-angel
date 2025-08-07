"""
Container Security Scanning Agent
Scans Docker/K8s images for vulnerabilities using Trivy, Grype, and Dockle
"""

import asyncio
import json
import subprocess
import tempfile
from typing import Dict, List, Any, Optional
from datetime import datetime
import boto3
from dataclasses import dataclass

@dataclass
class Vulnerability:
    """Vulnerability information"""
    cve_id: str
    severity: str
    package_name: str
    package_version: str
    fixed_version: Optional[str]
    description: str
    cvss_score: Optional[float]
    published_date: Optional[str]

@dataclass
class ContainerScanResult:
    """Container scan result"""
    image_name: str
    scan_timestamp: datetime
    vulnerabilities: List[Vulnerability]
    total_vulnerabilities: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    scan_tool: str
    scan_duration: float

class ContainerScanAgent:
    """Container Security Scanning Agent using Trivy, Grype, and Dockle"""
    
    def __init__(self):
        self.name = "ContainerScanAgent"
        self.description = "Scans Docker and Kubernetes images for vulnerabilities"
        self.supported_tools = ["trivy", "grype", "dockle"]
        self.ecr_client = boto3.client('ecr')
        
    async def scan_docker_image(self, image_name: str, tool: str = "trivy") -> ContainerScanResult:
        """Scan a Docker image for vulnerabilities"""
        try:
            start_time = datetime.now()
            
            if tool == "trivy":
                result = await self._scan_with_trivy(image_name)
            elif tool == "grype":
                result = await self._scan_with_grype(image_name)
            elif tool == "dockle":
                result = await self._scan_with_dockle(image_name)
            else:
                raise ValueError(f"Unsupported tool: {tool}")
            
            scan_duration = (datetime.now() - start_time).total_seconds()
            result.scan_duration = scan_duration
            
            return result
            
        except Exception as e:
            raise Exception(f"Container scan failed: {str(e)}")
    
    async def _scan_with_trivy(self, image_name: str) -> ContainerScanResult:
        """Scan using Trivy"""
        try:
            # Run Trivy scan
            cmd = [
                "trivy", "image", "--format", "json", 
                "--severity", "CRITICAL,HIGH,MEDIUM,LOW",
                image_name
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            if result.returncode != 0:
                raise Exception(f"Trivy scan failed: {result.stderr}")
            
            # Parse Trivy JSON output
            scan_data = json.loads(result.stdout)
            vulnerabilities = []
            
            for result_data in scan_data.get("Results", []):
                for vuln in result_data.get("Vulnerabilities", []):
                    vulnerability = Vulnerability(
                        cve_id=vuln.get("VulnerabilityID", ""),
                        severity=vuln.get("Severity", "UNKNOWN"),
                        package_name=vuln.get("PkgName", ""),
                        package_version=vuln.get("InstalledVersion", ""),
                        fixed_version=vuln.get("FixedVersion"),
                        description=vuln.get("Description", ""),
                        cvss_score=vuln.get("CVSS", {}).get("nvd", {}).get("V3Score"),
                        published_date=vuln.get("PublishedDate")
                    )
                    vulnerabilities.append(vulnerability)
            
            # Count by severity
            critical_count = len([v for v in vulnerabilities if v.severity == "CRITICAL"])
            high_count = len([v for v in vulnerabilities if v.severity == "HIGH"])
            medium_count = len([v for v in vulnerabilities if v.severity == "MEDIUM"])
            low_count = len([v for v in vulnerabilities if v.severity == "LOW"])
            
            return ContainerScanResult(
                image_name=image_name,
                scan_timestamp=datetime.now(),
                vulnerabilities=vulnerabilities,
                total_vulnerabilities=len(vulnerabilities),
                critical_count=critical_count,
                high_count=high_count,
                medium_count=medium_count,
                low_count=low_count,
                scan_tool="trivy",
                scan_duration=0
            )
            
        except Exception as e:
            raise Exception(f"Trivy scan error: {str(e)}")
    
    async def _scan_with_grype(self, image_name: str) -> ContainerScanResult:
        """Scan using Grype"""
        try:
            # Run Grype scan
            cmd = ["grype", image_name, "--output", "json"]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            if result.returncode != 0:
                raise Exception(f"Grype scan failed: {result.stderr}")
            
            # Parse Grype JSON output
            scan_data = json.loads(result.stdout)
            vulnerabilities = []
            
            for match in scan_data.get("matches", []):
                vulnerability = Vulnerability(
                    cve_id=match.get("vulnerability", {}).get("id", ""),
                    severity=match.get("vulnerability", {}).get("severity", "UNKNOWN"),
                    package_name=match.get("artifact", {}).get("name", ""),
                    package_version=match.get("artifact", {}).get("version", ""),
                    fixed_version=match.get("vulnerability", {}).get("fix", {}).get("versions", [None])[0],
                    description=match.get("vulnerability", {}).get("description", ""),
                    cvss_score=match.get("vulnerability", {}).get("cvss", {}).get("baseScore"),
                    published_date=match.get("vulnerability", {}).get("published")
                )
                vulnerabilities.append(vulnerability)
            
            # Count by severity
            critical_count = len([v for v in vulnerabilities if v.severity == "Critical"])
            high_count = len([v for v in vulnerabilities if v.severity == "High"])
            medium_count = len([v for v in vulnerabilities if v.severity == "Medium"])
            low_count = len([v for v in vulnerabilities if v.severity == "Low"])
            
            return ContainerScanResult(
                image_name=image_name,
                scan_timestamp=datetime.now(),
                vulnerabilities=vulnerabilities,
                total_vulnerabilities=len(vulnerabilities),
                critical_count=critical_count,
                high_count=high_count,
                medium_count=medium_count,
                low_count=low_count,
                scan_tool="grype",
                scan_duration=0
            )
            
        except Exception as e:
            raise Exception(f"Grype scan error: {str(e)}")
    
    async def _scan_with_dockle(self, image_name: str) -> ContainerScanResult:
        """Scan using Dockle (container best practices)"""
        try:
            # Run Dockle scan
            cmd = ["dockle", "--format", "json", image_name]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            # Dockle may return non-zero for findings, so we check stderr
            if result.stderr and "error" in result.stderr.lower():
                raise Exception(f"Dockle scan failed: {result.stderr}")
            
            # Parse Dockle JSON output
            scan_data = json.loads(result.stdout) if result.stdout else []
            vulnerabilities = []
            
            for finding in scan_data:
                vulnerability = Vulnerability(
                    cve_id=finding.get("code", ""),
                    severity=finding.get("level", "UNKNOWN"),
                    package_name="container_best_practices",
                    package_version="",
                    fixed_version=None,
                    description=finding.get("title", ""),
                    cvss_score=None,
                    published_date=None
                )
                vulnerabilities.append(vulnerability)
            
            # Count by severity
            critical_count = len([v for v in vulnerabilities if v.severity == "FATAL"])
            high_count = len([v for v in vulnerabilities if v.severity == "WARN"])
            medium_count = len([v for v in vulnerabilities if v.severity == "INFO"])
            low_count = len([v for v in vulnerabilities if v.severity == "PASS"])
            
            return ContainerScanResult(
                image_name=image_name,
                scan_timestamp=datetime.now(),
                vulnerabilities=vulnerabilities,
                total_vulnerabilities=len(vulnerabilities),
                critical_count=critical_count,
                high_count=high_count,
                medium_count=medium_count,
                low_count=low_count,
                scan_tool="dockle",
                scan_duration=0
            )
            
        except Exception as e:
            raise Exception(f"Dockle scan error: {str(e)}")
    
    async def scan_ecr_repository(self, repository_name: str, region: str = "us-east-1") -> List[ContainerScanResult]:
        """Scan all images in an ECR repository"""
        try:
            ecr_client = boto3.client('ecr', region_name=region)
            
            # List all images in repository
            response = ecr_client.list_images(repositoryName=repository_name)
            image_results = []
            
            for image in response.get('imageIds', []):
                image_tag = image.get('imageTag', 'latest')
                image_uri = f"{repository_name}:{image_tag}"
                
                # Scan with Trivy
                result = await self.scan_docker_image(image_uri, "trivy")
                image_results.append(result)
            
            return image_results
            
        except Exception as e:
            raise Exception(f"ECR repository scan failed: {str(e)}")
    
    def generate_scan_report(self, results: List[ContainerScanResult]) -> str:
        """Generate a comprehensive scan report"""
        if not results:
            return "No scan results available."
        
        report = f"""🔍 **Container Security Scan Report**
        
**📊 Scan Summary:**
• **Total Images Scanned:** {len(results)}
• **Total Vulnerabilities Found:** {sum(r.total_vulnerabilities for r in results)}
• **Critical Vulnerabilities:** {sum(r.critical_count for r in results)}
• **High Vulnerabilities:** {sum(r.high_count for r in results)}
• **Medium Vulnerabilities:** {sum(r.medium_count for r in results)}
• **Low Vulnerabilities:** {sum(r.low_count for r in results)}

**🚨 Critical Findings:**"""
        
        critical_vulns = []
        for result in results:
            for vuln in result.vulnerabilities:
                if vuln.severity in ["CRITICAL", "Critical", "FATAL"]:
                    critical_vulns.append({
                        'image': result.image_name,
                        'cve': vuln.cve_id,
                        'package': vuln.package_name,
                        'version': vuln.package_version,
                        'description': vuln.description[:100] + "..." if len(vuln.description) > 100 else vuln.description
                    })
        
        if critical_vulns:
            for vuln in critical_vulns[:5]:  # Show top 5 critical
                report += f"""
• **{vuln['image']}** - {vuln['cve']}
  - Package: {vuln['package']} {vuln['version']}
  - {vuln['description']}"""
        else:
            report += "\n✅ No critical vulnerabilities found!"
        
        report += f"""

**🔧 Recommendations:**
• Update base images to latest versions
• Implement automated vulnerability scanning in CI/CD
• Set up vulnerability alerts and notifications
• Consider using distroless images for production
• Regularly update dependencies and packages

**📈 Scan Details:**"""
        
        for result in results:
            report += f"""
• **{result.image_name}** ({result.scan_tool})
  - Vulnerabilities: {result.total_vulnerabilities}
  - Critical: {result.critical_count}, High: {result.high_count}
  - Scan Time: {result.scan_duration:.2f}s"""
        
        return report

# Global instance
container_scan_agent = ContainerScanAgent() 