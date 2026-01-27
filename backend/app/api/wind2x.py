"""
Wind 2X ERP模块API路由
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..models.indicators import IndicatorData, IndicatorMetrics, IndicatorInfo
from ..services.wind2x_service import wind2x_service

router = APIRouter(prefix="/wind_2x_erp", tags=["wind_2x_erp"])


@router.get("/indicators", response_model=list[IndicatorInfo])
async def get_indicators():
    """
    获取Wind 2X ERP模块的指标列表
    
    Returns:
        指标列表
    """
    return wind2x_service.get_indicators()


@router.get("/data", response_model=IndicatorData)
async def get_erp_data(
    start_date: Optional[str] = Query(None, description="开始日期，格式：YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="结束日期，格式：YYYY-MM-DD")
):
    """
    获取ERP 2X数据
    
    Args:
        start_date: 开始日期（可选）
        end_date: 结束日期（可选）
        
    Returns:
        指标数据
    """
    try:
        data = await wind2x_service.fetch_indicator_data(
            indicator_id="erp_2x",
            start_date=start_date,
            end_date=end_date
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取数据失败: {str(e)}")


@router.get("/metrics", response_model=IndicatorMetrics)
async def get_erp_metrics():
    """
    获取ERP 2X统计指标
    
    Returns:
        统计指标
    """
    try:
        metrics = await wind2x_service.fetch_indicator_metrics("erp_2x")
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取统计指标失败: {str(e)}")
