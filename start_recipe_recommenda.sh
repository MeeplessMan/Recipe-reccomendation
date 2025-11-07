#!/bin/bash
echo "Starting Recipe Recommenda Development Servers..."
echo ""

echo "[1/3] Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "[2/3] Setting up frontend..."
cd ../frontend
echo "Installing Node.js dependencies..."
npm install

echo ""
echo "[3/3] Starting servers..."
echo "Backend will start on: http://localhost:5000"
echo "Frontend will start on: http://localhost:3000"
echo ""

# Start backend in background
cd ../backend
source venv/bin/activate
python app.py &

# Start frontend
cd ../frontend
npm start &

echo ""
echo "Recipe Recommenda servers are starting..."
echo "Backend PID: $!"
echo "Access the application at: http://localhost:3000"
echo ""
echo "To stop the servers, press Ctrl+C"

# Wait for user input to keep script running
wait