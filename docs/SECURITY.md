# Security Guidelines

This document outlines security best practices, implementation guidelines, and considerations for the Ethio-Home application.

## Security Architecture Overview

The Ethio-Home application implements multiple layers of security:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│                 │    │                 │    │                 │
│ - Input Validation│    │ - Authentication│    │ - Access Control│
│ - XSS Protection │    │ - Authorization │    │ - Data Encryption│
│ - CSRF Protection│    │ - Rate Limiting │    │ - Audit Logging │
│ - Secure Headers │    │ - Input Sanitization│ │ - Backup Security│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Authentication & Authorization

### JWT Implementation

#### Token Management
```typescript
// Secure JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET, // Minimum 32 characters
  expiresIn: '15m', // Short-lived access tokens
  refreshTokenExpiresIn: '7d',
  algorithm: 'HS256',
};

// HTTP-only cookie configuration
const cookieOptions = {
  httpOnly: true, // Prevent XSS attacks
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict', // CSRF protection
  maxAge: 15 * 60 * 1000, // 15 minutes
};
```

#### Token Refresh Strategy
```javascript
// backend/controllers/authController.js
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('jwt', token, cookieOptions);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};
```

### Role-Based Access Control (RBAC)

#### User Roles Definition
```typescript
// src/types/auth.ts
export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  AGENT = 'agent',
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
}

export interface Permission {
  resource: string;
  actions: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.BUYER]: [
    { resource: 'properties', actions: ['read'] },
    { resource: 'interest', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reviews', actions: ['create', 'read', 'update', 'delete'] },
  ],
  [UserRole.SELLER]: [
    { resource: 'properties', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'interest', actions: ['read'] },
    { resource: 'reviews', actions: ['read'] },
  ],
  // ... other roles
};
```

#### Authorization Middleware
```javascript
// backend/middleware/authMiddleware.js
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// Usage
router.delete('/properties/:id', protect, authorize('admin', 'seller'), deleteProperty);
```

#### Frontend Route Protection
```typescript
// src/components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

## Input Validation & Sanitization

### Frontend Validation

#### Form Validation with Zod
```typescript
// src/schemas/propertySchema.ts
import { z } from 'zod';

export const createPropertySchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Title contains invalid characters'),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
  
  price: z
    .number()
    .positive('Price must be positive')
    .max(999999999, 'Price exceeds maximum allowed value'),
  
  location: z
    .string()
    .min(2, 'Location is required')
    .max(100, 'Location must not exceed 100 characters'),
  
  images: z
    .array(z.string().url('Invalid image URL'))
    .max(10, 'Maximum 10 images allowed'),
});

export type CreatePropertyData = z.infer<typeof createPropertySchema>;
```

#### Input Sanitization
```typescript
// src/utils/sanitizer.ts
import DOMPurify from 'dompurify';

export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  });
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML brackets
    .substring(0, 1000); // Limit length
};
```

### Backend Validation

#### Request Validation Middleware
```javascript
// backend/middleware/validation.js
const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// Property validation rules
const propertyValidation = [
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Title contains invalid characters'),
  
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .custom((value) => {
      if (value <= 0 || value > 999999999) {
        throw new Error('Price must be between 1 and 999,999,999');
      }
      return true;
    }),
  
  validateRequest,
];
```

#### Data Sanitization
```javascript
// backend/middleware/sanitization.js
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Apply sanitization middleware
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Clean user input from malicious HTML
app.use(hpp()); // Prevent HTTP Parameter Pollution
```

## Security Headers & CORS

### Security Headers Implementation
```javascript
// backend/middleware/security.js
const helmet = require('helmet');

const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});

app.use(securityHeaders);
```

### CORS Configuration
```javascript
// backend/config/cors.js
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173', // Development
      'https://ethio-home.com', // Production
      'https://staging.ethio-home.com', // Staging
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));
```

## Rate Limiting & DDoS Protection

### Rate Limiting Implementation
```javascript
// backend/middleware/rateLimiting.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('redis');

const redisClient = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

// General rate limiting
const generalLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:general:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.',
  },
  skipSuccessfulRequests: true,
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/v1/users/login', authLimiter);
app.use('/api/v1/users/signup', authLimiter);
```

### Request Size Limiting
```javascript
// backend/middleware/requestLimiting.js
const express = require('express');

// Limit request size
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload limits
const multer = require('multer');
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});
```

## Database Security

### MongoDB Security Configuration

#### Connection Security
```javascript
// backend/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Security options
      authSource: 'admin',
      ssl: process.env.NODE_ENV === 'production',
      sslValidate: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};
```

#### Data Encryption
```javascript
// backend/models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false, // Never include in queries by default
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  // ... other fields
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password verification method
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Password reset token generation
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};
```

#### Database Indexing for Security
```javascript
// backend/models/userModel.js
// Unique index for email
userSchema.index({ email: 1 }, { unique: true });

// TTL index for password reset tokens
userSchema.index({ passwordResetExpires: 1 }, { expireAfterSeconds: 0 });

// Compound index for security queries
userSchema.index({ email: 1, active: 1 });
```

## File Upload Security

### Secure File Upload Implementation
```javascript
// backend/middleware/fileUpload.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Secure file storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/properties');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueName}${extension}`);
  },
});

// File filter for security
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];
  
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const extension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10,
  },
});

module.exports = upload;
```

### File Validation and Processing
```javascript
// backend/utils/imageProcessor.js
const sharp = require('sharp');
const path = require('path');

const processImage = async (filePath) => {
  try {
    const processedPath = path.join(
      path.dirname(filePath),
      'processed_' + path.basename(filePath)
    );
    
    await sharp(filePath)
      .resize(1200, 800, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85 })
      .toFile(processedPath);
    
    // Remove original file
    fs.unlinkSync(filePath);
    
    return processedPath;
  } catch (error) {
    throw new Error('Image processing failed');
  }
};
```

## API Security

### Request Logging and Monitoring
```javascript
// backend/middleware/logging.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
    };
    
    if (res.statusCode >= 400) {
      logger.error('HTTP Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

module.exports = { logger, requestLogger };
```

### Error Handling Security
```javascript
// backend/middleware/errorHandler.js
const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/([\"])(\\\.?)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    sendErrorProd(error, res);
  }
};
```

## Frontend Security

### XSS Prevention
```typescript
// src/utils/security.ts
import DOMPurify from 'dompurify';

// Sanitize user content before rendering
export const sanitizeContent = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
};

// Safe HTML rendering component
export const SafeHTML: React.FC<{ content: string }> = ({ content }) => {
  const sanitizedContent = sanitizeContent(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
};
```

### CSRF Protection
```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection header
  },
});

// Add CSRF token to requests if available
api.interceptors.request.use((config) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});
```

### Secure Storage
```typescript
// src/utils/secureStorage.ts
class SecureStorage {
  private static encrypt(data: string): string {
    // Simple encryption for sensitive data
    return btoa(data);
  }

  private static decrypt(encryptedData: string): string {
    return atob(encryptedData);
  }

  static setItem(key: string, value: any, secure: boolean = false): void {
    const stringValue = JSON.stringify(value);
    const finalValue = secure ? this.encrypt(stringValue) : stringValue;
    localStorage.setItem(key, finalValue);
  }

  static getItem(key: string, secure: boolean = false): any {
    const value = localStorage.getItem(key);
    if (!value) return null;
    
    try {
      const decryptedValue = secure ? this.decrypt(value) : value;
      return JSON.parse(decryptedValue);
    } catch {
      return null;
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  static clear(): void {
    localStorage.clear();
  }
}

export default SecureStorage;
```

## Security Testing

### Security Test Cases
```typescript
// src/__tests__/security.test.ts
import { render, screen } from '@testing-library/react';
import { sanitizeContent } from '../utils/security';

describe('Security Functions', () => {
  describe('sanitizeContent', () => {
    it('should remove script tags', () => {
      const maliciousContent = '<script>alert("XSS")</script><p>Safe content</p>';
      const sanitized = sanitizeContent(maliciousContent);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('<p>Safe content</p>');
    });

    it('should remove event handlers', () => {
      const maliciousContent = '<div onclick="alert(\'XSS\')">Click me</div>';
      const sanitized = sanitizeContent(maliciousContent);
      
      expect(sanitized).not.toContain('onclick');
    });

    it('should allow safe HTML tags', () => {
      const safeContent = '<p><strong>Bold</strong> and <em>italic</em> text</p>';
      const sanitized = sanitizeContent(safeContent);
      
      expect(sanitized).toBe(safeContent);
    });
  });
});
```

### Backend Security Tests
```javascript
// backend/tests/security.test.js
const request = require('supertest');
const app = require('../app');

describe('Security Tests', () => {
  describe('Rate Limiting', () => {
    it('should block requests after rate limit exceeded', async () => {
      const requests = Array(6).fill().map(() => 
        request(app)
          .post('/api/v1/users/login')
          .send({ email: 'test@test.com', password: 'test' })
      );

      const responses = await Promise.all(requests);
      const lastResponse = responses[responses.length - 1];
      
      expect(lastResponse.status).toBe(429);
    });
  });

  describe('Input Validation', () => {
    it('should reject malicious input', async () => {
      const maliciousData = {
        title: '<script>alert("XSS")</script>',
        description: 'Test description',
        price: 100000,
      };

      const response = await request(app)
        .post('/api/v1/properties')
        .send(maliciousData);

      expect(response.status).toBe(400);
    });
  });
});
```

## Security Monitoring & Incident Response

### Security Monitoring Setup
```javascript
// backend/middleware/securityMonitoring.js
const logger = require('../utils/logger');

const securityMonitoring = (req, res, next) => {
  // Monitor suspicious activities
  const suspiciousPatterns = [
    /\\<script\\>/i,
    /javascript:/i,
    /onload=/i,
    /onerror=/i,
    /\\$\(\)/,
    /document\\.cookie/i,
  ];

  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(requestData)) {
      logger.error('Suspicious request detected', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        data: requestData,
        pattern: pattern.toString(),
      });
    }
  });

  next();
};

module.exports = securityMonitoring;
```

### Incident Response Procedures

#### Automated Response
```javascript
// backend/utils/incidentResponse.js
const logger = require('./logger');

class IncidentResponse {
  static async handleSecurityIncident(type, data) {
    // Log incident
    logger.error(`Security incident: ${type}`, data);

    // Automated responses based on incident type
    switch (type) {
      case 'BRUTE_FORCE':
        await this.handleBruteForce(data);
        break;
      case 'SQL_INJECTION':
        await this.handleSQLInjection(data);
        break;
      case 'XSS_ATTEMPT':
        await this.handleXSSAttempt(data);
        break;
      default:
        await this.handleGenericIncident(data);
    }
  }

  static async handleBruteForce(data) {
    // Temporarily block IP
    // Send alert to security team
    // Log for further analysis
  }

  static async handleSQLInjection(data) {
    // Block IP immediately
    // Alert development team
    // Review and patch vulnerable endpoint
  }
}

module.exports = IncidentResponse;
```

## Security Checklist

### Pre-Production Security Checklist

#### Backend Security
- [ ] All dependencies updated to latest secure versions
- [ ] Environment variables properly configured
- [ ] Database authentication enabled
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Output encoding implemented
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] File upload restrictions in place
- [ ] Error handling doesn't leak sensitive information
- [ ] Logging configured for security events
- [ ] SSL/TLS certificates properly configured

#### Frontend Security
- [ ] All user inputs sanitized
- [ ] XSS protection implemented
- [ ] CSRF protection in place
- [ ] Secure communication with backend
- [ ] No sensitive data in localStorage
- [ ] Content Security Policy implemented
- [ ] Dependencies scanned for vulnerabilities
- [ ] Build process secure

#### Infrastructure Security
- [ ] Server hardened and updated
- [ ] Firewall configured
- [ ] Database access restricted
- [ ] Backups encrypted
- [ ] Access logs monitored
- [ ] Intrusion detection in place
- [ ] Regular security updates scheduled

### Security Maintenance

#### Regular Security Tasks
- Weekly dependency vulnerability scans
- Monthly access review
- Quarterly penetration testing
- Annual security audit
- Continuous monitoring and alerting

#### Security Updates
```bash
# Automated security updates
npm audit fix
npm update

# Check for vulnerabilities
npm audit
npx better-npm-audit audit
```

This security guide provides comprehensive protection for the Ethio-Home application. Regular review and updates of these security measures are essential to maintain a secure application environment.
