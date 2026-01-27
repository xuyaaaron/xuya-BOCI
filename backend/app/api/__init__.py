"""
API路由层
"""
from .modules import router as modules_router
from .bociasi import router as bociasi_router
from .wind2x import router as wind2x_router

__all__ = ["modules_router", "bociasi_router", "wind2x_router"]
