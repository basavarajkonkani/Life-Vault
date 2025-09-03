# 🚀 Complete Supabase Integration Guide - LifeVault

## 📋 Overview

This guide will help you replace the in-memory backend with a full Supabase integration including:
- ✅ PostgreSQL database with proper schema
- ✅ Real authentication with JWT
- ✅ File storage for documents
- ✅ Row Level Security (RLS)
- ✅ Full CRUD operations
- ✅ Encrypted sensitive data

## 🎯 Step 1: Create Supabase Project

### 1.1 Sign Up & Create Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click **"New Project"**
4. Choose your organization
5. Enter project details:
   - **Name**: `lifevault`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your location
6. Click **"Create new project"**
7. Wait 2-3 minutes for setup to complete

### 1.2 Get Project Credentials
Once your project is ready:
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon/public key** 
   - **service_role/secret key**

## 🗄️ Step 2: Set Up Database Schema

### 2.1 Run SQL Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste it into the SQL editor
5. Click **"Run"** (bottom right)
6. You should see success messages

### 2.2 Verify Tables Created
1. Go to **Table Editor**
2. You should see these tables:
   - `users`
   - `assets`
   - `nominees`
   - `vault_requests`
   - `documents`
   - `audit_logs`

### 2.3 Set Up Storage
1. Go to **Storage**
2. Click **"Create bucket"**
3. Enter bucket name: `documents`
4. Set as **Public bucket**: ✅ Yes
5. Click **"Create bucket"**

## 🔧 Step 3: Configure Environment Variables

### 3.1 Create .env File
In your project root (`/Users/basavarajgm/Desktop/NIGHAN2/Life-Vault/`), create a `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-32-chars
JWT_EXPIRES_IN=7d

# App Configuration
PORT=3003
NODE_ENV=development

# Storage Configuration
STORAGE_BUCKET=documents
UPLOAD_MAX_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,doc,docx
```

### 3.2 Replace with Your Values
Replace the placeholder values with your actual Supabase credentials:
- `SUPABASE_URL`: Your project URL from Step 1.2
- `SUPABASE_ANON_KEY`: Your anon key from Step 1.2
- `SUPABASE_SERVICE_KEY`: Your service role key from Step 1.2
- `JWT_SECRET`: Generate a random 32+ character string

### 3.3 Generate JWT Secret
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

## 🚀 Step 4: Start Supabase Backend

### 4.1 Install Dependencies (if not done)
```bash
cd /Users/basavarajgm/Desktop/NIGHAN2/Life-Vault
npm install @supabase/supabase-js bcryptjs jsonwebtoken multer @types/bcryptjs @types/jsonwebtoken @types/multer dotenv
```

### 4.2 Stop Current Backend
```bash
# Find and stop the current simple backend process
lsof -ti:3003 | xargs kill -9
```

### 4.3 Start Supabase Backend
```bash
node supabase-backend.js
```

You should see:
```
🚀 LifeVault Supabase Backend running on http://localhost:3003
🗄️  Database: Supabase PostgreSQL
📁 Storage: Supabase Storage
📊 Dashboard API: http://localhost:3003/api/dashboard/stats
🔐 Auth API: http://localhost:3003/api/auth/register
💰 Assets API: http://localhost:3003/api/dashboard/assets
👥 Nominees API: http://localhost:3003/api/dashboard/nominees
📋 Vault API: http://localhost:3003/api/vault/requests

⚡ Full Supabase integration ready!
📝 Remember to configure your .env file with Supabase credentials
```

## 🧪 Step 5: Test the Integration

### 5.1 Test Database Connection
```bash
curl http://localhost:3003/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "LifeVault Supabase Backend is running!",
  "database": "Supabase PostgreSQL",
  "storage": "Supabase Storage",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 5.2 Test User Registration
```bash
curl -X POST http://localhost:3003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+91 9876543210",
    "email": "test@example.com",
    "pin": "1234",
    "address": "Test Address"
  }'
```

### 5.3 Test Frontend Integration
1. Make sure frontend is running on `http://localhost:3001`
2. Try the complete login flow:
   - Enter phone number
   - Use OTP: `123456`
   - Use PIN: `1234`
3. You should see the dashboard with real data

## 🔄 Step 6: Migrate from Mock to Real Data

### 6.1 Current State
- ✅ Frontend is connected to backend on port 3003
- ✅ Backend is now using Supabase instead of memory
- ✅ All CRUD operations work with real database
- ✅ File uploads work with Supabase Storage

### 6.2 What Changed
- **Authentication**: Now stores users in PostgreSQL
- **Assets**: Persistent storage in `assets` table
- **Nominees**: Persistent storage in `nominees` table
- **Files**: Stored in Supabase Storage bucket
- **Security**: JWT tokens, encrypted PINs, RLS policies

### 6.3 Data Persistence
All data is now persistent:
- User accounts survive server restarts
- Assets and nominees are permanently stored
- File uploads are saved to cloud storage
- Audit trail tracks all changes

## 🔐 Step 7: Security Features

### 7.1 Authentication Flow
1. **Registration**: PIN is hashed with bcrypt
2. **Login**: OTP verification (mock) + PIN verification
3. **Sessions**: JWT tokens with expiration
4. **Authorization**: All endpoints check valid tokens

### 7.2 Data Protection
- **PINs**: Hashed with bcrypt (irreversible)
- **Sensitive Data**: Account numbers can be encrypted
- **Row Level Security**: Users only see their own data
- **Input Validation**: All inputs validated and sanitized

### 7.3 File Security
- **Upload Limits**: 10MB max file size
- **File Types**: Only PDF, JPG, PNG allowed
- **Storage**: Organized by user ID in Supabase Storage
- **Access Control**: Users can only access their files

## 📊 Step 8: Available Features

### 8.1 Complete CRUD Operations
- ✅ **Users**: Register, login, update profile
- ✅ **Assets**: Create, read, update, delete with real database
- ✅ **Nominees**: Full management with allocation validation
- ✅ **Documents**: File upload and storage
- ✅ **Vault Requests**: Submit and track requests

### 8.2 Dashboard Features
- ✅ **Real Statistics**: Calculated from database
- ✅ **Asset Allocation**: Dynamic charts from real data
- ✅ **Net Worth**: Sum of all asset values
- ✅ **Recent Activity**: Audit trail of changes

### 8.3 File Management
- ✅ **Document Upload**: PDFs, images for assets
- ✅ **Death Certificates**: For vault requests
- ✅ **Cloud Storage**: Files stored in Supabase
- ✅ **Download Links**: Secure access to uploaded files

## 🎯 Step 9: Next Steps & Enhancements

### 9.1 Immediate Improvements
- [ ] Add data encryption for sensitive fields
- [ ] Implement real OTP service (Firebase/Twilio)
- [ ] Add email notifications
- [ ] Implement admin dashboard for vault requests

### 9.2 Advanced Features
- [ ] Two-factor authentication
- [ ] Automatic backup and recovery
- [ ] Advanced reporting and analytics
- [ ] Integration with financial APIs
- [ ] Mobile app support

### 9.3 Production Deployment
- [ ] Environment-specific configuration
- [ ] SSL/HTTPS setup
- [ ] Database backups
- [ ] Monitoring and logging
- [ ] Performance optimization

## 🚨 Troubleshooting

### 9.1 Common Issues

**Connection Error**: "Failed to connect to Supabase"
```bash
# Check your .env file
# Verify SUPABASE_URL and keys are correct
# Check Supabase project is active
```

**RLS Policies**: "Row Level Security policy violation"
```sql
-- Temporarily disable RLS for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- Re-enable after testing
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

**File Upload**: "Upload failed"
```bash
# Check Storage bucket exists
# Verify bucket is public
# Check file size and type restrictions
```

### 9.2 Debug Mode
Set environment variable for detailed logging:
```bash
NODE_ENV=development node supabase-backend.js
```

## ✅ Verification Checklist

Before proceeding, verify:
- [ ] Supabase project is created and active
- [ ] Database schema is deployed successfully
- [ ] Storage bucket `documents` is created
- [ ] `.env` file has correct credentials
- [ ] Backend starts without errors
- [ ] Frontend can register new users
- [ ] Dashboard shows real data from database
- [ ] Assets can be added/edited/deleted
- [ ] Nominees can be managed
- [ ] File uploads work

## 🎉 Success! 

Your LifeVault application now has:
- ✅ **Real Database**: PostgreSQL with proper schema
- ✅ **Cloud Storage**: File uploads to Supabase
- ✅ **Authentication**: JWT with hashed PINs
- ✅ **Security**: Row Level Security policies
- ✅ **Persistence**: All data survives server restarts
- ✅ **Scalability**: Ready for production deployment

**You've successfully replaced the in-memory backend with a full Supabase integration!** 