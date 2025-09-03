const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'your-service-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-make-it-long-and-secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG are allowed.'));
    }
  }
});

// Auth Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Utility Functions
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      phone: user.phone,
      email: user.email 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const hashPin = async (pin) => {
  return await bcrypt.hash(pin, 10);
};

const verifyPin = async (pin, hashedPin) => {
  return await bcrypt.compare(pin, hashedPin);
};

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, phone, email, pin, address } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !pin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, phone, email, and PIN are required' 
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`phone.eq.${phone},email.eq.${email}`)
      .single();

    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this phone or email already exists' 
      });
    }

    // Hash PIN
    const pinHash = await hashPin(pin);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        name,
        phone,
        email,
        address,
        pin_hash: pinHash,
        is_active: true,
        role: 'user'
      }])
      .select()
      .single();

    if (error) {
      console.error('User creation error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create user' 
      });
    }

    // Generate token
    const token = generateToken(newUser);

    // Remove sensitive data
    delete newUser.pin_hash;

    res.status(201).json({
      success: true,
      user: newUser,
      token,
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }

    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, phone, is_active')
      .eq('phone', phone)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // In production, integrate with Firebase Auth, Twilio, or similar
    // For demo, we'll simulate OTP sending
    console.log(`📱 Sending OTP to: ${phone} for user: ${user.name}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      userId: user.id
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP' 
    });
  }
});

// Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone and OTP are required' 
      });
    }

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, phone, is_active')
      .eq('phone', phone)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // In production, verify OTP with Firebase Auth, Twilio, etc.
    // For demo, accept '123456' as valid OTP
    if (otp !== '123456') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP. Use 123456 for demo' 
      });
    }

    console.log(`🔐 OTP verified for: ${phone}`);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      userId: user.id
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify OTP' 
    });
  }
});

// Verify PIN and login
app.post('/api/auth/verify-pin', async (req, res) => {
  try {
    const { userId, pin } = req.body;

    if (!userId || !pin) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and PIN are required' 
      });
    }

    // Get user with PIN hash
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Verify PIN
    const isPinValid = await verifyPin(pin, user.pin_hash);
    if (!isPinValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid PIN' 
      });
    }

    // Generate token
    const token = generateToken(user);

    // Remove sensitive data
    delete user.pin_hash;
    delete user.encryption_key;

    console.log(`🔑 PIN verified for user: ${user.name}`);

    res.json({
      success: true,
      user,
      token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Verify PIN error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify PIN' 
    });
  }
});

// ============================================================================
// DASHBOARD ROUTES
// ============================================================================

// Get dashboard statistics
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get assets count and total value
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('current_value')
      .eq('user_id', userId);

    if (assetsError) {
      console.error('Assets fetch error:', assetsError);
      return res.status(500).json({ error: 'Failed to fetch assets' });
    }

    // Get nominees count
    const { data: nominees, error: nomineesError } = await supabase
      .from('nominees')
      .select('id')
      .eq('user_id', userId);

    if (nomineesError) {
      console.error('Nominees fetch error:', nomineesError);
      return res.status(500).json({ error: 'Failed to fetch nominees' });
    }

    // Calculate total value
    const totalValue = assets.reduce((sum, asset) => sum + parseFloat(asset.current_value), 0);

    // Get asset allocation by category
    const { data: assetsByCategory, error: categoryError } = await supabase
      .from('assets')
      .select('category, current_value')
      .eq('user_id', userId);

    if (categoryError) {
      console.error('Asset category fetch error:', categoryError);
      return res.status(500).json({ error: 'Failed to fetch asset categories' });
    }

    // Calculate allocation percentages
    const categoryTotals = {};
    assetsByCategory.forEach(asset => {
      const category = asset.category;
      const value = parseFloat(asset.current_value);
      categoryTotals[category] = (categoryTotals[category] || 0) + value;
    });

    const assetAllocation = Object.entries(categoryTotals).map(([category, value], index) => {
      const colors = ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#EFF6FF'];
      return {
        name: category,
        value: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
        amount: value,
        color: colors[index % colors.length]
      };
    });

    res.json({
      totalAssets: assets.length,
      totalNominees: nominees.length,
      netWorth: totalValue,
      assetAllocation,
      recentActivity: [
        {
          id: 1,
          type: 'asset_added',
          description: 'Recent asset activity',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'success'
        }
      ]
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// ============================================================================
// ASSETS ROUTES
// ============================================================================

// Get all assets for user
app.get('/api/dashboard/assets', authenticateToken, async (req, res) => {
  try {
    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Assets fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch assets' });
    }

    res.json(assets);
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Create new asset
app.post('/api/assets', authenticateToken, async (req, res) => {
  try {
    const {
      category,
      institution,
      accountNumber,
      currentValue,
      status = 'Active',
      notes,
      maturityDate,
      nominee
    } = req.body;

    if (!category || !institution || !accountNumber || !currentValue) {
      return res.status(400).json({ 
        error: 'Category, institution, account number, and current value are required' 
      });
    }

    const { data: newAsset, error } = await supabase
      .from('assets')
      .insert([{
        user_id: req.user.id,
        category,
        institution,
        account_number: accountNumber,
        current_value: parseFloat(currentValue),
        status,
        notes,
        maturity_date: maturityDate,
        nominee,
        documents: []
      }])
      .select()
      .single();

    if (error) {
      console.error('Asset creation error:', error);
      return res.status(500).json({ error: 'Failed to create asset' });
    }

    console.log('✅ Added new asset:', newAsset.institution);
    res.status(201).json(newAsset);

  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// Update asset
app.put('/api/assets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert currentValue to number if present
    if (updateData.currentValue) {
      updateData.current_value = parseFloat(updateData.currentValue);
      delete updateData.currentValue;
    }

    // Convert accountNumber field name
    if (updateData.accountNumber) {
      updateData.account_number = updateData.accountNumber;
      delete updateData.accountNumber;
    }

    const { data: updatedAsset, error } = await supabase
      .from('assets')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Asset update error:', error);
      return res.status(500).json({ error: 'Failed to update asset' });
    }

    if (!updatedAsset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    console.log('✏️ Updated asset:', updatedAsset.institution);
    res.json(updatedAsset);

  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

// Delete asset
app.delete('/api/assets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: deletedAsset, error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Asset deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete asset' });
    }

    if (!deletedAsset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    console.log('🗑️ Deleted asset:', deletedAsset.institution);
    res.json({ message: 'Asset deleted successfully' });

  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

// ============================================================================
// NOMINEES ROUTES
// ============================================================================

// Get all nominees for user
app.get('/api/dashboard/nominees', authenticateToken, async (req, res) => {
  try {
    const { data: nominees, error } = await supabase
      .from('nominees')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Nominees fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch nominees' });
    }

    res.json(nominees);
  } catch (error) {
    console.error('Get nominees error:', error);
    res.status(500).json({ error: 'Failed to fetch nominees' });
  }
});

// Create new nominee
app.post('/api/nominees', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      relation,
      phone,
      email,
      allocationPercentage,
      isExecutor = false,
      isBackup = false,
      address,
      idProofType,
      idProofNumber
    } = req.body;

    if (!name || !relation || !phone || !email || allocationPercentage === undefined) {
      return res.status(400).json({ 
        error: 'Name, relation, phone, email, and allocation percentage are required' 
      });
    }

    const { data: newNominee, error } = await supabase
      .from('nominees')
      .insert([{
        user_id: req.user.id,
        name,
        relation,
        phone,
        email,
        allocation_percentage: parseFloat(allocationPercentage),
        is_executor: isExecutor,
        is_backup: isBackup,
        address,
        id_proof_type: idProofType,
        id_proof_number: idProofNumber
      }])
      .select()
      .single();

    if (error) {
      console.error('Nominee creation error:', error);
      return res.status(500).json({ error: 'Failed to create nominee' });
    }

    console.log('✅ Added new nominee:', newNominee.name);
    res.status(201).json(newNominee);

  } catch (error) {
    console.error('Create nominee error:', error);
    res.status(500).json({ error: 'Failed to create nominee' });
  }
});

// Update nominee
app.put('/api/nominees/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert field names to match database schema
    if (updateData.allocationPercentage !== undefined) {
      updateData.allocation_percentage = parseFloat(updateData.allocationPercentage);
      delete updateData.allocationPercentage;
    }
    
    if (updateData.isExecutor !== undefined) {
      updateData.is_executor = updateData.isExecutor;
      delete updateData.isExecutor;
    }
    
    if (updateData.isBackup !== undefined) {
      updateData.is_backup = updateData.isBackup;
      delete updateData.isBackup;
    }

    if (updateData.idProofType !== undefined) {
      updateData.id_proof_type = updateData.idProofType;
      delete updateData.idProofType;
    }

    if (updateData.idProofNumber !== undefined) {
      updateData.id_proof_number = updateData.idProofNumber;
      delete updateData.idProofNumber;
    }

    const { data: updatedNominee, error } = await supabase
      .from('nominees')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Nominee update error:', error);
      return res.status(500).json({ error: 'Failed to update nominee' });
    }

    if (!updatedNominee) {
      return res.status(404).json({ error: 'Nominee not found' });
    }

    console.log('✏️ Updated nominee:', updatedNominee.name);
    res.json(updatedNominee);

  } catch (error) {
    console.error('Update nominee error:', error);
    res.status(500).json({ error: 'Failed to update nominee' });
  }
});

// Delete nominee
app.delete('/api/nominees/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: deletedNominee, error } = await supabase
      .from('nominees')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Nominee deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete nominee' });
    }

    if (!deletedNominee) {
      return res.status(404).json({ error: 'Nominee not found' });
    }

    console.log('🗑️ Deleted nominee:', deletedNominee.name);
    res.json({ message: 'Nominee deleted successfully' });

  } catch (error) {
    console.error('Delete nominee error:', error);
    res.status(500).json({ error: 'Failed to delete nominee' });
  }
});

// ============================================================================
// FILE UPLOAD ROUTES
// ============================================================================

// Upload document
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const fileName = `${req.user.id}/${Date.now()}-${file.originalname}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        duplex: 'half'
      });

    if (error) {
      console.error('File upload error:', error);
      return res.status(500).json({ error: 'Failed to upload file' });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    console.log('📁 File uploaded:', fileName);
    
    res.json({
      success: true,
      fileName: data.path,
      url: publicUrl,
      size: file.size,
      type: file.mimetype
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// ============================================================================
// VAULT REQUESTS ROUTES
// ============================================================================

// Get vault requests (admin view)
app.get('/api/vault/requests', authenticateToken, async (req, res) => {
  try {
    const { data: requests, error } = await supabase
      .from('vault_requests')
      .select(`
        *,
        nominee:nominees(name, relation, user_id)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Vault requests fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch vault requests' });
    }

    res.json(requests);
  } catch (error) {
    console.error('Get vault requests error:', error);
    res.status(500).json({ error: 'Failed to fetch vault requests' });
  }
});

// Submit vault access request
app.post('/api/vault/requests', async (req, res) => {
  try {
    const {
      nomineeName,
      relationToDeceased,
      phoneNumber,
      email,
      deathCertificateUrl,
      nomineeId
    } = req.body;

    if (!nomineeName || !relationToDeceased || !phoneNumber || !email) {
      return res.status(400).json({ 
        error: 'Nominee name, relation, phone, and email are required' 
      });
    }

    const { data: newRequest, error } = await supabase
      .from('vault_requests')
      .insert([{
        nominee_id: nomineeId,
        nominee_name: nomineeName,
        relation_to_deceased: relationToDeceased,
        phone_number: phoneNumber,
        email,
        death_certificate_url: deathCertificateUrl,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Vault request creation error:', error);
      return res.status(500).json({ error: 'Failed to create vault request' });
    }

    console.log('📋 New vault request:', newRequest.nominee_name);
    res.status(201).json(newRequest);

  } catch (error) {
    console.error('Create vault request error:', error);
    res.status(500).json({ error: 'Failed to create vault request' });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'LifeVault Supabase Backend is running!',
    database: 'Supabase PostgreSQL',
    storage: 'Supabase Storage',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LifeVault Supabase Backend running on http://localhost:${PORT}`);
  console.log(`🗄️  Database: Supabase PostgreSQL`);
  console.log(`📁 Storage: Supabase Storage`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth/register`);
  console.log(`💰 Assets API: http://localhost:${PORT}/api/dashboard/assets`);
  console.log(`👥 Nominees API: http://localhost:${PORT}/api/dashboard/nominees`);
  console.log(`📋 Vault API: http://localhost:${PORT}/api/vault/requests`);
  console.log(`\n⚡ Full Supabase integration ready!`);
  console.log(`📝 Remember to configure your .env file with Supabase credentials`);
});

module.exports = app; 