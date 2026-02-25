import json

with open(r'public/static_data.json', encoding='utf-8') as f:
    data = json.load(f)

# 检查 fast_line
fast = data['bociasi'].get('fast_line', {})
pts = fast.get('data_points', [])
pts_sorted = sorted(pts, key=lambda x: x['date'])

print(f"fast_line total points: {len(pts_sorted)}")
print("Last 5 data points:")
for p in pts_sorted[-5:]:
    print(f"  {p['date']}: value={p.get('value')}, fast_line={p.get('fast_line')}, slow_line={p.get('slow_line')}")

print()
# 检查 slow_line
slow = data['bociasi'].get('slow_line', {})
slow_pts = sorted(slow.get('data_points', []), key=lambda x: x['date'])
print(f"slow_line total points: {len(slow_pts)}")
print("Last 5:")
for p in slow_pts[-5:]:
    print(f"  {p['date']}: value={p.get('value')}")
    
print()
print(f"generated_at: {data.get('generated_at')}")
