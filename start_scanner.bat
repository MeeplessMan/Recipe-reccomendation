@echo off
echo ================================
echo   Live Ingredient Scanner
echo ================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo Checking Python installation...
python --version

echo.
echo Checking if model file exists...
if exist "model\best.pt" (
    echo ✓ Model found: model\best.pt
) else (
    echo ✗ Model file missing: model\best.pt
    echo Please ensure the trained model is in the model folder
    pause
    exit /b 1
)

echo.
echo Installing dependencies (if needed)...
pip install ultralytics opencv-python numpy torch torchvision Pillow Flask --quiet --disable-pip-version-check

echo.
echo Starting the Live Ingredient Scanner...
echo.
echo Once started, open your browser and go to:
echo http://localhost:5000
echo.
echo Press Ctrl+C to stop the application
echo.

python app.py

echo.
echo Application stopped.
pause