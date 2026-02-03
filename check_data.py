import json
from datetime import datetime

with open(r'public\static_data.json', encoding='utf-8') as f:
    data = json.load(f)

print("=" * 60)
print("📊 数据完整性报告")
print("=" * 60)
print(f"生成时间: {data['generated_at']}")
print()

# BOCIASI 数据
print("✓ BOCIASI 数据:")
overview_pts = data['bociasi']['overview']['data_points']
print(f"  总数据点: {len(overview_pts)} 条")
if overview_pts:
    last = overview_pts[-1]
    print(f"  最新数据: {last['date']}")
    print(f"  数值: {last.get('value')}")
    print(f"  状态: {'✓ 正常' if last.get('value') and last.get('value') != 0 else '✗ 异常'}")

print()

# Wind 2X ERP 数据
print("✓ Wind 2X ERP 数据:")
erp_pts = data['wind_2x_erp']['data_points']
print(f"  总数据点: {len(erp_pts)} 条")
if erp_pts:
    last = erp_pts[-1]
    print(f"  最新数据: {last['date']}")
    print(f"  ERP值: {last.get('erp')}")
    print(f"  状态: {'✓ 正常' if last.get('erp') is not None else '✗ 异常'}")

print()
print("=" * 60)
print("✅ 数据检查完成")
print("=" * 60)
