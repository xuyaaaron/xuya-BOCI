from WindPy import w
import datetime

print("Connecting to Wind...")
res = w.start()
if res.ErrorCode == 0:
    print("Successfully connected to Wind")
    current_date = datetime.datetime.now().strftime('%Y-%m-%d')
    trade_days = w.tdays("2026-02-01", current_date, "")
    if trade_days.ErrorCode == 0:
        print("Trade days since 2026-02-01:", [d.strftime('%Y-%m-%d') for d in trade_days.Data[0]])
    else:
        print("Error getting trade days:", trade_days.ErrorCode)
    w.stop()
else:
    print("Failed to connect to Wind. ErrorCode:", res.ErrorCode)
