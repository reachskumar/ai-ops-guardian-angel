"""
Infrastructure as Code API Endpoints
Production-grade IaC generation, validation, and deployment
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import asyncio
import logging
from datetime import datetime

from ..tools.devops.iac_generator import (
    IaCGenerator, 
    IaCProvider, 
    IaCValidationLevel,
    IaCResource,
    IaCValidationResult
)
from ..auth.auth_middleware import get_current_user
from ..config.settings import settings

router = APIRouter(prefix="/iac", tags=["Infrastructure as Code"])
logger = logging.getLogger(__name__)

# Initialize IaC generator
iac_generator = IaCGenerator()


class IaCRequirements(BaseModel):
    """Requirements for IaC generation"""
    project_name: str = Field(..., description="Project name")
    environment: str = Field(default="production", description="Environment name")
    cloud_provider: str = Field(default="aws", description="Primary cloud provider")
    providers: List[str] = Field(default=["aws"], description="Cloud providers to use")
    
    # Infrastructure requirements
    compute_instances: Optional[Dict[str, Any]] = Field(
        default={"count": 2, "type": "t3.medium"},
        description="Compute instance requirements"
    )
    database: Optional[Dict[str, Any]] = Field(
        default={"type": "rds", "instance_class": "db.t3.micro"},
        description="Database requirements"
    )
    storage: Optional[Dict[str, Any]] = Field(
        default={"size_gb": 100, "type": "s3"},
        description="Storage requirements"
    )
    load_balancer: Optional[Dict[str, Any]] = Field(
        default={"type": "alb", "ssl": True},
        description="Load balancer requirements"
    )
    monitoring: Optional[Dict[str, Any]] = Field(
        default={"enabled": True, "retention_days": 30},
        description="Monitoring requirements"
    )
    
    # Network requirements
    vpc_cidr: str = Field(default="10.0.0.0/16", description="VPC CIDR block")
    availability_zones: List[str] = Field(
        default=["us-east-1a", "us-east-1b"],
        description="Availability zones"
    )
    aws_region: str = Field(default="us-east-1", description="AWS region")
    
    # Security requirements
    security_level: str = Field(default="standard", description="Security level")
    compliance_frameworks: List[str] = Field(
        default=["CIS", "NIST"],
        description="Compliance frameworks"
    )
    
    # Cost optimization
    budget_constraint: Optional[float] = Field(
        default=None,
        description="Monthly budget constraint in USD"
    )
    cost_optimization: bool = Field(
        default=True,
        description="Enable cost optimization"
    )


class IaCGenerationRequest(BaseModel):
    """Request for IaC generation"""
    requirements: IaCRequirements
    provider: IaCProvider = Field(default=IaCProvider.TERRAFORM)
    validation_level: IaCValidationLevel = Field(default=IaCValidationLevel.STRICT)
    include_deployment_plan: bool = Field(default=True)
    include_cost_estimate: bool = Field(default=True)
    include_security_analysis: bool = Field(default=True)


class IaCGenerationResponse(BaseModel):
    """Response from IaC generation"""
    success: bool
    provider: str
    iac_code: Dict[str, str]
    validation: IaCValidationResult
    cost_estimate: Dict[str, Any]
    security_analysis: Dict[str, Any]
    deployment_plan: Dict[str, Any]
    resources: List[IaCResource]
    estimated_deployment_time: str
    generated_at: datetime
    warnings: List[str] = []


class IaCValidationRequest(BaseModel):
    """Request for IaC validation"""
    iac_code: Dict[str, str]
    provider: IaCProvider
    validation_level: IaCValidationLevel = Field(default=IaCValidationLevel.STRICT)


class IaCDeploymentRequest(BaseModel):
    """Request for IaC deployment"""
    iac_code: Dict[str, str]
    provider: IaCProvider
    environment: str
    auto_approve: bool = Field(default=False)
    dry_run: bool = Field(default=True)


class IaCCostEstimateRequest(BaseModel):
    """Request for cost estimation"""
    requirements: IaCRequirements
    provider: IaCProvider = Field(default=IaCProvider.TERRAFORM)
    time_period: str = Field(default="monthly", description="Cost estimation period")


@router.post("/generate", response_model=IaCGenerationResponse)
async def generate_infrastructure(
    request: IaCGenerationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> IaCGenerationResponse:
    """Generate complete infrastructure as code"""
    
    try:
        logger.info(f"Generating {request.provider.value} infrastructure for user {current_user.get('user_id')}")
        
        # Generate infrastructure
        result = await iac_generator.generate_infrastructure(
            requirements=request.requirements.dict(),
            provider=request.provider,
            validation_level=request.validation_level
        )
        
        # Check budget constraints
        warnings = []
        if request.requirements.budget_constraint:
            total_cost = result.get('cost_estimate', {}).get('total_monthly_cost', 0)
            if total_cost > request.requirements.budget_constraint:
                warnings.append(f"Estimated cost (${total_cost:.2f}) exceeds budget constraint (${request.requirements.budget_constraint:.2f})")
        
        return IaCGenerationResponse(
            success=True,
            provider=result['provider'],
            iac_code=result['iac_code'],
            validation=result['validation'],
            cost_estimate=result['cost_estimate'],
            security_analysis=result['security_analysis'],
            deployment_plan=result['deployment_plan'],
            resources=result['resources'],
            estimated_deployment_time=result['estimated_deployment_time'],
            generated_at=datetime.now(),
            warnings=warnings
        )
        
    except Exception as e:
        logger.error(f"IaC generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"IaC generation failed: {str(e)}")


@router.post("/validate")
async def validate_infrastructure(
    request: IaCValidationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Validate generated IaC code"""
    
    try:
        logger.info(f"Validating {request.provider.value} infrastructure")
        
        validation_result = await iac_generator._validate_iac(
            iac_code=request.iac_code,
            provider=request.provider,
            validation_level=request.validation_level
        )
        
        return {
            "success": validation_result.is_valid,
            "validation": validation_result,
            "validated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"IaC validation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"IaC validation failed: {str(e)}")


@router.post("/deploy")
async def deploy_infrastructure(
    request: IaCDeploymentRequest,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Deploy infrastructure as code"""
    
    try:
        logger.info(f"Deploying {request.provider.value} infrastructure to {request.environment}")
        
        # Validate before deployment
        validation_result = await iac_generator._validate_iac(
            iac_code=request.iac_code,
            provider=request.provider,
            validation_level=IaCValidationLevel.STRICT
        )
        
        if not validation_result.is_valid:
            raise HTTPException(
                status_code=400, 
                detail=f"Infrastructure validation failed: {validation_result.errors}"
            )
        
        # Start deployment in background
        deployment_id = f"deploy-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        background_tasks.add_task(
            _deploy_infrastructure_background,
            deployment_id,
            request.iac_code,
            request.provider,
            request.environment,
            request.auto_approve,
            request.dry_run,
            current_user.get('user_id')
        )
        
        return {
            "success": True,
            "deployment_id": deployment_id,
            "status": "started",
            "environment": request.environment,
            "provider": request.provider.value,
            "dry_run": request.dry_run,
            "estimated_duration": "15-20 minutes"
        }
        
    except Exception as e:
        logger.error(f"Infrastructure deployment failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Deployment failed: {str(e)}")


@router.post("/cost-estimate")
async def estimate_costs(
    request: IaCCostEstimateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Estimate infrastructure costs"""
    
    try:
        logger.info(f"Estimating costs for {request.provider.value} infrastructure")
        
        cost_estimate = await iac_generator._estimate_costs(
            iac_code={},  # Empty for estimation
            requirements=request.requirements.dict()
        )
        
        # Add provider-specific estimates
        if request.provider == IaCProvider.TERRAFORM:
            if 'aws' in request.requirements.providers:
                aws_cost = await iac_generator._estimate_aws_cost(request.requirements.dict())
                cost_estimate['aws_cost'] = aws_cost
            if 'azure' in request.requirements.providers:
                azure_cost = await iac_generator._estimate_azure_cost(request.requirements.dict())
                cost_estimate['azure_cost'] = azure_cost
            if 'gcp' in request.requirements.providers:
                gcp_cost = await iac_generator._estimate_gcp_cost(request.requirements.dict())
                cost_estimate['gcp_cost'] = gcp_cost
        
        return {
            "success": True,
            "cost_estimate": cost_estimate,
            "time_period": request.time_period,
            "provider": request.provider.value,
            "estimated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Cost estimation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cost estimation failed: {str(e)}")


@router.get("/providers")
async def get_supported_providers() -> Dict[str, Any]:
    """Get supported IaC providers"""
    
    return {
        "providers": [
            {
                "name": "terraform",
                "display_name": "Terraform",
                "description": "HashiCorp Terraform for multi-cloud infrastructure",
                "supported_clouds": ["aws", "azure", "gcp", "kubernetes"],
                "features": ["state management", "module system", "planning", "validation"]
            },
            {
                "name": "pulumi",
                "display_name": "Pulumi",
                "description": "Modern infrastructure as code with general-purpose languages",
                "supported_clouds": ["aws", "azure", "gcp", "kubernetes"],
                "features": ["type safety", "testing", "policy as code", "cross-language"]
            },
            {
                "name": "cloudformation",
                "display_name": "AWS CloudFormation",
                "description": "AWS native infrastructure as code",
                "supported_clouds": ["aws"],
                "features": ["AWS native", "change sets", "stack management"]
            },
            {
                "name": "bicep",
                "display_name": "Azure Bicep",
                "description": "Azure native infrastructure as code",
                "supported_clouds": ["azure"],
                "features": ["Azure native", "type safety", "module system"]
            }
        ]
    }


@router.get("/templates")
async def get_iaC_templates() -> Dict[str, Any]:
    """Get available IaC templates"""
    
    return {
        "templates": [
            {
                "name": "web-application",
                "display_name": "Web Application",
                "description": "Standard web application with load balancer, auto scaling, and database",
                "components": ["vpc", "load_balancer", "auto_scaling", "database", "monitoring"],
                "estimated_cost": "$150-300/month",
                "deployment_time": "15-20 minutes"
            },
            {
                "name": "microservices",
                "display_name": "Microservices Architecture",
                "description": "Container-based microservices with Kubernetes or ECS",
                "components": ["vpc", "kubernetes", "load_balancer", "database", "monitoring", "logging"],
                "estimated_cost": "$300-600/month",
                "deployment_time": "25-35 minutes"
            },
            {
                "name": "data-pipeline",
                "display_name": "Data Pipeline",
                "description": "Big data processing with EMR, S3, and analytics",
                "components": ["vpc", "emr", "s3", "glue", "athena", "monitoring"],
                "estimated_cost": "$500-1000/month",
                "deployment_time": "30-45 minutes"
            },
            {
                "name": "serverless",
                "display_name": "Serverless Architecture",
                "description": "Event-driven serverless architecture with Lambda and API Gateway",
                "components": ["lambda", "api_gateway", "dynamodb", "s3", "cloudwatch"],
                "estimated_cost": "$50-150/month",
                "deployment_time": "10-15 minutes"
            }
        ]
    }


@router.get("/deployments/{deployment_id}")
async def get_deployment_status(
    deployment_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get deployment status"""
    
    # This would typically query a database for deployment status
    # For now, return mock status
    return {
        "deployment_id": deployment_id,
        "status": "completed",
        "progress": 100,
        "started_at": datetime.now().isoformat(),
        "completed_at": datetime.now().isoformat(),
        "resources_created": 15,
        "resources_failed": 0,
        "estimated_cost": "$180.50/month",
        "outputs": {
            "load_balancer_dns": "ai-ops-platform-123456789.us-east-1.elb.amazonaws.com",
            "database_endpoint": "ai-ops-platform-db.123456789.us-east-1.rds.amazonaws.com:5432",
            "vpc_id": "vpc-1234567890abcdef0"
        }
    }


async def _deploy_infrastructure_background(
    deployment_id: str,
    iac_code: Dict[str, str],
    provider: IaCProvider,
    environment: str,
    auto_approve: bool,
    dry_run: bool,
    user_id: str
):
    """Background task for infrastructure deployment"""
    
    try:
        logger.info(f"Starting background deployment {deployment_id}")
        
        # Create temporary directory for deployment
        import tempfile
        import os
        from pathlib import Path
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # Write IaC files
            for filename, content in iac_code.items():
                if filename.endswith('.tf') or filename.endswith('.ts') or filename.endswith('.yaml'):
                    filepath = Path(temp_dir) / filename
                    filepath.write_text(content)
            
            # Deploy based on provider
            if provider == IaCProvider.TERRAFORM:
                await _deploy_terraform(temp_dir, auto_approve, dry_run)
            elif provider == IaCProvider.PULUMI:
                await _deploy_pulumi(temp_dir, auto_approve, dry_run)
            elif provider == IaCProvider.CLOUDFORMATION:
                await _deploy_cloudformation(temp_dir, auto_approve, dry_run)
            
            logger.info(f"Deployment {deployment_id} completed successfully")
            
    except Exception as e:
        logger.error(f"Background deployment {deployment_id} failed: {str(e)}")


async def _deploy_terraform(temp_dir: str, auto_approve: bool, dry_run: bool):
    """Deploy Terraform infrastructure"""
    
    import subprocess
    
    try:
        # Initialize Terraform
        result = subprocess.run(
            ["terraform", "init"],
            cwd=temp_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise Exception(f"Terraform init failed: {result.stderr}")
        
        # Plan deployment
        plan_cmd = ["terraform", "plan"]
        if dry_run:
            plan_cmd.append("-detailed-exitcode")
        
        result = subprocess.run(
            plan_cmd,
            cwd=temp_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode not in [0, 2]:  # 2 means changes planned
            raise Exception(f"Terraform plan failed: {result.stderr}")
        
        # Apply if not dry run
        if not dry_run:
            apply_cmd = ["terraform", "apply"]
            if auto_approve:
                apply_cmd.append("-auto-approve")
            
            result = subprocess.run(
                apply_cmd,
                cwd=temp_dir,
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                raise Exception(f"Terraform apply failed: {result.stderr}")
        
    except Exception as e:
        logger.error(f"Terraform deployment failed: {str(e)}")
        raise


async def _deploy_pulumi(temp_dir: str, auto_approve: bool, dry_run: bool):
    """Deploy Pulumi infrastructure"""
    
    import subprocess
    
    try:
        # Install dependencies
        result = subprocess.run(
            ["npm", "install"],
            cwd=temp_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise Exception(f"Pulumi npm install failed: {result.stderr}")
        
        # Deploy
        deploy_cmd = ["pulumi", "up"]
        if auto_approve:
            deploy_cmd.append("--yes")
        if dry_run:
            deploy_cmd.append("--preview")
        
        result = subprocess.run(
            deploy_cmd,
            cwd=temp_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise Exception(f"Pulumi deployment failed: {result.stderr}")
        
    except Exception as e:
        logger.error(f"Pulumi deployment failed: {str(e)}")
        raise


async def _deploy_cloudformation(temp_dir: str, auto_approve: bool, dry_run: bool):
    """Deploy CloudFormation infrastructure"""
    
    import subprocess
    
    try:
        # Validate template
        result = subprocess.run(
            ["aws", "cloudformation", "validate-template", "--template-body", "file://template.yaml"],
            cwd=temp_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise Exception(f"CloudFormation validation failed: {result.stderr}")
        
        if not dry_run:
            # Deploy stack
            result = subprocess.run([
                "aws", "cloudformation", "create-stack",
                "--stack-name", "ai-ops-platform",
                "--template-body", "file://template.yaml",
                "--capabilities", "CAPABILITY_IAM"
            ], cwd=temp_dir, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"CloudFormation deployment failed: {result.stderr}")
        
    except Exception as e:
        logger.error(f"CloudFormation deployment failed: {str(e)}")
        raise 