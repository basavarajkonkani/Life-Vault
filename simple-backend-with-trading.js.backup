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
  email: 'test@example.com',
  role: 'owner'
};

// Mock nominees data
let nominees = [
  {
    id: 'nominee-1',
    name: 'John Doe',
    relation: 'Spouse',
    phone: '+91 9876543211',
    email: 'john@example.com',
    allocation_percentage: 60,
    is_executor: true,
    is_backup: false
  },
  {
    id: 'nominee-2',
    name: 'Jane Doe',
    relation: 'Child',
    phone: '+91 9876543212',
    email: 'jane@example.com',
    allocation_percentage: 40,
    is_executor: false,
    is_backup: true
  }
];

// Mock trading accounts data
let tradingAccounts = [
  {
    id: 'trading-1',
    user_id: 'user-123',
    broker_name: 'Zerodha',
    client_id: 'ZR123456',
    demat_number: 'NSDL123456789',
    nominee_id: 'nominee-1',
    current_value: 150000,
    status: 'Active',
    created_at: '2025-09-08T08:19:30.012Z',
    updated_at: '2025-09-08T08:19:30.016Z'
  },
  {
    id: 'trading-2',
    user_id: 'user-123',
    broker_name: 'Upstox',
    client_id: 'UP789012',
    demat_number: 'CDSL987654321',
    nominee_id: 'nominee-2',
    current_value: 75000,
    status: 'Active',
    created_at: '2025-09-08T08:19:30.017Z',
    updated_at: '2025-09-08T08:19:30.017Z'
  }
];
// Mock assets data
let assets = [
  {
    id: 'asset-1',
    user_id: 'user-123',
    category: 'Bank',
    institution: 'SBI',
    account_number: 'SBI123456789',
    current_value: 500000,
    status: 'Active',
    nominee_id: 'nominee-1',
    created_at: '2025-09-08T08:19:30.012Z',
    updated_at: '2025-09-08T08:19:30.016Z'
  },
  {
    id: 'asset-2',
    user_id: 'user-123',
    category: 'LIC',
    institution: 'LIC of India',
    account_number: 'LIC987654321',
    current_value: 300000,
    status: 'Active',
    nominee_id: 'nominee-2',
    created_at: '2025-09-08T08:19:30.017Z',
    updated_at: '2025-09-08T08:19:30.017Z'
  },
  {
    id: 'asset-3',
    user_id: 'user-123',
    category: 'Property',
    institution: 'Residential Property',
    account_number: 'PROP456789123',
    current_value: 2500000,
    status: 'Active',
    nominee_id: 'nominee-1',
    created_at: '2025-09-08T08:19:30.018Z',
    updated_at: '2025-09-08T08:19:30.018Z'
  },
  {
    id: 'asset-4',
    user_id: 'user-123',
    category: 'Stocks',
    institution: 'Direct Equity',
    account_number: 'STK789456123',
    current_value: 450000,
    status: 'Active',
    nominee_id: 'nominee-2',
    created_at: '2025-09-08T08:19:30.019Z',
    updated_at: '2025-09-08T08:19:30.019Z'
  }
];


// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
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
      userId: currentUser.id,
      requiresPin: true
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

// Get current user info
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json(currentUser);
});

// Dashboard Routes
app.get("/api/dashboard/stats", authenticateToken, (req, res) => {
  // Calculate asset allocation by category
  const assetsByCategory = {};
  let totalAssetValue = 0;
  
  // Process regular assets
  assets.forEach(asset => {
    if (asset.user_id === req.user.id) {
      if (!assetsByCategory[asset.category]) {
        assetsByCategory[asset.category] = 0;
      }
      assetsByCategory[asset.category] += asset.current_value;
      totalAssetValue += asset.current_value;
    }
  });
  
  // Add trading accounts as a category
  const tradingValue = tradingAccounts
    .filter(account => account.user_id === req.user.id)
    .reduce((sum, account) => sum + account.current_value, 0);
  
  if (tradingValue > 0) {
    assetsByCategory["Trading Accounts"] = tradingValue;
    totalAssetValue += tradingValue;
  }
  
  // Convert to array format with blue theme colors
  const blueShades = [
    "#1E40AF", // blue-800
    "#2563EB", // blue-600
    "#3B82F6", // blue-500
    "#60A5FA", // blue-400
    "#93C5FD", // blue-300
    "#DBEAFE", // blue-100
    "#1E3A8A", // blue-900
    "#1D4ED8"  // blue-700
  ];
  
  const assetAllocation = Object.entries(assetsByCategory).map(([category, value], index) => ({
    name: category,
    value: Number(value),
    color: blueShades[index % blueShades.length]
  }));
  
  const totalAssets = assets.filter(asset => asset.user_id === req.user.id).length + 
                     tradingAccounts.filter(account => account.user_id === req.user.id).length;
  
  res.json({
    totalAssets,
    totalNominees: nominees.length,
    netWorth: totalAssetValue,
    assetAllocation
  });
});


// Assets API
app.get('/api/dashboard/assets', authenticateToken, (req, res) => {
  const userAssets = assets.filter(asset => asset.user_id === req.user.id);
  res.json(userAssets);
});
// Trading Accounts API
app.get('/api/trading-accounts', authenticateToken, (req, res) => {
  console.log('📊 Fetched trading accounts for user:', req.user.id);
  res.json(tradingAccounts.filter(account => account.user_id === req.user.id));
});

app.post('/api/trading-accounts', authenticateToken, (req, res) => {
  const { broker_name, client_id, demat_number, nominee_id, current_value, status } = req.body;
  
  const newAccount = {
    id: `trading-${Date.now()}`,
    user_id: req.user.id,
    broker_name,
    client_id,
    demat_number,
    nominee_id,
    current_value: parseFloat(current_value) || 0,
    status: status || 'Active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  tradingAccounts.push(newAccount);
  console.log('✅ Created new trading account:', newAccount.id);
  res.json(newAccount);
});

app.put('/api/trading-accounts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { broker_name, client_id, demat_number, nominee_id, current_value, status } = req.body;
  
  const accountIndex = tradingAccounts.findIndex(account => account.id === id && account.user_id === req.user.id);
  
  if (accountIndex === -1) {
    return res.status(404).json({ error: 'Trading account not found' });
  }
  
  tradingAccounts[accountIndex] = {
    ...tradingAccounts[accountIndex],
    broker_name,
    client_id,
    demat_number,
    nominee_id,
    current_value: parseFloat(current_value) || 0,
    status,
    updated_at: new Date().toISOString()
  };
  
  console.log('✅ Updated trading account:', id);
  res.json(tradingAccounts[accountIndex]);
});

app.delete('/api/trading-accounts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const accountIndex = tradingAccounts.findIndex(account => account.id === id && account.user_id === req.user.id);
  
  if (accountIndex === -1) {
    return res.status(404).json({ error: 'Trading account not found' });
  }
  
  tradingAccounts.splice(accountIndex, 1);
  console.log('✅ Deleted trading account:', id);
  res.json({ message: 'Trading account deleted successfully' });
});

// Nominees API
app.get("/api/nominees", authenticateToken, (req, res) => {
  try {
    console.log(`👥 Fetched ${nominees.length} nominees for user: ${req.user.id}`);
    res.json(nominees);
  } catch (error) {
    console.error('Error fetching nominees:', error);
    res.status(500).json({ error: 'Failed to fetch nominees' });
  }
});

app.post("/api/nominees", authenticateToken, (req, res) => {
  const { name, relation, phone, email, allocation_percentage, is_executor, is_backup } = req.body;
  
  const newNominee = {
    id: `nominee-${Date.now()}`,
    name,
    relation,
    phone,
    email,
    allocation_percentage: parseFloat(allocation_percentage) || 0,
    is_executor: Boolean(is_executor),
    is_backup: Boolean(is_backup)
  };
  
  nominees.push(newNominee);
  console.log('✅ Created new nominee:', newNominee.id);
  res.json(newNominee);
});

app.put("/api/nominees/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, relation, phone, email, allocation_percentage, is_executor, is_backup } = req.body;
  
  const nomineeIndex = nominees.findIndex(nominee => nominee.id === id);
  
  if (nomineeIndex === -1) {
    return res.status(404).json({ error: 'Nominee not found' });
  }
  
  nominees[nomineeIndex] = {
    ...nominees[nomineeIndex],
    name,
    relation,
    phone,
    email,
    allocation_percentage: parseFloat(allocation_percentage) || 0,
    is_executor: Boolean(is_executor),
    is_backup: Boolean(is_backup)
  };
  
  console.log('✅ Updated nominee:', id);
  res.json(nominees[nomineeIndex]);
});

app.delete("/api/nominees/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const nomineeIndex = nominees.findIndex(nominee => nominee.id === id);
  
  if (nomineeIndex === -1) {
    return res.status(404).json({ error: 'Nominee not found' });
  }
  
  nominees.splice(nomineeIndex, 1);
  console.log('✅ Deleted nominee:', id);
  res.json({ message: 'Nominee deleted successfully' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'LifeVault Backend with Trading Accounts is running!',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LifeVault Backend with Trading Accounts running on http://localhost:${PORT}`);
  console.log('📱 Demo credentials:');
  console.log('   Phone: Any number');
  console.log('   OTP: 123456');
  console.log('   PIN: 1234');
  console.log('📊 Trading Accounts API: http://localhost:3003/api/trading-accounts');
});
