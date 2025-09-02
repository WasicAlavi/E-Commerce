#!/bin/bash

echo "🔄 Restarting servers with HTTPS configuration..."

# Stop any running processes on the ports
echo "Stopping existing processes..."
pkill -f "python.*main.py" || true
pkill -f "vite" || true

# Wait a moment
sleep 2

# Start backend server
echo "🚀 Starting backend server..."
cd ecommerce-backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend server with HTTPS
echo "🚀 Starting frontend server with HTTPS..."
cd ../Silk_Road
npm run dev &
FRONTEND_PID=$!

echo "✅ Servers started!"
echo "Backend: http://localhost:8000"
echo "Frontend: https://localhost:5173"
echo ""
echo "⚠️  Note: You may see a browser warning about the HTTPS certificate."
echo "   This is normal for localhost development. Click 'Advanced' and 'Proceed'."
echo ""
echo "To stop servers, press Ctrl+C"

# Wait for user to stop
wait 