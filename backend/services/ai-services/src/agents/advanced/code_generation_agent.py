"""
Code Generation Agent - Advanced AI agent for automated code generation and refactoring
Provides intelligent code generation, refactoring, and optimization capabilities
"""

import asyncio
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple
import ast
import re
from pathlib import Path

from ..base_agent import BaseAgent, AgentTask, AgentCapabilities, AgentRecommendation
from ...config.settings import AgentType, RiskLevel, settings


class CodeGenerationAgent(BaseAgent):
    """
    Advanced AI agent for infrastructure code generation and review.
    
    Capabilities:
    - Terraform configuration generation
    - Ansible playbook creation
    - Kubernetes manifest generation
    - Dockerfile optimization
    - Infrastructure code review and security analysis
    - Best practices enforcement
    - Code template management
    - Multi-cloud code generation
    """
    
    def __init__(self):
        capabilities = AgentCapabilities(
            supported_tasks=[
                "terraform_generation",
                "ansible_generation", 
                "kubernetes_generation",
                "docker_generation",
                "code_review",
                "security_analysis",
                "best_practices_check",
                "template_generation",
                "multi_cloud_translation",
                "code_optimization"
            ],
            required_tools=["code_generator", "template_engine", "code_reviewer"],
            max_concurrent_tasks=3,
            average_response_time=45.0
        )
        
        super().__init__(
            agent_type=AgentType.CODE_GENERATION,
            name="Code Generation Agent",
            description="AI-powered infrastructure code generation and review",
            capabilities=capabilities
        )
        
        # Code generation templates
        self.templates = {
            'terraform': {},
            'ansible': {},
            'kubernetes': {},
            'docker': {}
        }
        
        # Code quality rules
        self.quality_rules = {
            'terraform': [
                'use_variables_for_reusability',
                'implement_proper_state_management',
                'include_resource_tags',
                'use_modules_for_common_patterns',
                'implement_proper_naming_conventions'
            ],
            'ansible': [
                'use_handlers_for_service_management',
                'implement_idempotency',
                'use_variables_and_defaults',
                'implement_proper_error_handling',
                'follow_yaml_best_practices'
            ],
            'kubernetes': [
                'implement_resource_limits',
                'use_namespaces_for_isolation',
                'implement_health_checks',
                'use_secrets_for_sensitive_data',
                'implement_proper_rbac'
            ]
        }
        
        # Security patterns to detect
        self.security_patterns = {
            'hardcoded_secrets': r'(password|secret|key|token)\s*=\s*["\'][^"\']+["\']',
            'insecure_protocols': r'(http://|ftp://|telnet://)',
            'wildcard_permissions': r'(\*|\*/\*|0\.0\.0\.0/0)',
            'default_passwords': r'(admin|password|123456|root)'
        }
        
        self.logger.info("Code Generation Agent initialized")
    
    async def _on_start(self):
        """Initialize code generation templates and patterns"""
        try:
            await self._load_templates()
            await self._initialize_code_analyzers()
            self.logger.info("Code Generation Agent started successfully")
        except Exception as e:
            self.logger.error(f"Failed to start Code Generation Agent: {str(e)}")
    
    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        """Execute code generation tasks"""
        task_type = task.task_type
        context = task.context
        
        self.logger.info(f"Executing code generation task: {task_type}")
        
        if task_type == "terraform_generation":
            return await self._generate_terraform(context)
        elif task_type == "ansible_generation":
            return await self._generate_ansible(context)
        elif task_type == "kubernetes_generation":
            return await self._generate_kubernetes(context)
        elif task_type == "docker_generation":
            return await self._generate_docker(context)
        elif task_type == "code_review":
            return await self._review_code(context)
        elif task_type == "security_analysis":
            return await self._analyze_security(context)
        elif task_type == "best_practices_check":
            return await self._check_best_practices(context)
        elif task_type == "template_generation":
            return await self._generate_template(context)
        elif task_type == "multi_cloud_translation":
            return await self._translate_multi_cloud(context)
        elif task_type == "code_optimization":
            return await self._optimize_code(context)
        else:
            raise ValueError(f"Unsupported code generation task: {task_type}")
    
    async def _generate_recommendation_logic(
        self, 
        context: Dict[str, Any], 
        task_type: str
    ) -> Dict[str, Any]:
        """Generate code generation recommendations"""
        
        if task_type == "code_review":
            review_result = await self._review_code(context)
            
            issues_found = review_result.get('total_issues', 0)
            security_issues = review_result.get('security_issues', 0)
            quality_score = review_result.get('quality_score', 100)
            
            # Determine risk level
            if security_issues > 0 or quality_score < 60:
                risk_level = RiskLevel.HIGH
            elif issues_found > 5 or quality_score < 80:
                risk_level = RiskLevel.MEDIUM
            else:
                risk_level = RiskLevel.LOW
            
            return {
                "title": f"Infrastructure Code Review - {issues_found} issues found",
                "description": f"Code review identified {security_issues} security issues and {issues_found - security_issues} quality issues",
                "reasoning": f"""
                Code review analysis of infrastructure configurations:
                
                **Quality Score**: {quality_score:.1f}/100
                **Total Issues**: {issues_found}
                **Security Issues**: {security_issues}
                **Best Practice Violations**: {review_result.get('best_practice_violations', 0)}
                
                **Critical Findings**:
                {self._format_critical_findings(review_result.get('critical_issues', []))}
                
                **Recommendations**:
                1. Address all security vulnerabilities immediately
                2. Implement missing best practices
                3. Refactor code for better maintainability
                4. Add comprehensive documentation
                5. Implement proper testing procedures
                """,
                "confidence": 0.95,
                "impact": f"Improved code security and maintainability",
                "risk_level": risk_level,
                "estimated_duration": "1-2 weeks remediation",
                "resources_affected": context.get('files_reviewed', []),
                "alternatives": [
                    "Gradual remediation over multiple sprints",
                    "Focus on security issues first",
                    "Implement automated code quality gates"
                ],
                "prerequisites": [
                    "Code backup and version control",
                    "Test environment for validation",
                    "Team training on best practices"
                ],
                "rollback_plan": "All code changes tracked in version control with easy rollback"
            }
        
        elif task_type == "terraform_generation":
            generation_result = await self._generate_terraform(context)
            
            return {
                "title": "Terraform Infrastructure Code Generated",
                "description": f"Generated Terraform configuration for {context.get('infrastructure_type', 'infrastructure')}",
                "reasoning": f"""
                Generated comprehensive Terraform configuration including:
                
                **Resources Created**: {generation_result.get('resource_count', 0)}
                **Modules Used**: {len(generation_result.get('modules', []))}
                **Security Features**: {len(generation_result.get('security_features', []))}
                
                **Generated Components**:
                - Main configuration files
                - Variable definitions
                - Output specifications
                - Provider configurations
                - Module implementations
                
                **Best Practices Implemented**:
                - Proper resource naming
                - Comprehensive tagging
                - Security group restrictions
                - State management configuration
                """,
                "confidence": 0.90,
                "impact": "Automated infrastructure provisioning capability",
                "risk_level": RiskLevel.LOW,
                "estimated_duration": "Ready for immediate deployment"
            }
        
        return {
            "title": "Code Generation Complete",
            "description": "Infrastructure code generation completed successfully",
            "reasoning": "Generated infrastructure code following best practices",
            "confidence": 0.85,
            "impact": "Infrastructure automation capability",
            "risk_level": RiskLevel.LOW
        }
    
    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze code data using AI models"""
        try:
            code_files = data.get('code_files', {})
            requirements = data.get('requirements', {})
            
            # Analyze code quality
            quality_analysis = await self._analyze_code_quality(code_files)
            
            # Security analysis
            security_analysis = await self._perform_security_analysis(code_files)
            
            # Generate improvement suggestions
            suggestions = await self._generate_code_suggestions(code_files, requirements)
            
            return {
                'quality_analysis': quality_analysis,
                'security_analysis': security_analysis,
                'suggestions': suggestions,
                'maintainability_score': await self._calculate_maintainability_score(code_files),
                'analysis_timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            self.logger.error(f"Code data analysis failed: {str(e)}")
            raise
    
    # Core Code Generation Methods
    
    async def _generate_terraform(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Terraform configuration"""
        try:
            requirements = context.get('requirements', {})
            cloud_provider = context.get('cloud_provider', 'aws')
            
            self.logger.info(f"Generating Terraform for {cloud_provider}")
            
            # Generate main configuration
            main_tf = await self._generate_terraform_main(requirements, cloud_provider)
            
            # Generate variables
            variables_tf = await self._generate_terraform_variables(requirements)
            
            # Generate outputs
            outputs_tf = await self._generate_terraform_outputs(requirements)
            
            # Generate modules
            modules = await self._generate_terraform_modules(requirements)
            
            # Validate configuration
            validation_result = await self._validate_terraform_config(main_tf, variables_tf)
            
            return {
                'cloud_provider': cloud_provider,
                'main_tf': main_tf,
                'variables_tf': variables_tf,
                'outputs_tf': outputs_tf,
                'modules': modules,
                'resource_count': len(requirements.get('resources', [])),
                'security_features': await self._extract_security_features(main_tf),
                'validation_result': validation_result,
                'estimated_cost': await self._estimate_terraform_cost(requirements, cloud_provider)
            }
            
        except Exception as e:
            self.logger.error(f"Terraform generation failed: {str(e)}")
            raise
    
    async def _generate_terraform_main(self, requirements: Dict[str, Any], provider: str) -> str:
        """Generate main Terraform configuration"""
        if provider == 'aws':
            return f"""
# Provider configuration
terraform {{
  required_version = ">= 1.0"
  required_providers {{
    aws = {{
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }}
  }}
}}

provider "aws" {{
  region = var.aws_region
  
  default_tags {{
    tags = {{
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    }}
  }}
}}

# VPC Configuration
resource "aws_vpc" "main" {{
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {{
    Name = "${{var.project_name}}-vpc"
  }}
}}

# Internet Gateway
resource "aws_internet_gateway" "main" {{
  vpc_id = aws_vpc.main.id
  
  tags = {{
    Name = "${{var.project_name}}-igw"
  }}
}}

# Public Subnet
resource "aws_subnet" "public" {{
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = var.availability_zones[count.index]
  
  map_public_ip_on_launch = true
  
  tags = {{
    Name = "${{var.project_name}}-public-${{count.index + 1}}"
  }}
}}

# Security Group
resource "aws_security_group" "web" {{
  name_prefix = "${{var.project_name}}-web"
  vpc_id      = aws_vpc.main.id
  
  ingress {{
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }}
  
  ingress {{
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }}
  
  egress {{
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }}
  
  tags = {{
    Name = "${{var.project_name}}-web-sg"
  }}
}}
"""
        return "# Terraform configuration for other providers"
    
    async def _review_code(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Review infrastructure code for quality and security"""
        try:
            code_files = context.get('code_files', {})
            code_type = context.get('code_type', 'terraform')
            
            self.logger.info(f"Reviewing {len(code_files)} {code_type} files")
            
            total_issues = 0
            security_issues = 0
            best_practice_violations = 0
            critical_issues = []
            
            file_reviews = {}
            
            for filename, content in code_files.items():
                file_review = await self._review_single_file(filename, content, code_type)
                file_reviews[filename] = file_review
                
                total_issues += file_review['issue_count']
                security_issues += file_review['security_issue_count']
                best_practice_violations += file_review['best_practice_violations']
                critical_issues.extend(file_review['critical_issues'])
            
            # Calculate quality score
            base_score = 100
            penalty_per_issue = 2
            quality_score = max(0, base_score - (total_issues * penalty_per_issue))
            
            return {
                'total_issues': total_issues,
                'security_issues': security_issues,
                'best_practice_violations': best_practice_violations,
                'quality_score': quality_score,
                'critical_issues': critical_issues,
                'file_reviews': file_reviews,
                'recommendations': await self._generate_review_recommendations(file_reviews)
            }
            
        except Exception as e:
            self.logger.error(f"Code review failed: {str(e)}")
            raise
    
    async def _review_single_file(self, filename: str, content: str, code_type: str) -> Dict[str, Any]:
        """Review a single code file"""
        issues = []
        security_issues = []
        critical_issues = []
        
        # Check for security patterns
        for pattern_name, pattern in self.security_patterns.items():
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                issue = {
                    'type': 'security',
                    'severity': 'high',
                    'pattern': pattern_name,
                    'matches': len(matches),
                    'description': f"Found {pattern_name} in code"
                }
                security_issues.append(issue)
                critical_issues.append(issue)
        
        # Check best practices
        if code_type in self.quality_rules:
            for rule in self.quality_rules[code_type]:
                if not await self._check_best_practice_rule(content, rule, code_type):
                    issues.append({
                        'type': 'best_practice',
                        'severity': 'medium',
                        'rule': rule,
                        'description': f"Missing best practice: {rule}"
                    })
        
        return {
            'filename': filename,
            'issue_count': len(issues) + len(security_issues),
            'security_issue_count': len(security_issues),
            'best_practice_violations': len(issues),
            'critical_issues': critical_issues,
            'all_issues': issues + security_issues
        }
    
    # Helper Methods
    
    async def _load_templates(self):
        """Load code generation templates"""
        self.logger.info("Code generation templates loaded")
    
    async def _initialize_code_analyzers(self):
        """Initialize code analysis tools"""
        self.logger.info("Code analyzers initialized")
    
    def _format_critical_findings(self, critical_issues: List[Dict[str, Any]]) -> str:
        """Format critical findings for display"""
        if not critical_issues:
            return "No critical issues found"
        
        findings = []
        for issue in critical_issues[:5]:  # Show top 5
            findings.append(f"- {issue.get('description', 'Unknown issue')}")
        
        return "\n".join(findings)
    
    # Method stubs for completeness
    async def _generate_ansible(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _generate_kubernetes(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _generate_docker(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _analyze_security(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _check_best_practices(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _generate_template(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _translate_multi_cloud(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _optimize_code(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _analyze_code_quality(self, files) -> Dict[str, Any]: return {}
    async def _perform_security_analysis(self, files) -> Dict[str, Any]: return {}
    async def _generate_code_suggestions(self, files, requirements) -> List[str]: return []
    async def _calculate_maintainability_score(self, files) -> float: return 85.0
    async def _generate_terraform_variables(self, requirements) -> str: return "# Variables"
    async def _generate_terraform_outputs(self, requirements) -> str: return "# Outputs"
    async def _generate_terraform_modules(self, requirements) -> List[str]: return []
    async def _validate_terraform_config(self, main, variables) -> Dict[str, Any]: return {"valid": True}
    async def _extract_security_features(self, config) -> List[str]: return []
    async def _estimate_terraform_cost(self, requirements, provider) -> float: return 100.0
    async def _check_best_practice_rule(self, content, rule, code_type) -> bool: return True
    async def _generate_review_recommendations(self, reviews) -> List[str]: return [] 