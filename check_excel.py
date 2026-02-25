import pandas as pd
import warnings
warnings.filterwarnings('ignore')

excel_path = r'C:\Users\xuyaa\Desktop\BOCIASIV2.xlsx'

# 读取全部列（不限制列数）
print("正在读取Excel，请稍候...")
df_full = pd.read_excel(excel_path, sheet_name='A', header=None)
print(f'全部列数: {df_full.shape[1]}')
print(f'全部行数: {df_full.shape[0]}')

# 检查各关键列的最后有效行
check_cols = {
    'AF(股权溢价,31)': 31,
    'BN(融资余额,65)': 65,
    'CB(换手率,79)': 79,
    'CP(MA20,93)': 93,
    'CS(RSI,96)': 96,
    'DC(快线,106)': 106,
    'DD(慢线,107)': 107,
    'DI(107)': 112,
}

print()
print("各关键列最后有效数据行:")
for col_name, col_idx in check_cols.items():
    if col_idx >= df_full.shape[1]:
        print(f'  {col_name}: 列不存在（总列数{df_full.shape[1]}）')
        continue
    series = df_full.iloc[:, col_idx]
    valid_rows = series.dropna()
    if len(valid_rows) > 0:
        last_idx = valid_rows.index[-1]
        date_in_a = df_full.iloc[last_idx, 0]
        val = valid_rows.iloc[-1]
        print(f'  {col_name}: 最后有效行=pandas行{last_idx}(Excel第{last_idx+1}行), 日期={date_in_a}, 值={val}')
    else:
        print(f'  {col_name}: 无有效数据')

# 打印最后5行（日期+DC+DD）
print()
print("最后5行 日期(A) | 收盘(C) | 快线(DC=106) | 慢线(DD=107):")
for i in range(max(0, df_full.shape[0]-5), df_full.shape[0]):
    row = df_full.iloc[i]
    date_v = row.iloc[0]
    close_v = row.iloc[2] if df_full.shape[1] > 2 else 'N/A'
    dc_v = row.iloc[106] if df_full.shape[1] > 106 else 'N/A'
    dd_v = row.iloc[107] if df_full.shape[1] > 107 else 'N/A'
    print(f'  行{i}: {date_v} | {close_v} | {dc_v} | {dd_v}')
