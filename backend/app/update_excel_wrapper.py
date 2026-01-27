"""
Update Wrapper
Wraps the update_excel_daily.py functionality to be importable by app.main
"""
import sys
import os
import logging

# Add backend directory to path so imports work correctly
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Import the actual logic
try:
    from update_excel_daily import run_daily_update
except ImportError:
    # Fallback if running from a different context
    import sys
    sys.path.append(os.path.join(os.getcwd(), 'backend'))
    from update_excel_daily import run_daily_update

def run_update():
    """Run the daily update process"""
    logging.info("Triggering run_daily_update from wrapper...")
    try:
        run_daily_update(test_mode=False)
    except Exception as e:
        logging.error(f"Error in wrapper run_update: {e}", exc_info=True)
