@echo off
cd /d "d:\Kushal GHRCE\email-threat-analyzer\backend"
call venv\Scripts\activate.bat
pip install -r requirements.txt
echo.
echo Dependencies installed successfully!
pause
