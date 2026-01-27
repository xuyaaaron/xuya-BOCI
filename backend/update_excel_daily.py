"""
主程序 - Excel数据自动更新
整合数据获取和Excel操作，实现每日自动更新功能
"""
import sys
import logging
import os
import json
import asyncio
import subprocess
from datetime import datetime
from data_fetcher import WindDataFetcher
from excel_handler import ExcelHandler
import config

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format=config.LOG_FORMAT,
    handlers=[
        logging.FileHandler(config.get_log_filename(), encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

def run_git_sync(commit_message):
    """执行Git同步：add -> commit -> push"""
    try:
        logging.info("开始Git同步...")
        repo_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # git add
        subprocess.run(["git", "add", "."], cwd=repo_dir, check=True)
        
        # git commit
        subprocess.run(["git", "commit", "-m", commit_message], cwd=repo_dir, check=True)
        
        # git push
        subprocess.run(["git", "push"], cwd=repo_dir, check=True)
        
        logging.info("Git同步完成")
        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"Git操作失败: {e}")
        return False

async def generate_static_snapshot():
    """生成静态数据快照 (复用 generate_static.py 的逻辑)"""
    try:
        logging.info("开始生成静态数据快照...")
        
        # 延迟导入以避免循环依赖
        # 注意：这里需要确保 sys.path 包含 backend 目录
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        
        from app.services.bociasi_service import bociasi_service
        from app.services.wind2x_service import wind2x_service
        
        # 刷新缓存（确保读取最新的Excel）
        await bociasi_service.warm_cache()
        await wind2x_service.warm_cache()
        
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
        
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = "2016-01-01"

        for ind_id in indicators:
            data = await bociasi_service.fetch_indicator_data(ind_id, start_date, end_date)
            static_data["bociasi"][ind_id] = data.dict()

        # 2. 获取 Wind 2X ERP 数据
        data = await wind2x_service.fetch_indicator_data("erp_2x", "2005-01-01", end_date)
        static_data["wind_2x_erp"] = data.dict()

        # 3. 写入文件
        repo_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        output_path = os.path.join(repo_dir, 'public', 'static_data.json')
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(static_data, f, ensure_ascii=False)
            
        logging.info(f"静态数据已保存至: {output_path}")
        return True
        
    except Exception as e:
        logging.error(f"生成静态快照失败: {str(e)}", exc_info=True)
        return False

def run_daily_update(test_mode=False):
    """
    执行每日更新流程：
    1. 连接Wind更新Excel
    2. 生成静态数据快照
    3. 推送到GitHub
    """
    print("=" * 80)
    print(f"🚀 开始执行每日自动更新流程: {datetime.now()}")
    print("=" * 80)
    
    updated_count = 0
    fetcher = None
    
    try:
        # --- 步骤1: 更新Excel ---
        handler = ExcelHandler()
        handler.read_excel()
        last_date = handler.get_last_date()
        
        logging.info("连接Wind API...")
        fetcher = WindDataFetcher()
        fetcher.connect()
        
        # 0. 尝试修复上一日的融资余额
        # 如果上一日的融资余额是临时填充的（因为当时Wind还没更新），那么今天应该能取到真实值了
        # 需要将其更新到Excel中，以便今日数据缺失时能使用正确的上一日数据
        if last_date:
            print(f"正在检查上一交易日 ({last_date}) 的融资余额...")
            margin_val = fetcher.get_margin_balance(last_date)
            
            # 读取当前Excel中该日期的融资余额进行对比（可选，这里直接更新比较简单）
            if margin_val:
                 print(f"获取到 {last_date} 的最新融资余额: {margin_val}")
                 # 直接更新
                 if handler.update_margin_for_date(last_date, margin_val):
                     print(f"✅ 已修正上一日 ({last_date}) 的融资余额")
                 else:
                     print(f"⚠️ 修正上一日融资余额失败")
            else:
                 print(f"⚠️ 上一日 ({last_date}) 融资余额仍尚未更新 (Wind返回None)")
        
        dates_to_update = fetcher.get_trade_dates_after(last_date)
        
        if not dates_to_update:
            logging.info("Excel数据已是最新")
            print("✅ Excel数据已是最新")
        else:
            print(f"发现 {len(dates_to_update)} 个交易日需要更新")
            
            # 备份
            if not test_mode:
                handler.backup_excel()
            
            # 逐日更新
            for date in dates_to_update:
                logging.info(f"正在获取 {date} 的数据...")
                try:
                    data = fetcher.fetch_market_data(date)
                    is_valid, _, msg = handler.validate_data(data)
                    
                    if is_valid:
                        handler.append_data(data)
                        updated_count += 1
                        print(f"✅ {date} 数据已添加")
                    else:
                        logging.warning(f"{date} 数据无效: {msg}")
                except Exception as e:
                    logging.error(f"处理 {date} 失败: {e}")
            
            # 保存
            if updated_count > 0 and not test_mode:
                handler.save_excel()
                print(f"✅ 成功更新 {updated_count} 条记录并保存")
        
        # --- 步骤2: 生成静态快照 ---
        # 即使Excel没有更新，也可以重新生成快照以更新 'generated_at' 时间戳
        print("📸 正在生成静态数据快照...")
        # 由于是在同步函数中调用异步代码，需要使用 asyncio.run
        asyncio.run(generate_static_snapshot())
        
        # --- 步骤3: 推送GitHub ---
        if not test_mode:
            print("☁️ 正在同步到 GitHub...")
            msg = f"Auto update: {datetime.now().strftime('%Y-%m-%d')} (Updated {updated_count} records)"
            if run_git_sync(msg):
                print("✅ GitHub同步成功")
            else:
                print("❌ GitHub同步失败")
                
    except Exception as e:
        logging.error(f"更新流程异常: {e}", exc_info=True)
        print(f"❌ 错误: {e}")
    finally:
        if fetcher:
            fetcher.disconnect()
        print("=" * 80) 

def main(test_mode=False):
    """脚本入口点"""
    run_daily_update(test_mode)

if __name__ == "__main__":
    test_mode = '--test' in sys.argv
    main(test_mode=test_mode)
