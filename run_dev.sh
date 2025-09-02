#!/bin/bash

# Development setup script for running both frontend and backend

echo "Starting development servers..."

# Function to handle cleanup
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend
echo "Starting FastAPI backend on port 8000..."
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "Starting Next.js frontend on port 3000..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Backend running at: http://localhost:8000"
echo "✅ Frontend running at: http://localhost:3000"
echo "✅ API docs available at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait