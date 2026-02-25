"""
用 pandas skiprows 定向读取 Excel 的特定区域，检查 AF、DC、DD 列的有效数据范围
"""
import pandas as pd
import warnings
warnings.filterwarnings('ignore')

excel_path = r'C:\Users\xuyaa\Desktop\BOCIASIV2.xlsx'

# 只读取行2180~2220（pandas行，0-based）
# 即 skiprows=range(1, 2180) 跳过前面的行，但 header=None 所以 skiprows 直接是行号
# 读少量列 + 特定行范围
skiprows = list(range(1, 2180))   # 跳过行1到2179，保留行0（作为第一行）到后面
# 实际上用 skiprows 配合 nrows 更快

# 方法：读取整列但只看最后几个非空值
# 用 usecols 限制列数，nrows 限制行数
cols = [0, 2, 31, 106, 107]  # A, C, AF, DC, DD

# 读取所有行，但只要这5列
df = pd.read_excel(excel_path, sheet_name='A', header=None, usecols=cols)
print(f"Read {len(df)} rows, {len(df.columns)} cols")

# AF列(位置2), DC列(位置3), DD列(位置4)
af_col = df.iloc[:, 2]
dc_col = df.iloc[:, 3]
dd_col = df.iloc[:, 4]

# 找各列最后有值的行
def last_valid(series, col_name):
    valid = []
    for idx, v in series.items():
        if v is not None and str(v) not in ('nan', 'None', '') and 'Unnamed' not in str(v):
            try:
                float(str(v).replace('#N/A','').strip())
                valid.append((idx, v))
            except:
                pass
    if valid:
        last_idx, last_val = valid[-1]
        date_val = df.iloc[last_idx, 0]
        print(f"{col_name}: last valid row=pandas{last_idx}(Excel{last_idx+1}), date={date_val}, val={last_val}")
        # Also show surrounding rows
        for i in range(max(0, last_idx - 2), min(len(df), last_idx + 4)):
            r = df.iloc[i]
            print(f"    row{i}(Excel{i+1}): date={r.iloc[0]} | af={r.iloc[2]} | dc={r.iloc[3]} | dd={r.iloc[4]}")
    else:
        print(f"{col_name}: NO VALID DATA at all")

last_valid(af_col, 'AF(col31)')
print()
last_valid(dc_col, 'DC fast_line(col106)')
print()
last_valid(dd_col, 'DD slow_line(col107)')
