# 🏦 LifeVault - Digital Nominee Helper

**A secure digital inheritance and asset management platform built with React.js, Express.js, and Supabase.**

## 🎯 Project Overview

LifeVault helps users securely store, track, and transfer asset information to nominees after death. Built with a government-like trustable design (DigiLocker style) in blue and white theme.

## 🚀 **Current Status: FULLY FUNCTIONAL + SUPABASE READY**

### ✅ **Working Right Now**
- **Frontend**: React.js + Tailwind CSS on `http://localhost:3001`
- **Backend**: Express.js API on `http://localhost:3003`
- **Authentication**: OTP (123456) + PIN (1234) login flow
- **Dashboard**: Real data from backend API
- **Assets & Nominees**: Full CRUD operations

### 🔄 **Two Backend Options Available**

#### **Option 1: In-Memory Backend (Currently Running)**
- ✅ **Immediate use** - works right now
- ✅ **Zero setup** - no database required
- ✅ **Perfect for demo** - showcases all features
- ❌ **Data lost on restart** - not persistent
- 📁 **File**: `simple-backend.js`

#### **Option 2: Supabase Backend (Production Ready)**
- ✅ **Persistent data** - survives server restarts
- ✅ **Real authentication** - JWT + bcrypt hashing
- ✅ **File uploads** - cloud storage
- ✅ **Multi-user support** - isolated user data
- ✅ **Production ready** - scalable and secure
- 📁 **File**: `supabase-backend.js`
- ⏱️ **Setup time**: ~12 minutes

## 🏗️ **Architecture**

```
Frontend (React.js)  ←→  Backend (Express.js)  ←→  Database (Option)
     ↓                        ↓                      ↓
- Tailwind CSS          - REST API              - In-Memory (Option 1)
- Recharts              - JWT Auth              - Supabase PostgreSQL (Option 2)
- React Router          - File Upload           - Supabase Storage (Option 2)
- Axios API             - CORS Enabled          - Row Level Security (Option 2)
```

## 🎨 **Features**

### **Core Features (Working)**
- 🔐 **Authentication**: Phone + OTP + PIN flow
- 📊 **Dashboard**: Asset overview, net worth, charts
- 💰 **Asset Management**: Add/edit/delete Bank, LIC, PF, Property, Stocks, Crypto
- 👥 **Nominee Management**: Allocation percentages, executor roles
- 🏦 **Vault Access**: Nominee login and death certificate upload
- 📘 **Claim Guides**: Step-by-step guides for LIC, PF, Bank, Property
- 📈 **Reports**: Analytics with charts and PDF export
- ⚙️ **Settings**: Profile, security, notifications

### **Additional Features (Supabase Only)**
- 📁 **File Uploads**: Documents, death certificates
- 👤 **User Registration**: Create new accounts
- 🔒 **Data Persistence**: Real database storage
- 🔍 **Audit Trail**: Complete change logging
- 🚫 **User Isolation**: Each user sees only their data

## 🚀 **Quick Start**

### **Immediate Demo (No Setup)**
```bash
# Frontend (already running)
http://localhost:3001

# Backend API
http://localhost:3003

# Login Credentials
Phone: Any number
OTP: 123456
PIN: 1234
```

### **Production Setup (12 minutes)**
```bash
# 1. Follow the Supabase setup guide
open SUPABASE_SETUP_GUIDE.md

# 2. Create Supabase project and get credentials

# 3. Create .env file with your credentials

# 4. Start Supabase backend
node supabase-backend.js

# 5. Frontend automatically connects to new backend
```

## 📂 **Project Structure**

```
Life-Vault/
├── frontend/                    # React.js application
│   ├── src/
│   │   ├── components/         # Layout, Notification
│   │   ├── pages/              # Dashboard, Assets, Nominees, etc.
│   │   ├── services/           # API integration
│   │   └── styles/             # Tailwind CSS
│   └── public/
├── backend/                     # NestJS (future expansion)
├── simple-backend.js           # In-memory Express backend (current)
├── supabase-backend.js         # Supabase Express backend (ready)
├── supabase-schema.sql         # PostgreSQL database schema
├── SUPABASE_SETUP_GUIDE.md     # Step-by-step Supabase setup
├── MIGRATION_STATUS.md         # Migration overview
└── package.json                # Monorepo configuration
```

## 🛠️ **Technology Stack**

### **Frontend**
- **React.js 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with blue/white theme
- **Recharts** - Data visualization
- **React Router** - Navigation
- **Axios** - API communication
- **Lucide React** - Icons

### **Backend (Current)**
- **Express.js** - Web framework
- **CORS** - Cross-origin requests
- **JSON** - In-memory data storage

### **Backend (Supabase)**
- **Express.js** - Web framework
- **Supabase Client** - Database and storage
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **multer** - File upload handling

### **Database (Supabase)**
- **PostgreSQL** - Primary database
- **Supabase Storage** - File storage
- **Row Level Security** - Data protection
- **Real-time subscriptions** - Live updates

## 🔐 **Security Features**

### **Current (In-Memory)**
- ✅ Input validation
- ✅ CORS protection
- ✅ Mock authentication flow

### **Supabase Addition**
- ✅ **JWT Authentication** - Secure sessions
- ✅ **PIN Hashing** - bcrypt encryption
- ✅ **Row Level Security** - Database-level protection
- ✅ **User Isolation** - Each user sees only their data
- ✅ **File Upload Security** - Type and size validation
- ✅ **SQL Injection Protection** - Parameterized queries

## 📊 **API Endpoints**

### **Authentication**
```bash
POST /api/auth/send-otp        # Send OTP to phone
POST /api/auth/verify-otp      # Verify OTP code
POST /api/auth/verify-pin      # Verify PIN and login
POST /api/auth/register        # Create new user (Supabase only)
```

### **Dashboard**
```bash
GET  /api/dashboard/stats      # Dashboard statistics
GET  /api/dashboard/assets     # User assets
GET  /api/dashboard/nominees   # User nominees
```

### **Assets**
```bash
GET    /api/dashboard/assets   # List all assets
POST   /api/assets             # Create new asset
PUT    /api/assets/:id         # Update asset
DELETE /api/assets/:id         # Delete asset
```

### **Nominees**
```bash
GET    /api/dashboard/nominees # List all nominees
POST   /api/nominees           # Create new nominee
PUT    /api/nominees/:id       # Update nominee
DELETE /api/nominees/:id       # Delete nominee
```

### **Files (Supabase Only)**
```bash
POST /api/upload              # Upload document
```

## 🧪 **Testing**

### **Frontend Testing**
```bash
cd frontend
npm test
```

### **API Testing**
```bash
# Health check
curl http://localhost:3003/api/health

# Dashboard data
curl http://localhost:3003/api/dashboard/stats

# Authentication flow
curl -X POST http://localhost:3003/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+91 9876543210"}'
```

## 📖 **Documentation**

- 📘 **[Supabase Setup Guide](SUPABASE_SETUP_GUIDE.md)** - Complete migration guide
- 📊 **[Migration Status](MIGRATION_STATUS.md)** - In-memory vs Supabase comparison
- 🏗️ **[Backend Setup](BACKEND_SETUP.md)** - NestJS setup guide (advanced)

## 🚀 **Deployment Options**

### **Frontend Deployment**
- **Vercel** - Recommended for React apps
- **Netlify** - Alternative static hosting
- **GitHub Pages** - Free option

### **Backend Deployment**
- **Railway** - Easy Express.js deployment
- **Render** - Free tier available
- **Heroku** - Traditional PaaS
- **Supabase Edge Functions** - Serverless option

### **Database**
- **Supabase** - Managed PostgreSQL (recommended)
- **Railway PostgreSQL** - Alternative
- **Render PostgreSQL** - Integrated option

## 🤝 **Contributing**

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

### **For Demo/Testing**
- Use the current setup - everything works out of the box
- Login: Any phone + OTP: 123456 + PIN: 1234

### **For Production**
- Follow `SUPABASE_SETUP_GUIDE.md`
- Create issues for bugs or feature requests
- Check `MIGRATION_STATUS.md` for current capabilities

---

## 🎯 **Current Status Summary**

**✅ FULLY FUNCTIONAL**: Complete digital inheritance platform
**✅ DEMO READY**: Works immediately without setup
**✅ PRODUCTION READY**: Supabase backend available
**✅ SECURE**: JWT auth, PIN hashing, RLS policies
**✅ SCALABLE**: Cloud-native architecture
**✅ DOCUMENTED**: Complete setup guides

**🚀 Ready to use immediately or deploy to production!** 