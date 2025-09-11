const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003'],
  credentials: true,
}));
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
const authenticateDemoToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token === 'demo-token') {
    req.user = { sub: '22ce220b-e5a2-4a51-80ac-a7737c97decd', phone: '+91 9876543210', role: 'user' };
    return next();
  }

  // Fall back to JWT authentication
  authenticateToken(req, res, next);
};

// Validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

const validateNomineeData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!data.relation || data.relation.trim().length === 0) {
    errors.push('Relation is required');
  }

  if (!data.phone || data.phone.trim().length === 0) {
    errors.push('Phone number is required');
  } else if (!validatePhone(data.phone)) {
    errors.push('Please enter a valid phone number');
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!validateEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }

  if (data.allocationPercentage === undefined || data.allocationPercentage === null) {
    errors.push('Allocation percentage is required');
  } else {
    const allocation = parseFloat(data.allocationPercentage);
    if (isNaN(allocation) || allocation < 0 || allocation > 100) {
      errors.push('Allocation percentage must be between 0 and 100');
    }
  }

  return errors;
};

const validateAssetData = (data) => {
  const errors = [];

  if (!data.category || data.category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (!data.institution || data.institution.trim().length === 0) {
    errors.push('Institution is required');
  }

  if (!data.accountNumber || data.accountNumber.trim().length === 0) {
    errors.push('Account number is required');
  }

  if (data.currentValue === undefined || data.currentValue === null) {
    errors.push('Current value is required');
  } else {
    const value = parseFloat(data.currentValue);
    if (isNaN(value) || value < 0) {
      errors.push('Current value must be a positive number');
    }
  }

  return errors;
};

const validateTradingAccountData = (data) => {
  const errors = [];

  if (!data.brokerName || data.brokerName.trim().length === 0) {
    errors.push('Broker name is required');
  }

  if (!data.clientId || data.clientId.trim().length === 0) {
    errors.push('Client ID is required');
  }

  if (!data.dematNumber || data.dematNumber.trim().length === 0) {
    errors.push('Demat number is required');
  }

  if (data.currentValue === undefined || data.currentValue === null) {
    errors.push('Current value is required');
  } else {
    const value = parseFloat(data.currentValue);
    if (isNaN(value) || value < 0) {
      errors.push('Current value must be a positive number');
    }
  }

  return errors;
};

// Routes
app.get('/api/', (req, res) => {
  res.json({ message: 'LifeVault API is running!', endpoints: [
    '/api/health',
    '/api/auth/login',
    '/api/auth/register',
    '/api/dashboard/stats',
    '/api/dashboard/batch',
    '/api/assets',
    '/api/nominees',
    '/api/trading-accounts',
    '/api/vault-requests'
  ], timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.json({ message: 'LifeVault Backend is running!', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, phone, email, address, pin, role } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'User with this phone number already exists' });
    }

    // Hash the PIN
    const pinHash = await bcrypt.hash(pin, 10);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name,
        phone,
        email,
        address,
        pin_hash: pinHash,
        role: role || 'user',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Generate JWT token
    const token = jwt.sign(
      { sub: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        role: user.role,
        is_active: user.is_active,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Find user by phone
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid phone number' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // For demo purposes, accept any 6-digit OTP
    if (!otp || otp.length !== 6) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { sub: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        role: user.role,
        is_active: user.is_active,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/verify-pin', authenticateDemoToken, async (req, res) => {
  try {
    const { pin } = req.body;
    const userId = req.user.sub;

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Verify PIN
    const isPinValid = await bcrypt.compare(pin, user.pin_hash);
    if (!isPinValid) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { sub: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        role: user.role,
        is_active: user.is_active,
      },
      token,
    });
  } catch (error) {
    console.error('PIN verification error:', error);
    res.status(500).json({ error: 'PIN verification failed' });
  }
});

// Dashboard routes
app.get('/api/dashboard/stats', authenticateDemoToken, async (req, res) => {
  try {
    const userId = req.user.sub;

    // Get assets
    const { data: assets } = await supabase
      .from('assets')
      .select('current_value')
      .eq('user_id', userId);

    // Get nominees count
    const { count: nomineesCount } = await supabase
      .from('nominees')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get trading accounts count
    const { count: tradingAccountsCount } = await supabase
      .from('trading_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const totalValue = assets?.reduce((sum, asset) => sum + parseFloat(asset.current_value || 0), 0) || 0;

    res.json({
      totalAssets: assets?.length || 0,
      totalValue,
      totalNominees: nomineesCount || 0,
      totalTradingAccounts: tradingAccountsCount || 0,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

// Assets routes
app.get('/api/dashboard/assets', authenticateDemoToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(assets || []);
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Failed to get assets' });
  }
});

app.post('/api/assets', authenticateDemoToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { category, institution, accountNumber, currentValue, status, notes, documents } = req.body;

    // Validate input data
    const validationErrors = validateAssetData({
      category,
      institution,
      accountNumber,
      currentValue
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    const { data: asset, error } = await supabase
      .from('assets')
      .insert({
        user_id: userId,
        category,
        institution,
        account_number: accountNumber,
        current_value: parseFloat(currentValue),
        status: status || 'Active',
        notes,
        documents: documents || [],
      })
      .select()
      .single();

    if (error) throw error;
    res.json(asset);
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

app.put('/api/assets/:id', authenticateDemoToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    const { category, institution, accountNumber, currentValue, status, notes, documents } = req.body;

    // Validate input data
    const validationErrors = validateAssetData({
      category,
      institution,
      accountNumber,
      currentValue
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // First check if asset belongs to user
    const { data: existingAsset } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingAsset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const { data: asset, error } = await supabase
      .from('assets')
      .update({
        category,
        institution,
        account_number: accountNumber,
        current_value: parseFloat(currentValue),
        status: status || 'Active',
        notes,
        documents: documents || [],
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(asset);
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

app.delete('/api/assets/:id', authenticateDemoToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    // First check if asset belongs to user
    const { data: existingAsset } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingAsset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

// Nominees routes
app.get('/api/dashboard/nominees', authenticateDemoToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { data: nominees, error } = await supabase
      .from('nominees')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(nominees || []);
  } catch (error) {
    console.error('Get nominees error:', error);
    res.status(500).json({ error: 'Failed to get nominees' });
  }
});

app.post('/api/nominees', authenticateDemoToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { name, relation, phone, email, allocationPercentage, isExecutor, isBackup } = req.body;

    // Validate input data
    const validationErrors = validateNomineeData({
      name,
      relation,
      phone,
      email,
      allocationPercentage
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    const { data: nominee, error } = await supabase
      .from('nominees')
      .insert({
        user_id: userId,
        name: name.trim(),
        relation: relation.trim(),
        phone: phone.trim(),
        email: email.trim(),
        allocation_percentage: parseFloat(allocationPercentage),
        is_executor: isExecutor || false,
        is_backup: isBackup || false,
      })
      .select()
      .single();

    if (error) throw error;
    res.json(nominee);
  } catch (error) {
    console.error('Create nominee error:', error);
    res.status(500).json({ error: 'Failed to create nominee' });
  }
});

app.put('/api/nominees/:id', authenticateDemoToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    const { name, relation, phone, email, allocationPercentage, isExecutor, isBackup } = req.body;

    // Validate input data
    const validationErrors = validateNomineeData({
      name,
      relation,
      phone,
      email,
      allocationPercentage
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // First check if nominee belongs to user
    const { data: existingNominee } = await supabase
      .from('nominees')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingNominee) {
      return res.status(404).json({ error: 'Nominee not found' });
    }

    const { data: nominee, error } = await supabase
      .from('nominees')
      .update({
        name: name.trim(),
        relation: relation.trim(),
        phone: phone.trim(),
        email: email.trim(),
        allocation_percentage: parseFloat(allocationPercentage),
        is_executor: isExecutor || false,
        is_backup: isBackup || false,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(nominee);
  } catch (error) {
    console.error('Update nominee error:', error);
    res.status(500).json({ error: 'Failed to update nominee' });
  }
});

app.delete('/api/nominees/:id', authenticateDemoToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    // First check if nominee belongs to user
    const { data: existingNominee } = await supabase
      .from('nominees')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingNominee) {
      return res.status(404).json({ error: 'Nominee not found' });
    }

    const { error } = await supabase
      .from('nominees')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete nominee error:', error);
    res.status(500).json({ error: 'Failed to delete nominee' });
  }
});

// Trading Accounts routes
app.get('/api/dashboard/trading-accounts', authenticateDemoToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { data: tradingAccounts, error } = await supabase
      .from('trading_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(tradingAccounts || []);
  } catch (error) {
    console.error('Get trading accounts error:', error);
    res.status(500).json({ error: 'Failed to get trading accounts' });
  }
});

app.post('/api/trading-accounts', authenticateDemoToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { brokerName, clientId, dematNumber, nomineeId, currentValue, status, notes } = req.body;

    // Validate input data
    const validationErrors = validateTradingAccountData({
      brokerName,
      clientId,
      dematNumber,
      currentValue
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    const { data: tradingAccount, error } = await supabase
      .from('trading_accounts')
      .insert({
        user_id: userId,
        broker_name: brokerName,
        client_id: clientId,
        demat_number: dematNumber,
        nominee_id: nomineeId,
        current_value: parseFloat(currentValue),
        status: status || 'Active',
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    res.json(tradingAccount);
  } catch (error) {
    console.error('Create trading account error:', error);
    res.status(500).json({ error: 'Failed to create trading account' });
  }
});

app.put('/api/trading-accounts/:id', authenticateDemoToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    const { brokerName, clientId, dematNumber, nomineeId, currentValue, status, notes } = req.body;

    // Validate input data
    const validationErrors = validateTradingAccountData({
      brokerName,
      clientId,
      dematNumber,
      currentValue
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // First check if trading account belongs to user
    const { data: existingTradingAccount } = await supabase
      .from('trading_accounts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingTradingAccount) {
      return res.status(404).json({ error: 'Trading account not found' });
    }

    const { data: tradingAccount, error } = await supabase
      .from('trading_accounts')
      .update({
        broker_name: brokerName,
        client_id: clientId,
        demat_number: dematNumber,
        nominee_id: nomineeId,
        current_value: parseFloat(currentValue),
        status: status || 'Active',
        notes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(tradingAccount);
  } catch (error) {
    console.error('Update trading account error:', error);
    res.status(500).json({ error: 'Failed to update trading account' });
  }
});

app.delete('/api/trading-accounts/:id', authenticateDemoToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    // First check if trading account belongs to user
    const { data: existingTradingAccount } = await supabase
      .from('trading_accounts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingTradingAccount) {
      return res.status(404).json({ error: 'Trading account not found' });
    }

    const { error } = await supabase
      .from('trading_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete trading account error:', error);
    res.status(500).json({ error: 'Failed to delete trading account' });
  }
});

// Vault Requests routes
app.get('/api/vault-requests', authenticateDemoToken, async (req, res) => {
  try {
    const { data: vaultRequests, error } = await supabase
      .from('vault_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(vaultRequests || []);
  } catch (error) {
    console.error('Get vault requests error:', error);
    res.status(500).json({ error: 'Failed to get vault requests' });
  }
});

app.post('/api/vault-requests', async (req, res) => {
  try {
    const { nomineeId, nomineeName, relationToDeceased, phoneNumber, email, deathCertificateUrl } = req.body;

    const { data: vaultRequest, error } = await supabase
      .from('vault_requests')
      .insert({
        nominee_id: nomineeId,
        nominee_name: nomineeName,
        relation_to_deceased: relationToDeceased,
        phone_number: phoneNumber,
        email,
        death_certificate_url: deathCertificateUrl,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    res.json(vaultRequest);
  } catch (error) {
    console.error('Create vault request error:', error);
    res.status(500).json({ error: 'Failed to create vault request' });
  }
});

app.put('/api/vault-requests/:id', authenticateDemoToken, async (req, res) => {
  try {
    const { id } = req.params;
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
        status: status || 'pending',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(vaultRequest);
  } catch (error) {
    console.error('Update vault request error:', error);
    res.status(500).json({ error: 'Failed to update vault request' });
  }
});

app.delete('/api/vault-requests/:id', authenticateDemoToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('vault_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete vault request error:', error);
    res.status(500).json({ error: 'Failed to delete vault request' });
  }
});

// User Profile routes
app.get('/api/user/profile', authenticateDemoToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, phone, email, address, role, is_active, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) throw error;
    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

app.put('/api/user/profile', authenticateDemoToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { name, email, address } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({
        name: name.trim(),
        email: email.trim(),
        address: address?.trim() || null,
      })
      .eq('id', userId)
      .select('id, name, phone, email, address, role, is_active, created_at, updated_at')
      .single();

    if (error) throw error;
    res.json(user);
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LifeVault Backend running on http://localhost:${PORT}`);
  console.log(`📊 Supabase connected: ${process.env.SUPABASE_URL}`);
  console.log(`🔐 JWT Secret configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
  console.log(`📱 Demo token authentication enabled`);
  console.log(`✅ Input validation enabled`);
  console.log(`🔄 Full CRUD operations available`);
});

// Optimized batched dashboard endpoint
app.get('/api/dashboard/batch', authenticateDemoToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    console.log('Fetching batched dashboard data for user:', userId);

    // Execute all queries in parallel for maximum performance
    const [
      assetsResult,
      nomineesResult,
      tradingAccountsResult
    ] = await Promise.allSettled([
      supabase
        .from('assets')
        .select('id, category, current_value, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('nominees')
        .select('id, name, relation, allocation_percentage, is_executor, is_backup')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('trading_accounts')
        .select('id, broker_name, account_number, current_value, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    ]);

    // Extract data from results
    const assets = assetsResult.status === 'fulfilled' ? assetsResult.value.data || [] : [];
    const nominees = nomineesResult.status === 'fulfilled' ? nomineesResult.value.data || [] : [];
    const tradingAccounts = tradingAccountsResult.status === 'fulfilled' ? tradingAccountsResult.value.data || [] : [];

    // Calculate totals
    const totalAssets = assets.length;
    const totalNominees = nominees.length;
    const totalTradingAccounts = tradingAccounts.length;
    const totalValue = assets.reduce((sum, asset) => sum + parseFloat(asset.current_value || 0), 0);

    // Prepare asset allocation data with colors
    const colors = ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#EFF6FF', '#A78BFA'];
    
    const assetAllocation = [
      ...assets.map((asset, index) => ({
        name: asset.category,
        value: parseFloat(asset.current_value || 0),
        amount: parseFloat(asset.current_value || 0),
        color: colors[index % colors.length]
      })),
      ...tradingAccounts.map((account, index) => ({
        name: `Trading Account (${account.broker_name})`,
        value: parseFloat(account.current_value || 0),
        amount: parseFloat(account.current_value || 0),
        color: colors[(assets.length + index) % colors.length]
      }))
    ];

    // Prepare recent activity (simplified for performance)
    const recentActivity = [
      ...assets.slice(0, 3).map(asset => ({
        id: `asset_${asset.id}`,
        type: 'asset_added',
        description: `Added ${asset.category} - ${asset.institution || 'Account'}`,
        timestamp: new Date(asset.created_at),
        status: 'success'
      })),
      ...nominees.slice(0, 2).map(nominee => ({
        id: `nominee_${nominee.id}`,
        type: 'nominee_updated',
        description: `Updated ${nominee.name} (${nominee.relation})`,
        timestamp: new Date(),
        status: 'info'
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

    const response = {
      totalAssets,
      totalNominees,
      totalTradingAccounts,
      totalValue,
      netWorth: totalValue,
      assetAllocation,
      recentActivity,
      // Include raw data for other components
      assets: assets.map(asset => ({
        ...asset,
        institution: asset.institution || 'N/A',
        account_number: asset.account_number || 'N/A',
        notes: asset.notes || '',
        documents: asset.documents || []
      })),
      nominees: nominees.map(nominee => ({
        ...nominee,
        phone: nominee.phone || '',
        email: nominee.email || '',
        allocationPercentage: nominee.allocation_percentage,
        isExecutor: nominee.is_executor,
        isBackup: nominee.is_backup
      })),
      tradingAccounts: tradingAccounts.map(account => ({
        ...account,
        accountNumber: account.account_number,
        currentValue: account.current_value,
        brokerName: account.broker_name
      }))
    };

    console.log('Batched dashboard data prepared successfully');
    res.json(response);
  } catch (error) {
    console.error('Batched dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

