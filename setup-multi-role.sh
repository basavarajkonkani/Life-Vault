#!/bin/bash

echo "🚀 Setting up LifeVault Multi-Role System"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "🎯 Multi-Role System Setup Complete!"
echo ""
echo "📋 Available Roles and Demo Credentials:"
echo "========================================"
echo ""
echo "🔵 Asset Owner:"
echo "   Phone: +91 9876543210"
echo "   OTP: 123456"
echo "   PIN: 1234"
echo "   Features: Manage assets, add nominees, view reports, switch to nominee preview"
echo ""
echo "🟢 Nominee:"
echo "   Phone: +91 9876543211"
echo "   OTP: 123456"
echo "   PIN: Not required"
echo "   Features: View assigned assets, submit vault requests, upload death certificates"
echo ""
echo "🟣 Admin:"
echo "   Phone: +91 9999999999"
echo "   OTP: 123456"
echo "   PIN: 1234"
echo "   Features: Review vault requests, approve/reject requests, create other admins"
echo ""
echo "🚀 To start the system:"
echo "======================"
echo ""
echo "1. Start the backend:"
echo "   node multi-role-backend.js"
echo ""
echo "2. Start the frontend (in another terminal):"
echo "   cd frontend && npm start"
echo ""
echo "3. Open your browser to:"
echo "   http://localhost:3000"
echo ""
echo "📁 Files created:"
echo "================="
echo "✅ supabase-schema-multi-role.sql - Updated database schema"
echo "✅ multi-role-backend.js - Multi-role backend server"
echo "✅ frontend/src/pages/Login-multi-role.tsx - Role selection login"
echo "✅ frontend/src/pages/OwnerDashboard.tsx - Owner dashboard with preview mode"
echo "✅ frontend/src/pages/NomineeDashboard.tsx - Nominee dashboard"
echo "✅ frontend/src/pages/AdminDashboard.tsx - Admin dashboard"
echo "✅ frontend/src/services/api-multi-role.ts - Updated API service"
echo "✅ frontend/src/App-multi-role.tsx - Role-based routing"
echo "✅ frontend/src/components/Layout-multi-role.tsx - Role-based navigation"
echo ""
echo "🔄 To switch to multi-role system:"
echo "=================================="
echo ""
echo "1. Replace the current files with the multi-role versions:"
echo "   cp frontend/src/pages/Login-multi-role.tsx frontend/src/pages/Login.tsx"
echo "   cp frontend/src/services/api-multi-role.ts frontend/src/services/api.ts"
echo "   cp frontend/src/App-multi-role.tsx frontend/src/App.tsx"
echo "   cp frontend/src/components/Layout-multi-role.tsx frontend/src/components/Layout.tsx"
echo ""
echo "2. Start the multi-role backend instead of simple-backend.js:"
echo "   node multi-role-backend.js"
echo ""
echo "🎉 Happy testing!"
