@echo off
echo ========================================
echo   Rentify AI Chat Server
echo ========================================
echo.

REM Kiểm tra Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python chua duoc cai dat!
    echo Vui long cai dat Python tu https://www.python.org/
    pause
    exit /b 1
)

echo [1/3] Kiem tra dependencies...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo [INFO] Cai dat dependencies...
    pip install -r requirements.txt
) else (
    echo [OK] Dependencies da san sang
)

echo.
echo [2/3] Kiem tra database connection...
python -c "from db import DatabaseClient; db = DatabaseClient(); print('[OK] Database connected' if db.is_connected() else '[WARNING] Database disconnected - demo mode')"

echo.
echo [3/3] Khoi dong server...
echo.
echo Server dang chay tai: http://localhost:8000
echo Nhan Ctrl+C de dung server
echo.
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

echo.
echo Kich hoat mo truong ao neu can: .\.venv\Scripts\Activate.ps1
echo Quay ve: deactivate