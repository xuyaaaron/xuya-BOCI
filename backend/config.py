"""
配置模块 - 集中管理所有配置参数
"""
import os
from datetime import datetime

# ========== 文件路径配置 ==========
# Excel 文件路径
# Excel 文件路径
EXCEL_PATH = r'C:\Users\xuyaa\Desktop\BOCIASIV2.xlsx'
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
# Excel 列映射（从0开始）
COLUMN_MAPPING = {
    'date': 0,          # A列：日期
    'close': 2,         # C列：收盘价
    'erp': 17,          # R列：ERP
    'band_s': 18,       # S列
    # T列跳过
    'band_u': 20,       # U列
    'band_v': 21,       # V列
    'band_w': 22,       # W列
    'band_x': 23,       # X列
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
