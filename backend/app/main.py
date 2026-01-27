"""
中银策略数据可视化平台 - FastAPI主应用
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api import modules_router, bociasi_router, wind2x_router
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# 创建FastAPI应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="中银策略数据可视化平台后端API服务",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
# 注册路由
app.include_router(modules_router, prefix=settings.API_PREFIX)
app.include_router(bociasi_router, prefix=settings.API_PREFIX)
app.include_router(wind2x_router, prefix=settings.API_PREFIX)

# --- 任务调度配置 ---
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from . import update_excel_wrapper  # Helper module we need to create to bridge imports

scheduler = BackgroundScheduler()

@app.post("/api/admin/update")
async def trigger_update():
    """手动触发数据更新（仅限本地环境使用）"""
    # Run in a separate thread to not block API
    import threading
    thread = threading.Thread(target=update_excel_wrapper.run_update)
    thread.start()
    return {"status": "started", "message": "后台更新任务已启动，请稍候..."}

@app.get("/")
async def root():
    """根路径"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/api/docs"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}


@app.on_event("startup")
async def startup_event():
    """应用启动事件"""
    logger.info(f"{settings.APP_NAME} v{settings.APP_VERSION} 启动成功")
    logger.info(f"API文档: http://localhost:8000/api/docs")
    
    # 启动调度器
    # 每天 18:00 自动运行更新
    trigger = CronTrigger(hour=18, minute=0, timezone='Asia/Shanghai')
    scheduler.add_job(update_excel_wrapper.run_update, trigger=trigger, id='daily_update')
    scheduler.start()
    logger.info("📅 每日自动更新任务已设定 (18:00 CST)")
    
    # 异步预热数据
    from .services.bociasi_service import bociasi_service
    from .services.wind2x_service import wind2x_service
    import asyncio
    asyncio.create_task(bociasi_service.warm_cache())
    asyncio.create_task(wind2x_service.warm_cache())


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭事件"""
    logger.info(f"{settings.APP_NAME} 正在关闭")
    # 清理资源
    from .data.wind_client import wind_client
    wind_client.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
