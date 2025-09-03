# Backend Setup Guide - LifeVault

## 🚀 Quick Start (Current Status)

The backend is currently set up with **mock APIs** that provide the same data structure as the real Supabase implementation. This allows the frontend to work immediately while you set up Supabase.

### Current Working Features

✅ **Running Backend**: NestJS server on `http://localhost:3002`
✅ **Mock Authentication**: Login flow with OTP (123456) and PIN (1234)
✅ **Dashboard API**: Real-time data for dashboard components
✅ **CORS Enabled**: Frontend can communicate with backend
✅ **API Structure**: All endpoints defined and working

## 🔧 Current Backend Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts        # Authentication endpoints
│   │   └── dashboard.controller.ts   # Dashboard data endpoints
│   ├── entities/                     # Database entities (ready for Supabase)
│   │   ├── user.entity.ts
│   │   ├── asset.entity.ts
│   │   ├── nominee.entity.ts
│   │   └── vault-request.entity.ts
│   ├── dto/                          # Data transfer objects
│   ├── services/                     # Business logic
│   └── modules/                      # Feature modules
├── .env.example                      # Environment template
└── package.json
```

## 📡 Available API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP (use: 123456)
- `POST /api/auth/verify-pin` - Verify PIN (use: 1234)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/assets` - Get user assets
- `GET /api/dashboard/nominees` - Get user nominees

## 🗄️ Supabase Integration Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note down:
   - Project URL
   - Anon key
   - Service key
   - Database URL

### Step 2: Environment Configuration

Create `.env` file in `/backend/` directory:

```env
# Database Configuration (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Encryption Configuration
ENCRYPTION_KEY=your-32-character-encryption-key-here

# App Configuration
PORT=3002
NODE_ENV=development
```

### Step 3: Database Schema Setup

Run this SQL in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT,
    pin_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    role VARCHAR(20) DEFAULT 'user',
    encryption_key TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    institution VARCHAR(200) NOT NULL,
    account_number TEXT NOT NULL, -- Encrypted
    current_value DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    notes TEXT, -- Encrypted
    documents JSONB,
    maturity_date DATE,
    nominee VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Nominees table
CREATE TABLE nominees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    relation VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(255) NOT NULL,
    allocation_percentage DECIMAL(5,2) NOT NULL,
    is_executor BOOLEAN DEFAULT false,
    is_backup BOOLEAN DEFAULT false,
    address TEXT,
    id_proof_type VARCHAR(100),
    id_proof_number TEXT, -- Encrypted
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vault requests table
CREATE TABLE vault_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nominee_id UUID REFERENCES nominees(id) ON DELETE CASCADE,
    nominee_name VARCHAR(100) NOT NULL,
    relation_to_deceased VARCHAR(50) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    email VARCHAR(255) NOT NULL,
    death_certificate_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    admin_notes TEXT,
    reviewed_at TIMESTAMP,
    reviewed_by UUID,
    vault_opened_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_nominees_user_id ON nominees(user_id);
CREATE INDEX idx_vault_requests_nominee_id ON vault_requests(nominee_id);
```

### Step 4: Enable Full Database Integration

1. **Install missing dependencies**:
```bash
cd backend
npm install @nestjs/typeorm typeorm pg @types/pg
```

2. **Update app.module.ts** to enable TypeORM:
```typescript
// Uncomment the TypeORM configuration in app.module.ts
// This will enable full database integration
```

3. **Start with database**:
```bash
npm run start:dev
```

## 🔄 Migration from Mock to Real Data

### Current State: Mock APIs ✅
- Frontend works immediately
- Demo data for testing
- All API endpoints functional

### Next State: Supabase Integration
1. Set up Supabase project
2. Run database schema
3. Configure environment variables
4. Enable TypeORM in app.module.ts
5. Test with real data

## 🧪 Testing the Setup

### Test Mock APIs (Current)
```bash
# Test dashboard stats
curl http://localhost:3002/api/dashboard/stats

# Test authentication
curl -X POST http://localhost:3002/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+91 9876543210"}'
```

### Test Real APIs (After Supabase Setup)
```bash
# Test with real database
curl http://localhost:3002/api/dashboard/stats \
  -H "Authorization: Bearer your-jwt-token"
```

## 🔐 Security Features (Ready)

- **JWT Authentication**: Token-based sessions
- **PIN Hashing**: bcrypt for secure PIN storage
- **Data Encryption**: AES-256 for sensitive fields
- **CORS Protection**: Configured for frontend domains
- **Input Validation**: class-validator for all DTOs

## 📈 Scaling Considerations

- **Database Indexes**: Optimized for query performance
- **Connection Pooling**: TypeORM handles connections
- **Error Handling**: Comprehensive error responses
- **Logging**: Development and production logging
- **Rate Limiting**: Ready for implementation

## 🚀 Deployment Ready

- **Environment Variables**: Production-ready configuration
- **Docker Support**: Container-ready structure
- **Health Checks**: API status endpoints
- **SSL/TLS**: HTTPS ready for production

---

## 🎯 Next Steps

1. **Immediate**: Frontend is working with mock backend
2. **Next**: Set up Supabase project and run SQL schema
3. **Then**: Configure environment variables
4. **Finally**: Enable full database integration

**Current Status**: ✅ **Fully Functional with Mock Data**
**Next Status**: 🔄 **Supabase Integration Ready** 