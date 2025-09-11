const express = require('express');
const multer = require('multer');
const DocumentValidator = require('./document-validator');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize document validator
const validator = new DocumentValidator();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'), false);
    }
  }
});

// Middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // For demo purposes, accept demo-token
  if (token === 'demo-token') {
    req.user = { id: 'demo-user-123' };
    return next();
  }

  // In production, verify JWT token here
  next();
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Document Validation API is running!', 
    timestamp: new Date().toISOString(),
    features: [
      'Free OCR with Tesseract.js',
      'Document type detection',
      'Fraud detection',
      'Duplicate detection',
      'File validation'
    ]
  });
});

// Upload and validate single document
app.post('/api/documents/validate', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document provided' });
    }

    const { documentType } = req.body;
    
    // Validate document
    const validationResult = await validator.validateDocument(req.file, documentType);
    
    // Store document metadata in database
    const { data: documentRecord, error: dbError } = await supabase
      .from('document_validations')
      .insert({
        user_id: req.user.id,
        file_name: req.file.originalname,
        file_size: req.file.size,
        file_type: req.file.mimetype,
        document_type: validationResult.documentType,
        confidence_score: validationResult.confidence,
        fraud_risk_score: validationResult.fraudDetection?.riskScore || 0,
        is_duplicate: validationResult.duplicateDetection?.isDuplicate || false,
        validation_status: validationResult.isValid ? 'valid' : 'invalid',
        extracted_text: validationResult.extractedText,
        validation_details: {
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          recommendations: validationResult.recommendations,
          fraudDetection: validationResult.fraudDetection,
          duplicateDetection: validationResult.duplicateDetection
        },
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
    }

    res.json({
      success: true,
      validation: validationResult,
      documentId: documentRecord?.id,
      cost: {
        ocr: 'FREE (Tesseract.js)',
        validation: 'FREE (Open source)',
        total: '$0.00'
      }
    });

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ 
      error: 'Document validation failed',
      details: error.message 
    });
  }
});

// Upload and validate multiple documents
app.post('/api/documents/validate-batch', authenticateToken, upload.array('documents', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No documents provided' });
    }

    const results = [];
    let totalCost = 0;

    for (const file of req.files) {
      const validationResult = await validator.validateDocument(file);
      
      results.push({
        fileName: file.originalname,
        validation: validationResult,
        cost: '$0.00'
      });
    }

    res.json({
      success: true,
      results: results,
      summary: {
        totalDocuments: req.files.length,
        validDocuments: results.filter(r => r.validation.isValid).length,
        invalidDocuments: results.filter(r => !r.validation.isValid).length,
        totalCost: '$0.00',
        savings: '100% (All validation is FREE)'
      }
    });

  } catch (error) {
    console.error('Batch validation error:', error);
    res.status(500).json({ 
      error: 'Batch validation failed',
      details: error.message 
    });
  }
});

// Get validation history for user
app.get('/api/documents/history', authenticateToken, async (req, res) => {
  try {
    const { data: validations, error } = await supabase
      .from('document_validations')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      validations: validations || [],
      totalCost: '$0.00' // All validations are free
    });

  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch validation history',
      details: error.message 
    });
  }
});

// Get validation statistics
app.get('/api/documents/stats', authenticateToken, async (req, res) => {
  try {
    const { data: stats, error } = await supabase
      .from('document_validations')
      .select('validation_status, document_type, fraud_risk_score')
      .eq('user_id', req.user.id);

    if (error) {
      throw error;
    }

    const summary = {
      totalDocuments: stats.length,
      validDocuments: stats.filter(s => s.validation_status === 'valid').length,
      invalidDocuments: stats.filter(s => s.validation_status === 'invalid').length,
      documentTypes: {},
      fraudRiskDistribution: {
        low: stats.filter(s => s.fraud_risk_score < 20).length,
        medium: stats.filter(s => s.fraud_risk_score >= 20 && s.fraud_risk_score < 50).length,
        high: stats.filter(s => s.fraud_risk_score >= 50).length
      },
      totalSavings: `$${(stats.length * 2).toFixed(2)}` // Assuming $2 per validation saved
    };

    // Count document types
    stats.forEach(stat => {
      summary.documentTypes[stat.document_type] = (summary.documentTypes[stat.document_type] || 0) + 1;
    });

    res.json({
      success: true,
      stats: summary
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum 10MB allowed.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum 5 files allowed.' });
    }
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔒 Document Validation API running on http://localhost:${PORT}`);
  console.log(`💰 Cost: FREE for all validations`);
  console.log(`🛡️ Security: Multi-layer fraud detection`);
  console.log(`📊 Features: OCR, Type detection, Duplicate detection`);
});
