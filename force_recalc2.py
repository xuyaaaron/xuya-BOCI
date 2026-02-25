"""
强制用 Excel COM 对象重算 BOCIASIV2.xlsx 的所有公式并保存
"""
import sys
import os

EXCEL_PATH = r'C:\Users\xuyaa\Desktop\BOCIASIV2.xlsx'
LOG_FILE = r'C:\Users\xuyaa\Desktop\chengxu\2X\recalc_result.txt'

lines = []
lines.append("=" * 60)
lines.append("Force recalculate BOCIASIV2.xlsx formulas")
lines.append(f"File: {EXCEL_PATH}")
lines.append("=" * 60)

try:
    import win32com.client
    import pythoncom

    pythoncom.CoInitialize()
    excel = None
    wb = None

    try:
        lines.append("Starting Excel...")
        excel = win32com.client.DispatchEx("Excel.Application")
        excel.Visible = False
        excel.DisplayAlerts = False

        abs_path = os.path.abspath(EXCEL_PATH)
        lines.append("Opening workbook (may take a while)...")
        wb = excel.Workbooks.Open(abs_path)

        lines.append("Running CalculateFull()...")
        excel.CalculateFull()

        lines.append("Saving file...")
        wb.Save()

        lines.append("=" * 60)
        lines.append("SUCCESS: Formulas recalculated and saved!")
        lines.append("=" * 60)

    except Exception as e:
        import traceback
        lines.append(f"ERROR: {e}")
        lines.append(traceback.format_exc())
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

except ImportError as e:
    lines.append(f"ImportError: {e}")
    lines.append("win32com not available")

# Write log
with open(LOG_FILE, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

# Also print
for l in lines:
    print(l.encode('ascii', errors='replace').decode('ascii'))
