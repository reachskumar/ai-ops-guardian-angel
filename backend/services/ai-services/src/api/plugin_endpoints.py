"""
Plugin SDK API Endpoints
Production-grade API endpoints for plugin management and marketplace
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime

from ..plugins.plugin_sdk import (
    plugin_sdk,
    PluginType,
    PluginCategory,
    PluginStatus
)

router = APIRouter(prefix="/plugins", tags=["Plugin SDK"])

logger = logging.getLogger(__name__)


class PluginInstallRequest(BaseModel):
    """Request model for plugin installation"""
    plugin_id: str = Field(..., description="ID of the plugin to install")
    config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Plugin configuration")


class PluginExecuteRequest(BaseModel):
    """Request model for plugin execution"""
    plugin_id: str = Field(..., description="ID of the plugin to execute")
    method: str = Field(..., description="Method to execute")
    args: List[Any] = Field(default_factory=list, description="Method arguments")
    kwargs: Dict[str, Any] = Field(default_factory=dict, description="Method keyword arguments")


class PluginConfigUpdateRequest(BaseModel):
    """Request model for plugin configuration update"""
    plugin_id: str = Field(..., description="ID of the plugin")
    config: Dict[str, Any] = Field(..., description="New configuration")


class PluginResponse(BaseModel):
    """Response model for plugin operations"""
    success: bool
    plugin_id: Optional[str] = None
    message: str
    data: Optional[Dict[str, Any]] = None


class PluginListResponse(BaseModel):
    """Response model for plugin lists"""
    plugins: List[Dict[str, Any]]
    total_count: int


class PluginStatusResponse(BaseModel):
    """Response model for plugin status"""
    success: bool
    plugin_id: str
    name: str
    version: str
    status: str
    last_execution: Optional[str] = None
    execution_count: int
    success_count: int
    error_count: int
    error_message: Optional[str] = None
    config: Dict[str, Any]


class SDKStatusResponse(BaseModel):
    """Response model for SDK status"""
    status: str
    total_plugins: int
    active_plugins: int
    marketplace_plugins: int
    total_executions: int
    total_successes: int
    success_rate: float
    timestamp: str


@router.post("/install", response_model=PluginResponse)
async def install_plugin(request: PluginInstallRequest) -> PluginResponse:
    """
    Install a plugin from the marketplace
    
    - **plugin_id**: ID of the plugin to install
    - **config**: Optional plugin configuration
    """
    try:
        result = await plugin_sdk.install_plugin(
            plugin_id=request.plugin_id,
            config=request.config
        )
        
        return PluginResponse(
            success=result["success"],
            plugin_id=request.plugin_id,
            message=result.get("message", ""),
            data=result
        )
        
    except Exception as e:
        logger.error(f"Failed to install plugin: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to install plugin: {str(e)}")


@router.post("/uninstall/{plugin_id}", response_model=PluginResponse)
async def uninstall_plugin(plugin_id: str) -> PluginResponse:
    """
    Uninstall a plugin
    
    - **plugin_id**: ID of the plugin to uninstall
    """
    try:
        result = await plugin_sdk.uninstall_plugin(plugin_id=plugin_id)
        
        return PluginResponse(
            success=result["success"],
            plugin_id=plugin_id,
            message=result.get("message", ""),
            data=result
        )
        
    except Exception as e:
        logger.error(f"Failed to uninstall plugin: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to uninstall plugin: {str(e)}")


@router.post("/execute", response_model=PluginResponse)
async def execute_plugin(request: PluginExecuteRequest) -> PluginResponse:
    """
    Execute a plugin method
    
    - **plugin_id**: ID of the plugin to execute
    - **method**: Method name to execute
    - **args**: Method arguments
    - **kwargs**: Method keyword arguments
    """
    try:
        result = await plugin_sdk.execute_plugin(
            plugin_id=request.plugin_id,
            method=request.method,
            *request.args,
            **request.kwargs
        )
        
        return PluginResponse(
            success=result["success"],
            plugin_id=request.plugin_id,
            message=result.get("message", ""),
            data=result
        )
        
    except Exception as e:
        logger.error(f"Failed to execute plugin: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to execute plugin: {str(e)}")


@router.get("/installed", response_model=PluginListResponse)
async def get_installed_plugins() -> PluginListResponse:
    """
    Get list of installed plugins
    """
    try:
        plugins = await plugin_sdk.get_installed_plugins()
        
        return PluginListResponse(
            plugins=plugins,
            total_count=len(plugins)
        )
        
    except Exception as e:
        logger.error(f"Failed to get installed plugins: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get installed plugins: {str(e)}")


@router.get("/marketplace", response_model=PluginListResponse)
async def get_marketplace_plugins(
    category: Optional[PluginCategory] = None,
    plugin_type: Optional[PluginType] = None,
    search: Optional[str] = None
) -> PluginListResponse:
    """
    Get marketplace plugins
    
    - **category**: Filter by plugin category
    - **plugin_type**: Filter by plugin type
    - **search**: Search term for plugin name/description
    """
    try:
        plugins = await plugin_sdk.get_marketplace_plugins(
            category=category,
            plugin_type=plugin_type,
            search=search
        )
        
        return PluginListResponse(
            plugins=plugins,
            total_count=len(plugins)
        )
        
    except Exception as e:
        logger.error(f"Failed to get marketplace plugins: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get marketplace plugins: {str(e)}")


@router.get("/status/{plugin_id}", response_model=PluginStatusResponse)
async def get_plugin_status(plugin_id: str) -> PluginStatusResponse:
    """
    Get plugin status
    
    - **plugin_id**: ID of the plugin
    """
    try:
        result = await plugin_sdk.get_plugin_status(plugin_id)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return PluginStatusResponse(
            success=result["success"],
            plugin_id=plugin_id,
            name=result["name"],
            version=result["version"],
            status=result["status"],
            last_execution=result["last_execution"],
            execution_count=result["execution_count"],
            success_count=result["success_count"],
            error_count=result["error_count"],
            error_message=result["error_message"],
            config=result["config"]
        )
        
    except Exception as e:
        logger.error(f"Failed to get plugin status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get plugin status: {str(e)}")


@router.put("/config", response_model=PluginResponse)
async def update_plugin_config(request: PluginConfigUpdateRequest) -> PluginResponse:
    """
    Update plugin configuration
    
    - **plugin_id**: ID of the plugin
    - **config**: New configuration
    """
    try:
        result = await plugin_sdk.update_plugin_config(
            plugin_id=request.plugin_id,
            config=request.config
        )
        
        return PluginResponse(
            success=result["success"],
            plugin_id=request.plugin_id,
            message=result.get("message", ""),
            data=result
        )
        
    except Exception as e:
        logger.error(f"Failed to update plugin config: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update plugin config: {str(e)}")


@router.get("/sdk/status", response_model=SDKStatusResponse)
async def get_sdk_status() -> SDKStatusResponse:
    """
    Get Plugin SDK status and statistics
    """
    try:
        status = await plugin_sdk.get_sdk_status()
        
        return SDKStatusResponse(
            status=status["status"],
            total_plugins=status["total_plugins"],
            active_plugins=status["active_plugins"],
            marketplace_plugins=status["marketplace_plugins"],
            total_executions=status["total_executions"],
            total_successes=status["total_successes"],
            success_rate=status["success_rate"],
            timestamp=status["timestamp"]
        )
        
    except Exception as e:
        logger.error(f"Failed to get SDK status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get SDK status: {str(e)}")


@router.get("/categories", response_model=List[Dict[str, str]])
async def get_plugin_categories() -> List[Dict[str, str]]:
    """
    Get available plugin categories
    """
    try:
        categories = [
            {"value": category.value, "label": category.value.replace("_", " ").title()}
            for category in PluginCategory
        ]
        
        return categories
        
    except Exception as e:
        logger.error(f"Failed to get plugin categories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get plugin categories: {str(e)}")


@router.get("/types", response_model=List[Dict[str, str]])
async def get_plugin_types() -> List[Dict[str, str]]:
    """
    Get available plugin types
    """
    try:
        types = [
            {"value": plugin_type.value, "label": plugin_type.value.replace("_", " ").title()}
            for plugin_type in PluginType
        ]
        
        return types
        
    except Exception as e:
        logger.error(f"Failed to get plugin types: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get plugin types: {str(e)}")


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check for Plugin SDK
    """
    try:
        status = await plugin_sdk.get_sdk_status()
        
        return {
            "status": "healthy",
            "sdk_status": status["status"],
            "total_plugins": status["total_plugins"],
            "active_plugins": status["active_plugins"],
            "marketplace_plugins": status["marketplace_plugins"],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


# Specific plugin execution endpoints
@router.post("/security-scanner/scan", response_model=PluginResponse)
async def execute_security_scan(target: str) -> PluginResponse:
    """
    Execute security scanner plugin
    
    - **target**: Target to scan
    """
    try:
        result = await plugin_sdk.execute_plugin(
            plugin_id="security_scanner",
            method="scan_vulnerabilities",
            target=target
        )
        
        return PluginResponse(
            success=result["success"],
            plugin_id="security_scanner",
            message="Security scan completed",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Failed to execute security scan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to execute security scan: {str(e)}")


@router.post("/cost-optimizer/analyze", response_model=PluginResponse)
async def execute_cost_analysis(provider: str) -> PluginResponse:
    """
    Execute cost optimizer plugin
    
    - **provider**: Cloud provider to analyze
    """
    try:
        result = await plugin_sdk.execute_plugin(
            plugin_id="cost_optimizer",
            method="analyze_costs",
            provider=provider
        )
        
        return PluginResponse(
            success=result["success"],
            plugin_id="cost_optimizer",
            message="Cost analysis completed",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Failed to execute cost analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to execute cost analysis: {str(e)}")


@router.post("/compliance-checker/check", response_model=PluginResponse)
async def execute_compliance_check(framework: str) -> PluginResponse:
    """
    Execute compliance checker plugin
    
    - **framework**: Compliance framework to check
    """
    try:
        result = await plugin_sdk.execute_plugin(
            plugin_id="compliance_checker",
            method="check_compliance",
            framework=framework
        )
        
        return PluginResponse(
            success=result["success"],
            plugin_id="compliance_checker",
            message="Compliance check completed",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Failed to execute compliance check: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to execute compliance check: {str(e)}") 