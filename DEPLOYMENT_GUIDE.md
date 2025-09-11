# 🚀 Life-Vault Deployment Guide

## Deployment Options

### Option 1: Vercel + Heroku (Recommended)

#### Frontend (Vercel) - FREE
1. **Deploy Frontend to Vercel:**
   ```bash
   cd frontend
   vercel login
   vercel --prod
   ```

2. **Update API URL:**
   - After backend deployment, update `REACT_APP_API_URL` in Vercel dashboard
   - Go to Project Settings > Environment Variables

#### Backend (Heroku) - FREE with limitations
1. **Install Heroku CLI:**
   ```bash
   # macOS
   brew install heroku/brew/heroku
   
   # Or download from: https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Deploy Backend:**
   ```bash
   cd backend
   heroku login
   heroku create life-vault-api
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

3. **Set Environment Variables:**
   ```bash
   heroku config:set SUPABASE_URL=your_supabase_url
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   heroku config:set JWT_SECRET=your_jwt_secret
   ```

### Option 2: Netlify + Railway (Alternative)

#### Frontend (Netlify) - FREE
1. **Build and Deploy:**
   ```bash
   cd frontend
   npm run build
   # Drag and drop 'build' folder to netlify.com
   ```

#### Backend (Railway) - FREE with limitations
1. **Connect GitHub repository**
2. **Select backend folder**
3. **Set environment variables**

### Option 3: AWS (Production Ready)

#### Frontend (AWS S3 + CloudFront)
1. **Build and upload to S3**
2. **Configure CloudFront distribution**
3. **Set up custom domain**

#### Backend (AWS EC2 or Lambda)
1. **Deploy to EC2 instance**
2. **Configure load balancer**
3. **Set up RDS for database**

## Environment Variables Setup

### Frontend (.env.production)
```
REACT_APP_API_URL=https://your-backend-url.herokuapp.com
GENERATE_SOURCEMAP=false
```

### Backend (Heroku Config Vars)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
PORT=3001
```

## Database Setup

### Supabase (Recommended)
1. **Create Supabase project**
2. **Run SQL schema:**
   ```sql
   -- Copy contents from complete-lifevault-schema.sql
   ```

### Alternative: PostgreSQL
1. **Create PostgreSQL database**
2. **Run migrations**
3. **Update connection string**

## Step-by-Step Deployment

### 1. Prepare for Deployment
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm install --production
```

### 2. Deploy Backend First
```bash
cd backend
heroku create life-vault-api
git init
git add .
git commit -m "Deploy backend"
git push heroku main
```

### 3. Deploy Frontend
```bash
cd frontend
vercel --prod
```

### 4. Update Frontend API URL
- Go to Vercel dashboard
- Update environment variable: `REACT_APP_API_URL`
- Redeploy frontend

## Custom Domain Setup

### Vercel (Frontend)
1. **Add domain in Vercel dashboard**
2. **Update DNS records**
3. **Enable SSL**

### Heroku (Backend)
1. **Add custom domain in Heroku**
2. **Update DNS records**
3. **Enable SSL**

## Performance Optimization

### Frontend
- ✅ Code splitting implemented
- ✅ Lazy loading enabled
- ✅ Bundle optimization
- ✅ CDN delivery (Vercel)

### Backend
- ✅ Batched API endpoints
- ✅ Response compression
- ✅ Database query optimization
- ✅ Caching strategy

## Monitoring & Analytics

### Vercel Analytics
- Built-in performance monitoring
- Real user metrics
- Core Web Vitals

### Heroku Metrics
- Application performance
- Resource usage
- Error tracking

## Cost Breakdown

### Free Tier
- **Vercel**: Free (100GB bandwidth)
- **Heroku**: Free (550 dyno hours/month)
- **Supabase**: Free (500MB database)

### Paid Options
- **Vercel Pro**: $20/month
- **Heroku Hobby**: $7/month
- **Supabase Pro**: $25/month

## Troubleshooting

### Common Issues
1. **CORS errors**: Check backend CORS configuration
2. **Environment variables**: Verify all required vars are set
3. **Database connection**: Check Supabase credentials
4. **Build failures**: Check Node.js version compatibility

### Support
- Vercel: https://vercel.com/docs
- Heroku: https://devcenter.heroku.com
- Supabase: https://supabase.com/docs
