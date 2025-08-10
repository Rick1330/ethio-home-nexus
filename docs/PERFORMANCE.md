# Performance Optimization Guide

This document covers performance optimization strategies, monitoring, and best practices for the Ethio-Home application.

## Performance Overview

The Ethio-Home application performance strategy focuses on:
- **Frontend Performance**: Fast loading, smooth interactions, efficient rendering
- **Backend Performance**: Optimized API responses, efficient database queries
- **Network Performance**: Minimized payload, optimized caching
- **Database Performance**: Efficient queries, proper indexing

## Frontend Performance Optimization

### Bundle Optimization

#### Code Splitting
```typescript
// src/pages/PropertyDetail.tsx
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const PropertyDetail = lazy(() => import('./PropertyDetail'));
const PropertyMap = lazy(() => import('../components/PropertyMap'));

const App = () => {
  return (
    <Routes>
      <Route 
        path="/properties/:id" 
        element={
          <Suspense fallback={<PropertyDetailSkeleton />}>
            <PropertyDetail />
          </Suspense>
        } 
      />
    </Routes>
  );
};
```

#### Dynamic Imports
```typescript
// src/utils/dynamicImports.ts
export const loadChartLibrary = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};

export const loadImageEditor = async () => {
  const module = await import('react-image-crop');
  return module.default;
};

// Usage in component
const DashboardChart = () => {
  const [Chart, setChart] = useState(null);

  useEffect(() => {
    loadChartLibrary().then(setChart);
  }, []);

  if (!Chart) return <ChartSkeleton />;
  
  return <Chart data={chartData} />;
};
```

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Monitor bundle size in CI/CD
npm install -g bundlesize
bundlesize
```

### Image Optimization

#### Responsive Images
```typescript
// src/components/ui/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className,
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const generateSrcSet = (baseSrc: string) => {
    const sizes = [400, 800, 1200, 1600];
    return sizes
      .map(size => `${baseSrc}?w=${size} ${size}w`)
      .join(', ');
  };

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      <img
        src={src}
        srcSet={generateSrcSet(src)}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-500">Failed to load image</span>
        </div>
      )}
    </div>
  );
};
```

#### Image Lazy Loading
```typescript
// src/hooks/useLazyImage.ts
import { useEffect, useRef, useState } from 'react';

export const useLazyImage = (src: string) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    
    if (imgRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      
      observer.observe(imgRef.current);
    }

    return () => observer?.disconnect();
  }, [src]);

  return { imgRef, imageSrc, isLoaded, setIsLoaded };
};
```

### React Performance Optimization

#### Memoization Strategies
```typescript
// src/components/PropertyList.tsx
import { memo, useMemo, useCallback } from 'react';

interface PropertyListProps {
  properties: Property[];
  filters: PropertyFilters;
  onPropertySelect: (id: string) => void;
}

export const PropertyList = memo<PropertyListProps>(({
  properties,
  filters,
  onPropertySelect,
}) => {
  // Memoize filtered results
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      if (filters.minPrice && property.price < filters.minPrice) return false;
      if (filters.maxPrice && property.price > filters.maxPrice) return false;
      if (filters.location && !property.location.includes(filters.location)) return false;
      return true;
    });
  }, [properties, filters]);

  // Memoize callback to prevent unnecessary re-renders
  const handlePropertyClick = useCallback((propertyId: string) => {
    onPropertySelect(propertyId);
  }, [onPropertySelect]);

  return (
    <div className="property-grid">
      {filteredProperties.map(property => (
        <PropertyCard
          key={property._id}
          property={property}
          onClick={handlePropertyClick}
        />
      ))}
    </div>
  );
});

// Prevent re-renders with React.memo
const PropertyCard = memo<PropertyCardProps>(({ property, onClick }) => {
  return (
    <div 
      className="property-card"
      onClick={() => onClick(property._id)}
    >
      {/* Property content */}
    </div>
  );
});
```

#### Virtual Scrolling for Large Lists
```typescript
// src/components/VirtualPropertyList.tsx
import { FixedSizeList as List } from 'react-window';

interface VirtualPropertyListProps {
  properties: Property[];
  height: number;
  itemHeight: number;
}

const PropertyListItem = ({ index, style, data }) => (
  <div style={style}>
    <PropertyCard property={data[index]} />
  </div>
);

export const VirtualPropertyList: React.FC<VirtualPropertyListProps> = ({
  properties,
  height,
  itemHeight,
}) => {
  return (
    <List
      height={height}
      itemCount={properties.length}
      itemSize={itemHeight}
      itemData={properties}
    >
      {PropertyListItem}
    </List>
  );
};
```

### State Management Optimization

#### Optimized React Query Usage
```typescript
// src/hooks/useProperties.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

export const useProperties = (filters: PropertyFilters) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertyService.getProperties(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true, // Show previous data while loading new
    select: (data) => {
      // Transform data to reduce memory usage
      return data.map(property => ({
        ...property,
        // Only include necessary fields for list view
        description: undefined,
      }));
    },
  });
};

// Infinite query for pagination
export const useInfiniteProperties = (filters: PropertyFilters) => {
  return useInfiniteQuery({
    queryKey: ['properties', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => 
      propertyService.getProperties({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNextPage ? allPages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};
```

#### Zustand Performance Optimization
```typescript
// src/store/propertyStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface PropertyState {
  properties: Property[];
  filters: PropertyFilters;
  selectedProperty: Property | null;
  // Actions
  setProperties: (properties: Property[]) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  setFilters: (filters: PropertyFilters) => void;
}

export const usePropertyStore = create<PropertyState>()(
  subscribeWithSelector((set, get) => ({
    properties: [],
    filters: {},
    selectedProperty: null,
    
    setProperties: (properties) => set({ properties }),
    
    updateProperty: (id, updates) => set((state) => ({
      properties: state.properties.map(property =>
        property._id === id ? { ...property, ...updates } : property
      ),
    })),
    
    setFilters: (filters) => set({ filters }),
  }))
);

// Selective subscriptions to prevent unnecessary re-renders
export const usePropertyFilters = () => 
  usePropertyStore((state) => state.filters);

export const useSelectedProperty = () => 
  usePropertyStore((state) => state.selectedProperty);
```

## Backend Performance Optimization

### Database Optimization

#### Efficient Queries
```javascript
// backend/services/propertyService.js
class PropertyService {
  // Optimized property listing with pagination and field selection
  async getProperties(query) {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      fields = 'title,price,location,images,isVerified',
      ...filters
    } = query;

    // Build query with proper indexing
    const queryBuilder = Property.find(this.buildFilters(filters))
      .select(fields)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit * 1)
      .lean(); // Return plain objects instead of Mongoose documents

    // Use aggregation for complex queries
    if (query.includeStats) {
      return this.getPropertiesWithStats(filters, page, limit);
    }

    const properties = await queryBuilder;
    const total = await Property.countDocuments(this.buildFilters(filters));

    return {
      properties,
      pagination: {
        page: page * 1,
        limit: limit * 1,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  // Aggregation pipeline for complex queries
  async getPropertiesWithStats(filters, page, limit) {
    const pipeline = [
      { $match: this.buildFilters(filters) },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'property',
          as: 'reviews',
        },
      },
      {
        $addFields: {
          averageRating: { $avg: '$reviews.rating' },
          reviewCount: { $size: '$reviews' },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit * 1 },
      {
        $project: {
          title: 1,
          price: 1,
          location: 1,
          images: { $slice: ['$images', 1] }, // Only first image
          averageRating: 1,
          reviewCount: 1,
        },
      },
    ];

    return await Property.aggregate(pipeline);
  }

  buildFilters(filters) {
    const mongoFilters = {};

    if (filters.minPrice || filters.maxPrice) {
      mongoFilters.price = {};
      if (filters.minPrice) mongoFilters.price.$gte = filters.minPrice;
      if (filters.maxPrice) mongoFilters.price.$lte = filters.maxPrice;
    }

    if (filters.location) {
      mongoFilters.location = { $regex: filters.location, $options: 'i' };
    }

    if (filters.isVerified !== undefined) {
      mongoFilters.isVerified = filters.isVerified;
    }

    return mongoFilters;
  }
}
```

#### Database Indexing Strategy
```javascript
// backend/models/propertyModel.js
const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  owner: { type: mongoose.Schema.ObjectId, ref: 'User' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Performance indexes
propertySchema.index({ location: 1, price: 1 }); // Compound index for filtering
propertySchema.index({ price: 1 }); // Single field index
propertySchema.index({ createdAt: -1 }); // Sorting index
propertySchema.index({ owner: 1, isVerified: 1 }); // Owner queries
propertySchema.index({ 
  title: 'text', 
  description: 'text' 
}, { 
  weights: { title: 10, description: 5 } 
}); // Text search index

// TTL index for temporary data
propertySchema.index({ 
  expiresAt: 1 
}, { 
  expireAfterSeconds: 0 
});
```

#### Query Optimization Middleware
```javascript
// backend/middleware/queryOptimization.js
const queryOptimization = (req, res, next) => {
  // Default pagination limits
  if (req.query.limit) {
    req.query.limit = Math.min(parseInt(req.query.limit), 100); // Max 100 items
  }

  // Optimize field selection
  if (!req.query.fields && req.method === 'GET') {
    // Default fields for list views
    if (req.path.includes('/properties') && !req.params.id) {
      req.query.fields = 'title,price,location,images,isVerified,createdAt';
    }
  }

  next();
};

module.exports = queryOptimization;
```

### API Response Optimization

#### Response Compression
```javascript
// backend/middleware/compression.js
const compression = require('compression');

const compressionMiddleware = compression({
  level: 6, // Compression level (1-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression middleware
    return compression.filter(req, res);
  },
});

module.exports = compressionMiddleware;
```

#### Caching Strategy
```javascript
// backend/middleware/caching.js
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

const cache = (duration = 300) => { // 5 minutes default
  return async (req, res, next) => {
    const key = `cache:${req.method}:${req.originalUrl}`;
    
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        client.setex(key, duration, JSON.stringify(data));
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache error:', error);
      next();
    }
  };
};

// Usage
router.get('/properties', cache(600), getProperties); // Cache for 10 minutes
```

#### Response Optimization
```javascript
// backend/utils/responseOptimizer.js
class ResponseOptimizer {
  static optimizePropertyResponse(properties) {
    return properties.map(property => ({
      _id: property._id,
      title: property.title,
      price: property.price,
      location: property.location,
      image: property.images?.[0], // Only first image for list view
      isVerified: property.isVerified,
      createdAt: property.createdAt,
    }));
  }

  static paginateResponse(data, page, limit, total) {
    return {
      status: 'success',
      results: data.length,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }
}

module.exports = ResponseOptimizer;
```

## Network Performance

### HTTP/2 and Compression
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    
    # Enable compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Enable Brotli compression
    brotli on;
    brotli_comp_level 6;
    brotli_types
        text/plain
        text/css
        application/json
        application/javascript
        text/xml
        application/xml
        application/xml+rss
        text/javascript;

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
    }

    # API caching
    location /api/ {
        proxy_pass http://backend;
        proxy_cache api_cache;
        proxy_cache_valid 200 5m;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

### CDN Configuration
```typescript
// src/config/cdn.ts
export const CDN_CONFIG = {
  baseUrl: process.env.VITE_CDN_BASE_URL || '',
  imageDomains: [
    'images.ethio-home.com',
    'cdn.ethio-home.com',
  ],
};

export const getOptimizedImageUrl = (
  src: string,
  width?: number,
  quality?: number
): string => {
  if (!CDN_CONFIG.baseUrl) return src;
  
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (quality) params.append('q', quality.toString());
  
  return `${CDN_CONFIG.baseUrl}/${src}?${params.toString()}`;
};
```

## Performance Monitoring

### Frontend Performance Monitoring
```typescript
// src/utils/performanceMonitor.ts
class PerformanceMonitor {
  static measurePageLoad() {
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const metrics = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstPaint: this.getFirstPaint(),
            firstContentfulPaint: this.getFirstContentfulPaint(),
          };
          
          this.sendMetrics('page-load', metrics);
        }, 0);
      });
    }
  }

  static measureComponentRender(componentName: string) {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // Longer than one frame (60fps)
        this.sendMetrics('component-render', {
          component: componentName,
          renderTime,
        });
      }
    };
  }

  static getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint?.startTime || 0;
  }

  static getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp?.startTime || 0;
  }

  static sendMetrics(type: string, data: any) {
    // Send to analytics service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/v1/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, timestamp: Date.now() }),
      }).catch(console.error);
    }
  }
}

// Usage in components
export const usePerformanceMonitoring = (componentName: string) => {
  useEffect(() => {
    const endMeasurement = PerformanceMonitor.measureComponentRender(componentName);
    return endMeasurement;
  }, [componentName]);
};
```

### Backend Performance Monitoring
```javascript
// backend/middleware/performanceMonitor.js
const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Log slow requests
    if (duration > 1000) { // Slower than 1 second
      console.warn('Slow request detected:', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      });
    }
    
    // Send metrics to monitoring service
    if (process.env.NODE_ENV === 'production') {
      sendMetricsToService({
        method: req.method,
        route: req.route?.path || req.url,
        duration,
        statusCode: res.statusCode,
        timestamp: Date.now(),
      });
    }
  });
  
  next();
};

module.exports = performanceMonitor;
```

### Database Performance Monitoring
```javascript
// backend/utils/databaseMonitor.js
const mongoose = require('mongoose');

class DatabaseMonitor {
  static setupMonitoring() {
    mongoose.set('debug', process.env.NODE_ENV === 'development');
    
    // Monitor slow queries
    mongoose.connection.on('queryExecuted', (query) => {
      if (query.executionTime > 100) { // Slower than 100ms
        console.warn('Slow query detected:', {
          collection: query.collection,
          operation: query.operation,
          duration: `${query.executionTime}ms`,
          query: query.query,
        });
      }
    });
  }

  static async getConnectionStats() {
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    return {
      connections: mongoose.connection.readyState,
      collections: stats.collections,
      dataSize: stats.dataSize,
      indexSize: stats.indexSize,
      avgObjSize: stats.avgObjSize,
    };
  }
}

module.exports = DatabaseMonitor;
```

## Performance Testing

### Frontend Performance Tests
```javascript
// tests/performance/frontend.test.js
const { chromium } = require('playwright');

describe('Frontend Performance', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Home page loads within 3 seconds', async () => {
    const startTime = Date.now();
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('Property listing renders efficiently', async () => {
    await page.goto('http://localhost:5173/properties');
    
    // Measure rendering performance
    const metrics = await page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('measure'));
    });
    
    const renderMetrics = JSON.parse(metrics);
    const longTasks = renderMetrics.filter(metric => metric.duration > 50);
    
    expect(longTasks).toHaveLength(0);
  });
});
```

### Backend Performance Tests
```javascript
// tests/performance/backend.test.js
const request = require('supertest');
const app = require('../../app');

describe('Backend Performance', () => {
  test('Properties endpoint responds within 500ms', async () => {
    const startTime = Date.now();
    
    const response = await request(app)
      .get('/api/v1/properties')
      .expect(200);
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(500);
  });

  test('Database queries are optimized', async () => {
    // Monitor query execution time
    const queryStart = Date.now();
    
    await request(app)
      .get('/api/v1/properties?limit=100')
      .expect(200);
    
    const queryTime = Date.now() - queryStart;
    expect(queryTime).toBeLessThan(200); // Should complete within 200ms
  });
});
```

### Load Testing
```javascript
// tests/load/loadTest.js
const autocannon = require('autocannon');

const loadTest = async () => {
  const result = await autocannon({
    url: 'http://localhost:3000',
    connections: 100,
    duration: 30, // 30 seconds
    requests: [
      {
        method: 'GET',
        path: '/api/v1/properties',
      },
      {
        method: 'GET',
        path: '/api/v1/properties?limit=20&page=1',
      },
    ],
  });

  console.log('Load test results:', result);
  
  // Assert performance requirements
  expect(result.requests.average).toBeGreaterThan(100); // At least 100 req/sec
  expect(result.latency.p99).toBeLessThan(1000); // 99th percentile under 1 second
};

loadTest();
```

## Performance Optimization Checklist

### Frontend Checklist
- [ ] Code splitting implemented
- [ ] Lazy loading for images and components
- [ ] Bundle size optimized (<250KB gzipped)
- [ ] React.memo used for expensive components
- [ ] useMemo/useCallback for expensive computations
- [ ] Virtual scrolling for long lists
- [ ] Image optimization and WebP support
- [ ] Service worker for caching
- [ ] Critical CSS inlined
- [ ] Non-critical CSS loaded asynchronously

### Backend Checklist
- [ ] Database queries optimized
- [ ] Proper indexing implemented
- [ ] Response compression enabled
- [ ] Caching strategy implemented
- [ ] Connection pooling configured
- [ ] API rate limiting in place
- [ ] Query result pagination
- [ ] Database connection optimization
- [ ] Memory usage monitoring
- [ ] CPU usage optimization

### Infrastructure Checklist
- [ ] CDN configured for static assets
- [ ] HTTP/2 enabled
- [ ] Gzip/Brotli compression enabled
- [ ] Database optimization
- [ ] Load balancer configured
- [ ] Monitoring and alerting setup
- [ ] Performance testing automated
- [ ] Caching layers implemented
- [ ] Network optimization
- [ ] Server resource optimization

This performance guide provides comprehensive strategies for optimizing the Ethio-Home application across all layers. Regular monitoring and optimization based on real user data is essential for maintaining optimal performance.