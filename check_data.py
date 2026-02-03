import json

with open(r'public\static_data.json', encoding='utf-8') as f:
    data = json.load(f)

pts = data['bociasi']['overview']['data_points']

# 找到最后一个有效值
print("倒序查找最后一个有效数据点...")
for i in range(len(pts)-1, max(0, len(pts)-100), -1):
    val = pts[i].get('value')
    if val and val != 0:
        print(f"✓ 找到: {pts[i]['date']}: {val}")
        print(f"  (这是第 {i+1} 条数据，距离末尾 {len(pts)-i-1} 条)")
        break
else:
    print("✗ 最近100条都没有找到有效值！")
    
# 再往前找
print("\n检查2025年12月的数据:")
dec_data = [p for p in pts if p['date'].startswith('2025-12')]
if dec_data:
    for p in dec_data[-5:]:
        print(f"  {p['date']}: {p.get('value')}")
