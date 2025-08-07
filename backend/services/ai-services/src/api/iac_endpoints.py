"""
Infrastructure as Code (IaC) API endpoints
"""

try:
    from fastapi import APIRouter, HTTPException
    from pydantic import BaseModel
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    
    # Mock classes when FastAPI is not available
    class APIRouter:
        def __init__(self, *args, **kwargs):
            pass
        
        def get(self, *args, **kwargs):
            def decorator(func):
                return func
            return decorator
        
        def post(self, *args, **kwargs):
            def decorator(func):
                return func
            return decorator
    
    class BaseModel:
        pass
    
    class HTTPException(Exception):
        def __init__(self, status_code, detail):
            self.status_code = status_code
            self.detail = detail

from typing import Dict, Any, List, Optional

router = APIRouter(prefix="/iac", tags=["iac"])

class IaCGenerateRequest(BaseModel):
    provider: str  # aws, azure, gcp
    resources: List[Dict[str, Any]]
    template_type: str  # terraform, cloudformation, pulumi

class IaCValidateRequest(BaseModel):
    template: str
    template_type: str

class IaCResponse(BaseModel):
    success: bool
    template: Optional[str] = None
    errors: Optional[List[str]] = None
    warnings: Optional[List[str]] = None

@router.post("/generate", response_model=IaCResponse)
async def generate_iac(request: IaCGenerateRequest):
    """Generate Infrastructure as Code templates"""
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    
    return IaCResponse(
        success=True,
        template=f"# Generated {request.template_type} template for {request.provider}\n# Resources: {len(request.resources)}",
        errors=[],
        warnings=[]
    )

@router.post("/validate", response_model=IaCResponse)
async def validate_iac(request: IaCValidateRequest):
    """Validate Infrastructure as Code templates"""
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    
    return IaCResponse(
        success=True,
        template=request.template,
        errors=[],
        warnings=["This is a mock validation"]
    )

@router.get("/templates")
async def list_templates():
    """List available IaC templates"""
    return {
        "templates": [
            {"name": "AWS EC2 Basic", "type": "terraform", "provider": "aws"},
            {"name": "Azure VM", "type": "terraform", "provider": "azure"},
            {"name": "GCP Compute", "type": "terraform", "provider": "gcp"},
        ]
    }

@router.get("/health")
async def iac_health():
    """Health check for IaC service"""
    return {"status": "healthy", "service": "iac"}