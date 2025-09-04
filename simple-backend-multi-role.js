const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3003;
const JWT_SECRET = 'your-secret-key';

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Mock user data
let currentUser = {
  id: 'user-123',
  name: 'Test User',
  phone: '+91 9876543210',
  email: 'test@example.com'
};

// Authentication Routes
app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  console.log(`📱 Sending OTP to: ${phone}`);

  res.json({
    success: true,
    message: 'OTP sent successfully',
    userId: currentUser.id
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  console.log(`🔐 Verifying OTP: ${otp} for ${phone}`);

  if (otp === '123456') {
    res.json({
      success: true,
      message: 'OTP verified successfully',
      userId: currentUser.id
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid OTP. Use 123456 for demo'
    });
  }
});

app.post('/api/auth/verify-pin', (req, res) => {
  const { userId, pin } = req.body;
  console.log(`🔑 Verifying PIN: ${pin} for user: ${userId}`);

  if (pin === '1234') {
    const token = jwt.sign({ userId: currentUser.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({
      success: true,
      user: currentUser,
      token
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid PIN. Use 1234 for demo'
    });
  }
});

// Dashboard Routes
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalAssets: 4,
    totalNominees: 2,
    netWorth: 2500000,
    assetAllocation: [
      { name: 'Bank', value: 35, amount: 875000, color: '#1E3A8A' },
      { name: 'LIC', value: 25, amount: 625000, color: '#3B82F6' },
      { name: 'Property', value: 20, amount: 500000, color: '#60A5FA' },
      { name: 'Stocks', value: 20, amount: 500000, color: '#93C5FD' }
    ],
    recentActivity: []
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'LifeVault Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LifeVault Backend running on http://localhost:${PORT}`);
  console.log('📱 Demo credentials:');
  console.log('   Phone: Any number');
  console.log('   OTP: 123456');
  console.log('   PIN: 1234');
}); 