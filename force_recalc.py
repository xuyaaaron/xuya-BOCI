"""
强制用 Excel COM 对象重算 BOCIASIV2.xlsx 的所有公式并保存
运行前请确保 Excel 已安装，且 BOCIASIV2.xlsx 未被其他程序占用
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import win32com.client
import pythoncom

EXCEL_PATH = r'C:\Users\xuyaa\Desktop\BOCIASIV2.xlsx'

print("=" * 60)
print("正在启动 Excel 强制重算公式...")
print(f"文件: {EXCEL_PATH}")
print("=" * 60)

pythoncom.CoInitialize()
excel = None
wb = None

try:
    excel = win32com.client.DispatchEx("Excel.Application")
    excel.Visible = False
    excel.DisplayAlerts = False
    
    abs_path = os.path.abspath(EXCEL_PATH)
    print("正在打开文件（可能需要一分钟）...")
    wb = excel.Workbooks.Open(abs_path)
    
    print("正在强制重算所有公式（Ctrl+Alt+F9 等效）...")
    excel.CalculateFull()   # 强制全量重算，比 Calculate() 更彻底
    
    print("正在保存文件...")
    wb.Save()
    
    print("=" * 60)
    print("✅ 公式重算完成并已保存！")
    print("现在可以重新运行自动更新来生成正确的 static_data.json")
    print("=" * 60)
    
except Exception as e:
    print(f"❌ 失败: {e}")
    import traceback
    traceback.print_exc()
finally:
    if wb:
        try:
            wb.Close()
        except:
            pass
    if excel:
        try:
            excel.Quit()
        except:
            pass
    pythoncom.CoUninitialize()
