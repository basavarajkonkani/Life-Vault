#!/bin/bash

# LifeVault Supabase App Startup Script
echo "🚀 Starting LifeVault Application with Supabase..."

# Check if .env file exists and has Supabase keys
if [ ! -f "backend/.env" ]; then
    echo "❌ .env file not found in backend directory"
    echo "Please create .env file with your Supabase credentials"
    echo "See setup-supabase.md for instructions"
    exit 1
fi

# Check if Supabase keys are configured
if ! grep -q "SUPABASE_URL=https://iaeiiaurhafdgprvqkti.supabase.co" backend/.env; then
    echo "❌ Supabase URL not configured in .env file"
    echo "Please update backend/.env with your Supabase credentials"
    echo "See setup-supabase.md for instructions"
    exit 1
fi

if grep -q "your_anon_key_here" backend/.env; then
    echo "❌ Supabase API keys not configured in .env file"
    echo "Please update backend/.env with your actual Supabase API keys"
    echo "See setup-supabase.md for instructions"
    exit 1
fi

# Start backend
echo "🔧 Starting Supabase backend server..."
cd backend
node supabase-backend.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend is running
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo "❌ Backend failed to start"
    echo "Check your Supabase credentials and connection"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend started successfully on http://localhost:3001"

# Start frontend
echo "🎨 Starting frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "✅ Frontend starting on http://localhost:3000"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001/api"
echo "   Health Check: http://localhost:3001/api/health"
echo "   Supabase Dashboard: https://supabase.com/dashboard/project/iaeiiaurhafdgprvqkti"
echo ""
echo "📝 Demo Credentials:"
echo "   Phone: +91 9876543210"
echo "   OTP: 123456"
echo "   PIN: 1234"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait

# Cleanup
echo "🛑 Stopping servers..."
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null
echo "✅ Servers stopped"
