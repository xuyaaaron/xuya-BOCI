import pandas as pd
import warnings
warnings.filterwarnings('ignore')

excel_path = r'C:\Users\xuyaa\Desktop\BOCIASIV2.xlsx'
df_full = pd.read_excel(excel_path, sheet_name='A', header=None)

results = []
results.append(f"Total cols: {df_full.shape[1]}, rows: {df_full.shape[0]}")

check_cols = [('AF', 31), ('BN', 65), ('CB', 79), ('CP', 93), ('CS', 96), ('DC', 106), ('DD', 107), ('DI', 112)]

for col_name, col_idx in check_cols:
    series = df_full.iloc[1:, col_idx]  # skip header row 0
    # try to convert to numeric
    series_num = pd.to_numeric(series, errors='coerce')
    valid_rows = series_num.dropna()
    if len(valid_rows) > 0:
        last_idx = valid_rows.index[-1]
        date_in_a = df_full.iloc[last_idx, 0]
        val = valid_rows.iloc[-1]
        results.append(f"{col_name}(col{col_idx}): last pandas_row={last_idx} Excel_row={last_idx+1}, date={date_in_a}, val={val:.6f}")
    else:
        results.append(f"{col_name}(col{col_idx}): NO VALID DATA")

with open('check2_result.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(results))

print("Done. Results written to check2_result.txt")
print('\n'.join(results))
