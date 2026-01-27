"""
应用配置文件
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """应用配置类"""
    
    # 应用基础配置
    APP_NAME: str = "中银策略数据可视化平台"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # CORS配置
    # 开发环境
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://xuyaaaron.github.io",
    ]
    # 生产环境需要添加GitHub Pages域名
    # 例如：CORS_ORIGINS = ["https://yourusername.github.io"]
    # 可以通过环境变量CORS_ORIGINS覆盖此配置
    
    # API配置
    API_PREFIX: str = "/api"
    
    # 数据缓存配置
    CACHE_TTL: int = 300  # 缓存时间（秒）
    
    # Wind数据接口配置
    WIND_ENABLED: bool = True
    WIND_TIMEOUT: int = 30
    
    class Config:
        case_sensitive = True
        env_file = ".env"


# 全局配置实例
settings = Settings()
