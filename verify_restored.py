import pandas as pd
import os

path = r'C:\Users\xuyaa\Desktop\BOCIASIV2_restored.xlsx'
try:
    print(f"File size: {os.path.getsize(path)}")
    df = pd.read_excel(path, sheet_name='A', usecols=range(17))
    print(f"Rows: {len(df)}")
    print(f"Last Date: {df.iloc[-1, 0]}")
except Exception as e:
    print(f"Error: {e}")
