const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const FileType = require('file-type');
const crypto = require('crypto-js');
const fs = require('fs');
const path = require('path');

class DocumentValidator {
  constructor() {
    this.allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.documentTemplates = this.loadDocumentTemplates();
  }

  // Load document templates for validation
  loadDocumentTemplates() {
    return {
      'aadhaar': {
        keywords: ['aadhaar', 'uid', 'government of india', 'enrollment'],
        patterns: [/^\d{4}\s\d{4}\s\d{4}$/], // Aadhaar number pattern
        requiredFields: ['name', 'father', 'date of birth', 'address']
      },
      'pan': {
        keywords: ['permanent account number', 'income tax', 'pan card'],
        patterns: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/], // PAN pattern
        requiredFields: ['name', 'father', 'date of birth']
      },
      'death_certificate': {
        keywords: ['death certificate', 'municipal corporation', 'registrar'],
        patterns: [/certificate no/i, /date of death/i],
        requiredFields: ['name of deceased', 'date of death', 'place of death']
      },
      'bank_statement': {
        keywords: ['bank statement', 'account statement', 'transaction'],
        patterns: [/account number/i, /balance/i, /transaction/i],
        requiredFields: ['account number', 'bank name', 'statement period']
      }
    };
  }

  // FREE: Basic file validation
  async validateFile(file) {
    const results = {
      isValid: true,
      errors: [],
      warnings: [],
      fileInfo: {}
    };

    try {
      // Check file type
      const fileType = await FileType.fromBuffer(file.buffer);
      if (!fileType || !this.allowedTypes.includes(fileType.mime)) {
        results.isValid = false;
        results.errors.push('Invalid file type. Only JPG, PNG, and PDF are allowed.');
      }

      // Check file size
      if (file.size > this.maxFileSize) {
        results.isValid = false;
        results.errors.push('File size too large. Maximum 10MB allowed.');
      }

      // Check for suspicious patterns
      if (this.detectSuspiciousPatterns(file)) {
        results.warnings.push('File contains suspicious patterns. Manual review recommended.');
      }

      results.fileInfo = {
        type: fileType?.mime || 'unknown',
        size: file.size,
        name: file.originalname
      };

    } catch (error) {
      results.isValid = false;
      results.errors.push('File validation failed: ' + error.message);
    }

    return results;
  }

  // FREE: Detect suspicious patterns
  detectSuspiciousPatterns(file) {
    const suspiciousPatterns = [
      /password/i,
      /hack/i,
      /crack/i,
      /fake/i,
      /tutorial/i,
      /sample/i
    ];

    const fileName = file.originalname.toLowerCase();
    return suspiciousPatterns.some(pattern => pattern.test(fileName));
  }

  // FREE: Basic OCR with Tesseract.js
  async extractText(file) {
    try {
      let imageBuffer = file.buffer;
      
      // Convert PDF to image if needed
      if (file.mimetype === 'application/pdf') {
        // For PDF, we'll need a different approach
        // This is a simplified version
        return { text: '', confidence: 0 };
      }

      // Process image with Sharp for better OCR
      const processedImage = await sharp(imageBuffer)
        .resize(2000, 2000, { fit: 'inside' })
        .grayscale()
        .normalize()
        .toBuffer();

      // Extract text using Tesseract
      const { data: { text, confidence } } = await Tesseract.recognize(
        processedImage,
        'eng',
        {
          logger: m => console.log(m)
        }
      );

      return { text: text.toLowerCase(), confidence: confidence / 100 };
    } catch (error) {
      console.error('OCR Error:', error);
      return { text: '', confidence: 0 };
    }
  }

  // FREE: Document type detection
  async detectDocumentType(file) {
    const { text } = await this.extractText(file);
    const scores = {};

    for (const [docType, template] of Object.entries(this.documentTemplates)) {
      let score = 0;
      
      // Check keywords
      const keywordMatches = template.keywords.filter(keyword => 
        text.includes(keyword.toLowerCase())
      ).length;
      score += keywordMatches * 10;

      // Check patterns
      const patternMatches = template.patterns.filter(pattern => 
        pattern.test(text)
      ).length;
      score += patternMatches * 20;

      // Check required fields
      const fieldMatches = template.requiredFields.filter(field => 
        text.includes(field.toLowerCase())
      ).length;
      score += fieldMatches * 5;

      scores[docType] = score;
    }

    const detectedType = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );

    return {
      type: detectedType,
      confidence: scores[detectedType] / 100,
      scores: scores
    };
  }

  // FREE: Duplicate detection
  async detectDuplicate(file) {
    const fileHash = crypto.SHA256(file.buffer).toString();
    
    // In a real implementation, you'd check against a database
    // For now, we'll simulate this
    const existingHashes = []; // This would come from your database
    
    return {
      isDuplicate: existingHashes.includes(fileHash),
      hash: fileHash
    };
  }

  // FREE: Basic fraud detection
  async detectFraud(file, extractedText) {
    const fraudIndicators = {
      isSuspicious: false,
      reasons: [],
      riskScore: 0
    };

    // Check for common fraud patterns
    const fraudPatterns = [
      /photoshop/i,
      /edited/i,
      /modified/i,
      /fake/i,
      /sample/i,
      /test/i,
      /dummy/i
    ];

    fraudPatterns.forEach(pattern => {
      if (pattern.test(extractedText) || pattern.test(file.originalname)) {
        fraudIndicators.isSuspicious = true;
        fraudIndicators.reasons.push('Suspicious keywords detected');
        fraudIndicators.riskScore += 20;
      }
    });

    // Check for low quality (might indicate tampering)
    if (extractedText.length < 50) {
      fraudIndicators.reasons.push('Very little text extracted - possible low quality or tampered document');
      fraudIndicators.riskScore += 15;
    }

    // Check for multiple languages (might indicate copy-paste)
    const languagePatterns = {
      english: /[a-zA-Z]/g,
      hindi: /[\u0900-\u097F]/g,
      numbers: /[0-9]/g
    };

    const languageCount = Object.values(languagePatterns)
      .map(pattern => (extractedText.match(pattern) || []).length)
      .filter(count => count > 0).length;

    if (languageCount > 2) {
      fraudIndicators.reasons.push('Multiple languages detected - possible copy-paste fraud');
      fraudIndicators.riskScore += 10;
    }

    return fraudIndicators;
  }

  // Main validation function
  async validateDocument(file, documentType = null) {
    const validationResult = {
      isValid: false,
      documentType: null,
      confidence: 0,
      extractedText: '',
      fraudDetection: null,
      duplicateDetection: null,
      errors: [],
      warnings: [],
      recommendations: []
    };

    try {
      // Step 1: Basic file validation
      const fileValidation = await this.validateFile(file);
      if (!fileValidation.isValid) {
        validationResult.errors = fileValidation.errors;
        return validationResult;
      }

      // Step 2: Extract text using OCR
      const ocrResult = await this.extractText(file);
      validationResult.extractedText = ocrResult.text;

      // Step 3: Detect document type
      const typeDetection = await this.detectDocumentType(file);
      validationResult.documentType = typeDetection.type;
      validationResult.confidence = typeDetection.confidence;

      // Step 4: Check for duplicates
      const duplicateCheck = await this.detectDuplicate(file);
      validationResult.duplicateDetection = duplicateCheck;

      // Step 5: Fraud detection
      const fraudCheck = await this.detectFraud(file, ocrResult.text);
      validationResult.fraudDetection = fraudCheck;

      // Step 6: Generate recommendations
      if (validationResult.confidence < 0.5) {
        validationResult.recommendations.push('Low confidence in document type detection. Manual review recommended.');
      }

      if (fraudCheck.riskScore > 30) {
        validationResult.recommendations.push('High fraud risk detected. Manual review required.');
      }

      if (duplicateCheck.isDuplicate) {
        validationResult.recommendations.push('Duplicate document detected. This document has been submitted before.');
      }

      // Final validation decision
      validationResult.isValid = fileValidation.isValid && 
                                validationResult.confidence > 0.3 && 
                                fraudCheck.riskScore < 50;

    } catch (error) {
      validationResult.errors.push('Validation failed: ' + error.message);
    }

    return validationResult;
  }
}

module.exports = DocumentValidator;
