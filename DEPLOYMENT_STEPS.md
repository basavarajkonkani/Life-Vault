# 🚀 LifeVault Deployment Guide (FREE)

## ✅ Current Status
- Code is ready ✅
- GitHub repo is set up ✅
- Supabase is configured ✅

## 📱 Step 1: Deploy Frontend (GitHub Pages)

**Go to:** https://github.com/basavarajkonkani/Life-Vault/settings/pages

1. Under **"Source"** → Select **"GitHub Actions"**
2. Click **"Save"**
3. Wait 2-3 minutes for build

**Result:** https://basavarajkonkani.github.io/Life-Vault

---

## ⚙️ Step 2: Deploy Backend (Railway)

**Go to:** https://railway.app

1. **Login with GitHub**
2. **New Project** → **Deploy from GitHub repo**
3. **Select:** `basavarajkonkani/Life-Vault`
4. **Settings** → **Start Command:** `node production-backend.js`
5. **Variables** → Add these:

```
NODE_ENV=production
SUPABASE_URL=https://iaeiaurhafdgprvqkti.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZWlhdXJoYWZkZ3BydnFrdGkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyNTM1ODQ3MywiZXhwIjoyMDQwOTM0NDczfQ.9pJYFRm3Mru_UzTNx4q4lhLMxm38QHlQQHGV8vvjFTY
JWT_SECRET=lifevault-super-secret-2024
```

6. **Deploy** ✅

**Result:** Railway will give you a URL like `https://lifevault-production.up.railway.app`

---

## 🔗 Step 3: Connect Frontend to Backend

1. **Copy your Railway URL** (from Railway dashboard)
2. **Go to:** https://github.com/basavarajkonkani/Life-Vault/settings/secrets/actions
3. **New repository secret:**
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://your-railway-url.railway.app/api`
4. **Push any small change** to trigger redeploy

---

## 🎯 Final URLs

- **Frontend:** https://basavarajkonkani.github.io/Life-Vault
- **Backend:** https://your-railway-url.railway.app
- **Total Cost:** $0 (FREE!) 🎉

---

## 📞 Need Help?

Come back here after each step and I'll help you with the next one! 