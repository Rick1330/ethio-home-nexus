# Troubleshooting Guide

This guide provides solutions to common issues encountered during development, deployment, and operation of the Ethio-Home application.

## Quick Diagnostic Commands

### Health Check Commands
```bash
# Check frontend development server
curl http://localhost:5173

# Check backend API health
curl http://localhost:3000/api/v1/health

# Check database connection
mongosh --eval "db.runCommand('ping')"

# Check Node.js and npm versions
node --version && npm --version

# Check available ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :5173
```

## Frontend Issues

### Build and Development Issues

#### Issue: "Cannot resolve module" errors
```bash
# Symptoms
Module not found: Can't resolve './components/PropertyCard'

# Solutions
1. Check file paths and case sensitivity
2. Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

3. Check tsconfig.json paths configuration
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}

4. Restart development server
npm run dev
```

#### Issue: TypeScript compilation errors
```bash
# Symptoms
Type 'string | undefined' is not assignable to type 'string'

# Solutions
1. Add proper type guards
if (property.title) {
  // Use property.title safely
}

2. Use optional chaining
const title = property?.title ?? 'Default Title';

3. Update type definitions
interface Property {
  title: string; // Make required
  description?: string; // Make optional
}

4. Check for strict mode settings in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true
  }
}
```

#### Issue: Vite build fails with memory errors
```bash
# Symptoms
JavaScript heap out of memory

# Solutions
1. Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

2. Optimize build configuration in vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});

3. Clear build cache
rm -rf dist .vite
npm run build
```

### Runtime Issues

#### Issue: React Router not working after deployment
```bash
# Symptoms
404 errors on page refresh or direct URL access

# Solutions
1. Configure server for SPA routing (Nginx example)
location / {
    try_files $uri $uri/ /index.html;
}

2. Add base URL in vite.config.ts for subdirectory deployment
export default defineConfig({
  base: '/ethio-home/',
});

3. Check router configuration
<BrowserRouter basename="/ethio-home">
  <Routes>
    <Route path="/" element={<Home />} />
  </Routes>
</BrowserRouter>
```

#### Issue: Environment variables not loading
```bash
# Symptoms
import.meta.env.VITE_API_BASE_URL is undefined

# Solutions
1. Check .env file naming and location
# Must be in project root
.env.local (for local development)
.env.production (for production)

2. Ensure variables have VITE_ prefix
VITE_API_BASE_URL=http://localhost:3000/api/v1

3. Restart development server after changing .env
npm run dev

4. Check if .env is in .gitignore
echo ".env.local" >> .gitignore
```

### API Integration Issues

#### Issue: CORS errors in browser
```bash
# Symptoms
Access to fetch at 'http://localhost:3000' from origin 'http://localhost:5173' has been blocked by CORS policy

# Solutions
1. Configure CORS on backend
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com'],
  credentials: true,
}));

2. Check axios configuration
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true,
});

3. Use proxy in vite.config.ts for development
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

#### Issue: Authentication token issues
```bash
# Symptoms
401 Unauthorized errors despite being logged in

# Solutions
1. Check token storage and retrieval
// Verify token exists
const token = localStorage.getItem('auth-token');
console.log('Token:', token);

2. Check token format in requests
// Ensure proper Authorization header
headers: {
  'Authorization': `Bearer ${token}`
}

3. Verify token expiration
// Decode JWT to check expiry
const payload = JSON.parse(atob(token.split('.')[1]));
const isExpired = payload.exp * 1000 < Date.now();

4. Implement token refresh logic
const refreshToken = async () => {
  try {
    const response = await api.post('/users/refresh-token');
    const newToken = response.data.token;
    localStorage.setItem('auth-token', newToken);
    return newToken;
  } catch (error) {
    // Redirect to login
    window.location.href = '/login';
  }
};
```

## Backend Issues

### Server Startup Issues

#### Issue: Port already in use
```bash
# Symptoms
Error: listen EADDRINUSE: address already in use :::3000

# Solutions
1. Find and kill process using port
lsof -ti:3000 | xargs kill -9

# Or on Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

2. Use different port
PORT=3001 npm start

3. Check for other services using the port
netstat -tulpn | grep :3000
```

#### Issue: Database connection failures
```bash
# Symptoms
MongoNetworkError: failed to connect to server

# Solutions
1. Check MongoDB status
# Local MongoDB
sudo systemctl status mongod
sudo systemctl start mongod

# MongoDB Atlas
ping <cluster-url>

2. Verify connection string
DATABASE_URI=mongodb://localhost:27017/ethio-home
# Or for Atlas
DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/database

3. Check network access (Atlas)
- Whitelist IP addresses in Atlas dashboard
- Check firewall settings

4. Test connection directly
mongosh "mongodb://localhost:27017/ethio-home"
```

#### Issue: Environment variables not loading
```bash
# Symptoms
process.env.DATABASE_URI is undefined

# Solutions
1. Check .env file location (backend root directory)
NODE_ENV=development
PORT=3000
DATABASE_URI=mongodb://localhost:27017/ethio-home

2. Ensure dotenv is configured
require('dotenv').config();
// Or
import 'dotenv/config';

3. Check file permissions
chmod 644 .env

4. Verify no spaces around = in .env
# Wrong
DATABASE_URI = mongodb://localhost:27017/ethio-home
# Correct
DATABASE_URI=mongodb://localhost:27017/ethio-home
```

### Database Issues

#### Issue: Slow query performance
```bash
# Symptoms
Queries taking more than 1 second

# Solutions
1. Add database indexes
db.properties.createIndex({ "location": 1, "price": 1 });
db.properties.createIndex({ "createdAt": -1 });

2. Use explain() to analyze queries
db.properties.find({ location: "Addis Ababa" }).explain("executionStats");

3. Optimize Mongoose queries
// Use lean() for read-only operations
const properties = await Property.find().lean();

// Select only needed fields
const properties = await Property.find().select('title price location');

// Use aggregation for complex queries
const stats = await Property.aggregate([
  { $match: { isVerified: true } },
  { $group: { _id: "$location", count: { $sum: 1 } } }
]);
```

#### Issue: Database connection pool exhaustion
```bash
# Symptoms
MongoServerSelectionError: connection pool timeout

# Solutions
1. Configure connection pool settings
mongoose.connect(DATABASE_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

2. Ensure connections are properly closed
// Don't do this
const db = mongoose.connection;
// Do this instead - let Mongoose handle connections

3. Monitor connection usage
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});
```

### API Issues

#### Issue: 500 Internal Server Error
```bash
# Symptoms
API returns generic 500 error

# Solutions
1. Check server logs
tail -f logs/error.log
# Or
pm2 logs

2. Add proper error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (process.env.NODE_ENV === 'development') {
    res.status(500).json({
      status: 'error',
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

3. Validate input data
const { body, validationResult } = require('express-validator');

const validateProperty = [
  body('title').isLength({ min: 3 }).trim().escape(),
  body('price').isNumeric(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
```

#### Issue: JWT authentication failures
```bash
# Symptoms
JsonWebTokenError: invalid token

# Solutions
1. Check JWT secret consistency
# Ensure same secret across all environments
JWT_SECRET=your-super-secret-key-minimum-32-characters

2. Verify token format
const token = req.headers.authorization?.split(' ')[1];
if (!token) {
  return res.status(401).json({ message: 'No token provided' });
}

3. Handle token expiration
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
} catch (error) {
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }
  return res.status(401).json({ message: 'Invalid token' });
}
```

## Database Issues

### MongoDB Troubleshooting

#### Issue: Collection not found
```bash
# Symptoms
MongoServerError: ns not found

# Solutions
1. Check database and collection names
use ethio-home
show collections

2. Verify Mongoose model names
// Ensure model is properly defined and imported
const Property = require('./models/propertyModel');

3. Check for typos in queries
// Wrong
db.propertys.find()
// Correct
db.properties.find()
```

#### Issue: Index creation failures
```bash
# Symptoms
MongoServerError: Index build failed

# Solutions
1. Check for duplicate key errors
db.users.dropIndex("email_1")
db.users.createIndex({ "email": 1 }, { unique: true })

2. Ensure data consistency before creating unique indexes
// Remove duplicates first
db.users.aggregate([
  { $group: { _id: "$email", count: { $sum: 1 }, docs: { $push: "$_id" } } },
  { $match: { count: { $gt: 1 } } }
])

3. Create indexes with proper options
// Background index creation
db.properties.createIndex({ "location": 1 }, { background: true })
```

## Performance Issues

### Frontend Performance

#### Issue: Slow page loading
```bash
# Symptoms
Page takes more than 3 seconds to load

# Solutions
1. Implement code splitting
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));

2. Optimize images
// Use WebP format
<img src="image.webp" alt="Property" loading="lazy" />

3. Add service worker caching
// In public/sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

4. Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

#### Issue: Memory leaks in React components
```bash
# Symptoms
Browser becomes slow after prolonged use

# Solutions
1. Clean up event listeners
useEffect(() => {
  const handleResize = () => setWindowWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

2. Cancel pending API requests
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/properties', { signal: controller.signal })
    .then(setProperties)
    .catch((err) => {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    });
  
  return () => controller.abort();
}, []);

3. Use React DevTools Profiler to identify issues
// Wrap components to measure performance
<Profiler id="PropertyList" onRender={onRenderCallback}>
  <PropertyList />
</Profiler>
```

### Backend Performance

#### Issue: High response times
```bash
# Symptoms
API responses taking more than 1 second

# Solutions
1. Add response time monitoring
const responseTime = require('response-time');
app.use(responseTime((req, res, time) => {
  if (time > 1000) {
    console.warn(`Slow request: ${req.method} ${req.url} - ${time}ms`);
  }
}));

2. Implement caching
const redis = require('redis');
const client = redis.createClient();

const cache = (duration) => (req, res, next) => {
  const key = req.originalUrl;
  client.get(key, (err, data) => {
    if (data) {
      res.json(JSON.parse(data));
    } else {
      res.sendResponse = res.json;
      res.json = (body) => {
        client.setex(key, duration, JSON.stringify(body));
        res.sendResponse(body);
      };
      next();
    }
  });
};

3. Optimize database queries
// Use projection to limit fields
const properties = await Property.find({}, 'title price location');

// Use aggregation for complex operations
const stats = await Property.aggregate([
  { $match: { isVerified: true } },
  { $group: { _id: '$location', avgPrice: { $avg: '$price' } } }
]);
```

## Deployment Issues

### Docker Issues

#### Issue: Container build failures
```bash
# Symptoms
Docker build fails with permission or dependency errors

# Solutions
1. Check Dockerfile syntax
# Use multi-stage builds for optimization
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

2. Handle file permissions
# Add user in Dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

3. Check .dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env.local
```

#### Issue: Container runtime errors
```bash
# Symptoms
Container exits immediately or crashes

# Solutions
1. Check container logs
docker logs <container-id>
docker logs --follow <container-id>

2. Debug by overriding entry point
docker run -it --entrypoint /bin/sh <image-name>

3. Check environment variables
docker exec <container-id> env

4. Verify port mapping
docker run -p 3000:3000 <image-name>
```

### Production Deployment Issues

#### Issue: SSL certificate problems
```bash
# Symptoms
ERR_SSL_PROTOCOL_ERROR or certificate warnings

# Solutions
1. Check certificate validity
openssl x509 -in certificate.crt -text -noout
openssl s_client -connect yourdomain.com:443

2. Renew Let's Encrypt certificates
sudo certbot renew
sudo systemctl reload nginx

3. Check certificate chain
# Ensure intermediate certificates are included
cat certificate.crt intermediate.crt > fullchain.pem
```

#### Issue: Load balancer health check failures
```bash
# Symptoms
Instances marked as unhealthy

# Solutions
1. Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

2. Check health check configuration
# AWS ALB example
Path: /health
Port: 3000
Protocol: HTTP
Timeout: 5 seconds
Interval: 30 seconds
Healthy threshold: 2
Unhealthy threshold: 5

3. Monitor application logs for errors
tail -f /var/log/app/error.log
```

## Environment-Specific Issues

### Development Environment

#### Issue: Hot reload not working
```bash
# Symptoms
Changes not reflected in browser

# Solutions
1. Check Vite configuration
export default defineConfig({
  server: {
    watch: {
      usePolling: true, // For some file systems
    },
  },
});

2. Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

3. Check file watchers limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Production Environment

#### Issue: Memory leaks in production
```bash
# Symptoms
Server memory usage continuously increases

# Solutions
1. Monitor memory usage
const memoryUsage = process.memoryUsage();
console.log('Memory usage:', {
  rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
  heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
  heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
});

2. Use PM2 for process management
pm2 start ecosystem.config.js
pm2 monit
pm2 reload app --max-memory-restart 500M

3. Profile memory usage
node --inspect server.js
# Use Chrome DevTools to analyze memory
```

## General Debugging Tips

### Enable Debug Logging
```bash
# Frontend
localStorage.setItem('debug', 'ethio-home:*');

# Backend
DEBUG=ethio-home:* npm start

# Database
mongoose.set('debug', true);
```

### Use Browser DevTools
```javascript
// Network tab: Monitor API calls
// Console tab: Check for JavaScript errors
// Performance tab: Profile runtime performance
// Application tab: Check localStorage/sessionStorage
```

### Log Analysis
```bash
# Search for specific errors
grep -r "Error" logs/
grep -r "500" logs/ | tail -20

# Monitor logs in real-time
tail -f logs/combined.log | grep ERROR

# Analyze access patterns
awk '{print $1}' access.log | sort | uniq -c | sort -nr
```

This troubleshooting guide covers the most common issues you'll encounter. For specific errors not covered here, check the application logs and error messages for more detailed information.