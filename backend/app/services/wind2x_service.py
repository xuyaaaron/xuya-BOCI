"""
万得全A "2X" ERP模块服务
"""
from typing import List
from datetime import datetime, timedelta
import numpy as np
from .base_module import BaseDataModule
from ..models.indicators import IndicatorData, IndicatorMetrics, DataPoint
from ..data.wind_client import wind_client
from ..data.cache import cache
import logging
import os

logger = logging.getLogger(__name__)


class Wind2XService(BaseDataModule):
    """万得全A "2X" ERP服务"""
    
    def __init__(self):
        super().__init__(
            module_id="wind_2x_erp",
            module_name='万得全A "2X" ERP',
            description="万得全A指数风险溢价（2倍杠杆）"
        )
        self.initialize()
        self._cache = {}
        self._last_file_mtime = 0
        self._last_fetch_time = None
    
    async def warm_cache(self) -> None:
        """启动预热缓存"""
        logger.info("正在执行 Wind 2X ERP 数据预热...")
        await self._fetch_from_wind("2005-01-01", datetime.now().strftime('%Y-%m-%d'))
        logger.info("Wind 2X ERP 数据预热完成")

    def initialize(self) -> None:
        """注册指标"""
        # Wind 2X ERP只有一个主指标，没有子标签
        self.register_indicator(
            "erp_2x",
            "ERP 2X",
            "万得全A指数风险溢价（2倍杠杆）",
            "red"
        )
    
    async def fetch_indicator_data(
        self,
        indicator_id: str,
        start_date: str = None,
        end_date: str = None,
        **kwargs
    ) -> IndicatorData:
        """
        获取指标数据
        """
        if indicator_id not in ["erp_2x", "default"]:
            indicator_id = "erp_2x"
        
        # 检查缓存 (Redis/File cache)
        cache_key = f"wind2x_{indicator_id}_{start_date}_{end_date}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return IndicatorData(**cached_data)
        
        # 获取指标信息
        indicator_info = self.get_indicator(indicator_id)
        if not indicator_info:
            raise ValueError(f"指标不存在: {indicator_id}")
        
        # 设置默认日期范围
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        if not start_date:
            start_date = "2005-01-01"
        
        data_points = await self._fetch_from_wind(start_date, end_date)
        metrics = await self._calculate_metrics(data_points)
        
        result = IndicatorData(
            indicator_id=indicator_id,
            indicator_name=indicator_info.name,
            data_points=data_points,
            metrics=metrics,
            last_update=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )
        
        cache.set(cache_key, result.dict())
        return result
    
    async def fetch_indicator_metrics(
        self,
        indicator_id: str
    ) -> IndicatorMetrics:
        """获取统计指标"""
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=5*365)).strftime('%Y-%m-%d')
        data = await self.fetch_indicator_data(indicator_id, start_date, end_date)
        return data.metrics
    
    async def _fetch_from_wind(self, start_date: str, end_date: str) -> List[DataPoint]:
        """从Excel获取ERP 2X数据 (使用内存缓存优化)"""
        import pandas as pd
        from pathlib import Path
        from config import EXCEL_PATH, COLUMN_MAPPING
        
        try:
            excel_path = Path(EXCEL_PATH)
            if not excel_path.exists():
                return []

            mtime = os.path.getmtime(excel_path)
            # 5分钟内且文件未修改，使用内存缓存
            if mtime == self._last_file_mtime and self._cache.get('all_points'):
                # 只要文件没变，就一直使用内存缓存
                return self._filter_data(self._cache['all_points'], start_date, end_date)

            logger.info(f"正在优化读取 ERP 2X 数据: {excel_path}")
            # 优化: 只读需要的列
            cols = [
                COLUMN_MAPPING['date'], COLUMN_MAPPING['close'], COLUMN_MAPPING['erp'],
                COLUMN_MAPPING['band_s'], COLUMN_MAPPING['band_u'], COLUMN_MAPPING['band_v'],
                COLUMN_MAPPING['band_w'], COLUMN_MAPPING['band_x']
            ]
            
            # 使用 pd.read_excel 配合 usecols
            df = pd.read_excel(excel_path, header=None, usecols=cols)
            START_ROW_INDEX = 728 
            if len(df) <= START_ROW_INDEX: return []

            all_points = []
            data_subset = df.iloc[START_ROW_INDEX:].values
            
            for row in data_subset:
                date_val = row[0]
                if pd.isna(date_val): continue
                
                try: 
                    if isinstance(date_val, datetime): d_str = date_val.strftime('%Y-%m-%d')
                    else: d_str = pd.to_datetime(date_val).strftime('%Y-%m-%d')
                except: continue

                def f(v):
                    try:
                        val = float(v)
                        return val if v != "#N/A" and not pd.isna(val) else None
                    except: return None

                dp = DataPoint(
                    date=d_str,
                    value=f(row[2]) or 0,
                    close=f(row[1]),
                    erp=f(row[2]),
                    avg=f(row[3]),
                    sd1_up=f(row[4]),
                    sd1_low=f(row[5]),
                    sd2_up=f(row[6]),
                    sd2_low=f(row[7])
                )
                all_points.append(dp)
            
            all_points.sort(key=lambda x: x.date)
            self._cache['all_points'] = all_points
            self._last_file_mtime = mtime
            self._last_fetch_time = datetime.now()
            
            return self._filter_data(all_points, start_date, end_date)

        except Exception as e:
            logger.error(f"Wind2X Excel read error: {str(e)}")
            return self._filter_data(self._cache.get('all_points', []), start_date, end_date)

    def _filter_data(self, data: List[DataPoint], start_date: str, end_date: str) -> List[DataPoint]:
        filtered = []
        for dp in data:
            if start_date and dp.date < start_date: continue
            if end_date and dp.date > end_date: continue
            filtered.append(dp)
        return filtered

    async def _calculate_metrics(self, data_points: List[DataPoint]) -> IndicatorMetrics:
        """计算统计指标"""
        if not data_points:
            return IndicatorMetrics(current_value="N/A", percentile_5y="N/A", change_weekly="N/A", status="Neutral", description="暂无数据")
        
        values = [dp.value for dp in data_points]
        current_value = values[-1]
        percentile = (np.sum(np.array(values) <= current_value) / len(values)) * 100
        
        if len(values) >= 5:
            weekly_change = ((current_value - values[-5]) / values[-5]) * 100 if values[-5] != 0 else 0
        else:
            weekly_change = 0
        
        if percentile > 70: status = "Attractive"
        elif percentile < 30: status = "Caution"
        else: status = "Neutral"
        
        return IndicatorMetrics(
            current_value=f"{current_value:.2f}%",
            percentile_5y=f"{percentile:.1f}%",
            change_weekly=f"{weekly_change:+.2f}%",
            status=status,
            description=self._get_status_description(status)
        )
    
    def _get_status_description(self, status: str) -> str:
        descriptions = {
            "Attractive": "ERP处于高位，股票相对债券具有吸引力",
            "Neutral": "ERP处于中性水平",
            "Caution": "ERP处于低位，股票相对债券吸引力较低"
        }
        return descriptions.get(status, "")

wind2x_service = Wind2XService()
