const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://demo:demo@localhost:5432/lifevault',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

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

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(15) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        pin_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'owner',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create assets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        institution VARCHAR(200) NOT NULL,
        account_number VARCHAR(100) NOT NULL,
        current_value DECIMAL(15,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Active',
        notes TEXT,
        documents JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create nominees table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS nominees (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        relation VARCHAR(50) NOT NULL,
        phone VARCHAR(15) NOT NULL,
        email VARCHAR(255) NOT NULL,
        allocation_percentage DECIMAL(5,2) NOT NULL,
        is_executor BOOLEAN DEFAULT false,
        is_backup BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create vault_requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vault_requests (
        id SERIAL PRIMARY KEY,
        nominee_id INTEGER REFERENCES nominees(id) ON DELETE CASCADE,
        nominee_name VARCHAR(100) NOT NULL,
        relation_to_deceased VARCHAR(50) NOT NULL,
        phone_number VARCHAR(15) NOT NULL,
        email VARCHAR(255) NOT NULL,
        death_certificate_url TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        admin_notes TEXT,
        reviewed_at TIMESTAMP,
        reviewed_by INTEGER,
        vault_opened_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create trading_accounts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trading_accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        broker_name VARCHAR(100) NOT NULL,
        client_id VARCHAR(100) NOT NULL,
        demat_number VARCHAR(100) NOT NULL,
        nominee_id INTEGER REFERENCES nominees(id),
        current_value DECIMAL(15,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

// Seed demo data
const seedDemoData = async () => {
  try {
    // Check if demo user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE phone = $1', ['+91 9876543210']);
    
    if (userCheck.rows.length === 0) {
      // Create demo user
      const hashedPin = await bcrypt.hash('1234', 10);
      const userResult = await pool.query(
        'INSERT INTO users (name, phone, email, pin_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        ['Demo User', '+91 9876543210', 'demo@lifevault.com', hashedPin, 'owner']
      );
      const userId = userResult.rows[0].id;

      // Create demo nominees
      await pool.query(
        'INSERT INTO nominees (user_id, name, relation, phone, email, allocation_percentage, is_executor) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [userId, 'Jane Doe', 'Spouse', '+91 9876543211', 'jane@example.com', 60, true]
      );
      
      await pool.query(
        'INSERT INTO nominees (user_id, name, relation, phone, email, allocation_percentage, is_executor) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [userId, 'John Jr', 'Child', '+91 9876543212', 'john@example.com', 40, false]
      );

      // Create demo assets
      await pool.query(
        'INSERT INTO assets (user_id, category, institution, account_number, current_value, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, 'Bank', 'State Bank of India', '****1234', 500000, 'Active']
      );
      
      await pool.query(
        'INSERT INTO assets (user_id, category, institution, account_number, current_value, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, 'LIC', 'LIC of India', '****5678', 200000, 'Active']
      );

      await pool.query(
        'INSERT INTO assets (user_id, category, institution, account_number, current_value, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, 'Property', 'Self', 'Property Deed', 1500000, 'Active']
      );

      await pool.query(
        'INSERT INTO assets (user_id, category, institution, account_number, current_value, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, 'Stocks', 'Zerodha', '****9012', 300000, 'Active']
      );

      console.log('✅ Demo data seeded successfully');
    }
  } catch (error) {
    console.error('❌ Demo data seeding error:', error);
  }
};

// Auth endpoints
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone, role } = req.body;
    console.log('OTP request:', { phone, role });
    
    // In production, integrate with SMS service
    // For demo, just return success
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
    
    // In production, verify with SMS service
    // For demo, accept '123456' as valid OTP
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
    
    // Get user from database
    const userResult = await pool.query('SELECT * FROM users WHERE phone = $1', ['+91 9876543210']);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
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
    const assetsResult = await pool.query(
      'SELECT category, SUM(current_value) as total_value FROM assets WHERE user_id = $1 AND status = $2 GROUP BY category',
      [userId, 'Active']
    );
    
    const totalAssets = assetsResult.rows.length;
    const netWorth = assetsResult.rows.reduce((sum, row) => sum + parseFloat(row.total_value), 0);
    
    // Get nominees count
    const nomineesResult = await pool.query(
      'SELECT COUNT(*) as count FROM nominees WHERE user_id = $1',
      [userId]
    );
    const totalNominees = parseInt(nomineesResult.rows[0].count);
    
    // Format asset allocation
    const assetAllocation = assetsResult.rows.map((row, index) => ({
      name: row.category,
      value: Math.round((parseFloat(row.total_value) / netWorth) * 100),
      amount: parseFloat(row.total_value),
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
    const result = await pool.query(
      'SELECT * FROM assets WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    const assets = result.rows.map(asset => ({
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
    
    res.json(assets);
  } catch (error) {
    console.error('Assets fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

app.post('/api/assets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category, institution, accountNumber, currentValue, notes, documents } = req.body;
    
    const result = await pool.query(
      'INSERT INTO assets (user_id, category, institution, account_number, current_value, notes, documents) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, category, institution, accountNumber, currentValue, notes, documents || []]
    );
    
    const asset = result.rows[0];
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
    
    const result = await pool.query(
      'UPDATE assets SET category = $1, institution = $2, account_number = $3, current_value = $4, status = $5, notes = $6, documents = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 AND user_id = $9 RETURNING *',
      [category, institution, accountNumber, currentValue, status, notes, documents, assetId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    const asset = result.rows[0];
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
    
    const result = await pool.query(
      'DELETE FROM assets WHERE id = $1 AND user_id = $2 RETURNING id',
      [assetId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
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
    const result = await pool.query(
      'SELECT * FROM nominees WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    const nominees = result.rows.map(nominee => ({
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
    
    res.json(nominees);
  } catch (error) {
    console.error('Nominees fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch nominees' });
  }
});

app.post('/api/nominees', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, relation, phone, email, allocationPercentage, isExecutor, isBackup } = req.body;
    
    const result = await pool.query(
      'INSERT INTO nominees (user_id, name, relation, phone, email, allocation_percentage, is_executor, is_backup) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [userId, name, relation, phone, email, allocationPercentage, isExecutor || false, isBackup || false]
    );
    
    const nominee = result.rows[0];
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
    
    const result = await pool.query(
      'UPDATE nominees SET name = $1, relation = $2, phone = $3, email = $4, allocation_percentage = $5, is_executor = $6, is_backup = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 AND user_id = $9 RETURNING *',
      [name, relation, phone, email, allocationPercentage, isExecutor, isBackup, nomineeId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nominee not found' });
    }
    
    const nominee = result.rows[0];
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
    
    const result = await pool.query(
      'DELETE FROM nominees WHERE id = $1 AND user_id = $2 RETURNING id',
      [nomineeId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nominee not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Nominee deletion error:', error);
    res.status(500).json({ error: 'Failed to delete nominee' });
  }
});

// Trading accounts endpoints
app.get('/api/trading-accounts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      'SELECT ta.*, n.name as nominee_name FROM trading_accounts ta LEFT JOIN nominees n ON ta.nominee_id = n.id WHERE ta.user_id = $1 ORDER BY ta.created_at DESC',
      [userId]
    );
    
    const tradingAccounts = result.rows.map(account => ({
      id: account.id,
      brokerName: account.broker_name,
      clientId: account.client_id,
      dematNumber: account.demat_number,
      nomineeId: account.nominee_id,
      nomineeName: account.nominee_name,
      currentValue: parseFloat(account.current_value),
      status: account.status,
      createdAt: account.created_at,
      updatedAt: account.updated_at
    }));
    
    res.json(tradingAccounts);
  } catch (error) {
    console.error('Trading accounts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch trading accounts' });
  }
});

app.post('/api/trading-accounts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { brokerName, clientId, dematNumber, nomineeId, currentValue, status } = req.body;
    
    const result = await pool.query(
      'INSERT INTO trading_accounts (user_id, broker_name, client_id, demat_number, nominee_id, current_value, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, brokerName, clientId, dematNumber, nomineeId, currentValue, status || 'Active']
    );
    
    const account = result.rows[0];
    res.json({
      id: account.id,
      brokerName: account.broker_name,
      clientId: account.client_id,
      dematNumber: account.demat_number,
      nomineeId: account.nominee_id,
      currentValue: parseFloat(account.current_value),
      status: account.status
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
    const result = await pool.query(
      'SELECT vr.*, n.name as nominee_name FROM vault_requests vr LEFT JOIN nominees n ON vr.nominee_id = n.id WHERE n.user_id = $1 OR vr.nominee_id IN (SELECT id FROM nominees WHERE user_id = $1) ORDER BY vr.created_at DESC',
      [userId]
    );
    
    const vaultRequests = result.rows.map(request => ({
      id: request.id,
      nomineeName: request.nominee_name || request.nominee_name,
      relationToDeceased: request.relation_to_deceased,
      requestDate: request.created_at,
      status: request.status,
      deathCertificate: request.death_certificate_url,
      adminNotes: request.admin_notes,
      reviewedAt: request.reviewed_at,
      vaultOpenedAt: request.vault_opened_at
    }));
    
    res.json(vaultRequests);
  } catch (error) {
    console.error('Vault requests fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch vault requests' });
  }
});

app.post('/api/vault/requests', authenticateToken, async (req, res) => {
  try {
    const { nomineeName, relationToDeceased, phoneNumber, email, deathCertificate, nomineeId } = req.body;
    
    const result = await pool.query(
      'INSERT INTO vault_requests (nominee_id, nominee_name, relation_to_deceased, phone_number, email, death_certificate_url, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nomineeId, nomineeName, relationToDeceased, phoneNumber, email, deathCertificate, 'pending']
    );
    
    const request = result.rows[0];
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
    // In production, implement actual file upload to cloud storage
    // For demo, return a mock file path
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
    database: 'Connected'
  });
});

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    await seedDemoData();
    
    app.listen(PORT, () => {
      console.log(`🚀 Real backend server running on http://localhost:${PORT}`);
      console.log(`📊 Database: PostgreSQL connected`);
      console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Using demo secret'}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();
