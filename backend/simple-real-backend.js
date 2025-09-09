const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data storage (replace with PostgreSQL later)
let users = [];
let assets = [];
let nominees = [];
let vaultRequests = [];
let tradingAccounts = [];

// Initialize demo data
const initializeDemoData = async () => {
  try {
    // Create demo user
    const hashedPin = await bcrypt.hash('1234', 10);
    const demoUser = {
      id: 1,
      name: 'Demo User',
      phone: '+91 9876543210',
      email: 'demo@lifevault.com',
      pin_hash: hashedPin,
      role: 'owner',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };
    users.push(demoUser);

    // Create demo nominees
    nominees.push({
      id: 1,
      user_id: 1,
      name: 'Jane Doe',
      relation: 'Spouse',
      phone: '+91 9876543211',
      email: 'jane@example.com',
      allocation_percentage: 60,
      is_executor: true,
      is_backup: false,
      created_at: new Date(),
      updated_at: new Date()
    });

    nominees.push({
      id: 2,
      user_id: 1,
      name: 'John Jr',
      relation: 'Child',
      phone: '+91 9876543212',
      email: 'john@example.com',
      allocation_percentage: 40,
      is_executor: false,
      is_backup: false,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Create demo assets
    assets.push({
      id: 1,
      user_id: 1,
      category: 'Bank',
      institution: 'State Bank of India',
      account_number: '****1234',
      current_value: 500000,
      status: 'Active',
      notes: 'Primary savings account',
      documents: [],
      created_at: new Date(),
      updated_at: new Date()
    });

    assets.push({
      id: 2,
      user_id: 1,
      category: 'LIC',
      institution: 'LIC of India',
      account_number: '****5678',
      current_value: 200000,
      status: 'Active',
      notes: 'Life insurance policy',
      documents: [],
      created_at: new Date(),
      updated_at: new Date()
    });

    assets.push({
      id: 3,
      user_id: 1,
      category: 'Property',
      institution: 'Self',
      account_number: 'Property Deed',
      current_value: 1500000,
      status: 'Active',
      notes: 'Residential property',
      documents: [],
      created_at: new Date(),
      updated_at: new Date()
    });

    assets.push({
      id: 4,
      user_id: 1,
      category: 'Stocks',
      institution: 'Zerodha',
      account_number: '****9012',
      current_value: 300000,
      status: 'Active',
      notes: 'Stock portfolio',
      documents: [],
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('✅ Demo data initialized successfully');
  } catch (error) {
    console.error('❌ Demo data initialization error:', error);
  }
};

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'demo-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth endpoints
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone, role } = req.body;
    console.log('OTP request:', { phone, role });
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully', 
      userId: 'demo-user-123' 
    });
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    console.log('OTP verify:', { phone, otp });
    
    if (otp !== '123456') {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    res.json({ 
      success: true, 
      message: 'OTP verified successfully', 
      userId: 'demo-user-123', 
      requiresPin: true 
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

app.post('/api/auth/verify-pin', async (req, res) => {
  try {
    const { userId, pin } = req.body;
    console.log('PIN verify:', { userId, pin });
    
    const user = users.find(u => u.phone === '+91 9876543210');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isValidPin = await bcrypt.compare(pin, user.pin_hash);
    if (!isValidPin) {
      return res.status(400).json({ error: 'Invalid PIN' });
    }
    
    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '7d' }
    );
    
    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        phone: user.phone, 
        email: user.email, 
        role: user.role 
      }, 
      token 
    });
  } catch (error) {
    console.error('PIN verify error:', error);
    res.status(500).json({ error: 'Failed to verify PIN' });
  }
});

// Dashboard endpoints
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userAssets = assets.filter(asset => asset.user_id === userId && asset.status === 'Active');
    const totalAssets = userAssets.length;
    const netWorth = userAssets.reduce((sum, asset) => sum + asset.current_value, 0);
    
    const userNominees = nominees.filter(nominee => nominee.user_id === userId);
    const totalNominees = userNominees.length;
    
    const assetAllocation = userAssets.map((asset, index) => ({
      name: asset.category,
      value: asset.current_value,
      color: ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD'][index % 4]
    }));
    
    res.json({
      totalAssets,
      totalNominees,
      netWorth,
      assetAllocation,
      recentActivity: []
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Assets endpoints
app.get('/api/assets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userAssets = assets.filter(asset => asset.user_id === userId);
    
    const formattedAssets = userAssets.map(asset => ({
      id: asset.id,
      category: asset.category,
      institution: asset.institution,
      accountNumber: asset.account_number,
      currentValue: asset.current_value,
      status: asset.status,
      notes: asset.notes,
      documents: asset.documents || [],
      createdAt: asset.created_at,
      updatedAt: asset.updated_at
    }));
    
    res.json(formattedAssets);
  } catch (error) {
    console.error('Assets fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

app.post('/api/assets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category, institution, accountNumber, currentValue, notes, documents } = req.body;
    
    const newAsset = {
      id: assets.length + 1,
      user_id: userId,
      category,
      institution,
      account_number: accountNumber,
      current_value: currentValue,
      status: 'Active',
      notes: notes || '',
      documents: documents || [],
      created_at: new Date(),
      updated_at: new Date()
    };
    
    assets.push(newAsset);
    
    res.json({
      id: newAsset.id,
      category: newAsset.category,
      institution: newAsset.institution,
      accountNumber: newAsset.account_number,
      currentValue: newAsset.current_value,
      status: newAsset.status,
      notes: newAsset.notes,
      documents: newAsset.documents
    });
  } catch (error) {
    console.error('Asset creation error:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

app.put('/api/assets/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const assetId = parseInt(req.params.id);
    const { category, institution, accountNumber, currentValue, status, notes, documents } = req.body;
    
    const assetIndex = assets.findIndex(asset => asset.id === assetId && asset.user_id === userId);
    
    if (assetIndex === -1) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    assets[assetIndex] = {
      ...assets[assetIndex],
      category,
      institution,
      account_number: accountNumber,
      current_value: currentValue,
      status: status || 'Active',
      notes: notes || '',
      documents: documents || [],
      updated_at: new Date()
    };
    
    const updatedAsset = assets[assetIndex];
    res.json({
      id: updatedAsset.id,
      category: updatedAsset.category,
      institution: updatedAsset.institution,
      accountNumber: updatedAsset.account_number,
      currentValue: updatedAsset.current_value,
      status: updatedAsset.status,
      notes: updatedAsset.notes,
      documents: updatedAsset.documents
    });
  } catch (error) {
    console.error('Asset update error:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

app.delete('/api/assets/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const assetId = parseInt(req.params.id);
    
    const assetIndex = assets.findIndex(asset => asset.id === assetId && asset.user_id === userId);
    
    if (assetIndex === -1) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    assets.splice(assetIndex, 1);
    res.json({ success: true });
  } catch (error) {
    console.error('Asset deletion error:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

// Nominees endpoints
app.get('/api/nominees', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userNominees = nominees.filter(nominee => nominee.user_id === userId);
    
    const formattedNominees = userNominees.map(nominee => ({
      id: nominee.id,
      name: nominee.name,
      relation: nominee.relation,
      phone: nominee.phone,
      email: nominee.email,
      allocationPercentage: nominee.allocation_percentage,
      isExecutor: nominee.is_executor,
      isBackup: nominee.is_backup,
      createdAt: nominee.created_at,
      updatedAt: nominee.updated_at
    }));
    
    res.json(formattedNominees);
  } catch (error) {
    console.error('Nominees fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch nominees' });
  }
});

app.post('/api/nominees', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, relation, phone, email, allocationPercentage, isExecutor, isBackup } = req.body;
    
    const newNominee = {
      id: nominees.length + 1,
      user_id: userId,
      name,
      relation,
      phone,
      email,
      allocation_percentage: allocationPercentage,
      is_executor: isExecutor || false,
      is_backup: isBackup || false,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    nominees.push(newNominee);
    
    res.json({
      id: newNominee.id,
      name: newNominee.name,
      relation: newNominee.relation,
      phone: newNominee.phone,
      email: newNominee.email,
      allocationPercentage: newNominee.allocation_percentage,
      isExecutor: newNominee.is_executor,
      isBackup: newNominee.is_backup
    });
  } catch (error) {
    console.error('Nominee creation error:', error);
    res.status(500).json({ error: 'Failed to create nominee' });
  }
});

// Trading accounts endpoints
app.get('/api/trading-accounts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userTradingAccounts = tradingAccounts.filter(account => account.user_id === userId);
    
    const formattedAccounts = userTradingAccounts.map(account => ({
      id: account.id,
      brokerName: account.broker_name,
      clientId: account.client_id,
      dematNumber: account.demat_number,
      nomineeId: account.nominee_id,
      nomineeName: account.nominee_name,
      currentValue: account.current_value,
      status: account.status,
      createdAt: account.created_at,
      updatedAt: account.updated_at
    }));
    
    res.json(formattedAccounts);
  } catch (error) {
    console.error('Trading accounts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch trading accounts' });
  }
});

app.post('/api/trading-accounts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { brokerName, clientId, dematNumber, nomineeId, currentValue, status } = req.body;
    
    const newAccount = {
      id: tradingAccounts.length + 1,
      user_id: userId,
      broker_name: brokerName,
      client_id: clientId,
      demat_number: dematNumber,
      nominee_id: nomineeId,
      current_value: currentValue,
      status: status || 'Active',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    tradingAccounts.push(newAccount);
    
    res.json({
      id: newAccount.id,
      brokerName: newAccount.broker_name,
      clientId: newAccount.client_id,
      dematNumber: newAccount.demat_number,
      nomineeId: newAccount.nominee_id,
      currentValue: newAccount.current_value,
      status: newAccount.status
    });
  } catch (error) {
    console.error('Trading account creation error:', error);
    res.status(500).json({ error: 'Failed to create trading account' });
  }
});

// Vault requests endpoints
app.get('/api/vault/requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userVaultRequests = vaultRequests.filter(request => {
      const nominee = nominees.find(n => n.id === request.nominee_id);
      return nominee && nominee.user_id === userId;
    });
    
    const formattedRequests = userVaultRequests.map(request => ({
      id: request.id,
      nomineeName: request.nominee_name,
      relationToDeceased: request.relation_to_deceased,
      requestDate: request.created_at,
      status: request.status,
      deathCertificate: request.death_certificate_url,
      adminNotes: request.admin_notes,
      reviewedAt: request.reviewed_at,
      vaultOpenedAt: request.vault_opened_at
    }));
    
    res.json(formattedRequests);
  } catch (error) {
    console.error('Vault requests fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch vault requests' });
  }
});

app.post('/api/vault/requests', authenticateToken, async (req, res) => {
  try {
    const { nomineeName, relationToDeceased, phoneNumber, email, deathCertificate, nomineeId } = req.body;
    
    const newRequest = {
      id: vaultRequests.length + 1,
      nominee_id: nomineeId,
      nominee_name: nomineeName,
      relation_to_deceased: relationToDeceased,
      phone_number: phoneNumber,
      email: email,
      death_certificate_url: deathCertificate,
      status: 'pending',
      admin_notes: null,
      reviewed_at: null,
      reviewed_by: null,
      vault_opened_at: null,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    vaultRequests.push(newRequest);
    
    res.json({
      id: newRequest.id,
      nomineeName: newRequest.nominee_name,
      relationToDeceased: newRequest.relation_to_deceased,
      status: newRequest.status,
      createdAt: newRequest.created_at
    });
  } catch (error) {
    console.error('Vault request creation error:', error);
    res.status(500).json({ error: 'Failed to create vault request' });
  }
});

// File upload endpoint
app.post('/api/upload', authenticateToken, (req, res) => {
  try {
    const fileName = `demo-file-${Date.now()}.pdf`;
    const fileUrl = `https://demo-storage.com/files/${fileName}`;
    
    res.json({ 
      success: true, 
      fileName, 
      url: fileUrl 
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'In-memory storage',
    data: {
      users: users.length,
      assets: assets.length,
      nominees: nominees.length,
      vaultRequests: vaultRequests.length,
      tradingAccounts: tradingAccounts.length
    }
  });
});

// Start server
const startServer = async () => {
  try {
    await initializeDemoData();
    
    app.listen(PORT, () => {
      console.log(`🚀 Real backend server running on http://localhost:${PORT}`);
      console.log(`📊 Database: In-memory storage (ready for PostgreSQL)`);
      console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Using demo secret'}`);
      console.log(`📝 Demo data loaded: ${users.length} users, ${assets.length} assets, ${nominees.length} nominees`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();
