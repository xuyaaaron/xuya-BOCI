"""
Wind数据接口封装
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)


class WindDataClient:
    """Wind数据客户端封装"""
    
    def __init__(self):
        """初始化Wind客户端"""
        self._initialized = False
        self._w = None
        self._init_connection()
    
    def _init_connection(self) -> None:
        """初始化Wind连接"""
        try:
            from WindPy import w
            self._w = w
            if not self._w.isconnected():
                result = self._w.start()
                if result.ErrorCode == 0:
                    self._initialized = True
                    logger.info("Wind API连接成功")
                else:
                    logger.error(f"Wind API连接失败: {result.Data}")
            else:
                self._initialized = True
                logger.info("Wind API已连接")
        except ImportError:
            logger.warning("WindPy未安装，将使用模拟数据")
            self._initialized = False
        except Exception as e:
            logger.error(f"Wind API初始化异常: {str(e)}")
            self._initialized = False
    
    def is_connected(self) -> bool:
        """检查是否已连接"""
        return self._initialized and self._w is not None and self._w.isconnected()
    
    def fetch_timeseries(
        self,
        codes: str,
        fields: str,
        start_date: str,
        end_date: str,
        options: str = ""
    ) -> Dict[str, Any]:
        """
        获取时间序列数据
        
        Args:
            codes: Wind代码
            fields: 字段名
            start_date: 开始日期
            end_date: 结束日期
            options: 可选参数
            
        Returns:
            包含dates和values的字典
        """
        if not self.is_connected():
            logger.warning("Wind未连接，返回模拟数据")
            return self._get_mock_data(start_date, end_date)
        
        try:
            result = self._w.wsd(codes, fields, start_date, end_date, options)
            
            if result.ErrorCode != 0:
                logger.error(f"Wind数据获取失败: {result.Data}")
                return self._get_mock_data(start_date, end_date)
            
            return {
                'dates': [d.strftime('%Y-%m-%d') for d in result.Times],
                'values': result.Data[0] if result.Data else []
            }
        except Exception as e:
            logger.error(f"获取Wind数据异常: {str(e)}")
            return self._get_mock_data(start_date, end_date)
    
    def fetch_indicator(
        self,
        codes: str,
        indicator: str,
        start_date: str,
        end_date: str
    ) -> List[Dict[str, Any]]:
        """
        获取指标数据
        
        Args:
            codes: Wind代码
            indicator: 指标名称
            start_date: 开始日期
            end_date: 结束日期
            
        Returns:
            数据点列表
        """
        data = self.fetch_timeseries(codes, indicator, start_date, end_date)
        
        result = []
        for date_str, value in zip(data['dates'], data['values']):
            if value is not None:
                result.append({
                    'date': date_str,
                    'value': float(value)
                })
        
        return result
    
    def _get_mock_data(self, start_date: str, end_date: str) -> Dict[str, Any]:
        """
        生成模拟数据（用于测试）
        
        Args:
            start_date: 开始日期
            end_date: 结束日期
            
        Returns:
            模拟的时间序列数据
        """
        import numpy as np
        from datetime import timedelta
        
        # 生成日期序列
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        
        dates = []
        current = start
        while current <= end:
            # 跳过周末
            if current.weekday() < 5:
                dates.append(current.strftime('%Y-%m-%d'))
            current += timedelta(days=1)
        
        # 生成随机数据
        n = len(dates)
        values = np.random.randn(n).cumsum() + 100
        
        return {
            'dates': dates,
            'values': values.tolist()
        }
    
    def close(self) -> None:
        """关闭Wind连接"""
        if self._w and self._initialized:
            try:
                self._w.stop()
                logger.info("Wind API连接已关闭")
            except Exception as e:
                logger.error(f"关闭Wind连接异常: {str(e)}")


# 全局Wind客户端实例
wind_client = WindDataClient()
