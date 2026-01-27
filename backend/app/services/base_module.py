"""
数据模块基类定义
所有数据模块必须继承此基类，确保接口统一
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from ..models.indicators import (
    ModuleInfo,
    IndicatorInfo,
    IndicatorData,
    IndicatorMetrics,
    DataPoint
)


class BaseDataModule(ABC):
    """数据模块基类（抽象类）"""
    
    def __init__(self, module_id: str, module_name: str, description: str):
        """
        初始化数据模块
        
        Args:
            module_id: 模块唯一标识
            module_name: 模块名称
            description: 模块描述
        """
        self.module_id = module_id
        self.module_name = module_name
        self.description = description
        self._indicators: List[IndicatorInfo] = []
    
    @abstractmethod
    def initialize(self) -> None:
        """
        初始化模块
        子类必须实现此方法，用于注册指标等初始化工作
        """
        pass
    
    @abstractmethod
    async def fetch_indicator_data(
        self,
        indicator_id: str,
        start_date: str = None,
        end_date: str = None,
        **kwargs
    ) -> IndicatorData:
        """
        获取指标数据
        
        Args:
            indicator_id: 指标ID
            start_date: 开始日期（可选）
            end_date: 结束日期（可选）
            **kwargs: 其他参数
            
        Returns:
            IndicatorData: 指标数据
        """
        pass
    
    @abstractmethod
    async def fetch_indicator_metrics(
        self,
        indicator_id: str
    ) -> IndicatorMetrics:
        """
        获取指标统计指标
        
        Args:
            indicator_id: 指标ID
            
        Returns:
            IndicatorMetrics: 指标统计数据
        """
        pass
    
    def register_indicator(
        self,
        indicator_id: str,
        name: str,
        description: str,
        color: str = "gray"
    ) -> None:
        """
        注册指标
        
        Args:
            indicator_id: 指标ID
            name: 指标名称
            description: 指标描述
            color: 标签颜色
        """
        indicator = IndicatorInfo(
            id=indicator_id,
            name=name,
            description=description,
            color=color
        )
        self._indicators.append(indicator)
    
    def get_module_info(self) -> ModuleInfo:
        """
        获取模块信息
        
        Returns:
            ModuleInfo: 模块信息
        """
        return ModuleInfo(
            id=self.module_id,
            name=self.module_name,
            description=self.description,
            indicators=self._indicators,
            enabled=True
        )
    
    def get_indicators(self) -> List[IndicatorInfo]:
        """
        获取模块的所有指标
        
        Returns:
            指标列表
        """
        return self._indicators
    
    def get_indicator(self, indicator_id: str) -> IndicatorInfo:
        """
        根据ID获取指标信息
        
        Args:
            indicator_id: 指标ID
            
        Returns:
            指标信息，如果不存在则返回None
        """
        for indicator in self._indicators:
            if indicator.id == indicator_id:
                return indicator
        return None
