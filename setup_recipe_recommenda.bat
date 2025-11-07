@echo off
echo ========================================
echo    Recipe Recommenda Setup Wizard
echo ========================================
echo.

echo This script will help you set up Recipe Recommenda on your system.
echo.

echo [Step 1] Checking system requirements...
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH!
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
) else (
    echo ✓ Python is installed
    python --version
)

node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH!
    echo Please install Node.js 14+ from https://nodejs.org
    pause
    exit /b 1
) else (
    echo ✓ Node.js is installed
    node --version
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed or not in PATH!
    echo Please install Node.js which includes npm
    pause
    exit /b 1
) else (
    echo ✓ npm is installed
    npm --version
)

echo.
echo [Step 2] Setting up Python backend...
cd backend

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
) else (
    echo ✓ Virtual environment already exists
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -r requirements.txt

if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies!
    pause
    exit /b 1
) else (
    echo ✓ Python dependencies installed successfully
)

echo.
echo [Step 3] Setting up React frontend...
cd ..\frontend

echo Installing Node.js dependencies...
npm install

if errorlevel 1 (
    echo ERROR: Failed to install Node.js dependencies!
    pause
    exit /b 1
) else (
    echo ✓ Node.js dependencies installed successfully
)

cd ..

echo.
echo [Step 4] Setting up environment files...

if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env"
        echo ✓ Backend .env file created from example
        echo   Please edit backend\.env with your Supabase credentials
    ) else (
        echo ! Backend .env.example not found
    )
) else (
    echo ✓ Backend .env file already exists
)

if not exist "frontend\.env" (
    if exist "frontend\.env.example" (
        copy "frontend\.env.example" "frontend\.env"
        echo ✓ Frontend .env file created from example
    ) else (
        echo ! Frontend .env.example not found
    )
) else (
    echo ✓ Frontend .env file already exists
)

echo.
echo ========================================
echo       Setup Complete! 🎉
echo ========================================
echo.
echo Next steps:
echo 1. Configure your Supabase database:
echo    - Create account at https://supabase.com
echo    - Create new project
echo    - Run SUPABASE_SCHEMA_COMPLETE.sql
echo    - Update backend\.env with your credentials
echo.
echo 2. Start the application:
echo    - Run: start_recipe_recommenda.bat
echo    - Or manually start backend and frontend
echo.
echo 3. Access Recipe Recommenda:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:5000
echo.
echo For detailed instructions, see SETUP_INSTRUCTIONS.md
echo.
pause