# 🚀 Quick Supabase Setup Guide

## Step 1: Get Supabase Credentials

1. **Go to [supabase.com](https://supabase.com)** and create account
2. **Create new project** (takes 2-3 minutes)
3. **Go to Settings → API** and copy:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon public key** 

## Step 2: Configure Environment

Create a `.env` file in your project root:

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your credentials
nano .env
```

Replace these values in `.env`:
```env
SUPABASE_URL=https://your-actual-project.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key-here
JWT_SECRET=your-super-secret-jwt-key-here
```

## Step 3: Set Up Database

1. **Go to Supabase Dashboard → SQL Editor**
2. **Copy the contents** of `supabase-schema.sql`
3. **Paste and run** the SQL to create tables

## Step 4: Test the Connection

```bash
# Stop current backend
lsof -ti:3003 | xargs kill -9

# Start Supabase backend
node supabase-backend-updated.js
```

You should see:
```
✅ Supabase client initialized
🔗 Connected to: https://your-project.supabase.co
🚀 LifeVault Supabase Backend running on http://localhost:3003
🗄️  Database: Supabase PostgreSQL
```

## Step 5: Test API

```bash
# Test health check
curl http://localhost:3003/api/health

# Register a test user
curl -X POST http://localhost:3003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+91 9876543210", 
    "email": "test@example.com",
    "pin": "1234"
  }'
```

## 🎉 Success!

If everything works, your backend is now using **real Supabase database** instead of in-memory data!

- ✅ **Users** stored in Supabase
- ✅ **Assets** persist across restarts  
- ✅ **Nominees** saved to database
- ✅ **Authentication** with real JWT tokens 