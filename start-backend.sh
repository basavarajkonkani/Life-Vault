#!/bin/bash

# Kill any existing backend processes
pkill -f "simple-backend-with-trading.js" 2>/dev/null

# Start the backend
echo "🚀 Starting LifeVault Backend..."
node simple-backend-with-trading.js &

# Wait a moment for it to start
sleep 3

# Test if it's running
if curl -s http://localhost:3003/api/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:3003"
    echo "📱 Demo credentials:"
    echo "   Phone: Any number"
    echo "   OTP: 123456"
    echo "   PIN: 1234"
else
    echo "❌ Backend failed to start"
    exit 1
fi
