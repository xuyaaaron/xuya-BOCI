"""
模块管理API路由
"""
from fastapi import APIRouter, HTTPException
from typing import List
from ..models.indicators import ModuleInfo, ModuleListResponse
from ..services.bociasi_service import bociasi_service
from ..services.wind2x_service import wind2x_service

router = APIRouter(prefix="/modules", tags=["modules"])

# 模块注册表
MODULE_REGISTRY = {
    "bociasi": bociasi_service,
    "wind_2x_erp": wind2x_service,
}


@router.get("", response_model=ModuleListResponse)
async def get_modules():
    """
    获取所有可用的数据模块列表
    
    Returns:
        模块列表
    """
    modules = [service.get_module_info() for service in MODULE_REGISTRY.values()]
    return ModuleListResponse(
        modules=modules,
        total=len(modules)
    )


@router.get("/{module_id}", response_model=ModuleInfo)
async def get_module(module_id: str):
    """
    获取指定模块的详细信息
    
    Args:
        module_id: 模块ID
        
    Returns:
        模块详细信息
    """
    if module_id not in MODULE_REGISTRY:
        raise HTTPException(status_code=404, detail=f"模块不存在: {module_id}")
    
    service = MODULE_REGISTRY[module_id]
    return service.get_module_info()
