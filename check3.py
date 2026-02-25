import pandas as pd
import warnings
warnings.filterwarnings('ignore')

excel_path = r'C:\Users\xuyaa\Desktop\BOCIASIV2.xlsx'

# 先读取不限制列版本，查看第2194行（pandas行2193）各关键列的原始值
df_full = pd.read_excel(excel_path, sheet_name='A', header=None)

results = []
results.append(f"Total cols: {df_full.shape[1]}, rows: {df_full.shape[0]}")

# 检查第2194行（pandas索引2193）, 也是START_ROW_INDEX=2193
row_2193 = df_full.iloc[2193]
results.append(f"\nRow 2193 (Excel row 2194) -- first data row:")
results.append(f"  col0(A date): {row_2193.iloc[0]!r}")
results.append(f"  col2(C close): {row_2193.iloc[2]!r}")
results.append(f"  col31(AF): {row_2193.iloc[31]!r}")
results.append(f"  col65(BN): {row_2193.iloc[65]!r}")
results.append(f"  col79(CB): {row_2193.iloc[79]!r}")
results.append(f"  col93(CP): {row_2193.iloc[93]!r}")
results.append(f"  col96(CS): {row_2193.iloc[96]!r}")
results.append(f"  col106(DC fast): {row_2193.iloc[106]!r}")
results.append(f"  col107(DD slow): {row_2193.iloc[107]!r}")

# 检查最后5行
results.append(f"\nLast 5 rows - col0(date), col2(close), col31(AF), col106(DC fast), col107(DD slow):")
for i in range(max(0, len(df_full)-5), len(df_full)):
    row = df_full.iloc[i]
    d = row.iloc[0]
    c = row.iloc[2]
    af = row.iloc[31]
    dc = row.iloc[106]
    dd = row.iloc[107]
    results.append(f"  row{i}: {d!r} | close={c!r} | AF={af!r} | DC={dc!r} | DD={dd!r}")

# 检查前几行作为参照
results.append(f"\nRows 0-5 (header area):")
for i in range(6):
    row = df_full.iloc[i]
    d = row.iloc[0]
    af = row.iloc[31]
    dc = row.iloc[106]
    results.append(f"  row{i}: date={d!r} | AF={af!r} | DC={dc!r}")

print('\n'.join(results))
with open('check3_result.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(results))
