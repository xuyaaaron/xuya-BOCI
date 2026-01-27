"""
指标数据模型定义
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import date


class DataPoint(BaseModel):
    """数据点模型"""
    date: str = Field(..., description="日期，格式：YYYY-MM-DD")
    value: float = Field(..., description="数值（通常是ERP值）")
    # 额外字段用于前端展示
    close: Optional[float] = Field(None, description="收盘价")
    erp: Optional[float] = Field(None, description="ERP原始值")
    avg: Optional[float] = Field(None, description="均值")
    sd1_up: Optional[float] = Field(None, description="+1标准差")
    sd1_low: Optional[float] = Field(None, description="-1标准差")
    sd2_up: Optional[float] = Field(None, description="+2标准差")
    sd2_low: Optional[float] = Field(None, description="-2标准差")
    
    # BOCIASI 特定字段
    line_green: Optional[float] = Field(None, description="绿色线 (DJ)")
    line_black: Optional[float] = Field(None, description="黑色线 (DK)")
    line_yellow: Optional[float] = Field(None, description="黄色线 (DL)")
    slow_line: Optional[float] = Field(None, description="慢线读数 (DD)")
    fast_line: Optional[float] = Field(None, description="快线读数 (DC)")
    equity_premium: Optional[float] = Field(None, description="股权溢价 (AF)")
    eb_position_gap: Optional[float] = Field(None, description="股债位置差 (AL)")
    eb_yield_gap: Optional[float] = Field(None, description="股债收益差 (BA)")
    margin_balance: Optional[float] = Field(None, description="融资余额 (BN)")
    ma20: Optional[float] = Field(None, description="MA20 (CP)")
    turnover: Optional[float] = Field(None, description="换手率 (CB)")
    up_down_ratio: Optional[float] = Field(None, description="涨跌停比 (CM)")
    rsi: Optional[float] = Field(None, description="RSI (CS)")
    marker_red: Optional[float] = Field(None, description="慢线买入信号 (EN)")
    marker_green: Optional[float] = Field(None, description="慢线卖出信号 (EO)")
    marker_fast_buy: Optional[float] = Field(None, description="快线买入信号 (EV)")
    marker_fast_sell: Optional[float] = Field(None, description="快线卖出信号 (EW)")
    
    # BOCIASI 阈值字段
    di_signal: Optional[float] = Field(None, description="信号方向 (DI)")
    slow_threshold_1: Optional[float] = Field(None, description="慢线阈值 1 (EH)")
    slow_threshold_0: Optional[float] = Field(None, description="慢线阈值 0 (EI)")
    slow_threshold_neg1: Optional[float] = Field(None, description="慢线阈值 -1 (EJ)")
    fast_threshold_1: Optional[float] = Field(None, description="快线阈值 1 (EP)")
    fast_threshold_0: Optional[float] = Field(None, description="快线阈值 0 (EQ)")
    fast_threshold_neg1: Optional[float] = Field(None, description="快线阈值 -1 (ER)")


class IndicatorMetrics(BaseModel):
    """指标统计指标模型"""
    current_value: str = Field(..., description="当前值")
    percentile_5y: str = Field(..., description="5年分位数")
    change_weekly: str = Field(..., description="周变化")
    status: Literal["Attractive", "Neutral", "Caution"] = Field(..., description="状态")
    description: str = Field(..., description="描述")


class IndicatorData(BaseModel):
    """指标数据响应模型"""
    indicator_id: str = Field(..., description="指标ID")
    indicator_name: str = Field(..., description="指标名称")
    data_points: List[DataPoint] = Field(..., description="数据点列表")
    metrics: IndicatorMetrics = Field(..., description="统计指标")
    last_update: str = Field(..., description="最后更新时间")


class IndicatorInfo(BaseModel):
    """指标信息模型"""
    id: str = Field(..., description="指标ID")
    name: str = Field(..., description="指标名称")
    description: str = Field(..., description="指标描述")
    color: Literal["black", "red", "gray"] = Field(..., description="标签颜色")


class ModuleInfo(BaseModel):
    """数据模块信息模型"""
    id: str = Field(..., description="模块ID")
    name: str = Field(..., description="模块名称")
    description: str = Field(..., description="模块描述")
    indicators: List[IndicatorInfo] = Field(..., description="指标列表")
    enabled: bool = Field(True, description="是否启用")


class ModuleListResponse(BaseModel):
    """模块列表响应模型"""
    modules: List[ModuleInfo] = Field(..., description="模块列表")
    total: int = Field(..., description="总数")
