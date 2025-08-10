# Deployment Guide

This guide covers the deployment process for both development and production environments of the Ethio-Home application.

## Overview

The Ethio-Home application consists of:
- **Frontend**: React SPA built with Vite
- **Backend**: Node.js/Express API server
- **Database**: MongoDB
- **File Storage**: Local/Cloud storage for images

## Environment Setup

### Development Environment
```
Frontend: http://localhost:5173
Backend:  http://localhost:3000
Database: mongodb://localhost:27017/ethio-home-dev
```

### Staging Environment
```
Frontend: https://staging.ethio-home.com
Backend:  https://api-staging.ethio-home.com
Database: MongoDB Atlas (staging cluster)
```

### Production Environment
```
Frontend: https://ethio-home.com
Backend:  https://api.ethio-home.com
Database: MongoDB Atlas (production cluster)
```

## Frontend Deployment

### Build Process

#### 1. Environment Configuration
```bash
# .env.production
VITE_API_BASE_URL=https://api.ethio-home.com/api/v1
VITE_APP_ENV=production
VITE_APP_NAME=Ethio-Home
```

#### 2. Build for Production
```bash
# Install dependencies
npm ci

# Build the application
npm run build

# Preview the build (optional)
npm run preview
```

#### 3. Build Output
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js    # Main application bundle
│   ├── index-[hash].css   # Styles
│   └── [assets]           # Images, fonts, etc.
└── favicon.ico
```

### Deployment Options

#### Option 1: Static Hosting (Recommended)

**Netlify Deployment**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --dir=dist --prod
```

**Vercel Deployment**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**GitHub Pages**
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### Option 2: Docker Deployment

**Dockerfile**
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
    }
}
```

**Build and Deploy**
```bash
# Build Docker image
docker build -t ethio-home-frontend .

# Run container
docker run -p 80:80 ethio-home-frontend
```

## Backend Deployment

### Environment Configuration

#### Production Environment Variables
```bash
# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/ethio-home
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# CORS configuration
CORS_ORIGIN=https://ethio-home.com

# Email configuration
EMAIL_FROM=noreply@ethio-home.com
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USERNAME=apikey
EMAIL_PASSWORD=your-sendgrid-api-key

# File upload
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=5242880

# Rate limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Deployment Options

#### Option 1: VPS/Server Deployment

**Server Setup (Ubuntu)**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install MongoDB (if hosting locally)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Nginx
sudo apt install nginx
```

**Application Deployment**
```bash
# Clone repository
git clone <repository-url> /var/www/ethio-home
cd /var/www/ethio-home/backend

# Install dependencies
npm ci --production

# Set up environment
cp .env.example .env
# Edit .env with production values

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

**PM2 Configuration (ecosystem.config.js)**
```javascript
module.exports = {
  apps: [{
    name: 'ethio-home-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/ethio-home-error.log',
    out_file: '/var/log/pm2/ethio-home-out.log',
    log_file: '/var/log/pm2/ethio-home-combined.log',
    time: true
  }]
};
```

**Nginx Configuration**
```nginx
# /etc/nginx/sites-available/ethio-home-api
server {
    listen 80;
    server_name api.ethio-home.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File upload handling
    client_max_body_size 10M;
}
```

**SSL Configuration with Let's Encrypt**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d api.ethio-home.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Option 2: Docker Deployment

**Backend Dockerfile**
```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Start the application
CMD ["npm", "start"]
```

**Docker Compose for Full Stack**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URI=mongodb://mongo:27017/ethio-home
    depends_on:
      - mongo
    volumes:
      - uploads:/app/uploads

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=ethio-home

volumes:
  mongo_data:
  uploads:
```

**Deploy with Docker Compose**
```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Update deployment
docker-compose pull
docker-compose up -d --no-deps --build backend
```

#### Option 3: Cloud Platform Deployment

**Heroku Deployment**
```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create ethio-home-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URI=mongodb+srv://...

# Deploy
git push heroku main
```

**Railway Deployment**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

**DigitalOcean App Platform**
```yaml
# .do/app.yaml
name: ethio-home-api
services:
- name: api
  source_dir: /backend
  github:
    repo: your-repo/ethio-home
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URI
    value: ${DATABASE_URI}
```

## Database Deployment

### MongoDB Atlas (Recommended)

**Setup Steps**
1. Create MongoDB Atlas account
2. Create a new cluster
3. Configure network access (whitelist IPs)
4. Create database user
5. Get connection string

**Connection String Format**
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Security Configuration**
```javascript
// backend/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};
```

### Self-Hosted MongoDB

**Production MongoDB Setup**
```bash
# Install MongoDB
sudo apt-get install -y mongodb-org

# Configure MongoDB
sudo nano /etc/mongod.conf

# Security configuration
security:
  authorization: enabled

# Network configuration
net:
  port: 27017
  bindIp: 127.0.0.1

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create admin user
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "strong-password",
  roles: ["userAdminAnyDatabase"]
})
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # Frontend tests
      - name: Install frontend dependencies
        run: npm ci
      
      - name: Run frontend tests
        run: npm run test
      
      # Backend tests
      - name: Install backend dependencies
        run: cd backend && npm ci
      
      - name: Run backend tests
        run: cd backend && npm run test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=dist --prod
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.PRIVATE_KEY }}
          script: |
            cd /var/www/ethio-home
            git pull origin main
            cd backend
            npm ci --production
            pm2 reload ecosystem.config.js --env production
```

## Monitoring and Logging

### Application Monitoring

**PM2 Monitoring**
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs ethio-home-api

# Restart application
pm2 restart ethio-home-api
```

**Health Check Endpoint**
```javascript
// backend/routes/healthRoutes.js
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
```

### Log Management

**Winston Logger Configuration**
```javascript
// backend/utils/logger.js
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

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

## Security Considerations

### Production Security Checklist

**Backend Security**
```javascript
// backend/app.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

**Environment Variables Security**
- Never commit `.env` files
- Use strong, random secrets
- Rotate keys regularly
- Use environment-specific configurations

**Database Security**
- Enable authentication
- Use strong passwords
- Configure network access properly
- Regular backups
- Monitor access logs

## Backup Strategy

### Database Backups

**Automated MongoDB Backup**
```bash
#!/bin/bash
# backup-script.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DB_NAME="ethio-home"

# Create backup
mongodump --host localhost:27017 --db $DB_NAME --out $BACKUP_DIR/$DATE

# Compress backup
tar -czf $BACKUP_DIR/$DATE.tar.gz -C $BACKUP_DIR $DATE
rm -rf $BACKUP_DIR/$DATE

# Remove backups older than 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE.tar.gz"
```

**Cron Job for Automatic Backups**
```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

### File Backups
```bash
# Backup uploaded files
rsync -av /app/uploads/ /backups/uploads/$(date +%Y%m%d)/
```

## Troubleshooting

### Common Deployment Issues

**Build Failures**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Memory Issues**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 app.js

# Or in package.json
"start": "node --max-old-space-size=4096 server.js"
```

**Database Connection Issues**
- Check network connectivity
- Verify credentials
- Check IP whitelist
- Monitor connection limits

**SSL Certificate Issues**
```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Performance Optimization

**Frontend Optimization**
- Enable Gzip compression
- Implement CDN
- Optimize images
- Use lazy loading

**Backend Optimization**
- Implement caching
- Database indexing
- Connection pooling
- Load balancing

**Database Optimization**
- Proper indexing
- Query optimization
- Connection limits
- Sharding (if needed)

## Rollback Procedures

### Frontend Rollback
```bash
# Revert to previous deployment
git revert <commit-hash>
npm run build
# Deploy previous version
```

### Backend Rollback
```bash
# Using PM2
pm2 stop ethio-home-api
git checkout <previous-commit>
npm ci --production
pm2 start ecosystem.config.js --env production
```

### Database Rollback
```bash
# Restore from backup
mongorestore --drop --host localhost:27017 --db ethio-home /backups/mongodb/backup-date/
```

This deployment guide provides comprehensive instructions for deploying the Ethio-Home application across different environments and platforms. Choose the deployment strategy that best fits your infrastructure requirements and team capabilities.