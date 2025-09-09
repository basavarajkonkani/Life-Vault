const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

// Initialize demo data
const initializeDemoData = async () => {
  try {
    // Check if demo user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', '+91 9876543210')
      .single();

    if (!existingUser) {
      // Create demo user
      const hashedPin = await bcrypt.hash('1234', 10);
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert([
          {
            name: 'Demo User',
            phone: '+91 9876543210',
            email: 'demo@lifevault.com',
            pin_hash: hashedPin,
            role: 'owner',
            is_active: true
          }
        ])
        .select()
        .single();

      if (userError) {
        console.error('Error creating demo user:', userError);
        return;
      }

      // Create demo nominees
      const { error: nomineeError } = await supabase
        .from('nominees')
        .insert([
          {
            user_id: user.id,
            name: 'Jane Doe',
            relation: 'Spouse',
            phone: '+91 9876543211',
            email: 'jane@example.com',
            allocation_percentage: 60,
            is_executor: true,
            is_backup: false
          },
          {
            user_id: user.id,
            name: 'John Jr',
            relation: 'Child',
            phone: '+91 9876543212',
            email: 'john@example.com',
            allocation_percentage: 40,
            is_executor: false,
            is_backup: false
          }
        ]);

      if (nomineeError) {
        console.error('Error creating demo nominees:', nomineeError);
        return;
      }

      // Create demo assets
      const { error: assetError } = await supabase
        .from('assets')
        .insert([
          {
            user_id: user.id,
            category: 'Bank',
            institution: 'State Bank of India',
            account_number: '****1234',
            current_value: 500000,
            status: 'Active',
            notes: 'Primary savings account',
            documents: []
          },
          {
            user_id: user.id,
            category: 'LIC',
            institution: 'LIC of India',
            account_number: '****5678',
            current_value: 200000,
            status: 'Active',
            notes: 'Life insurance policy',
            documents: []
          },
          {
            user_id: user.id,
            category: 'Property',
            institution: 'Self',
            account_number: 'Property Deed',
            current_value: 1500000,
            status: 'Active',
            notes: 'Residential property',
            documents: []
          },
          {
            user_id: user.id,
            category: 'Stocks',
            institution: 'Zerodha',
            account_number: '****9012',
            current_value: 300000,
            status: 'Active',
            notes: 'Stock portfolio',
            documents: []
          }
        ]);

      if (assetError) {
        console.error('Error creating demo assets:', assetError);
        return;
      }

      console.log('✅ Demo data initialized successfully');
    } else {
      console.log('✅ Demo user already exists');
    }
  } catch (error) {
    console.error('❌ Demo data initialization error:', error);
  }
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
    
    // Get user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', '+91 9876543210')
      .single();
    
    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify PIN
    const isValidPin = await bcrypt.compare(pin, user.pin_hash);
    if (!isValidPin) {
      return res.status(400).json({ error: 'Invalid PIN' });
    }
    
    // Generate JWT token
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
    
    // Get asset statistics
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('category, current_value')
      .eq('user_id', userId)
      .eq('status', 'Active');

    if (assetsError) {
      throw assetsError;
    }

    const totalAssets = assets.length;
    const netWorth = assets.reduce((sum, asset) => sum + parseFloat(asset.current_value), 0);
    
    // Get nominees count
    const { data: nominees, error: nomineesError } = await supabase
      .from('nominees')
      .select('id')
      .eq('user_id', userId);

    if (nomineesError) {
      throw nomineesError;
    }

    const totalNominees = nominees.length;
    
    // Format asset allocation
    const assetAllocation = assets.map((asset, index) => ({
      name: asset.category,
      value: parseFloat(asset.current_value),
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
    
    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    const formattedAssets = assets.map(asset => ({
      id: asset.id,
      category: asset.category,
      institution: asset.institution,
      accountNumber: asset.account_number,
      currentValue: parseFloat(asset.current_value),
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
    
    const { data: asset, error } = await supabase
      .from('assets')
      .insert([
        {
          user_id: userId,
          category,
          institution,
          account_number: accountNumber,
          current_value: currentValue,
          status: 'Active',
          notes: notes || '',
          documents: documents || []
        }
      ])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.json({
      id: asset.id,
      category: asset.category,
      institution: asset.institution,
      accountNumber: asset.account_number,
      currentValue: parseFloat(asset.current_value),
      status: asset.status,
      notes: asset.notes,
      documents: asset.documents || []
    });
  } catch (error) {
    console.error('Asset creation error:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

app.put('/api/assets/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const assetId = req.params.id;
    const { category, institution, accountNumber, currentValue, status, notes, documents } = req.body;
    
    const { data: asset, error } = await supabase
      .from('assets')
      .update({
        category,
        institution,
        account_number: accountNumber,
        current_value: currentValue,
        status: status || 'Active',
        notes: notes || '',
        documents: documents || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json({
      id: asset.id,
      category: asset.category,
      institution: asset.institution,
      accountNumber: asset.account_number,
      currentValue: parseFloat(asset.current_value),
      status: asset.status,
      notes: asset.notes,
      documents: asset.documents || []
    });
  } catch (error) {
    console.error('Asset update error:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

app.delete('/api/assets/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const assetId = req.params.id;
    
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
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
    
    const { data: nominees, error } = await supabase
      .from('nominees')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    const formattedNominees = nominees.map(nominee => ({
      id: nominee.id,
      name: nominee.name,
      relation: nominee.relation,
      phone: nominee.phone,
      email: nominee.email,
      allocationPercentage: parseFloat(nominee.allocation_percentage),
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
    
    const { data: nominee, error } = await supabase
      .from('nominees')
      .insert([
        {
          user_id: userId,
          name,
          relation,
          phone,
          email,
          allocation_percentage: allocationPercentage,
          is_executor: isExecutor || false,
          is_backup: isBackup || false
        }
      ])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.json({
      id: nominee.id,
      name: nominee.name,
      relation: nominee.relation,
      phone: nominee.phone,
      email: nominee.email,
      allocationPercentage: parseFloat(nominee.allocation_percentage),
      isExecutor: nominee.is_executor,
      isBackup: nominee.is_backup
    });
  } catch (error) {
    console.error('Nominee creation error:', error);
    res.status(500).json({ error: 'Failed to create nominee' });
  }
});

app.put('/api/nominees/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const nomineeId = req.params.id;
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
        is_backup: isBackup,
        updated_at: new Date().toISOString()
      })
      .eq('id', nomineeId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!nominee) {
      return res.status(404).json({ error: 'Nominee not found' });
    }
    
    res.json({
      id: nominee.id,
      name: nominee.name,
      relation: nominee.relation,
      phone: nominee.phone,
      email: nominee.email,
      allocationPercentage: parseFloat(nominee.allocation_percentage),
      isExecutor: nominee.is_executor,
      isBackup: nominee.is_backup
    });
  } catch (error) {
    console.error('Nominee update error:', error);
    res.status(500).json({ error: 'Failed to update nominee' });
  }
});

app.delete('/api/nominees/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const nomineeId = req.params.id;
    
    const { error } = await supabase
      .from('nominees')
      .delete()
      .eq('id', nomineeId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Nominee deletion error:', error);
    res.status(500).json({ error: 'Failed to delete nominee' });
  }
});

// Trading accounts endpoints (placeholder - add to schema if needed)
app.get('/api/trading-accounts', authenticateToken, async (req, res) => {
  try {
    // For now, return empty array since trading_accounts table doesn't exist in your schema
    res.json([]);
  } catch (error) {
    console.error('Trading accounts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch trading accounts' });
  }
});

// Vault requests endpoints
app.get('/api/vault/requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get vault requests for user's nominees
    const { data: vaultRequests, error } = await supabase
      .from('vault_requests')
      .select(`
        *,
        nominees!inner(user_id)
      `)
      .eq('nominees.user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    const formattedRequests = vaultRequests.map(request => ({
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
    
    const { data: request, error } = await supabase
      .from('vault_requests')
      .insert([
        {
          nominee_id: nomineeId,
          nominee_name: nomineeName,
          relation_to_deceased: relationToDeceased,
          phone_number: phoneNumber,
          email: email,
          death_certificate_url: deathCertificate,
          status: 'pending'
        }
      ])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.json({
      id: request.id,
      nomineeName: request.nominee_name,
      relationToDeceased: request.relation_to_deceased,
      status: request.status,
      createdAt: request.created_at
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
app.get('/api/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Supabase PostgreSQL',
      connection: 'Connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'Supabase PostgreSQL',
      connection: 'Failed',
      error: error.message
    });
  }
});

// Start server
const startServer = async () => {
  try {
    await initializeDemoData();
    
    app.listen(PORT, () => {
      console.log(`🚀 Supabase backend server running on http://localhost:${PORT}`);
      console.log(`📊 Database: Supabase PostgreSQL`);
      console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Using demo secret'}`);
      console.log(`🌐 Supabase URL: ${supabaseUrl ? 'Connected' : 'Not configured'}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();
