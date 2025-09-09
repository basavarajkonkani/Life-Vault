# LifeVault - Digital Asset Management System

A comprehensive digital asset management system built with React.js frontend and Node.js backend with PostgreSQL database integration.

## 🚀 Features

- **Real-time Data**: Live PostgreSQL database integration with no mock data
- **Authentication**: JWT-based authentication with OTP and PIN verification
- **Asset Management**: CRUD operations for financial assets
- **Nominee Management**: Manage beneficiaries and their allocations
- **Vault System**: Secure document storage and access requests
- **Trading Accounts**: Manage stock trading accounts
- **Role-based Access**: Owner, Nominee, Admin, and Super-Admin roles
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
- **PostgreSQL** database
- **JWT** authentication
- **bcryptjs** for password hashing
- **CORS** enabled for cross-origin requests

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
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

### 2. Database Setup

```bash
# Start PostgreSQL service
# On macOS:
brew services start postgresql

# On Ubuntu:
sudo systemctl start postgresql

# Create database
createdb lifevault
```

### 3. Environment Configuration

Create `.env` file in the backend directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/lifevault

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
./start-app.sh
```

#### Option 2: Manual startup
```bash
# Terminal 1 - Start Backend
cd backend
node real-backend.js

# Terminal 2 - Start Frontend
cd frontend
npm start
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

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

### Trading Accounts
- `GET /api/trading-accounts` - Get all trading accounts
- `POST /api/trading-accounts` - Create new trading account
- `PUT /api/trading-accounts/:id` - Update trading account
- `DELETE /api/trading-accounts/:id` - Delete trading account

### Vault
- `GET /api/vault/requests` - Get vault requests
- `POST /api/vault/requests` - Submit vault request

### File Upload
- `POST /api/upload` - Upload files

## 🗄 Database Schema

The application automatically creates the following tables:

- **users** - User accounts and authentication
- **assets** - Financial assets and investments
- **nominees** - Beneficiaries and their allocations
- **vault_requests** - Document access requests
- **trading_accounts** - Stock trading accounts

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
npm run dev  # If you have nodemon installed
# or
node real-backend.js
```

### Frontend Development
```bash
cd frontend
npm start
```

### Database Management
```bash
# Connect to database
psql lifevault

# View tables
\dt

# View data
SELECT * FROM users;
SELECT * FROM assets;
```

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

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Verify database exists

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing processes: `lsof -ti:3001 | xargs kill`

3. **CORS Errors**
   - Backend has CORS enabled for all origins
   - Check if backend is running on correct port

4. **Authentication Issues**
   - Clear localStorage: `localStorage.clear()`
   - Check JWT_SECRET in .env file

### Logs
- Backend logs are displayed in the terminal
- Frontend errors are shown in browser console
- Database logs can be viewed in PostgreSQL logs

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://demo:demo@localhost:5432/lifevault` |
| `JWT_SECRET` | Secret key for JWT tokens | `demo-secret` |
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
- Review the API documentation
- Check browser console for frontend errors
- Check backend terminal for server errors

---

**Note**: This application uses demo data and credentials for development purposes. In production, implement proper security measures, use real SMS services for OTP, and secure your database connections.
