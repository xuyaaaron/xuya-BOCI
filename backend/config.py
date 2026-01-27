"""
配置模块 - 集中管理所有配置参数
"""
import os
from datetime import datetime

# ========== 文件路径配置 ==========
# Excel 文件路径
# Excel 文件路径
# 优先使用项目内的文件（适配 GitHub Actions），如果没有则使用本地桌面路径
# 强制指向桌面文件，确保用户能看到更新
EXCEL_PATH = r'C:\Users\xuyaa\Desktop\BOCIASIV2.xlsx'

# 备用路径（仅作记录）
# _LOCAL_EXCEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app', 'data', 'BOCIASIV2.xlsx')

SHEET_NAME = 'A'  # 工作表名称

# 备份目录
BACKUP_DIR = r'C:\Users\xuyaa\Desktop\chengxu\2X\backend\backups'
os.makedirs(BACKUP_DIR, exist_ok=True)

# 日志目录
LOG_DIR = r'C:\Users\xuyaa\Desktop\chengxu\2X\backend\logs'
os.makedirs(LOG_DIR, exist_ok=True)

# ========== Wind API 配置 ==========
# Wind 指数代码
WIND_INDEX_CODE = "881001.WI"  # 万得全A
WIND_EQUITY_FUND_CODE = "885001.WI"  # 偏股混合型基金
WIND_BOND_FUND_CODE = "885003.WI"  # 偏债混合型基金
WIND_SECTOR_ID = "a001010100000000"  # 万得全A成分股板块ID

# 国债收益率代码
TREASURY_YIELD_CODE = "M1004271"  # 10年期国债收益率

# ========== 数据字段配置 ==========
COLUMN_MAPPING = {
    'date': 0,          # A: 日期
    'turnover': 1,      # B: 换手率
    'close': 2,         # C: 收盘价
    'equity_fund': 3,   # D: 万得偏股混合型基金指数
    'bond_fund': 4,     # E: 万得偏债混合型基金指数
    'dividend': 5,      # F: 股息率TTM
    'margin': 6,        # G: 融资余额
    'rise': 7,          # H: 上涨家数
    'flat': 8,          # I: 平盘家数
    'fall': 9,          # J: 下跌家数
    'limit_up': 10,     # K: 涨停家数
    'limit_down': 11,   # L: 跌停家数
    'rsi': 12,          # M: RSI(20日)
    'ma20': 13,         # N: MA20
    'treasury': 14,     # O: 十年国债利率
    'pe_ttm': 15,       # P: 市盈率
    'pe_inverse': 16,   # Q: 市盈率倒数
    
    # R列 (17) 及之后是公式自动计算
    'erp': 17,          # R: ERP
    'band_s': 18,       # S: 3年均值
    'band_t': 19,       # T: 标准差
    'band_u': 20,       # U: 1倍标准差下限 (-1SD)
    'band_v': 21,       # V: 1倍标准差上限 (+1SD
    'band_w': 22,       # W: 2倍标准差下限 (-2SD)
    'band_x': 23,       # X: 2倍标准差上限 (+2SD)
}

# ========== 其他配置 ==========
# MA20 计算参数
MA20_BATCH_SIZE = 3000  # 批量获取股票数据的批次大小

# 备份文件保留天数
BACKUP_RETENTION_DAYS = 7

# 日志配置
LOG_LEVEL = 'INFO'
LOG_FORMAT = '%(asctime)s - %(levelname)s - %(message)s'

def get_backup_filename():
    """生成带时间戳的备份文件名"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    return os.path.join(BACKUP_DIR, f'BOCIASIV2_backup_{timestamp}.xlsx')

def get_log_filename():
    """生成今日日志文件名"""
    date_str = datetime.now().strftime('%Y%m%d')
    return os.path.join(LOG_DIR, f'update_{date_str}.log')
