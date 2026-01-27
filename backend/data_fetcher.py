"""
数据获取模块 - 整合Wind API数据获取和MA20计算
"""
from WindPy import w
from datetime import datetime
import numpy as np
import config

class WindDataFetcher:
    """Wind 数据获取类"""
    
    def __init__(self):
        """初始化Wind API连接"""
        self.connected = False
        
    def connect(self):
        """连接Wind API"""
        if not w.isconnected():
            result = w.start()
            if result.ErrorCode != 0:
                raise Exception(f"Wind API 启动失败: {result.Data}")
        self.connected = True
        return True
    
    def disconnect(self):
        """断开Wind API连接"""
        if w.isconnected():
            w.stop()
        self.connected = False
    
    def get_latest_trade_date(self):
        """获取最新交易日"""
        current_date = datetime.now().strftime('%Y-%m-%d')
        trade_days = w.tdays("2026-01-01", current_date, "")
        
        if trade_days.ErrorCode == 0 and trade_days.Data:
            latest_trade_day = trade_days.Data[0][-1]
            if hasattr(latest_trade_day, 'strftime'):
                return latest_trade_day.strftime('%Y-%m-%d')
            return str(latest_trade_day)
        
        return current_date
    
    def get_trade_dates_after(self, start_date):
        """获取指定日期之后的所有交易日（不包括start_date本身）"""
        current_date = datetime.now().strftime('%Y-%m-%d')
        trade_days = w.tdays(start_date, current_date, "")
        
        if trade_days.ErrorCode == 0 and trade_days.Data:
            dates = []
            for date in trade_days.Data[0]:
                date_str = date.strftime('%Y-%m-%d') if hasattr(date, 'strftime') else str(date)
                # 排除起始日期本身
                if date_str > start_date:
                    dates.append(date_str)
            return dates
        
        return []
    
    def fetch_market_data(self, date):
        """
        获取指定日期的市场数据
        
        参数:
            date: 日期字符串，格式 "YYYY-MM-DD"
        
        返回:
            dict: 包含所有指标的数据字典
        """
        data = {
            'date': date,
            'turnover': None,
            'close': None,
            'equity_fund': None,
            'bond_fund': None,
            'dividend': None,
            'margin': None,
            'rise': None,
            'flat': None,
            'fall': None,
            'limit_up': None,
            'limit_down': None,
            'rsi': None,
            'ma20': None,
            'treasury': None,
            'pe_ttm': None,
        }
        
        try:
            # 1. 获取万得全A数据：收盘价、换手率、股息率、PE_TTM
            result_index = w.wsd(
                config.WIND_INDEX_CODE, 
                "close,free_turn_n,val_dividendyield3,pe_ttm", 
                date, date, "PriceAdj=F"
            )
            if result_index.ErrorCode == 0 and result_index.Data:
                data['close'] = result_index.Data[0][0] if result_index.Data[0] else None
                data['turnover'] = result_index.Data[1][0] if len(result_index.Data) > 1 else None
                data['dividend'] = result_index.Data[2][0] if len(result_index.Data) > 2 else None
                data['pe_ttm'] = result_index.Data[3][0] if len(result_index.Data) > 3 else None
            
            # 2. 获取基金数据：偏股、偏债（分别获取，避免同时获取时偏债返回None）
            # 偏股混合型基金
            result_equity = w.wsd(
                config.WIND_EQUITY_FUND_CODE, 
                "close", 
                date, date, "PriceAdj=F"
            )
            if result_equity.ErrorCode == 0 and result_equity.Data:
                data['equity_fund'] = result_equity.Data[0][0] if result_equity.Data[0] else None
            
            # 偏债混合型基金（单独获取）
            result_bond = w.wsd(
                config.WIND_BOND_FUND_CODE, 
                "close", 
                date, date, "PriceAdj=F"
            )
            if result_bond.ErrorCode == 0 and result_bond.Data:
                data['bond_fund'] = result_bond.Data[0][0] if result_bond.Data[0] else None
            
            # 3. 获取融资余额（使用新API）
            result_margin = w.wset(
                "markettradingstatistics(value)",
                f"exchange=all;startdate={date};enddate={date};frequency=day;sort=asc;field=margin_balance"
            )
            if result_margin.ErrorCode == 0 and result_margin.Data:
                # 返回的数据格式：Data[索引][0]
                # 通常margin_balance在某个字段中，需要找到对应的字段
                if len(result_margin.Data) > 0 and len(result_margin.Data[0]) > 0:
                    margin_balance = result_margin.Data[0][0]  # 第一个字段通常是日期，第二个可能是余额
                    # 如果第一个字段是日期，尝试第二个字段
                    if len(result_margin.Data) > 1:
                        margin_balance = result_margin.Data[1][0]
                    # 转换为亿元（API返回的可能已经是正确单位，需要测试）
                    data['margin'] = margin_balance / 100000000 if margin_balance and margin_balance > 1000000 else margin_balance
            
            # 4. 获取涨跌停数据
            result_change = w.wset(
                "numberofchangeindomestic", 
                f"startdate={date};enddate={date};frequency=day;"
                "field=reportdate,risenumberofshandsz,noriseorfallnumberofshandsz,"
                "fallnumberofshandsz,limitupnumofshandsz,limitdownnumofshandsz"
            )
            if result_change.ErrorCode == 0 and result_change.Data and len(result_change.Data[0]) > 0:
                data['rise'] = result_change.Data[1][0] if len(result_change.Data) > 1 else None
                data['flat'] = result_change.Data[2][0] if len(result_change.Data) > 2 else None
                data['fall'] = result_change.Data[3][0] if len(result_change.Data) > 3 else None
                data['limit_up'] = result_change.Data[4][0] if len(result_change.Data) > 4 else None
                data['limit_down'] = result_change.Data[5][0] if len(result_change.Data) > 5 else None
            
            # 5. 获取RSI指标
            result_rsi = w.wsd(
                config.WIND_INDEX_CODE, 
                "RSI", 
                date, date, "RSI_N=20;PriceAdj=F"
            )
            if result_rsi.ErrorCode == 0 and result_rsi.Data:
                data['rsi'] = result_rsi.Data[0][0] if result_rsi.Data[0] else None
            
            # 6. 获取国债收益率
            result_treasury = w.edb(config.TREASURY_YIELD_CODE, date, date, "Fill=Previous")
            if result_treasury.ErrorCode == 0 and result_treasury.Data:
                treasury_data = result_treasury.Data[0] if isinstance(result_treasury.Data, list) else result_treasury.Data
                data['treasury'] = treasury_data[0] if isinstance(treasury_data, list) else treasury_data
            
            # 7. 计算MA20宽度
            data['ma20'] = self.calculate_ma20_breadth(date)
            
        except Exception as e:
            print(f"⚠️ 获取 {date} 数据时出错: {str(e)}")
        
        return data
    
    def calculate_ma20_breadth(self, date):
        """
        计算指定日期的MA20宽度指标
        
        参数:
            date: 日期字符串，格式 "YYYY-MM-DD"
        
        返回:
            float: MA20宽度百分比
        """
        try:
            # API日期格式
            date_api = date.replace('-', '')
            
            # 1. 获取成分股
            sector_data = w.wset("sectorconstituent", f"date={date};sectorid={config.WIND_SECTOR_ID}")
            
            if sector_data.ErrorCode != 0:
                print(f"  ⚠️ 获取成分股失败: {sector_data.ErrorCode}")
                return None
            
            codes = sector_data.Data[1]
            total_count = len(codes)
            
            if total_count == 0:
                print(f"  ⚠️ 成分股数量为0")
                return None
            
            # 2. 批量获取数据
            valid_stocks = 0
            above_ma20_count = 0
            
            for i in range(0, total_count, config.MA20_BATCH_SIZE):
                batch_codes = codes[i:i+config.MA20_BATCH_SIZE]
                batch_codes_str = ",".join(batch_codes)
                
                data = w.wss(batch_codes_str, "close,MA", f"tradeDate={date_api};MA_N=20;priceAdj=F;cycle=D")
                
                if data.ErrorCode != 0:
                    continue
                
                closes = data.Data[0]
                mas = data.Data[1]
                
                for j in range(len(batch_codes)):
                    price = closes[j]
                    ma = mas[j]
                    
                    if price is None or ma is None or np.isnan(price) or np.isnan(ma):
                        continue
                    
                    valid_stocks += 1
                    if price > ma:
                        above_ma20_count += 1
            
            # 3. 计算比例
            if valid_stocks > 0:
                ratio = (above_ma20_count / valid_stocks) * 100
                return round(ratio, 2)
            
            return None
            
        except Exception as e:
            print(f"  ⚠️ MA20计算出错: {str(e)}")
            return None


# 便捷函数
def fetch_data_for_date(date):
    """
    获取指定日期的完整数据（包含Wind连接管理）
    
    参数:
        date: 日期字符串，格式 "YYYY-MM-DD"
    
    返回:
        dict: 数据字典
    """
    fetcher = WindDataFetcher()
    try:
        fetcher.connect()
        data = fetcher.fetch_market_data(date)
        return data
    finally:
        fetcher.disconnect()
