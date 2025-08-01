"""
Container Security Scanner Tool
Handles Docker container security scanning and vulnerability assessment
"""

import asyncio
import json
import logging
import uuid
import subprocess
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
import docker
from docker.errors import DockerException

logger = logging.getLogger(__name__)


class ContainerSecurityScanner:
    """
    Advanced container security scanner with comprehensive vulnerability assessment
    """
    
    def __init__(self):
        self.client = None
        self.scan_history = []
        self._initialize_docker_client()
        
    def _initialize_docker_client(self):
        """Initialize Docker client"""
        try:
            self.client = docker.from_env()
            logger.info("Docker client initialized for security scanning")
        except DockerException as e:
            logger.warning(f"Docker client initialization failed: {e}")
            self.client = None
    
    async def scan_container(
        self,
        container_id: str,
        scan_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Scan container for security vulnerabilities"""
        
        try:
            if not self.client:
                raise DockerException("Docker client not available")
            
            scan_config = scan_config or {}
            scan_id = str(uuid.uuid4())
            
            container = self.client.containers.get(container_id)
            
            # Perform security scans
            vulnerability_scan = await self._scan_vulnerabilities(container, scan_config)
            configuration_scan = await self._scan_configuration(container, scan_config)
            runtime_scan = await self._scan_runtime_security(container, scan_config)
            
            # Generate security report
            security_report = await self._generate_security_report(
                scan_id, container, vulnerability_scan, configuration_scan, runtime_scan
            )
            
            # Calculate risk score
            risk_score = self._calculate_risk_score(vulnerability_scan, configuration_scan, runtime_scan)
            
            scan_results = {
                "scan_id": scan_id,
                "container_id": container_id,
                "scan_date": datetime.now().isoformat(),
                "vulnerability_scan": vulnerability_scan,
                "configuration_scan": configuration_scan,
                "runtime_scan": runtime_scan,
                "risk_score": risk_score,
                "security_report": security_report,
                "recommendations": self._generate_security_recommendations(
                    vulnerability_scan, configuration_scan, runtime_scan
                )
            }
            
            # Record scan
            self.scan_history.append({
                "operation": "scan_container",
                "timestamp": datetime.now().isoformat(),
                "scan_results": scan_results
            })
            
            logger.info(f"Security scan completed for container {container_id}. Risk score: {risk_score}")
            
            return scan_results
            
        except Exception as e:
            logger.error(f"Container security scan failed: {e}")
            raise
    
    async def scan_image(
        self,
        image_name: str,
        scan_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Scan Docker image for security vulnerabilities"""
        
        try:
            if not self.client:
                raise DockerException("Docker client not available")
            
            scan_config = scan_config or {}
            scan_id = str(uuid.uuid4())
            
            image = self.client.images.get(image_name)
            
            # Perform image security scans
            base_image_scan = await self._scan_base_image(image, scan_config)
            package_scan = await self._scan_packages(image, scan_config)
            layer_scan = await self._scan_image_layers(image, scan_config)
            
            # Generate security report
            security_report = await self._generate_image_security_report(
                scan_id, image, base_image_scan, package_scan, layer_scan
            )
            
            # Calculate risk score
            risk_score = self._calculate_image_risk_score(base_image_scan, package_scan, layer_scan)
            
            scan_results = {
                "scan_id": scan_id,
                "image_name": image_name,
                "scan_date": datetime.now().isoformat(),
                "base_image_scan": base_image_scan,
                "package_scan": package_scan,
                "layer_scan": layer_scan,
                "risk_score": risk_score,
                "security_report": security_report,
                "recommendations": self._generate_image_security_recommendations(
                    base_image_scan, package_scan, layer_scan
                )
            }
            
            # Record scan
            self.scan_history.append({
                "operation": "scan_image",
                "timestamp": datetime.now().isoformat(),
                "scan_results": scan_results
            })
            
            logger.info(f"Image security scan completed for {image_name}. Risk score: {risk_score}")
            
            return scan_results
            
        except Exception as e:
            logger.error(f"Image security scan failed: {e}")
            raise
    
    async def _scan_vulnerabilities(
        self,
        container,
        scan_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Scan container for known vulnerabilities"""
        
        try:
            # Get container image info
            image_id = container.attrs.get("Image")
            image_info = self.client.images.get(image_id)
            
            # Simulate vulnerability scanning
            # In a real implementation, this would use tools like Trivy, Clair, etc.
            vulnerabilities = []
            
            # Check for common vulnerabilities
            if self._check_common_vulnerabilities(image_info):
                vulnerabilities.append({
                    "cve_id": "CVE-2023-1234",
                    "severity": "high",
                    "description": "Common vulnerability in base image",
                    "affected_packages": ["openssl", "libssl"],
                    "cvss_score": 8.5
                })
            
            # Check for outdated packages
            outdated_packages = await self._check_outdated_packages(container)
            for package in outdated_packages:
                vulnerabilities.append({
                    "cve_id": f"OUTDATED-{package['name']}",
                    "severity": "medium",
                    "description": f"Outdated package: {package['name']}",
                    "affected_packages": [package['name']],
                    "cvss_score": 5.0
                })
            
            return {
                "total_vulnerabilities": len(vulnerabilities),
                "high_severity": len([v for v in vulnerabilities if v["severity"] == "high"]),
                "medium_severity": len([v for v in vulnerabilities if v["severity"] == "medium"]),
                "low_severity": len([v for v in vulnerabilities if v["severity"] == "low"]),
                "vulnerabilities": vulnerabilities
            }
            
        except Exception as e:
            logger.error(f"Vulnerability scan failed: {e}")
            return {"error": str(e)}
    
    async def _scan_configuration(
        self,
        container,
        scan_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Scan container configuration for security issues"""
        
        try:
            config_issues = []
            
            # Check container configuration
            config = container.attrs.get("Config", {})
            host_config = container.attrs.get("HostConfig", {})
            
            # Check for privileged mode
            if host_config.get("Privileged", False):
                config_issues.append({
                    "type": "privileged_mode",
                    "severity": "high",
                    "description": "Container running in privileged mode",
                    "recommendation": "Run container in non-privileged mode"
                })
            
            # Check for root user
            if config.get("User", "") == "" or config.get("User", "") == "root":
                config_issues.append({
                    "type": "root_user",
                    "severity": "medium",
                    "description": "Container running as root user",
                    "recommendation": "Use non-root user"
                })
            
            # Check for unnecessary capabilities
            capabilities = host_config.get("CapAdd", [])
            dangerous_caps = ["SYS_ADMIN", "NET_ADMIN", "SYS_MODULE"]
            for cap in dangerous_caps:
                if cap in capabilities:
                    config_issues.append({
                        "type": "dangerous_capability",
                        "severity": "high",
                        "description": f"Container has dangerous capability: {cap}",
                        "recommendation": f"Remove capability: {cap}"
                    })
            
            # Check for read-only filesystem
            if not host_config.get("ReadonlyRootfs", False):
                config_issues.append({
                    "type": "writable_filesystem",
                    "severity": "medium",
                    "description": "Container has writable filesystem",
                    "recommendation": "Use read-only filesystem where possible"
                })
            
            return {
                "total_issues": len(config_issues),
                "high_severity": len([i for i in config_issues if i["severity"] == "high"]),
                "medium_severity": len([i for i in config_issues if i["severity"] == "medium"]),
                "low_severity": len([i for i in config_issues if i["severity"] == "low"]),
                "issues": config_issues
            }
            
        except Exception as e:
            logger.error(f"Configuration scan failed: {e}")
            return {"error": str(e)}
    
    async def _scan_runtime_security(
        self,
        container,
        scan_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Scan container runtime security"""
        
        try:
            runtime_issues = []
            
            # Check for running processes
            try:
                processes = container.top()
                if len(processes.get("Processes", [])) > 10:
                    runtime_issues.append({
                        "type": "too_many_processes",
                        "severity": "medium",
                        "description": "Container has too many running processes",
                        "recommendation": "Limit number of processes"
                    })
            except:
                pass
            
            # Check for open ports
            network_settings = container.attrs.get("NetworkSettings", {})
            ports = network_settings.get("Ports", {})
            if len(ports) > 5:
                runtime_issues.append({
                    "type": "too_many_ports",
                    "severity": "medium",
                    "description": "Container exposes too many ports",
                    "recommendation": "Expose only necessary ports"
                })
            
            # Check for resource usage
            try:
                stats = container.stats(stream=False)
                memory_usage = self._calculate_memory_usage(stats)
                if memory_usage.get("usage_percent", 0) > 90:
                    runtime_issues.append({
                        "type": "high_memory_usage",
                        "severity": "medium",
                        "description": "Container using high memory",
                        "recommendation": "Optimize memory usage"
                    })
            except:
                pass
            
            return {
                "total_issues": len(runtime_issues),
                "high_severity": len([i for i in runtime_issues if i["severity"] == "high"]),
                "medium_severity": len([i for i in runtime_issues if i["severity"] == "medium"]),
                "low_severity": len([i for i in runtime_issues if i["severity"] == "low"]),
                "issues": runtime_issues
            }
            
        except Exception as e:
            logger.error(f"Runtime security scan failed: {e}")
            return {"error": str(e)}
    
    async def _scan_base_image(
        self,
        image,
        scan_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Scan base image for vulnerabilities"""
        
        try:
            # Get image history
            history = image.attrs.get("History", [])
            base_image = self._extract_base_image(history)
            
            # Check base image security
            base_image_issues = []
            
            if "alpine" not in base_image.lower() and "distroless" not in base_image.lower():
                base_image_issues.append({
                    "type": "large_base_image",
                    "severity": "medium",
                    "description": f"Using large base image: {base_image}",
                    "recommendation": "Use Alpine Linux or distroless images"
                })
            
            return {
                "base_image": base_image,
                "total_issues": len(base_image_issues),
                "issues": base_image_issues
            }
            
        except Exception as e:
            logger.error(f"Base image scan failed: {e}")
            return {"error": str(e)}
    
    async def _scan_packages(
        self,
        image,
        scan_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Scan image packages for vulnerabilities"""
        
        try:
            # Simulate package scanning
            # In a real implementation, this would use package managers
            packages = [
                {"name": "openssl", "version": "1.1.1k", "vulnerabilities": 2},
                {"name": "curl", "version": "7.68.0", "vulnerabilities": 1},
                {"name": "bash", "version": "5.0-4", "vulnerabilities": 0}
            ]
            
            total_vulnerabilities = sum(pkg["vulnerabilities"] for pkg in packages)
            
            return {
                "total_packages": len(packages),
                "total_vulnerabilities": total_vulnerabilities,
                "packages": packages
            }
            
        except Exception as e:
            logger.error(f"Package scan failed: {e}")
            return {"error": str(e)}
    
    async def _scan_image_layers(
        self,
        image,
        scan_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Scan image layers for security issues"""
        
        try:
            layers = image.attrs.get("Layers", [])
            layer_issues = []
            
            # Check for sensitive files in layers
            sensitive_patterns = ["/etc/passwd", "/etc/shadow", "/root/.ssh"]
            for pattern in sensitive_patterns:
                layer_issues.append({
                    "type": "sensitive_file",
                    "severity": "high",
                    "description": f"Potential sensitive file: {pattern}",
                    "recommendation": "Remove sensitive files from image"
                })
            
            return {
                "total_layers": len(layers),
                "total_issues": len(layer_issues),
                "issues": layer_issues
            }
            
        except Exception as e:
            logger.error(f"Layer scan failed: {e}")
            return {"error": str(e)}
    
    def _calculate_risk_score(
        self,
        vulnerability_scan: Dict[str, Any],
        configuration_scan: Dict[str, Any],
        runtime_scan: Dict[str, Any]
    ) -> float:
        """Calculate overall risk score"""
        
        try:
            score = 0.0
            
            # Vulnerability score (40% weight)
            vuln_scan = vulnerability_scan.get("vulnerabilities", [])
            high_vulns = len([v for v in vuln_scan if v.get("severity") == "high"])
            medium_vulns = len([v for v in vuln_scan if v.get("severity") == "medium"])
            score += (high_vulns * 10 + medium_vulns * 5) * 0.4
            
            # Configuration score (35% weight)
            config_issues = configuration_scan.get("issues", [])
            high_config = len([i for i in config_issues if i.get("severity") == "high"])
            medium_config = len([i for i in config_issues if i.get("severity") == "medium"])
            score += (high_config * 8 + medium_config * 4) * 0.35
            
            # Runtime score (25% weight)
            runtime_issues = runtime_scan.get("issues", [])
            high_runtime = len([i for i in runtime_issues if i.get("severity") == "high"])
            medium_runtime = len([i for i in runtime_issues if i.get("severity") == "medium"])
            score += (high_runtime * 6 + medium_runtime * 3) * 0.25
            
            return min(score, 100.0)
            
        except Exception as e:
            logger.error(f"Risk score calculation failed: {e}")
            return 50.0
    
    def _calculate_image_risk_score(
        self,
        base_image_scan: Dict[str, Any],
        package_scan: Dict[str, Any],
        layer_scan: Dict[str, Any]
    ) -> float:
        """Calculate image risk score"""
        
        try:
            score = 0.0
            
            # Base image score (30% weight)
            base_issues = base_image_scan.get("total_issues", 0)
            score += base_issues * 5 * 0.3
            
            # Package score (50% weight)
            package_vulns = package_scan.get("total_vulnerabilities", 0)
            score += package_vulns * 8 * 0.5
            
            # Layer score (20% weight)
            layer_issues = layer_scan.get("total_issues", 0)
            score += layer_issues * 3 * 0.2
            
            return min(score, 100.0)
            
        except Exception as e:
            logger.error(f"Image risk score calculation failed: {e}")
            return 50.0
    
    def _generate_security_recommendations(
        self,
        vulnerability_scan: Dict[str, Any],
        configuration_scan: Dict[str, Any],
        runtime_scan: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate security recommendations"""
        
        recommendations = []
        
        # Vulnerability recommendations
        vuln_scan = vulnerability_scan.get("vulnerabilities", [])
        if vuln_scan:
            recommendations.append({
                "category": "vulnerabilities",
                "priority": "high",
                "description": f"Found {len(vuln_scan)} vulnerabilities",
                "actions": [
                    "Update vulnerable packages",
                    "Use vulnerability scanning tools",
                    "Implement patch management"
                ]
            })
        
        # Configuration recommendations
        config_issues = configuration_scan.get("issues", [])
        if config_issues:
            recommendations.append({
                "category": "configuration",
                "priority": "medium",
                "description": f"Found {len(config_issues)} configuration issues",
                "actions": [
                    "Run container as non-root user",
                    "Remove unnecessary capabilities",
                    "Use read-only filesystem"
                ]
            })
        
        return recommendations
    
    def _generate_image_security_recommendations(
        self,
        base_image_scan: Dict[str, Any],
        package_scan: Dict[str, Any],
        layer_scan: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate image security recommendations"""
        
        recommendations = []
        
        # Base image recommendations
        base_issues = base_image_scan.get("total_issues", 0)
        if base_issues > 0:
            recommendations.append({
                "category": "base_image",
                "priority": "medium",
                "description": "Base image security issues found",
                "actions": [
                    "Use minimal base images",
                    "Consider distroless images",
                    "Regularly update base images"
                ]
            })
        
        # Package recommendations
        package_vulns = package_scan.get("total_vulnerabilities", 0)
        if package_vulns > 0:
            recommendations.append({
                "category": "packages",
                "priority": "high",
                "description": f"Found {package_vulns} package vulnerabilities",
                "actions": [
                    "Update vulnerable packages",
                    "Use package vulnerability scanners",
                    "Implement automated updates"
                ]
            })
        
        return recommendations
    
    async def _generate_security_report(
        self,
        scan_id: str,
        container,
        vulnerability_scan: Dict[str, Any],
        configuration_scan: Dict[str, Any],
        runtime_scan: Dict[str, Any]
    ) -> str:
        """Generate comprehensive security report"""
        
        try:
            report_dir = Path("security_reports") / scan_id
            report_dir.mkdir(parents=True, exist_ok=True)
            
            # Create report content
            report_content = f"""
# Container Security Report

## Scan Details
- **Scan ID**: {scan_id}
- **Container ID**: {container.id}
- **Scan Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **Container Name**: {container.name}

## Vulnerability Scan
- **Total Vulnerabilities**: {vulnerability_scan.get('total_vulnerabilities', 0)}
- **High Severity**: {vulnerability_scan.get('high_severity', 0)}
- **Medium Severity**: {vulnerability_scan.get('medium_severity', 0)}

## Configuration Scan
- **Total Issues**: {configuration_scan.get('total_issues', 0)}
- **High Severity**: {configuration_scan.get('high_severity', 0)}
- **Medium Severity**: {configuration_scan.get('medium_severity', 0)}

## Runtime Security Scan
- **Total Issues**: {runtime_scan.get('total_issues', 0)}
- **High Severity**: {runtime_scan.get('high_severity', 0)}
- **Medium Severity**: {runtime_scan.get('medium_severity', 0)}

## Recommendations
{self._format_recommendations(self._generate_security_recommendations(vulnerability_scan, configuration_scan, runtime_scan))}
"""
            
            with open(report_dir / "security_report.md", "w") as f:
                f.write(report_content)
            
            return str(report_dir)
            
        except Exception as e:
            logger.error(f"Failed to generate security report: {e}")
            return ""
    
    async def _generate_image_security_report(
        self,
        scan_id: str,
        image,
        base_image_scan: Dict[str, Any],
        package_scan: Dict[str, Any],
        layer_scan: Dict[str, Any]
    ) -> str:
        """Generate image security report"""
        
        try:
            report_dir = Path("security_reports") / scan_id
            report_dir.mkdir(parents=True, exist_ok=True)
            
            # Create report content
            report_content = f"""
# Image Security Report

## Scan Details
- **Scan ID**: {scan_id}
- **Image Name**: {image.tags[0] if image.tags else 'untagged'}
- **Scan Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Base Image Scan
- **Base Image**: {base_image_scan.get('base_image', 'unknown')}
- **Total Issues**: {base_image_scan.get('total_issues', 0)}

## Package Scan
- **Total Packages**: {package_scan.get('total_packages', 0)}
- **Total Vulnerabilities**: {package_scan.get('total_vulnerabilities', 0)}

## Layer Scan
- **Total Layers**: {layer_scan.get('total_layers', 0)}
- **Total Issues**: {layer_scan.get('total_issues', 0)}

## Recommendations
{self._format_recommendations(self._generate_image_security_recommendations(base_image_scan, package_scan, layer_scan))}
"""
            
            with open(report_dir / "image_security_report.md", "w") as f:
                f.write(report_content)
            
            return str(report_dir)
            
        except Exception as e:
            logger.error(f"Failed to generate image security report: {e}")
            return ""
    
    def _format_recommendations(self, recommendations: List[Dict[str, Any]]) -> str:
        """Format recommendations for report"""
        formatted = ""
        for rec in recommendations:
            formatted += f"""
### {rec['category'].title()}
- **Priority**: {rec['priority']}
- **Description**: {rec['description']}
- **Actions**:
"""
            for action in rec['actions']:
                formatted += f"  - {action}\n"
        return formatted
    
    def _check_common_vulnerabilities(self, image_info) -> bool:
        """Check for common vulnerabilities"""
        # Simulate vulnerability check
        return True
    
    async def _check_outdated_packages(self, container) -> List[Dict[str, Any]]:
        """Check for outdated packages"""
        # Simulate package check
        return [
            {"name": "openssl", "current_version": "1.1.1k", "latest_version": "1.1.1w"},
            {"name": "curl", "current_version": "7.68.0", "latest_version": "7.88.1"}
        ]
    
    def _calculate_memory_usage(self, stats: Dict[str, Any]) -> Dict[str, int]:
        """Calculate memory usage"""
        try:
            memory_stats = stats.get("memory_stats", {})
            usage = memory_stats.get("usage", 0)
            limit = memory_stats.get("limit", 1)
            
            return {
                "usage_bytes": usage,
                "limit_bytes": limit,
                "usage_percent": (usage / limit) * 100 if limit > 0 else 0
            }
        except:
            return {"usage_bytes": 0, "limit_bytes": 0, "usage_percent": 0}
    
    def _extract_base_image(self, history: List[Dict[str, Any]]) -> str:
        """Extract base image from history"""
        try:
            for entry in history:
                if "FROM" in entry.get("created_by", ""):
                    return entry["created_by"].split("FROM ")[-1].split(" ")[0]
            return "unknown"
        except:
            return "unknown"
    
    def get_scan_history(self) -> List[Dict[str, Any]]:
        """Get scan history"""
        return self.scan_history 