const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock auth endpoints
app.post('/api/auth/send-otp', (req, res) => {
  console.log('OTP request:', req.body);
  res.json({ success: true, message: 'OTP sent successfully', userId: 'demo-user-123' });
});

app.post('/api/auth/verify-otp', (req, res) => {
  console.log('OTP verify:', req.body);
  res.json({ success: true, message: 'OTP verified successfully', userId: 'demo-user-123', requiresPin: true });
});

app.post('/api/auth/verify-pin', (req, res) => {
  console.log('PIN verify:', req.body);
  res.json({ 
    success: true, 
    user: { id: 'demo-user-123', name: 'Demo User', role: 'owner' }, 
    token: 'demo-jwt-token' 
  });
});

// Mock dashboard endpoints
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalAssets: 4,
    totalNominees: 2,
    netWorth: 2500000,
    assetAllocation: [
      { name: 'Bank', value: 35, amount: 875000, color: '#1E3A8A' },
      { name: 'LIC', value: 25, amount: 625000, color: '#3B82F6' },
      { name: 'Property', value: 20, amount: 500000, color: '#60A5FA' },
      { name: 'Stocks', value: 20, amount: 500000, color: '#93C5FD' },
    ],
    recentActivity: []
  });
});

// Mock CRUD endpoints
app.get('/api/assets', (req, res) => {
  res.json([
    { id: '1', category: 'Bank', institution: 'SBI', accountNumber: '****1234', currentValue: 500000, status: 'Active', documents: [] },
    { id: '2', category: 'LIC', institution: 'LIC India', accountNumber: '****5678', currentValue: 200000, status: 'Active', documents: [] }
  ]);
});

app.get('/api/nominees', (req, res) => {
  res.json([
    { id: '1', name: 'Jane Doe', relation: 'Spouse', phone: '+91 9876543210', email: 'jane@example.com', allocationPercentage: 60, isExecutor: true, isBackup: false },
    { id: '2', name: 'John Jr', relation: 'Child', phone: '+91 9876543211', email: 'john@example.com', allocationPercentage: 40, isExecutor: false, isBackup: false }
  ]);
});

app.get('/api/trading-accounts', (req, res) => {
  res.json([]);
});

app.get('/api/vault/requests', (req, res) => {
  res.json([]);
});

app.post('/api/vault/requests', (req, res) => {
  console.log('Vault request:', req.body);
  res.json({ success: true, id: 'vault-123' });
});

app.post('/api/upload', (req, res) => {
  console.log('File upload request');
  res.json({ success: true, fileName: 'demo-file.pdf', url: 'https://demo.com/file.pdf' });
});

app.listen(PORT, () => {
  console.log(`🚀 Simple backend running on http://localhost:${PORT}`);
});
