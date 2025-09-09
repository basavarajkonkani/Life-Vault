# LifeVault - Supabase Integration

A comprehensive digital asset management system built with React.js frontend and Node.js backend integrated with **Supabase PostgreSQL**.

## 🚀 Features

- **Real-time Data**: Live Supabase PostgreSQL database integration
- **Row Level Security (RLS)**: Secure data access with Supabase RLS policies
- **Authentication**: JWT-based authentication with OTP and PIN verification
- **Asset Management**: CRUD operations for financial assets
- **Nominee Management**: Manage beneficiaries and their allocations
- **Vault System**: Secure document storage and access requests
- **Real-time Notifications**: Toast notifications for user feedback
- **Loading States**: Proper loading indicators and error handling
- **Responsive Design**: Mobile-friendly interface

## 🛠 Tech Stack

### Frontend
- **React.js** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **Axios** for API calls
- **Custom Hooks** for API state management

### Backend
- **Node.js** with Express.js
- **Supabase** PostgreSQL database
- **JWT** authentication
- **bcryptjs** for password hashing
- **CORS** enabled for cross-origin requests

### Database
- **Supabase PostgreSQL** with Row Level Security
- **UUID** primary keys
- **JSONB** for document storage
- **Automatic timestamps**

## 📋 Prerequisites

- Node.js (v16 or higher)
- Supabase account and project
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd Life-Vault

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Supabase Setup

#### Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/iaeiiaurhafdgprvqkti
2. Click on "Settings" → "API"
3. Copy your project URL and API keys

#### Run Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Run the provided schema to create tables and RLS policies:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT,
    pin_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    institution VARCHAR(200) NOT NULL,
    account_number TEXT NOT NULL,
    current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    notes TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nominees table
CREATE TABLE IF NOT EXISTS nominees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    relation VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(255) NOT NULL,
    allocation_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    is_executor BOOLEAN DEFAULT false,
    is_backup BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vault requests table
CREATE TABLE IF NOT EXISTS vault_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nominee_id UUID REFERENCES nominees(id) ON DELETE CASCADE,
    nominee_name VARCHAR(100) NOT NULL,
    relation_to_deceased VARCHAR(50) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    email VARCHAR(255) NOT NULL,
    death_certificate_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_nominees_user_id ON nominees(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_requests_nominee_id ON vault_requests(nominee_id);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can register" ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own assets" ON assets FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own assets" ON assets FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own assets" ON assets FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own assets" ON assets FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own nominees" ON nominees FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own nominees" ON nominees FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own nominees" ON nominees FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own nominees" ON nominees FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Anyone can submit vault requests" ON vault_requests FOR INSERT WITH CHECK (true);
```

### 3. Environment Configuration

Create `.env` file in the backend directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://iaeiiaurhafdgprvqkti.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 4. Start the Application

#### Option 1: Using the startup script (Recommended)
```bash
./start-supabase-app.sh
```

#### Option 2: Manual startup
```bash
# Terminal 1 - Start Backend
cd backend
node supabase-backend.js

# Terminal 2 - Start Frontend
cd frontend
npm start
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health
- **Supabase Dashboard**: https://supabase.com/dashboard/project/iaeiiaurhafdgprvqkti

## 🔐 Demo Credentials

For testing purposes, use these credentials:

- **Phone**: +91 9876543210
- **OTP**: 123456
- **PIN**: 1234
- **Role**: Owner

## 📊 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/verify-pin` - Verify PIN

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Assets
- `GET /api/assets` - Get all assets
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Nominees
- `GET /api/nominees` - Get all nominees
- `POST /api/nominees` - Create new nominee
- `PUT /api/nominees/:id` - Update nominee
- `DELETE /api/nominees/:id` - Delete nominee

### Vault
- `GET /api/vault/requests` - Get vault requests
- `POST /api/vault/requests` - Submit vault request

### File Upload
- `POST /api/upload` - Upload files

## 🗄 Database Schema

The application uses the following Supabase tables:

- **users** - User accounts and authentication
- **assets** - Financial assets and investments
- **nominees** - Beneficiaries and their allocations
- **vault_requests** - Document access requests

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Proper authentication is required
- Secure data isolation between users

## 🎨 Frontend Architecture

### Components
- **Layout** - Main application layout
- **Notification** - Toast notification system
- **Pages** - Individual page components

### Hooks
- **useApi** - Custom hook for API calls with loading states
- **useApiMutation** - Custom hook for API mutations

### Services
- **api.ts** - Centralized API service with error handling
- **NotificationContext** - Global notification state management

## 🔧 Development

### Backend Development
```bash
cd backend
node supabase-backend.js
```

### Frontend Development
```bash
cd frontend
npm start
```

### Database Management
- Use Supabase Dashboard for database management
- SQL Editor for running queries
- Table Editor for viewing data
- Real-time subscriptions available

## 🧪 Testing

### Manual Testing
1. Start the application
2. Login with demo credentials
3. Test CRUD operations for assets and nominees
4. Verify real-time data updates
5. Test error handling and loading states

### API Testing
```bash
# Health check
curl http://localhost:3001/api/health

# Get assets (requires authentication)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3001/api/assets
```

## 🚨 Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Verify SUPABASE_URL and API keys in .env file
   - Check if Supabase project is active
   - Ensure database schema has been run

2. **RLS Policy Issues**
   - Verify RLS is enabled on all tables
   - Check that policies are created correctly
   - Ensure service role key has proper permissions

3. **Authentication Issues**
   - Clear localStorage: `localStorage.clear()`
   - Check JWT_SECRET in .env file
   - Verify user exists in Supabase

4. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing processes: `lsof -ti:3001 | xargs kill`

### Logs
- Backend logs are displayed in the terminal
- Frontend errors are shown in browser console
- Supabase logs can be viewed in the dashboard

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review the Supabase documentation
- Check browser console for frontend errors
- Check backend terminal for server errors
- Use Supabase dashboard for database issues

---

**Note**: This application uses demo data and credentials for development purposes. In production, implement proper security measures, use real SMS services for OTP, and secure your Supabase configuration.
