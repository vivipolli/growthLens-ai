#!/bin/bash

echo "🚀 Starting Hedera Growth Platform Development Environment..."

# Function to check if a port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
}

# Function to start backend
start_backend() {
    echo "🔧 Starting Backend Server (Port 3001)..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    echo "✅ Backend started with PID: $BACKEND_PID"
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting Frontend Server (Port 5173)..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend started with PID: $FRONTEND_PID"
    cd ..
}

# Check if ports are already in use
if check_port 3001; then
    echo "⚠️  Port 3001 (Backend) is already in use"
else
    start_backend
fi

if check_port 5173; then
    echo "⚠️  Port 5173 (Frontend) is already in use"
else
    start_frontend
fi

echo ""
echo "🌐 Development Environment Status:"
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:5173"
echo ""
echo "📊 Health Check:"
sleep 3
curl -s http://localhost:3001/api/agent/health > /dev/null && echo "   ✅ Backend: Healthy" || echo "   ❌ Backend: Unhealthy"
curl -s http://localhost:5173 > /dev/null && echo "   ✅ Frontend: Running" || echo "   ❌ Frontend: Not responding"
echo ""
echo "🔗 Quick Links:"
echo "   Frontend: http://localhost:5173"
echo "   Backend Health: http://localhost:3001/api/agent/health"
echo ""
echo "💡 To stop servers: pkill -f 'npm run dev'"
echo "💡 To view logs: tail -f backend/logs/*.log" 