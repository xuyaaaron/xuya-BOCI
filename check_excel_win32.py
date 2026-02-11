import win32com.client
import pythoncom
import os

def check_excel():
    pythoncom.CoInitialize()
    excel = None
    try:
        excel = win32com.client.DispatchEx("Excel.Application")
        excel.Visible = False
        excel.DisplayAlerts = False
        
        path = r"C:\Users\xuyaa\Desktop\BOCIASIV2.xlsx"
        wb = excel.Workbooks.Open(os.path.abspath(path))
        ws = wb.Worksheets("A")
        
        last_row = ws.UsedRange.Rows.Count
        date_val = ws.Cells(last_row, 1).Value
        close_val = ws.Cells(last_row, 3).Value
        
        print(f"Last Row: {last_row}")
        print(f"Date: {date_val}")
        print(f"Close: {close_val}")
        
        wb.Close(False)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if excel:
            excel.Quit()
        pythoncom.CoUninitialize()

if __name__ == "__main__":
    check_excel()
