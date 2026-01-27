import asyncio
import json
import os
import sys
from datetime import datetime

# Add backend directory to sys.path to import modules
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.bociasi_service import bociasi_service
from app.services.wind2x_service import wind2x_service

async def generate_static_data():
    print("开始生成静态数据快照...")
    
    static_data = {
        "generated_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "bociasi": {},
        "wind_2x_erp": {}
    }

    # 1. 获取 BOCIASI 所有指标数据
    indicators = [
        'overview', 'equity_premium', 'eb_position_gap', 'eb_yield_gap',
        'margin_balance', 'slow_line', 'ma20', 'turnover',
        'up_down_ratio', 'rsi', 'fast_line'
    ]
    
    # 获取最近5年数据
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = "2016-01-01" # 匹配 BOCIASI 默认

    print("正在获取 BOCIASI 数据...")
    for ind_id in indicators:
        try:
            data = await bociasi_service.fetch_indicator_data(ind_id, start_date, end_date)
            # Pydantic model to dict
            static_data["bociasi"][ind_id] = data.dict()
            print(f"  - {ind_id}: {len(data.data_points)} 条记录")
        except Exception as e:
            print(f"  ! {ind_id} 获取失败: {str(e)}")

    # 2. 获取 Wind 2X ERP 数据
    print("正在获取 Wind 2X ERP 数据...")
    try:
        data = await wind2x_service.fetch_indicator_data("erp_2x", "2005-01-01", end_date)
        static_data["wind_2x_erp"] = data.dict()
        print(f"  - erp_2x: {len(data.data_points)} 条记录")
    except Exception as e:
        print(f"  ! erp_2x 获取失败: {str(e)}")

    # 3. 写入文件
    output_path = os.path.join('public', 'static_data.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(static_data, f, ensure_ascii=False)
    
    print(f"✅ 静态数据已保存至: {output_path}")

if __name__ == "__main__":
    asyncio.run(generate_static_data())
