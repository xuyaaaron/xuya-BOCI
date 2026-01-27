from typing import Any, Optional, Dict
import time

class DataCache:
    """
    简单的内存缓存实现
    用于缓存API响应和计算结果，减少重复计算和IO
    """
    def __init__(self):
        self._cache: Dict[str, Any] = {}
        self._expiry: Dict[str, float] = {}

    def get(self, key: str) -> Optional[Any]:
        """
        获取缓存值
        :param key: 缓存键
        :return: 缓存值或None
        """
        if key in self._cache:
            # 检查是否过期
            if key in self._expiry:
                if time.time() > self._expiry[key]:
                    self.delete(key)
                    return None
            return self._cache[key]
        return None

    def set(self, key: str, value: Any, ttl: int = 300) -> None:
        """
        设置缓存
        :param key: 键
        :param value: 值
        :param ttl: 过期时间(秒)，默认5分钟。设置为0表示不过期。
        """
        self._cache[key] = value
        if ttl > 0:
            self._expiry[key] = time.time() + ttl
        elif key in self._expiry:
            del self._expiry[key]

    def delete(self, key: str) -> None:
        """删除缓存"""
        if key in self._cache:
            del self._cache[key]
        if key in self._expiry:
            del self._expiry[key]
            
    def clear(self) -> None:
        """清空所有缓存"""
        self._cache.clear()
        self._expiry.clear()

# 全局单例缓存实例
cache = DataCache()
