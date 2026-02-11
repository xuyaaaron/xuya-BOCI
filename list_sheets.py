import win32com.client
import pythoncom
import os

def list_sheets():
    pythoncom.CoInitialize()
    excel = None
    try:
        excel = win32com.client.DispatchEx("Excel.Application")
        excel.Visible = False
        excel.DisplayAlerts = False
        
        path = r"C:\Users\xuyaa\Desktop\BOCIASIV2.xlsx"
        wb = excel.Workbooks.Open(os.path.abspath(path))
        print("Sheets in workbook:")
        for sheet in wb.Sheets:
            print(f"- {sheet.Name}")
        wb.Close(False)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if excel:
            excel.Quit()
        pythoncom.CoUninitialize()

if __name__ == "__main__":
    list_sheets()
