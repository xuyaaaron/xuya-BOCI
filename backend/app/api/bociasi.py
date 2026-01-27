"""
BOCIASI模块API路由
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..models.indicators import IndicatorData, IndicatorMetrics, IndicatorInfo
from ..services.bociasi_service import bociasi_service

router = APIRouter(prefix="/bociasi", tags=["bociasi"])


@router.get("/indicators", response_model=list[IndicatorInfo])
async def get_indicators():
    """
    获取BOCIASI模块的所有指标列表
    
    Returns:
        指标列表
    """
    return bociasi_service.get_indicators()


@router.get("/{indicator_id}/data", response_model=IndicatorData)
async def get_indicator_data(
    indicator_id: str,
    start_date: Optional[str] = Query(None, description="开始日期，格式：YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="结束日期，格式：YYYY-MM-DD")
):
    """
    获取指定指标的时间序列数据
    
    Args:
        indicator_id: 指标ID
        start_date: 开始日期（可选）
        end_date: 结束日期（可选）
        
    Returns:
        指标数据
    """
    try:
        data = await bociasi_service.fetch_indicator_data(
            indicator_id=indicator_id,
            start_date=start_date,
            end_date=end_date
        )
        return data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取数据失败: {str(e)}")


@router.get("/{indicator_id}/metrics", response_model=IndicatorMetrics)
async def get_indicator_metrics(indicator_id: str):
    """
    获取指定指标的统计指标
    
    Args:
        indicator_id: 指标ID
        
    Returns:
        统计指标
    """
    try:
        metrics = await bociasi_service.fetch_indicator_metrics(indicator_id)
        return metrics
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取统计指标失败: {str(e)}")
