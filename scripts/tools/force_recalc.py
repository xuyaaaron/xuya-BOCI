from excel_handler import ExcelHandler
import os

print("正在强制刷新Excel公式...")
# 指向桌面的文件
handler = ExcelHandler()
# 确保使用绝对路径
print(f"Target file: {handler.excel_path}")

success = handler.recalculate_formulas()

if success:
    print("Excel公式重算成功！")
else:
    print("Excel公式重算失败！")

try:
    # 同时也尝试重新生成静态快照
    import asyncio
    from update_excel_daily import generate_static_snapshot
    print("正在重新生成静态快照...")
    asyncio.run(generate_static_snapshot())
    print("静态快照已更新")
except Exception as e:
    print(f"生成快照失败: {e}")
