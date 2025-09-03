const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3003;

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

// Mock user data
let currentUser = {
  id: 'user-123',
  name: 'John Doe',
  phone: '+91 9876543210',
  email: 'john.doe@example.com',
  address: '123 Main Street, Mumbai, Maharashtra 400001'
};

// Mock data
const mockAssets = [
  {
    id: '1',
    category: 'Bank',
    institution: 'State Bank of India',
    accountNumber: '****1234',
    currentValue: 500000,
    status: 'Active',
    documents: ['passbook.pdf'],
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: currentUser.id
  },
  {
    id: '2',
    category: 'LIC',
    institution: 'LIC of India',
    accountNumber: '****5678',
    currentValue: 625000,
    status: 'Active',
    documents: ['policy.pdf'],
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: currentUser.id
  },
  {
    id: '3',
    category: 'Property',
    institution: 'Self',
    accountNumber: 'Property Deed',
    currentValue: 500000,
    status: 'Active',
    documents: ['deed.pdf'],
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: currentUser.id
  },
  {
    id: '4',
    category: 'Stocks',
    institution: 'Zerodha',
    accountNumber: '****9012',
    currentValue: 875000,
    status: 'Active',
    documents: ['portfolio.pdf'],
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: currentUser.id
  }
];

const mockNominees = [
  {
    id: '1',
    name: 'Jane Doe',
    relation: 'Spouse',
    phone: '+91 9876543210',
    email: 'jane@example.com',
    allocationPercentage: 60,
    isExecutor: true,
    isBackup: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: currentUser.id
  },
  {
    id: '2',
    name: 'John Doe Jr.',
    relation: 'Child',
    phone: '+91 9876543211',
    email: 'john.jr@example.com',
    allocationPercentage: 40,
    isExecutor: false,
    isBackup: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: currentUser.id
  }
];

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
    res.json({
      success: true,
      user: currentUser,
      token: 'mock-jwt-token-' + Date.now()
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
  const totalValue = mockAssets.reduce((sum, asset) => sum + asset.currentValue, 0);
  
  res.json({
    totalAssets: mockAssets.length,
    totalNominees: mockNominees.length,
    netWorth: totalValue,
    assetAllocation: [
      { name: 'Bank', value: 20, amount: 500000, color: '#1E3A8A' },
      { name: 'LIC', value: 25, amount: 625000, color: '#3B82F6' },
      { name: 'Property', value: 20, amount: 500000, color: '#60A5FA' },
      { name: 'Stocks', value: 35, amount: 875000, color: '#93C5FD' },
    ],
    recentActivity: [
      {
        id: 1,
        type: 'asset_added',
        description: 'Added SBI Savings Account',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'success'
      },
      {
        id: 2,
        type: 'nominee_updated',
        description: 'Updated nominee allocation',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'info'
      },
      {
        id: 3,
        type: 'reminder',
        description: 'LIC policy renewal reminder',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'warning'
      }
    ]
  });
});

app.get('/api/dashboard/assets', (req, res) => {
  res.json(mockAssets);
});

app.get('/api/dashboard/nominees', (req, res) => {
  res.json(mockNominees);
});

// Assets Routes
app.post('/api/assets', (req, res) => {
  const newAsset = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: currentUser.id
  };
  
  mockAssets.push(newAsset);
  console.log('✅ Added new asset:', newAsset.institution);
  
  res.status(201).json(newAsset);
});

app.put('/api/assets/:id', (req, res) => {
  const { id } = req.params;
  const assetIndex = mockAssets.findIndex(asset => asset.id === id);
  
  if (assetIndex === -1) {
    return res.status(404).json({ message: 'Asset not found' });
  }
  
  mockAssets[assetIndex] = {
    ...mockAssets[assetIndex],
    ...req.body,
    updatedAt: new Date()
  };
  
  console.log('✏️ Updated asset:', mockAssets[assetIndex].institution);
  res.json(mockAssets[assetIndex]);
});

app.delete('/api/assets/:id', (req, res) => {
  const { id } = req.params;
  const assetIndex = mockAssets.findIndex(asset => asset.id === id);
  
  if (assetIndex === -1) {
    return res.status(404).json({ message: 'Asset not found' });
  }
  
  const deletedAsset = mockAssets.splice(assetIndex, 1)[0];
  console.log('🗑️ Deleted asset:', deletedAsset.institution);
  
  res.json({ message: 'Asset deleted successfully' });
});

// Nominees Routes
app.post('/api/nominees', (req, res) => {
  const newNominee = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: currentUser.id
  };
  
  mockNominees.push(newNominee);
  console.log('✅ Added new nominee:', newNominee.name);
  
  res.status(201).json(newNominee);
});

app.put('/api/nominees/:id', (req, res) => {
  const { id } = req.params;
  const nomineeIndex = mockNominees.findIndex(nominee => nominee.id === id);
  
  if (nomineeIndex === -1) {
    return res.status(404).json({ message: 'Nominee not found' });
  }
  
  mockNominees[nomineeIndex] = {
    ...mockNominees[nomineeIndex],
    ...req.body,
    updatedAt: new Date()
  };
  
  console.log('✏️ Updated nominee:', mockNominees[nomineeIndex].name);
  res.json(mockNominees[nomineeIndex]);
});

app.delete('/api/nominees/:id', (req, res) => {
  const { id } = req.params;
  const nomineeIndex = mockNominees.findIndex(nominee => nominee.id === id);
  
  if (nomineeIndex === -1) {
    return res.status(404).json({ message: 'Nominee not found' });
  }
  
  const deletedNominee = mockNominees.splice(nomineeIndex, 1)[0];
  console.log('🗑️ Deleted nominee:', deletedNominee.name);
  
  res.json({ message: 'Nominee deleted successfully' });
});

// File Upload Routes
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    const file = req.file;
    
    // In a real app, this would upload to cloud storage
    // For demo, we'll simulate a successful upload
    const fileName = `uploads/${Date.now()}-${file.originalname}`;
    const fileUrl = `http://localhost:3003/files/${fileName}`;

    console.log('📁 File uploaded (simulated):', file.originalname);
    
    res.json({
      success: true,
      fileName: fileName,
      url: fileUrl,
      size: file.size,
      type: file.mimetype,
      originalName: file.originalname
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload file' 
    });
  }
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
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth/send-otp`);
  console.log(`💰 Assets API: http://localhost:${PORT}/api/dashboard/assets`);
  console.log(`👥 Nominees API: http://localhost:${PORT}/api/dashboard/nominees`);
  console.log(`📁 Upload API: http://localhost:${PORT}/api/upload`);
  console.log(`\n✨ Frontend should now have real data from backend!`);
  console.log(`📄 File uploads are now working!`);
});

module.exports = app; 