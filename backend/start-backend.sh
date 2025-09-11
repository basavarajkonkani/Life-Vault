#!/bin/bash

echo "🚀 Starting LifeVault Backend with Supabase..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it with your Supabase credentials."
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Kill any existing backend process
pkill -f "simple-supabase-backend" 2>/dev/null

# Start the backend
echo "🔧 Starting backend server..."
node simple-supabase-backend.js

