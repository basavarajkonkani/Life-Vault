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

// Mock users with roles
const users = {
  'owner-123': {
    id: 'owner-123',
    name: 'John Doe',
    phone: '+91 9876543210',
    email: 'john@example.com',
    role: 'owner',
    pinHash: 'hashed1234'
  },
  'nominee-123': {
    id: 'nominee-123',
    name: 'Jane Doe',
    phone: '+91 9876543211',
    email: 'jane@example.com',
    role: 'nominee',
    pinHash: null
  },
  'admin-123': {
    id: 'admin-123',
    name: 'Super Admin',
    phone: '+91 9999999999',
    email: 'admin@lifevault.com',
    role: 'admin',
    pinHash: 'hashed1234'
  }
};

// Helper function to normalize phone numbers
const normalizePhone = (phone) => {
  // Remove all spaces and special characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // If it starts with +91, return as is
  if (cleaned.startsWith('+91')) {
    return cleaned;
  }
  
  // If it starts with 91, add +
  if (cleaned.startsWith('91')) {
    return '+' + cleaned;
  }
  
  // If it's a 10-digit number, add +91
  if (cleaned.length === 10) {
    return '+91' + cleaned;
  }
  
  // Return as is if none of the above
  return phone;
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users[decoded.userId];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Send OTP (works for all roles)
app.post('/api/auth/send-otp', (req, res) => {
  const { phone, role } = req.body;
  const normalizedPhone = normalizePhone(phone);
  
  console.log(`📱 Sending OTP to: ${phone} (normalized: ${normalizedPhone}) for role: ${role}`);

  // Find user by normalized phone and role
  const user = Object.values(users).find(u => normalizePhone(u.phone) === normalizedPhone && u.role === role);
  
  if (!user) {
    console.log(`❌ User not found for phone: ${normalizedPhone} and role: ${role}`);
    return res.status(404).json({
      success: false,
      message: 'User not found for this role'
    });
  }

  console.log(`✅ User found: ${user.name} (${user.role})`);
  res.json({
    success: true,
    message: 'OTP sent successfully',
    userId: user.id,
    requiresPin: user.role !== 'nominee'
  });
});

// Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp, role } = req.body;
  const normalizedPhone = normalizePhone(phone);
  
  console.log(`🔐 Verifying OTP: ${otp} for ${normalizedPhone} with role: ${role}`);

  if (otp !== '123456') {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP. Use 123456 for demo'
    });
  }

  const user = Object.values(users).find(u => normalizePhone(u.phone) === normalizedPhone && u.role === role);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // For nominees, skip PIN verification
  if (user.role === 'nominee') {
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({
      success: true,
      user: { ...user, pinHash: undefined },
      token,
      message: 'Login successful'
    });
  }

  res.json({
    success: true,
    message: 'OTP verified successfully',
    userId: user.id,
    requiresPin: true
  });
});

// Verify PIN (for owners and admins only)
app.post('/api/auth/verify-pin', (req, res) => {
  const { userId, pin } = req.body;
  console.log(`🔑 Verifying PIN: ${pin} for user: ${userId}`);

  const user = users[userId];
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.role === 'nominee') {
    return res.status(400).json({
      success: false,
      message: 'PIN not required for nominees'
    });
  }

  if (pin !== '1234') {
    return res.status(400).json({
      success: false,
      message: 'Invalid PIN. Use 1234 for demo'
    });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  
  res.json({
    success: true,
    user: { ...user, pinHash: undefined },
    token,
    message: 'Login successful'
  });
});

// ============================================================================
// DASHBOARD ROUTES
// ============================================================================

// Get dashboard stats (role-based)
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const user = req.user;
  
  if (user.role === 'owner') {
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
  } else if (user.role === 'nominee') {
    res.json({
      totalAssets: 2,
      totalNominees: 0,
      netWorth: 800000,
      assetAllocation: [
        { name: 'Bank', value: 62, amount: 500000, color: '#1E3A8A' },
        { name: 'LIC', value: 38, amount: 300000, color: '#3B82F6' }
      ],
      recentActivity: []
    });
  } else if (user.role === 'admin') {
    res.json({
      totalAssets: 0,
      totalNominees: 0,
      netWorth: 0,
      assetAllocation: [],
      recentActivity: [],
      adminStats: {
        pendingRequests: 3,
        totalRequests: 10,
        approvedRequests: 5,
        rejectedRequests: 2
      }
    });
  }
});

// Get assets (role-based)
app.get('/api/dashboard/assets', authenticateToken, (req, res) => {
  const user = req.user;
  
  if (user.role === 'owner') {
    res.json([
      { id: 'asset-1', category: 'Bank', institution: 'SBI', current_value: 500000, status: 'Active' },
      { id: 'asset-2', category: 'LIC', institution: 'LIC Policy', current_value: 300000, status: 'Active' },
      { id: 'asset-3', category: 'Property', institution: 'House', current_value: 2000000, status: 'Active' }
    ]);
  } else if (user.role === 'nominee') {
    res.json([
      { id: 'asset-1', category: 'Bank', institution: 'SBI', current_value: 500000, status: 'Active' },
      { id: 'asset-2', category: 'LIC', institution: 'LIC Policy', current_value: 300000, status: 'Active' }
    ]);
  } else {
    res.json([]);
  }
});

// ============================================================================
// VAULT REQUEST ROUTES
// ============================================================================

// Get vault requests (nominee and admin)
app.get('/api/vault/requests', authenticateToken, (req, res) => {
  const user = req.user;
  
  if (user.role === 'nominee') {
    res.json([
      {
        id: 'vault-1',
        nominee_id: user.id,
        owner_id: 'owner-123',
        status: 'pending',
        created_at: new Date().toISOString()
      }
    ]);
  } else if (user.role === 'admin') {
    res.json([
      {
        id: 'vault-1',
        nominee_id: 'nominee-123',
        owner_id: 'owner-123',
        status: 'pending',
        created_at: new Date().toISOString()
      }
    ]);
  } else {
    res.status(403).json({ error: 'Access denied' });
  }
});

// Submit vault request (nominee only)
app.post('/api/vault/requests', authenticateToken, requireRole(['nominee']), (req, res) => {
  const { death_certificate_url } = req.body;
  const user = req.user;
  
  const newRequest = {
    id: `vault-${Date.now()}`,
    nominee_id: user.id,
    owner_id: 'owner-123',
    death_certificate_url,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  
  res.json({
    success: true,
    request: newRequest,
    message: 'Vault request submitted successfully'
  });
});

// Update vault request status (admin only)
app.put('/api/vault/requests/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body;
  
  res.json({
    success: true,
    request: {
      id,
      status,
      admin_notes,
      reviewed_at: new Date().toISOString(),
      reviewed_by: req.user.id
    },
    message: 'Request status updated successfully'
  });
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

// Create admin (super admin only)
app.post('/api/admin/create', authenticateToken, requireRole(['admin']), (req, res) => {
  const { name, phone, email } = req.body;
  
  // Check if current user is super admin (hardcoded check)
  if (req.user.id !== 'admin-123') {
    return res.status(403).json({ error: 'Only super admin can create admins' });
  }
  
  const newAdminId = `admin-${Date.now()}`;
  const newAdmin = {
    id: newAdminId,
    name,
    phone,
    email,
    role: 'admin',
    pinHash: 'hashed1234'
  };
  
  users[newAdminId] = newAdmin;
  
  res.json({
    success: true,
    admin: { ...newAdmin, pinHash: undefined },
    message: 'Admin created successfully'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'LifeVault Multi-Role Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LifeVault Multi-Role Backend running on http://localhost:${PORT}`);
  console.log('📱 Demo credentials:');
  console.log('   Owner: +91 9876543210 (OTP: 123456, PIN: 1234)');
  console.log('   Nominee: +91 9876543211 (OTP: 123456, no PIN)');
  console.log('   Admin: +91 9999999999 (OTP: 123456, PIN: 1234)');
  console.log('📱 Alternative formats also supported:');
  console.log('   9876543210, 919876543210, +919876543210');
});
