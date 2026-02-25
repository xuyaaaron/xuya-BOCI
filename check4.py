import pandas as pd
import warnings
warnings.filterwarnings('ignore')

excel_path = r'C:\Users\xuyaa\Desktop\BOCIASIV2.xlsx'

# 只读少量列和行，快速检查
# 先看col 31 (AF) 周围几行
df = pd.read_excel(excel_path, sheet_name='A', header=None, usecols=[0, 2, 31, 106, 107], nrows=2220)

lines = []
lines.append(f"总行数(nrows=2220): {len(df)}")
lines.append(f"\n行2190~2200 (date | close | AF | DC | DD):")
for i in range(2188, min(2210, len(df))):
    row = df.iloc[i]
    lines.append(f"  pandas_row={i} Excel_row={i+1}: {row.iloc[0]!r} | {row.iloc[1]!r} | {row.iloc[2]!r} | {row.iloc[3]!r} | {row.iloc[4]!r}")

with open('check4.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print("Done, see check4.txt")
for l in lines:
    print(l)
