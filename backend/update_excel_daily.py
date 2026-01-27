"""
主程序 - Excel数据自动更新
整合数据获取和Excel操作，实现每日自动更新功能
"""
import sys
import logging
from datetime import datetime
from data_fetcher import WindDataFetcher
from excel_handler import ExcelHandler
import config

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format=config.LOG_FORMAT,
    handlers=[
        logging.FileHandler(config. get_log_filename(), encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

def main(test_mode=False):
    """
    主函数 - 执行Excel数据更新
    
    参数:
        test_mode: 测试模式，不实际保存Excel
    """
    print("=" * 80)
    print("🚀 Excel 数据自动更新程序")
    print("=" * 80)
    print(f"开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    fetcher = None
    handler = None
    
    try:
        # 1. 初始化Excel处理器
        logging.info("初始化Excel处理器...")
        handler = ExcelHandler()
        handler.read_excel()
        handler.print_summary()
        
        # 2. 获取最后更新日期
        last_date = handler.get_last_date()
        logging.info(f"Excel最后更新日期: {last_date}")
        print()
        
        # 3. 连接Wind API
        logging.info("连接Wind API...")
        print("📡 正在连接 Wind API...")
        fetcher = WindDataFetcher()
        fetcher.connect()
        print("✅ Wind API 已连接")
        print()
        
        # 4. 获取需要更新的交易日列表
        logging.info("查询需要更新的交易日...")
        print("📅 正在查询需要更新的交易日...")
        
        dates_to_update = fetcher.get_trade_dates_after(last_date)
        
        if not dates_to_update:
            print("✅ 数据已是最新，无需更新")
            logging.info("数据已是最新，无需更新")
            return
        
        print(f"发现 {len(dates_to_update)} 个交易日需要更新:")
        for date in dates_to_update:
            print(f"  - {date}")
        print()
        
        # 5. 备份Excel文件
        if not test_mode:
            logging.info("备份Excel文件...")
            print("💾 正在备份Excel文件...")
            handler.backup_excel()
            print()
        
        # 6. 逐日获取数据并更新
        updated_count = 0
        failed_dates = []
        
        for i, date in enumerate(dates_to_update, 1):
            print("=" * 80)
            print(f"📊 [{i}/{len(dates_to_update)}] 正在处理 {date}...")
            print("=" * 80)
            logging.info(f"正在获取 {date} 的数据...")
            
            try:
                # 获取数据
                data = fetcher.fetch_market_data(date)
                
                # 验证数据
                is_valid, missing_fields, message = handler.validate_data(data)
                
                if not is_valid:
                    print(f"⚠️ 数据验证失败: {message}")
                    logging.warning(f"{date} 数据验证失败: {message}")
                    failed_dates.append((date, message))
                    continue
                
                # 显示获取的数据
                print(f"\n✅ 数据获取成功:")
                print(f"  日期: {data['date']}")
                print(f"  收盘价: {data['close']}")
                print(f"  换手率: {data['turnover']}%")
                print(f"  股息率: {data['dividend']}%")
                print(f"  融资余额: {data['margin']:.2f}亿元" if data['margin'] else "  融资余额: N/A")
                print(f"  上涨/平盘/下跌: {data['rise']}/{data['flat']}/{data['fall']}")
                print(f"  涨停/跌停: {data['limit_up']}/{data['limit_down']}")
                print(f"  RSI(20): {data['rsi']}")
                print(f"  MA20宽度: {data['ma20']}%" if data['ma20'] else "  MA20宽度: N/A")
                print(f"  国债收益率: {data['treasury']}%")
                
                # 追加到DataFrame
                handler.append_data(data)
                updated_count += 1
                logging.info(f"{date} 数据已添加到DataFrame")
                
                print(f"\n✅ {date} 数据已添加")
                
            except Exception as e:
                error_msg = f"处理 {date} 时出错: {str(e)}"
                print(f"❌ {error_msg}")
                logging.error(error_msg, exc_info=True)
                failed_dates.append((date, str(e)))
            
            print()
        
        # 7. 保存Excel文件
        if updated_count > 0 and not test_mode:
            print("=" * 80)
            print("💾 正在保存Excel文件...")
            logging.info("保存Excel文件...")
            
            handler.save_excel()
            
            print("✅ Excel文件已保存")
            logging.info("Excel文件保存成功")
        
        # 8. 输出总结
        print()
        print("=" * 80)
        print("📈 更新完成总结")
        print("=" * 80)
        print(f"  成功更新: {updated_count} 个交易日")
        print(f"  失败: {len(failed_dates)} 个交易日")
        
        if failed_dates:
            print("\n  失败详情:")
            for date, reason in failed_dates:
                print(f"    - {date}: {reason}")
        
        if test_mode:
            print("\n  ⚠️ 测试模式：未实际保存Excel文件")
        
        print()
        handler.print_summary()
        
        logging.info(f"更新完成 - 成功: {updated_count}, 失败: {len(failed_dates)}")
        
    except Exception as e:
        error_msg = f"程序执行失败: {str(e)}"
        print(f"\n❌ {error_msg}")
        logging.error(error_msg, exc_info=True)
        sys.exit(1)
    
    finally:
        # 断开Wind连接
        if fetcher:
            fetcher.disconnect()
            print("🔌 Wind API 连接已关闭")
        
        print()
        print("=" * 80)
        print(f"结束时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)


if __name__ == "__main__":
    # 检查命令行参数
    test_mode = '--test' in sys.argv
    
    if test_mode:
        print("⚠️ 运行在测试模式\n")
    
    main(test_mode=test_mode)
