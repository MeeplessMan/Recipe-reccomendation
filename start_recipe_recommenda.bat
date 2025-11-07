@echo off
echo Starting Recipe Recommenda Development Servers...
echo.

echo [1/3] Setting up backend...
cd backend
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo [2/3] Setting up frontend...
cd ..\frontend
echo Installing Node.js dependencies...
call npm install

echo.
echo [3/3] Starting servers...
echo Backend will start on: http://localhost:5000
echo Frontend will start on: http://localhost:3000
echo.

start cmd /k "cd /d %~dp0backend && venv\Scripts\activate && python app.py"
start cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Recipe Recommenda servers are starting...
echo Check the new terminal windows for server status.
echo.
pause