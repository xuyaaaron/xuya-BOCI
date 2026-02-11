import json
import os

path = r'c:\Users\xuyaa\Desktop\chengxu\2X\public\static_data.json'
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        last_boci = data['bociasi']['overview']['data_points'][-1]
        last_erp = data['wind_2x_erp']['data_points'][-1]
        print(f"BOCI: {last_boci.get('date')} -> {last_boci.get('value')}")
        print(f"ERP: {last_erp.get('date')} -> {last_erp.get('value')}")
else:
    print("File not found")
