#!/bin/bash

echo "🧪 Testing Lok Password Manager Web App"
echo "======================================="

# Check if backend is running
echo "1️⃣ Checking backend status..."
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend not running. Starting backend..."
    cd backend && python run.py &
    BACKEND_PID=$!
    sleep 5
fi

# Check if frontend is running  
echo "2️⃣ Checking frontend status..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend not running. Starting frontend..."
    cd frontend && npm run dev &
    FRONTEND_PID=$!
    sleep 10
fi

# Run API tests
echo "3️⃣ Running API integration tests..."
cd backend && python tests/test_api.py

# Test frontend functionality
echo "4️⃣ Testing frontend functionality..."
echo "   📱 Open http://localhost:5173 in your browser"
echo "   🔐 Test user registration/login"
echo "   ➕ Test adding passwords"
echo "   🔍 Test search functionality"
echo "   🛡️ Test security dashboard"
echo "   ⚙️ Test settings and import/export"

echo ""
echo "🎯 Manual Test Checklist:"
echo "========================"
echo "□ User can register new account"
echo "□ User can login with credentials"
echo "□ User can add new password entries"
echo "□ User can view password vault"
echo "□ User can search passwords"
echo "□ User can generate secure passwords"
echo "□ User can view security dashboard"
echo "□ User can import/export passwords"
echo "□ User can access settings"
echo "□ User can logout securely"

# Cleanup function
cleanup() {
    echo "🧹 Cleaning up..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
}

trap cleanup EXIT

echo ""
echo "Press Ctrl+C to stop testing and cleanup processes"
wait