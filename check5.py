import pandas as pd
import warnings
warnings.filterwarnings('ignore')

excel_path = r'C:\Users\xuyaa\Desktop\BOCIASIV2.xlsx'
df = pd.read_excel(excel_path, sheet_name='A', header=None, usecols=[0, 2, 31, 106, 107], nrows=2220)

lines = []
lines.append(f"rows={len(df)}")
for i in range(2188, min(2215, len(df))):
    row = df.iloc[i]
    line = f"row{i}|date={str(row.iloc[0])[:20]}|close={str(row.iloc[1])[:12]}|AF={str(row.iloc[2])[:12]}|DC={str(row.iloc[3])[:12]}|DD={str(row.iloc[4])[:12]}"
    lines.append(line)

result = '\n'.join(lines)
open('check5.txt', 'w', encoding='ascii', errors='replace').write(result)

# also print each line individually
for l in lines:
    print(l)
