import pandas as pd
import warnings
warnings.filterwarnings('ignore')

excel_path = r'C:\Users\xuyaa\Desktop\BOCIASIV2.xlsx'

# 只读 DC(col106) 和 DD(col107) 以及 date(col0)
cols = [0, 106, 107]
df = pd.read_excel(excel_path, sheet_name='A', header=None, usecols=cols)

START_ROW_INDEX = 2193
data = df.iloc[START_ROW_INDEX:]

lines = []
lines.append(f"Data rows: {len(data)}")
lines.append("Last 15 rows: date | DC(fast,col106) | DD(slow,col107)")
for i, row in data.tail(15).iterrows():
    d = str(row.iloc[0])[:20]
    dc = row.iloc[1]
    dd = row.iloc[2]
    lines.append(f"  pandas{i}(Excel{i+1}): {d} | DC={dc} | DD={dd}")

# count non-null
dc_col = pd.to_numeric(data.iloc[:, 1], errors='coerce')
dd_col = pd.to_numeric(data.iloc[:, 2], errors='coerce')
lines.append(f"\nDC(fast) non-null count: {dc_col.notna().sum()} / {len(data)}")
lines.append(f"DD(slow) non-null count: {dd_col.notna().sum()} / {len(data)}")

output = '\n'.join(lines)
with open('check_dc_dd.txt', 'w', encoding='ascii', errors='replace') as f:
    f.write(output)

for l in lines:
    print(l.encode('ascii', errors='replace').decode())
