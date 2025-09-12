const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001", 
      "http://localhost:3003",
      "https://life-vault-frontend-y0a5.onrender.com",
      "https://life-vault-frontend.onrender.com"
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Additional CORS headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:3003",
    "https://life-vault-frontend-y0a5.onrender.com",
    "https://life-vault-frontend.onrender.com"
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Demo token middleware (for testing)
const demoTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token === 'demo-token') {
    req.user = { id: '550e8400-e29b-41d4-a716-446655440000', role: 'owner' };
    return next();
  }

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Life Vault Backend is running'
  });
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone, address, role } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, phone, address, role: role || 'owner' }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile in users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email,
        phone: phone || '',
        address: address || '',
        role: role || 'owner',
        is_active: true
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      return res.status(500).json({ error: 'Failed to create user profile' });
    }

    res.json({ 
      success: true, 
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email,
        name,
        role: role || 'owner'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    // For demo purposes, just return success
    res.json({ 
      success: true, 
      message: 'OTP sent successfully (demo mode)',
      otp: '123456' // Demo OTP
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // For demo purposes, accept any OTP
    if (otp === '123456' || otp === 'demo') {
      res.json({ 
        success: true, 
        message: 'OTP verified successfully',
        requiresPin: true
      });
    } else {
      res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/verify-pin', async (req, res) => {
  try {
    const { userId, pin } = req.body;

    // For demo purposes, accept any PIN
    const token = jwt.sign(
      { id: userId, role: 'owner' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true, 
      message: 'PIN verified successfully',
      token,
      user: { id: userId, role: 'owner' }
    });
  } catch (error) {
    console.error('Verify PIN error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard endpoints
app.get('/api/dashboard/stats', demoTokenMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get counts from database
    const [assetsResult, nomineesResult, tradingAccountsResult] = await Promise.all([
      supabase.from('assets').select('id, current_value').eq('user_id', userId),
      supabase.from('nominees').select('id').eq('user_id', userId),
      supabase.from('trading_accounts').select('id, current_value').eq('user_id', userId)
    ]);

    let assets = assetsResult.data || [];
    let nominees = nomineesResult.data || [];
    let tradingAccounts = tradingAccountsResult.data || [];

    // If no data exists, return demo data
    if (assets.length === 0 && nominees.length === 0 && tradingAccounts.length === 0) {
      console.log('No data found, returning demo data');
      
      // Demo assets
      assets = [
        {
          id: 'demo-1',
          user_id: userId,
          category: 'Bank',
          institution: 'State Bank of India',
          account_number: '****1234',
          current_value: 500000,
          status: 'Active',
          notes: 'Primary savings account',
          documents: []
        },
        {
          id: 'demo-2',
          user_id: userId,
          category: 'Mutual Fund',
          institution: 'HDFC Mutual Fund',
          account_number: 'MF001234',
          current_value: 300000,
          status: 'Active',
          notes: 'Equity growth fund',
          documents: []
        },
        {
          id: 'demo-3',
          user_id: userId,
          category: 'LIC Policy',
          institution: 'Life Insurance Corporation',
          account_number: 'LIC123456',
          current_value: 200000,
          status: 'Active',
          notes: 'Term life insurance policy',
          documents: []
        },
        {
          id: 'demo-4',
          user_id: userId,
          category: 'Fixed Deposit',
          institution: 'ICICI Bank',
          account_number: 'FD789012',
          current_value: 150000,
          status: 'Active',
          notes: '5-year fixed deposit',
          documents: []
        }
      ];

      // Demo nominees
      nominees = [
        {
          id: 'demo-nominee-1',
          user_id: userId,
          name: 'Jane Doe',
          relation: 'Spouse',
          phone: '+91 9876543211',
          email: 'jane@example.com',
          allocation_percentage: 60,
          is_executor: true,
          is_backup: false
        },
        {
          id: 'demo-nominee-2',
          user_id: userId,
          name: 'John Jr',
          relation: 'Child',
          phone: '+91 9876543212',
          email: 'john@example.com',
          allocation_percentage: 40,
          is_executor: false,
          is_backup: false
        }
      ];

      // Demo trading accounts
      tradingAccounts = [
        {
          id: 'demo-trading-1',
          user_id: userId,
          platform: 'Zerodha',
          account_number: 'ZR123456',
          current_value: 250000,
          status: 'Active',
          notes: 'Primary trading account'
        },
        {
          id: 'demo-trading-2',
          user_id: userId,
          platform: 'Upstox',
          account_number: 'UP789012',
          current_value: 100000,
          status: 'Active',
          notes: 'Secondary trading account'
        }
      ];
    }

    const totalValue = assets.reduce((sum, asset) => sum + (asset.current_value || 0), 0);
    const tradingValue = tradingAccounts.reduce((sum, account) => sum + (account.current_value || 0), 0);

    // Calculate asset allocation
    const assetAllocation = assets.map((asset, index) => ({
      name: asset.category || `Asset ${index + 1}`,
      value: totalValue > 0 ? (asset.current_value / totalValue) * 100 : 0,
      amount: asset.current_value || 0,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
    }));

    res.json({
      totalAssets: assets.length,
      totalNominees: nominees.length,
      totalTradingAccounts: tradingAccounts.length,
      totalValue,
      netWorth: totalValue + tradingValue,
      assetAllocation,
      recentActivity: []
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

app.get('/api/dashboard/batch', demoTokenMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all data in parallel
    const [assetsResult, nomineesResult, tradingAccountsResult] = await Promise.all([
      supabase.from('assets').select('*').eq('user_id', userId),
      supabase.from('nominees').select('*').eq('user_id', userId),
      supabase.from('trading_accounts').select('*').eq('user_id', userId)
    ]);

    const assets = [{"id":"demo-1","user_id":userId,"category":"Bank","institution":"State Bank of India","account_number":"****1234","current_value":500000,"status":"Active","notes":"Primary savings account","documents":[]},{"id":"demo-2","user_id":userId,"category":"Mutual Fund","institution":"HDFC Mutual Fund","account_number":"MF001234","current_value":300000,"status":"Active","notes":"Equity growth fund","documents":[]},{"id":"demo-3","user_id":userId,"category":"LIC Policy","institution":"Life Insurance Corporation","account_number":"LIC123456","current_value":200000,"status":"Active","notes":"Term life insurance policy","documents":[]},{"id":"demo-4","user_id":userId,"category":"Fixed Deposit","institution":"ICICI Bank","account_number":"FD789012","current_value":150000,"status":"Active","notes":"5-year fixed deposit","documents":[]}];
    const nominees = [{"id":"demo-nominee-1","user_id":userId,"name":"Jane Doe","relation":"Spouse","phone":"+91 9876543211","email":"jane@example.com","allocation_percentage":60,"is_executor":true,"is_backup":false},{"id":"demo-nominee-2","user_id":userId,"name":"John Jr","relation":"Child","phone":"+91 9876543212","email":"john@example.com","allocation_percentage":40,"is_executor":false,"is_backup":false}];
    const tradingAccounts = [{"id":"demo-trading-1","user_id":userId,"platform":"Zerodha","account_number":"ZR123456","current_value":250000,"status":"Active","notes":"Primary trading account"},{"id":"demo-trading-2","user_id":userId,"platform":"Upstox","account_number":"UP789012","current_value":100000,"status":"Active","notes":"Secondary trading account"}];

    const totalValue = assets.reduce((sum, asset) => sum + (asset.current_value || 0), 0);
    const tradingValue = tradingAccounts.reduce((sum, account) => sum + (account.current_value || 0), 0);

    // Calculate asset allocation
    const assetAllocation = assets.map((asset, index) => ({
      name: asset.category || `Asset ${index + 1}`,
      value: totalValue > 0 ? (asset.current_value / totalValue) * 100 : 0,
      amount: asset.current_value || 0,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
    }));

    res.json({
      totalAssets: assets.length,
      totalNominees: nominees.length,
      totalTradingAccounts: tradingAccounts.length,
      totalValue,
      netWorth: totalValue + tradingValue,
      assetAllocation,
      recentActivity: [],
      assets,
      nominees,
      tradingAccounts
    });
  } catch (error) {
    console.error('Dashboard batch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

app.get('/api/dashboard/assets', demoTokenMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch assets' });
    }

    res.json(assets || []);
  } catch (error) {
    console.error('Dashboard assets error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

app.get('/api/dashboard/nominees', demoTokenMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: nominees, error } = await supabase
      .from('nominees')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch nominees' });
    }

    res.json(nominees || []);
  } catch (error) {
    console.error('Dashboard nominees error:', error);
    res.status(500).json({ error: 'Failed to fetch nominees' });
  }
});

app.get('/api/dashboard/trading-accounts', demoTokenMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: tradingAccounts, error } = await supabase
      .from('trading_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch trading accounts' });
    }

    res.json(tradingAccounts || []);
  } catch (error) {
    console.error('Dashboard trading accounts error:', error);
    res.status(500).json({ error: 'Failed to fetch trading accounts' });
  }
});

// Assets endpoints
app.get('/api/assets', demoTokenMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch assets' });
    }

    res.json(assets || []);
  } catch (error) {
    console.error('Assets fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

app.post('/api/assets', demoTokenMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, institution, accountNumber, currentValue, status, notes, documents } = req.body;

    const { data: asset, error } = await supabase
      .from('assets')
      .insert({
        user_id: userId,
        category,
        institution,
        account_number: accountNumber,
        current_value: currentValue,
        status: status || 'Active',
        notes: notes || '',
        documents: documents || []
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create asset' });
    }

    res.json(asset);
  } catch (error) {
    console.error('Asset creation error:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

app.put('/api/assets/:id', demoTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { category, institution, accountNumber, currentValue, status, notes, documents } = req.body;

    const { data: asset, error } = await supabase
      .from('assets')
      .update({
        category,
        institution,
        account_number: accountNumber,
        current_value: currentValue,
        status,
        notes,
        documents
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update asset' });
    }

    res.json(asset);
  } catch (error) {
    console.error('Asset update error:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

app.delete('/api/assets/:id', demoTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete asset' });
    }

    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Asset deletion error:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

// Nominees endpoints
app.get('/api/nominees', demoTokenMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: nominees, error } = await supabase
      .from('nominees')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch nominees' });
    }

    res.json(nominees || []);
  } catch (error) {
    console.error('Nominees fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch nominees' });
  }
});

app.post('/api/nominees', demoTokenMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, relation, phone, email, allocationPercentage, isExecutor, isBackup } = req.body;

    const { data: nominee, error } = await supabase
      .from('nominees')
      .insert({
        user_id: userId,
        name,
        relation,
        phone,
        email,
        allocation_percentage: allocationPercentage,
        is_executor: isExecutor || false,
        is_backup: isBackup || false
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create nominee' });
    }

    res.json(nominee);
  } catch (error) {
    console.error('Nominee creation error:', error);
    res.status(500).json({ error: 'Failed to create nominee' });
  }
});

app.put('/api/nominees/:id', demoTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, relation, phone, email, allocationPercentage, isExecutor, isBackup } = req.body;

    const { data: nominee, error } = await supabase
      .from('nominees')
      .update({
        name,
        relation,
        phone,
        email,
        allocation_percentage: allocationPercentage,
        is_executor: isExecutor,
        is_backup: isBackup
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update nominee' });
    }

    res.json(nominee);
  } catch (error) {
    console.error('Nominee update error:', error);
    res.status(500).json({ error: 'Failed to update nominee' });
  }
});

app.delete('/api/nominees/:id', demoTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('nominees')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete nominee' });
    }

    res.json({ success: true, message: 'Nominee deleted successfully' });
  } catch (error) {
    console.error('Nominee deletion error:', error);
    res.status(500).json({ error: 'Failed to delete nominee' });
  }
});

// Trading Accounts endpoints
app.get('/api/trading-accounts', demoTokenMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: tradingAccounts, error } = await supabase
      .from('trading_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch trading accounts' });
    }

    res.json(tradingAccounts || []);
  } catch (error) {
    console.error('Trading accounts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch trading accounts' });
  }
});

app.post('/api/trading-accounts', demoTokenMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { platform, accountNumber, currentValue, status, notes } = req.body;

    const { data: tradingAccount, error } = await supabase
      .from('trading_accounts')
      .insert({
        user_id: userId,
        platform,
        account_number: accountNumber,
        current_value: currentValue,
        status: status || 'Active',
        notes: notes || ''
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create trading account' });
    }

    res.json(tradingAccount);
  } catch (error) {
    console.error('Trading account creation error:', error);
    res.status(500).json({ error: 'Failed to create trading account' });
  }
});

app.put('/api/trading-accounts/:id', demoTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { platform, accountNumber, currentValue, status, notes } = req.body;

    const { data: tradingAccount, error } = await supabase
      .from('trading_accounts')
      .update({
        platform,
        account_number: accountNumber,
        current_value: currentValue,
        status,
        notes
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update trading account' });
    }

    res.json(tradingAccount);
  } catch (error) {
    console.error('Trading account update error:', error);
    res.status(500).json({ error: 'Failed to update trading account' });
  }
});

app.delete('/api/trading-accounts/:id', demoTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('trading_accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete trading account' });
    }

    res.json({ success: true, message: 'Trading account deleted successfully' });
  } catch (error) {
    console.error('Trading account deletion error:', error);
    res.status(500).json({ error: 'Failed to delete trading account' });
  }
});

// Vault endpoints
app.get('/api/vault/requests', demoTokenMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: vaultRequests, error } = await supabase
      .from('vault_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch vault requests' });
    }

    res.json(vaultRequests || []);
  } catch (error) {
    console.error('Vault requests fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch vault requests' });
  }
});

app.post('/api/vault/requests', demoTokenMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { nomineeId, nomineeName, relationToDeceased, phoneNumber, email, deathCertificateUrl } = req.body;

    const { data: vaultRequest, error } = await supabase
      .from('vault_requests')
      .insert({
        user_id: userId,
        nominee_id: nomineeId,
        nominee_name: nomineeName,
        relation_to_deceased: relationToDeceased,
        phone_number: phoneNumber,
        email,
        death_certificate_url: deathCertificateUrl,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create vault request' });
    }

    res.json(vaultRequest);
  } catch (error) {
    console.error('Vault request creation error:', error);
    res.status(500).json({ error: 'Failed to create vault request' });
  }
});

app.put('/api/vault/requests/:id', demoTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { nomineeId, nomineeName, relationToDeceased, phoneNumber, email, deathCertificateUrl, status } = req.body;

    const { data: vaultRequest, error } = await supabase
      .from('vault_requests')
      .update({
        nominee_id: nomineeId,
        nominee_name: nomineeName,
        relation_to_deceased: relationToDeceased,
        phone_number: phoneNumber,
        email,
        death_certificate_url: deathCertificateUrl,
        status
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update vault request' });
    }

    res.json(vaultRequest);
  } catch (error) {
    console.error('Vault request update error:', error);
    res.status(500).json({ error: 'Failed to update vault request' });
  }
});

app.delete('/api/vault/requests/:id', demoTokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('vault_requests')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete vault request' });
    }

    res.json({ success: true, message: 'Vault request deleted successfully' });
  } catch (error) {
    console.error('Vault request deletion error:', error);
    res.status(500).json({ error: 'Failed to delete vault request' });
  }
});



// Initialize demo data
const initializeDemoData = async () => {
  try {
    const demoUserId = '550e8400-e29b-41d4-a716-446655440000';
    
    // First, create the demo user if it doesn't exist
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', demoUserId)
      .single();

    if (!existingUser) {
      await supabase.from('users').insert({
        id: demoUserId,
        name: 'Demo User',
        email: 'demo@lifevault.com',
        phone: '+91 9876543210',
        address: '123 Demo Street, Demo City',
        role: 'owner',
        is_active: true
      });
      console.log('Demo user created');
    }
    
    // Check if demo data already exists
    const { data: existingAssets } = await supabase
      .from('assets')
      .select('id')
      .eq('user_id', demoUserId)
      .limit(1);

    if (existingAssets && existingAssets.length > 0) {
      console.log('Demo data already exists, skipping initialization');
      return;
    }

    // Create demo assets
    const demoAssets = [
      {
        user_id: demoUserId,
        category: 'Bank',
        institution: 'State Bank of India',
        account_number: '****1234',
        current_value: 500000,
        status: 'Active',
        notes: 'Primary savings account',
        documents: []
      },
      {
        user_id: demoUserId,
        category: 'Mutual Fund',
        institution: 'HDFC Mutual Fund',
        account_number: 'MF001234',
        current_value: 300000,
        status: 'Active',
        notes: 'Equity growth fund',
        documents: []
      },
      {
        user_id: demoUserId,
        category: 'LIC Policy',
        institution: 'Life Insurance Corporation',
        account_number: 'LIC123456',
        current_value: 200000,
        status: 'Active',
        notes: 'Term life insurance policy',
        documents: []
      },
      {
        user_id: demoUserId,
        category: 'Fixed Deposit',
        institution: 'ICICI Bank',
        account_number: 'FD789012',
        current_value: 150000,
        status: 'Active',
        notes: '5-year fixed deposit',
        documents: []
      }
    ];

    // Create demo nominees
    const demoNominees = [
      {
        user_id: demoUserId,
        name: 'Jane Doe',
        relation: 'Spouse',
        phone: '+91 9876543211',
        email: 'jane@example.com',
        allocation_percentage: 60,
        is_executor: true,
        is_backup: false
      },
      {
        user_id: demoUserId,
        name: 'John Jr',
        relation: 'Child',
        phone: '+91 9876543212',
        email: 'john@example.com',
        allocation_percentage: 40,
        is_executor: false,
        is_backup: false
      }
    ];

    // Create demo trading accounts
    const demoTradingAccounts = [
      {
        user_id: demoUserId,
        platform: 'Zerodha',
        account_number: 'ZR123456',
        current_value: 250000,
        status: 'Active',
        notes: 'Primary trading account'
      },
      {
        user_id: demoUserId,
        platform: 'Upstox',
        account_number: 'UP789012',
        current_value: 100000,
        status: 'Active',
        notes: 'Secondary trading account'
      }
    ];

    // Insert demo data
    await supabase.from('assets').insert(demoAssets);
    await supabase.from('nominees').insert(demoNominees);
    await supabase.from('trading_accounts').insert(demoTradingAccounts);

    console.log('✅ Demo data initialized successfully');
  } catch (error) {
    console.error('❌ Demo data initialization error:', error);
  }
};




// Test endpoint to manually create demo data
app.post('/api/test/create-demo-data', demoTokenMiddleware, async (req, res) => {
  try {
    const demoUserId = '550e8400-e29b-41d4-a716-446655440000';
    
    // Create demo user
    const { error: userError } = await supabase.from('users').upsert({
      id: demoUserId,
      name: 'Demo User',
      email: 'demo@lifevault.com',
      phone: '+91 9876543210',
      address: '123 Demo Street, Demo City',
      role: 'owner',
      is_active: true
    });

    if (userError) {
      console.error('User creation error:', userError);
    } else {
      console.log('Demo user created/updated');
    }

    // Create demo assets
    const demoAssets = [
      {
        user_id: demoUserId,
        category: 'Bank',
        institution: 'State Bank of India',
        account_number: '****1234',
        current_value: 500000,
        status: 'Active',
        notes: 'Primary savings account',
        documents: []
      },
      {
        user_id: demoUserId,
        category: 'Mutual Fund',
        institution: 'HDFC Mutual Fund',
        account_number: 'MF001234',
        current_value: 300000,
        status: 'Active',
        notes: 'Equity growth fund',
        documents: []
      },
      {
        user_id: demoUserId,
        category: 'LIC Policy',
        institution: 'Life Insurance Corporation',
        account_number: 'LIC123456',
        current_value: 200000,
        status: 'Active',
        notes: 'Term life insurance policy',
        documents: []
      },
      {
        user_id: demoUserId,
        category: 'Fixed Deposit',
        institution: 'ICICI Bank',
        account_number: 'FD789012',
        current_value: 150000,
        status: 'Active',
        notes: '5-year fixed deposit',
        documents: []
      }
    ];

    // Create demo nominees
    const demoNominees = [
      {
        user_id: demoUserId,
        name: 'Jane Doe',
        relation: 'Spouse',
        phone: '+91 9876543211',
        email: 'jane@example.com',
        allocation_percentage: 60,
        is_executor: true,
        is_backup: false
      },
      {
        user_id: demoUserId,
        name: 'John Jr',
        relation: 'Child',
        phone: '+91 9876543212',
        email: 'john@example.com',
        allocation_percentage: 40,
        is_executor: false,
        is_backup: false
      }
    ];

    // Create demo trading accounts
    const demoTradingAccounts = [
      {
        user_id: demoUserId,
        platform: 'Zerodha',
        account_number: 'ZR123456',
        current_value: 250000,
        status: 'Active',
        notes: 'Primary trading account'
      },
      {
        user_id: demoUserId,
        platform: 'Upstox',
        account_number: 'UP789012',
        current_value: 100000,
        status: 'Active',
        notes: 'Secondary trading account'
      }
    ];

    // Clear existing data first
    await supabase.from('assets').delete().eq('user_id', demoUserId);
    await supabase.from('nominees').delete().eq('user_id', demoUserId);
    await supabase.from('trading_accounts').delete().eq('user_id', demoUserId);

    // Insert demo data
    const { error: assetsError } = await supabase.from('assets').insert(demoAssets);
    const { error: nomineesError } = await supabase.from('nominees').insert(demoNominees);
    const { error: tradingError } = await supabase.from('trading_accounts').insert(demoTradingAccounts);

    if (assetsError) console.error('Assets error:', assetsError);
    if (nomineesError) console.error('Nominees error:', nomineesError);
    if (tradingError) console.error('Trading accounts error:', tradingError);

    res.json({ 
      success: true, 
      message: 'Demo data created successfully',
      assets: demoAssets.length,
      nominees: demoNominees.length,
      tradingAccounts: demoTradingAccounts.length
    });
  } catch (error) {
    console.error('Demo data creation error:', error);
    res.status(500).json({ error: 'Failed to create demo data' });
  }
});


// Test endpoint to return demo data
app.get('/api/test/demo-data', demoTokenMiddleware, async (req, res) => {
  try {
    const demoData = {
      totalAssets: 4,
      totalNominees: 2,
      totalTradingAccounts: 2,
      totalValue: 1150000,
      netWorth: 1500000,
      assetAllocation: [
        {
          name: 'Bank',
          value: 43.48,
          amount: 500000,
          color: 'hsl(0, 70%, 50%)'
        },
        {
          name: 'Mutual Fund',
          value: 26.09,
          amount: 300000,
          color: 'hsl(137.5, 70%, 50%)'
        },
        {
          name: 'LIC Policy',
          value: 17.39,
          amount: 200000,
          color: 'hsl(275, 70%, 50%)'
        },
        {
          name: 'Fixed Deposit',
          value: 13.04,
          amount: 150000,
          color: 'hsl(412.5, 70%, 50%)'
        }
      ],
      recentActivity: [],
      assets: [
        {
          id: 'demo-1',
          user_id: req.user.id,
          category: 'Bank',
          institution: 'State Bank of India',
          account_number: '****1234',
          current_value: 500000,
          status: 'Active',
          notes: 'Primary savings account',
          documents: []
        },
        {
          id: 'demo-2',
          user_id: req.user.id,
          category: 'Mutual Fund',
          institution: 'HDFC Mutual Fund',
          account_number: 'MF001234',
          current_value: 300000,
          status: 'Active',
          notes: 'Equity growth fund',
          documents: []
        },
        {
          id: 'demo-3',
          user_id: req.user.id,
          category: 'LIC Policy',
          institution: 'Life Insurance Corporation',
          account_number: 'LIC123456',
          current_value: 200000,
          status: 'Active',
          notes: 'Term life insurance policy',
          documents: []
        },
        {
          id: 'demo-4',
          user_id: req.user.id,
          category: 'Fixed Deposit',
          institution: 'ICICI Bank',
          account_number: 'FD789012',
          current_value: 150000,
          status: 'Active',
          notes: '5-year fixed deposit',
          documents: []
        }
      ],
      nominees: [
        {
          id: 'demo-nominee-1',
          user_id: req.user.id,
          name: 'Jane Doe',
          relation: 'Spouse',
          phone: '+91 9876543211',
          email: 'jane@example.com',
          allocation_percentage: 60,
          is_executor: true,
          is_backup: false
        },
        {
          id: 'demo-nominee-2',
          user_id: req.user.id,
          name: 'John Jr',
          relation: 'Child',
          phone: '+91 9876543212',
          email: 'john@example.com',
          allocation_percentage: 40,
          is_executor: false,
          is_backup: false
        }
      ],
      tradingAccounts: [
        {
          id: 'demo-trading-1',
          user_id: req.user.id,
          platform: 'Zerodha',
          account_number: 'ZR123456',
          current_value: 250000,
          status: 'Active',
          notes: 'Primary trading account'
        },
        {
          id: 'demo-trading-2',
          user_id: req.user.id,
          platform: 'Upstox',
          account_number: 'UP789012',
          current_value: 100000,
          status: 'Active',
          notes: 'Secondary trading account'
        }
      ]
    };

    res.json(demoData);
  } catch (error) {
    console.error('Demo data test error:', error);
    res.status(500).json({ error: 'Failed to fetch demo data' });
  }
});


// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working!', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for origins: ${JSON.stringify([
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:3003",
    "https://life-vault-frontend-y0a5.onrender.com",
    "https://life-vault-frontend.onrender.com"
  ])}`);
  
  // Initialize demo data
  await initializeDemoData();
});
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for origins: ${JSON.stringify([
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:3003",
    "https://life-vault-frontend-y0a5.onrender.com",
    "https://life-vault-frontend.onrender.com"
  ])}`);
});
