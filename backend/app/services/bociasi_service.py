"""
BOCIASI A股情绪指标模块服务
"""
from typing import List
from datetime import datetime, timedelta
import numpy as np
from .base_module import BaseDataModule
from ..models.indicators import IndicatorData, IndicatorMetrics, DataPoint
from ..data.wind_client import wind_client
from ..data.cache import cache
import logging

logger = logging.getLogger(__name__)


class BOCIASIService(BaseDataModule):
    """BOCIASI A股情绪指标服务"""
    
    def __init__(self):
        super().__init__(
            module_id="bociasi",
            module_name="BOCIASI A股情绪指标",
            description="中银国际证券A股情绪综合指标体系"
        )
        self.initialize()
        self._cache = {} # indicator_id -> List[DataPoint]
        self._last_file_mtime = 0
        self._last_fetch_time = None
    
    async def warm_cache(self) -> None:
        """启动预热缓存"""
        logger.info("正在执行 BOCIASI 数据预热...")
        await self._get_buffered_data()
        logger.info("BOCIASI 数据预热完成")

    def initialize(self) -> None:
        """注册所有子指标"""
        # 注册11个子指标
        self.register_indicator("overview", "总览", "A股情绪综合总览", "black")
        self.register_indicator("equity_premium", "股权溢价", "股票相对债券的风险溢价", "red")
        self.register_indicator("eb_position_gap", "股债位置差", "股债相对位置差异", "red")
        self.register_indicator("eb_yield_gap", "股债收益差", "股债收益率差值", "red")
        self.register_indicator("margin_balance", "融资余额", "市场融资余额变化", "red")
        self.register_indicator("slow_line", "慢线", "情绪慢速移动平均线", "red")
        self.register_indicator("ma20", "MA20", "20日移动平均线", "gray")
        self.register_indicator("turnover", "换手率", "市场换手率指标", "gray")
        self.register_indicator("up_down_ratio", "涨跌停比", "涨停跌停家数比", "gray")
        self.register_indicator("rsi", "RSI", "相对强弱指标", "gray")
        self.register_indicator("fast_line", "快线", "情绪快速移动平均线", "gray")
    
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
            start_date: 开始日期
            end_date: 结束日期
            
        Returns:
            IndicatorData: 指标数据
        """
        # 检查缓存
        cache_key = f"bociasi_{indicator_id}_{start_date}_{end_date}"
        cached_data = cache.get(cache_key)
        if cached_data:
            logger.info(f"从缓存获取数据: {cache_key}")
            return IndicatorData(**cached_data)
        
        # 获取指标信息
        indicator_info = self.get_indicator(indicator_id)
        if not indicator_info:
            raise ValueError(f"指标不存在: {indicator_id}")
        
        # 设置默认日期范围（最近5年）
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        if not start_date:
            # 统一从 2016-01-01 开始 (对应 2194行附近)
            start_date = "2016-01-01"
        
        # 从Wind获取数据
        data_points = await self._fetch_from_wind(indicator_id, start_date, end_date)
        
        # 计算统计指标
        metrics = await self._calculate_metrics(indicator_id, data_points)
        
        # 构建响应
        result = IndicatorData(
            indicator_id=indicator_id,
            indicator_name=indicator_info.name,
            data_points=data_points,
            metrics=metrics,
            last_update=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )
        
        # 缓存数据
        cache.set(cache_key, result.dict())
        
        return result
    
    async def fetch_indicator_metrics(
        self,
        indicator_id: str
    ) -> IndicatorMetrics:
        """
        获取指标统计指标
        
        Args:
            indicator_id: 指标ID
            
        Returns:
            IndicatorMetrics: 统计指标
        """
        # 获取最近5年数据
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=5*365)).strftime('%Y-%m-%d')
        
        data = await self.fetch_indicator_data(indicator_id, start_date, end_date)
        return data.metrics
    
    async def _fetch_from_wind(
        self,
        indicator_id: str,
        start_date: str,
        end_date: str
    ) -> List[DataPoint]:
        """
        从Wind/Excel获取数据
        """
        # 从Excel读取指示器 (所有BOCIASI子指标)
        return await self._fetch_indicator_from_excel(indicator_id, start_date, end_date)

        # ... (Existing Wind logic for other indicators) ...
        # Wind代码映射（需要根据实际情况配置）
        wind_codes_map = {
            "equity_premium": "000300.SH",  # 沪深300
            "eb_position_gap": "000300.SH",
            "eb_yield_gap": "000300.SH",
            "margin_balance": "RZYE.SH",    # 融资余额
            "ma20": "000300.SH",
            "turnover": "000300.SH",
            "rsi": "000300.SH",
        }
        
        wind_code = wind_codes_map.get(indicator_id, "000300.SH")
        
        # 获取数据
        raw_data = wind_client.fetch_indicator(
            codes=wind_code,
            indicator="close",
            start_date=start_date,
            end_date=end_date
        )
        
        # 转换为DataPoint格式
        data_points = [DataPoint(**item) for item in raw_data]
        
        return data_points
        
    async def _fetch_indicator_from_excel(self, indicator_id: str, start_date: str, end_date: str) -> List[DataPoint]:
        """从Excel读取所有指标数据"""
        all_data = await self._get_buffered_data()
        if not all_data: return []
        
        filtered = []
        for dp in all_data:
            # 数据复制优化：使用 copy 并同时更新 fields
            update_dict = {}
            if indicator_id == "slow_line":
                update_dict['value'] = dp.slow_line if dp.slow_line is not None else 0
            elif indicator_id == "fast_line":
                update_dict['value'] = dp.fast_line if dp.fast_line is not None else 0
            elif indicator_id == "equity_premium":
                update_dict['value'] = dp.equity_premium if dp.equity_premium is not None else 0
            elif indicator_id == "eb_position_gap":
                update_dict['value'] = dp.eb_position_gap if dp.eb_position_gap is not None else 0
            elif indicator_id == "eb_yield_gap":
                update_dict['value'] = dp.eb_yield_gap if dp.eb_yield_gap is not None else 0
            elif indicator_id == "margin_balance":
                update_dict['value'] = dp.margin_balance if dp.margin_balance is not None else 0
            elif indicator_id == "ma20":
                update_dict['value'] = dp.ma20 if dp.ma20 is not None else 0
            elif indicator_id == "turnover":
                update_dict['value'] = dp.turnover if dp.turnover is not None else 0
            elif indicator_id == "up_down_ratio":
                update_dict['value'] = dp.up_down_ratio if dp.up_down_ratio is not None else 0
            elif indicator_id == "rsi":
                update_dict['value'] = dp.rsi if dp.rsi is not None else 0
            elif indicator_id == "overview":
                update_dict['value'] = dp.slow_line if dp.slow_line is not None else 0
            
            # 使用 copy(update=...) 避免先复制再赋值
            new_dp = dp.copy(update=update_dict)
            
            if start_date and new_dp.date < start_date: continue
            if end_date and new_dp.date > end_date: continue
            filtered.append(new_dp)
        return filtered

    async def _get_buffered_data(self) -> List[DataPoint]:
        """获取带缓存的Excel数据，显著提升加载速度"""
        import pandas as pd
        from pathlib import Path
        import os
        from config import EXCEL_PATH
        
        try:
            excel_path = Path(EXCEL_PATH)
            if not excel_path.exists():
                return []
            
            mtime = os.path.getmtime(excel_path)
            if mtime == self._last_file_mtime and self._cache.get('all_points'):
                # 只要文件没变，就一直使用内存缓存，不需要每5分钟重读
                return self._cache['all_points']

            logger.info(f"正在全量调取Excel数据: {excel_path}")
            # A=0, C=2
            # AF=31, AL=37, BA=52, BN=65, CP=93, CB=79, CM=90, CS=96
            # DC=106, DD=107, DJ=113, DK=114, DL=115, EN=143, EO=144, EV=151, EW=152
            cols_to_read = [
                0, 2, 31, 37, 52, 65, 79, 90, 93, 96, 
                106, 107, 112, 113, 114, 115, 137, 138, 139, 143, 144, 145, 146, 147, 151, 152
            ]
            
            from config import EXCEL_PATH, SHEET_NAME
            
            df = pd.read_excel(excel_path, sheet_name=SHEET_NAME, header=None, usecols=cols_to_read)
            START_ROW_INDEX = 2193
            if len(df) <= START_ROW_INDEX: return []
            
            all_points = []
            data_subset = df.iloc[START_ROW_INDEX:].values
            
            # 由于列是按升序读取的，我们需要精确映射 numpy row 索引
            # 0:date(A), 1:close(C), 2:equity(AF), 3:pos(AL), 4:yield(BA), 5:margin(BN), 6:turnover(CB)
            # 7:updown(CM), 8:ma20(CP), 9:rsi(CS), 10:fast(DC), 11:slow(DD), 12:di(DI)
            # 13:green(DJ), 14:black(DK), 15:yellow(DL), 16:eh, 17:ei, 18:ej, 19:en, 20:eo, 21:ep, 22:eq, 23:er, 24:ev, 25:ew
            
            for row in data_subset:
                date_val = row[0]
                if pd.isna(date_val): continue
                
                try: 
                    if isinstance(date_val, datetime): d_str = date_val.strftime('%Y-%m-%d')
                    else: d_str = pd.to_datetime(date_val).strftime('%Y-%m-%d')
                except: continue
                
                def f(idx):
                    if idx >= len(row): return None
                    v = row[idx]
                    if v == "#N/A" or pd.isna(v): return None
                    try: return float(v)
                    except: return None
 
                dp = DataPoint(
                    date=d_str,
                    value=0,
                    close=f(1),            # C
                    equity_premium=f(2),   # AF
                    eb_position_gap=f(3),  # AL
                    eb_yield_gap=f(4),     # BA
                    margin_balance=f(5),   # BN
                    turnover=f(6),         # CB
                    up_down_ratio=f(7),    # CM
                    ma20=f(8),             # CP
                    rsi=f(9),              # CS
                    fast_line=f(10),       # DC
                    slow_line=f(11),       # DD
                    di_signal=f(12),       # DI
                    line_green=f(13),      # DJ
                    line_black=f(14),      # DK
                    line_yellow=f(15),     # DL
                    slow_threshold_1=f(16),    # EH
                    slow_threshold_0=f(17),    # EI
                    slow_threshold_neg1=f(18), # EJ
                    marker_red=f(19),      # EN
                    marker_green=f(20),    # EO
                    fast_threshold_1=f(21),    # EP
                    fast_threshold_0=f(22),    # EQ
                    fast_threshold_neg1=f(23), # ER
                    marker_fast_buy=f(24), # EV
                    marker_fast_sell=f(25) # EW
                )
                all_points.append(dp)
            
            all_points.sort(key=lambda x: x.date)
            self._cache['all_points'] = all_points
            self._last_file_mtime = mtime
            self._last_fetch_time = datetime.now()
            return all_points
            
        except Exception as e:
            logger.error(f"Buffered Excel read error: {str(e)}")
            return self._cache.get('all_points', [])

    async def _fetch_overview_from_excel(self, start_date: str, end_date: str) -> List[DataPoint]:
        """由于逻辑统一，该方法可重定向"""
        return await self._fetch_indicator_from_excel("overview", start_date, end_date)
    
    async def _calculate_metrics(
        self,
        indicator_id: str,
        data_points: List[DataPoint]
    ) -> IndicatorMetrics:
        """计算统计指标"""
        if not data_points:
            return IndicatorMetrics(
                current_value="N/A",
                percentile_5y="N/A",
                change_weekly="N/A",
                status="Neutral",
                description="暂无数据"
            )
        
        # 提取数值
        values = [dp.value for dp in data_points]
        current_value = values[-1]
        
        # 计算5年分位数
        percentile = (np.sum(np.array(values) <= current_value) / len(values)) * 100
        
        # 计算周变化
        if len(values) >= 5 and values[-5] != 0 and values[-5] is not None:
            weekly_change = ((current_value - values[-5]) / values[-5]) * 100
        else:
            weekly_change = 0
        
        # 判断状态
        if percentile < 30:
            status = "Attractive"
        elif percentile > 70:
            status = "Caution"
        else:
            status = "Neutral"
        
        return IndicatorMetrics(
            current_value=f"{current_value:.2f}",
            percentile_5y=f"{percentile:.1f}%",
            change_weekly=f"{weekly_change:+.2f}%",
            status=status,
            description=self._get_status_description(status)
        )
    
    def _get_status_description(self, status: str) -> str:
        """获取状态描述"""
        descriptions = {
            "Attractive": "市场情绪处于低位，可能存在投资机会",
            "Neutral": "市场情绪中性，建议观望",
            "Caution": "市场情绪偏热，需要谨慎"
        }
        return descriptions.get(status, "")


# 全局服务实例
bociasi_service = BOCIASIService()
