"""
Pipeline Generator Agent
Generates CI/CD pipelines for GitHub Actions, ArgoCD, and other GitOps tools
"""

import asyncio
import json
import yaml
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass
import boto3
from github import Github
import os

@dataclass
class PipelineConfig:
    """Pipeline configuration"""
    name: str
    type: str  # github-actions, argocd, jenkins, gitlab-ci
    language: str  # python, nodejs, java, go, etc.
    framework: str  # django, flask, react, vue, spring, etc.
    deployment_target: str  # aws, gcp, azure, kubernetes
    features: List[str]  # testing, security, deployment, etc.

@dataclass
class GeneratedPipeline:
    """Generated pipeline result"""
    name: str
    type: str
    content: str
    file_path: str
    description: str
    estimated_duration: int  # minutes

class PipelineGeneratorAgent:
    """Pipeline Generator Agent for CI/CD automation"""
    
    def __init__(self):
        self.name = "PipelineGeneratorAgent"
        self.description = "Generates CI/CD pipelines for various platforms"
        self.supported_platforms = ["github-actions", "argocd", "jenkins", "gitlab-ci"]
        self.github_token = os.getenv('GITHUB_TOKEN')
        self.github_client = Github(self.github_token) if self.github_token else None
        
    async def generate_pipeline(self, config: PipelineConfig) -> GeneratedPipeline:
        """Generate a CI/CD pipeline based on configuration"""
        try:
            if config.type == "github-actions":
                return await self._generate_github_actions_pipeline(config)
            elif config.type == "argocd":
                return await self._generate_argocd_pipeline(config)
            elif config.type == "jenkins":
                return await self._generate_jenkins_pipeline(config)
            elif config.type == "gitlab-ci":
                return await self._generate_gitlab_pipeline(config)
            else:
                raise ValueError(f"Unsupported pipeline type: {config.type}")
                
        except Exception as e:
            raise Exception(f"Pipeline generation failed: {str(e)}")
    
    async def _generate_github_actions_pipeline(self, config: PipelineConfig) -> GeneratedPipeline:
        """Generate GitHub Actions workflow"""
        
        # Base workflow template
        workflow = {
            "name": f"{config.name} CI/CD Pipeline",
            "on": {
                "push": {"branches": ["main", "develop"]},
                "pull_request": {"branches": ["main"]}
            },
            "jobs": {}
        }
        
        # Add language-specific jobs
        if config.language == "python":
            workflow["jobs"]["test"] = {
                "runs-on": "ubuntu-latest",
                "steps": [
                    {"uses": "actions/checkout@v3"},
                    {"name": "Set up Python", "uses": "actions/setup-python@v4", "with": {"python-version": "3.9"}},
                    {"name": "Install dependencies", "run": "pip install -r requirements.txt"},
                    {"name": "Run tests", "run": "python -m pytest"},
                    {"name": "Run linting", "run": "flake8 ."},
                ]
            }
            
            if "security" in config.features:
                workflow["jobs"]["security"] = {
                    "runs-on": "ubuntu-latest",
                    "steps": [
                        {"uses": "actions/checkout@v3"},
                        {"name": "Security scan", "run": "pip install bandit && bandit -r ."},
                        {"name": "Dependency check", "run": "pip install safety && safety check"},
                    ]
                }
        
        elif config.language == "nodejs":
            workflow["jobs"]["test"] = {
                "runs-on": "ubuntu-latest",
                "steps": [
                    {"uses": "actions/checkout@v3"},
                    {"name": "Set up Node.js", "uses": "actions/setup-node@v3", "with": {"node-version": "18"}},
                    {"name": "Install dependencies", "run": "npm ci"},
                    {"name": "Run tests", "run": "npm test"},
                    {"name": "Run linting", "run": "npm run lint"},
                ]
            }
        
        # Add deployment job
        if config.deployment_target == "aws":
            workflow["jobs"]["deploy"] = {
                "needs": ["test"],
                "runs-on": "ubuntu-latest",
                "steps": [
                    {"uses": "actions/checkout@v3"},
                    {"name": "Configure AWS credentials", "uses": "aws-actions/configure-aws-credentials@v1", "with": {"aws-access-key-id": "${{ secrets.AWS_ACCESS_KEY_ID }}", "aws-secret-access-key": "${{ secrets.AWS_SECRET_ACCESS_KEY }}", "aws-region": "us-east-1"}},
                    {"name": "Deploy to AWS", "run": "aws deploy create-deployment --application-name ${{ github.event.repository.name }} --deployment-group-name production --s3-location bucket=${{ secrets.S3_BUCKET }},key=app.zip,bundleType=zip"},
                ]
            }
        
        elif config.deployment_target == "kubernetes":
            workflow["jobs"]["deploy"] = {
                "needs": ["test"],
                "runs-on": "ubuntu-latest",
                "steps": [
                    {"uses": "actions/checkout@v3"},
                    {"name": "Set up kubectl", "uses": "azure/setup-kubectl@v3"},
                    {"name": "Deploy to Kubernetes", "run": "kubectl apply -f k8s/"},
                ]
            }
        
        # Convert to YAML
        pipeline_yaml = yaml.dump(workflow, default_flow_style=False, sort_keys=False)
        
        return GeneratedPipeline(
            name=f"{config.name}-pipeline",
            type="github-actions",
            content=pipeline_yaml,
            file_path=".github/workflows/ci-cd.yml",
            description=f"GitHub Actions pipeline for {config.language} application",
            estimated_duration=15
        )
    
    async def _generate_argocd_pipeline(self, config: PipelineConfig) -> GeneratedPipeline:
        """Generate ArgoCD application manifest"""
        
        # ArgoCD Application manifest
        application = {
            "apiVersion": "argoproj.io/v1alpha1",
            "kind": "Application",
            "metadata": {
                "name": config.name,
                "namespace": "argocd"
            },
            "spec": {
                "project": "default",
                "source": {
                    "repoURL": f"https://github.com/your-org/{config.name}",
                    "targetRevision": "HEAD",
                    "path": "k8s"
                },
                "destination": {
                    "server": "https://kubernetes.default.svc",
                    "namespace": "production"
                },
                "syncPolicy": {
                    "automated": {
                        "prune": True,
                        "selfHeal": True
                    },
                    "syncOptions": ["CreateNamespace=true"]
                }
            }
        }
        
        # Generate Kubernetes manifests
        k8s_manifests = self._generate_k8s_manifests(config)
        
        pipeline_content = f"""# ArgoCD Application
{yaml.dump(application, default_flow_style=False)}

# Kubernetes Manifests
---
{yaml.dump(k8s_manifests, default_flow_style=False)}"""
        
        return GeneratedPipeline(
            name=f"{config.name}-argocd",
            type="argocd",
            content=pipeline_content,
            file_path="argocd/application.yml",
            description=f"ArgoCD application for {config.name}",
            estimated_duration=5
        )
    
    def _generate_k8s_manifests(self, config: PipelineConfig) -> Dict:
        """Generate Kubernetes manifests"""
        
        manifests = {
            "apiVersion": "apps/v1",
            "kind": "Deployment",
            "metadata": {"name": config.name},
            "spec": {
                "replicas": 3,
                "selector": {"matchLabels": {"app": config.name}},
                "template": {
                    "metadata": {"labels": {"app": config.name}},
                    "spec": {
                        "containers": [{
                            "name": config.name,
                            "image": f"{config.name}:latest",
                            "ports": [{"containerPort": 8080}]
                        }]
                    }
                }
            }
        }
        
        # Add service
        service = {
            "apiVersion": "v1",
            "kind": "Service",
            "metadata": {"name": f"{config.name}-service"},
            "spec": {
                "selector": {"app": config.name},
                "ports": [{"port": 80, "targetPort": 8080}],
                "type": "LoadBalancer"
            }
        }
        
        return {"deployment": manifests, "service": service}
    
    async def _generate_jenkins_pipeline(self, config: PipelineConfig) -> GeneratedPipeline:
        """Generate Jenkins pipeline"""
        
        jenkinsfile = f"""pipeline {{
    agent any
    
    environment {{
        DOCKER_IMAGE = '{config.name}:${{BUILD_NUMBER}}'
    }}
    
    stages {{
        stage('Checkout') {{
            steps {{
                checkout scm
            }}
        }}
        
        stage('Test') {{
            steps {{
                script {{
                    if ('{config.language}' == 'python') {{
                        sh 'pip install -r requirements.txt'
                        sh 'python -m pytest'
                    }} else if ('{config.language}' == 'nodejs') {{
                        sh 'npm ci'
                        sh 'npm test'
                    }}
                }}
            }}
        }}
        
        stage('Build') {{
            steps {{
                script {{
                    docker.build("${{DOCKER_IMAGE}}")
                }}
            }}
        }}
        
        stage('Deploy') {{
            steps {{
                script {{
                    if ('{config.deployment_target}' == 'aws') {{
                        sh 'aws ecs update-service --cluster production --service {config.name} --force-new-deployment'
                    }} else if ('{config.deployment_target}' == 'kubernetes') {{
                        sh 'kubectl set image deployment/{config.name} {config.name}=${{DOCKER_IMAGE}}'
                    }}
                }}
            }}
        }}
    }}
    
    post {{
        always {{
            cleanWs()
        }}
    }}
}}"""
        
        return GeneratedPipeline(
            name=f"{config.name}-jenkins",
            type="jenkins",
            content=jenkinsfile,
            file_path="Jenkinsfile",
            description=f"Jenkins pipeline for {config.name}",
            estimated_duration=20
        )
    
    async def _generate_gitlab_pipeline(self, config: PipelineConfig) -> GeneratedPipeline:
        """Generate GitLab CI pipeline"""
        
        gitlab_ci = f""".gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

test:
  stage: test
  image: {config.language}:latest
  script:
    - if [ "{config.language}" = "python" ]; then
        pip install -r requirements.txt;
        python -m pytest;
      elif [ "{config.language}" = "nodejs" ]; then
        npm ci;
        npm test;
      fi

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $DOCKER_IMAGE .
    - docker push $DOCKER_IMAGE

deploy:
  stage: deploy
  image: alpine:latest
  script:
    - if [ "{config.deployment_target}" = "aws" ]; then
        apk add --no-cache aws-cli;
        aws ecs update-service --cluster production --service {config.name} --force-new-deployment;
      elif [ "{config.deployment_target}" = "kubernetes" ]; then
        apk add --no-cache kubectl;
        kubectl set image deployment/{config.name} {config.name}=$DOCKER_IMAGE;
      fi
  only:
    - main"""
        
        return GeneratedPipeline(
            name=f"{config.name}-gitlab",
            type="gitlab-ci",
            content=gitlab_ci,
            file_path=".gitlab-ci.yml",
            description=f"GitLab CI pipeline for {config.name}",
            estimated_duration=15
        )
    
    async def create_pipeline_in_repository(self, repo_name: str, pipeline: GeneratedPipeline) -> bool:
        """Create pipeline in GitHub repository"""
        try:
            if not self.github_client:
                raise Exception("GitHub token not configured")
            
            repo = self.github_client.get_repo(repo_name)
            
            # Create the pipeline file
            repo.create_file(
                path=pipeline.file_path,
                message=f"Add {pipeline.type} pipeline",
                content=pipeline.content,
                branch="main"
            )
            
            return True
            
        except Exception as e:
            raise Exception(f"Failed to create pipeline in repository: {str(e)}")
    
    def generate_pipeline_report(self, pipelines: List[GeneratedPipeline]) -> str:
        """Generate a comprehensive pipeline report"""
        if not pipelines:
            return "No pipelines generated."
        
        report = f"""🚀 **Pipeline Generation Report**
        
**📊 Generated Pipelines:**
• **Total Pipelines:** {len(pipelines)}
• **Total Estimated Duration:** {sum(p.estimated_duration for p in pipelines)} minutes

**📋 Pipeline Details:**"""
        
        for pipeline in pipelines:
            report += f"""
• **{pipeline.name}** ({pipeline.type})
  - File: {pipeline.file_path}
  - Duration: {pipeline.estimated_duration} minutes
  - Description: {pipeline.description}"""
        
        report += f"""

**🔧 Next Steps:**
• Review generated pipelines for accuracy
• Customize deployment configurations
• Set up required secrets and environment variables
• Test pipelines in staging environment
• Configure branch protection rules

**📈 Platform Distribution:**"""
        
        platform_counts = {}
        for pipeline in pipelines:
            platform_counts[pipeline.type] = platform_counts.get(pipeline.type, 0) + 1
        
        for platform, count in platform_counts.items():
            report += f"\n• **{platform}:** {count} pipelines"
        
        return report

# Global instance
pipeline_generator_agent = PipelineGeneratorAgent() 