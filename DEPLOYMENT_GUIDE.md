# 🚀 LifeVault Production Deployment Guide

## 📋 Overview

This guide will help you deploy your LifeVault Digital Inheritance Platform to production using:
- **Frontend**: Vercel (React app)
- **Backend**: Render (Node.js API)
- **Database**: Supabase (PostgreSQL - already setup)

## 🎯 Deployment Architecture

```
Users → Vercel (Frontend) → Render (Backend) → Supabase (Database)
```

---

## 📱 STEP 1: Deploy Frontend to Vercel

### Method A: GitHub Integration (Recommended)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Import Repository**:
   - Search for `basavarajkonkani/Life-Vault`
   - Click "Import"
5. **Configure Project**:
   - **Framework Preset**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

6. **Environment Variables** (click "Add"):
   ```
   REACT_APP_API_URL=https://your-backend-name.onrender.com/api
   ```
   *(You'll update this after deploying backend)*

7. **Click "Deploy"** ✅

8. **Your frontend will be live at**: `https://your-project-name.vercel.app`

### Method B: CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow the prompts
```

---

## ⚙️ STEP 2: Deploy Backend to Render

### Method A: GitHub Integration (Recommended)

1. **Go to [render.com](https://render.com)**
2. **Sign up/Login** with GitHub
3. **Click "New +"** → **"Web Service"**
4. **Connect Repository**:
   - Select `basavarajkonkani/Life-Vault`
   - Click "Connect"

5. **Configure Service**:
   - **Name**: `lifevault-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (root)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node production-backend.js`
   - **Plan**: Free (or paid for better performance)

6. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   JWT_SECRET=your-super-secret-jwt-key-here
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

7. **Click "Create Web Service"** ✅

8. **Your backend will be live at**: `https://lifevault-backend.onrender.com`

### Method B: CLI Deployment

```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# Deploy
render deploy
```

---

## 🔄 STEP 3: Update Frontend with Backend URL

1. **Go back to Vercel Dashboard**
2. **Select your frontend project**
3. **Go to Settings** → **Environment Variables**
4. **Update**:
   ```
   REACT_APP_API_URL=https://lifevault-backend.onrender.com/api
   ```
5. **Save** and **redeploy**

---

## 🗄️ STEP 4: Verify Database Connection

Your Supabase database is already configured! Just verify:

1. **Go to [supabase.com](https://supabase.com)** → Your project
2. **Check Tables**: users, assets, nominees, vault_requests ✅
3. **Check RLS**: Should show "Restricted" ✅
4. **API Keys**: Already configured in backend ✅

---

## 🧪 STEP 5: Test Production Deployment

### Test Backend
```bash
# Health check
curl https://lifevault-backend.onrender.com/api/health

# Should return:
# {"status":"OK","message":"LifeVault Production Backend is running!"}
```

### Test Frontend
1. **Visit**: `https://your-project.vercel.app`
2. **Register** a new account
3. **Login** with OTP (123456) and PIN
4. **Add an asset** and **nominee**
5. **Verify data** persists in Supabase

---

## 🔒 STEP 6: Security & Environment Variables

### Required Environment Variables

**Frontend (Vercel)**:
```env
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

**Backend (Render)**:
```env
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-secure-secret-key
FRONTEND_URL=https://your-frontend.vercel.app
```

### Security Checklist
- ✅ Environment variables set
- ✅ CORS configured for production URLs
- ✅ JWT secret is strong and unique
- ✅ Supabase RLS policies enabled
- ✅ File upload validation in place
- ✅ HTTPS enforced (automatic on Vercel/Render)

---

## 🚀 STEP 7: Custom Domain (Optional)

### Frontend (Vercel)
1. **Go to Vercel Dashboard** → **Settings** → **Domains**
2. **Add your domain**: `lifevault.yourdomain.com`
3. **Configure DNS** with your domain provider
4. **SSL**: Automatic ✅

### Backend (Render)
1. **Go to Render Dashboard** → **Settings** → **Custom Domains**
2. **Add domain**: `api.yourdomain.com`
3. **Configure DNS** CNAME record
4. **SSL**: Automatic ✅

---

## 📊 STEP 8: Monitoring & Scaling

### Vercel Analytics
- **Go to Vercel Dashboard** → **Analytics**
- **Monitor**: Page views, performance, errors

### Render Monitoring
- **Go to Render Dashboard** → **Metrics**
- **Monitor**: CPU, memory, response times

### Supabase Monitoring
- **Go to Supabase Dashboard** → **Reports**
- **Monitor**: Database size, API calls, performance

---

## 🔧 Troubleshooting

### Common Issues

**1. Frontend can't connect to backend**
- Check `REACT_APP_API_URL` environment variable
- Verify backend is running: `curl https://your-backend.onrender.com/api/health`
- Check CORS settings in backend

**2. Database connection errors**
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Check Supabase project is active
- Verify RLS policies allow operations

**3. Authentication not working**
- Check `JWT_SECRET` is set and consistent
- Verify user registration flow
- Check browser console for errors

**4. File uploads failing**
- Check file size limits (10MB)
- Verify file types (PDF, JPG, PNG)
- Check backend logs for upload errors

### Getting Help

1. **Check logs**:
   - Vercel: Dashboard → Functions → View Logs
   - Render: Dashboard → Logs
   - Supabase: Dashboard → Logs

2. **Test endpoints**:
   ```bash
   curl https://your-backend.onrender.com/api/health
   curl https://your-backend.onrender.com/
   ```

---

## 🎉 Success!

Your LifeVault Digital Inheritance Platform is now live in production!

### URLs
- **Frontend**: https://your-project.vercel.app
- **Backend API**: https://your-backend.onrender.com
- **Database**: Supabase (managed)

### Features Live
- ✅ User registration and authentication
- ✅ Asset management with file uploads
- ✅ Nominee management with allocations
- ✅ Vault access system
- ✅ Dashboard analytics
- ✅ Secure data isolation (RLS)
- ✅ Production-grade security

### Next Steps
- Set up monitoring and alerts
- Configure backup strategies
- Plan feature updates
- Scale as needed

**Congratulations on deploying your production-ready digital inheritance platform!** 🚀 