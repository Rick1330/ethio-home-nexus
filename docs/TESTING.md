# Testing Strategy and Guidelines

This document outlines the comprehensive testing approach for the Ethio-Home application, covering unit tests, integration tests, end-to-end tests, and performance testing.

## Testing Philosophy

Our testing strategy follows the testing pyramid:
- **Unit Tests (70%)**: Fast, isolated tests for individual functions and components
- **Integration Tests (20%)**: Tests for component interactions and API integrations
- **End-to-End Tests (10%)**: Full user journey tests

## Testing Stack

### Frontend Testing
- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: MSW (Mock Service Worker)
- **E2E Testing**: Playwright
- **Component Testing**: Storybook

### Backend Testing
- **Test Runner**: Jest
- **API Testing**: Supertest
- **Database Testing**: MongoDB Memory Server
- **Load Testing**: Artillery/Autocannon

## Frontend Testing

### Unit Testing

#### Component Testing Setup
```typescript
// src/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactElement } from 'react';

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
});

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
```

#### Component Test Examples
```typescript
// src/components/PropertyCard.test.tsx
import { render, screen, fireEvent } from '../test-utils';
import { PropertyCard } from './PropertyCard';

const mockProperty = {
  _id: '1',
  title: 'Beautiful House',
  description: 'A lovely family home',
  price: 500000,
  location: 'Addis Ababa',
  images: ['image1.jpg'],
  isVerified: true,
  createdAt: '2023-01-01T00:00:00.000Z',
};

describe('PropertyCard', () => {
  it('renders property information correctly', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('Beautiful House')).toBeInTheDocument();
    expect(screen.getByText('500,000 ETB')).toBeInTheDocument();
    expect(screen.getByText('Addis Ababa')).toBeInTheDocument();
  });

  it('shows verified badge when property is verified', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<PropertyCard property={mockProperty} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith('1');
  });

  it('displays property image with correct alt text', () => {
    render(<PropertyCard property={mockProperty} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', 'Beautiful House');
    expect(image).toHaveAttribute('src', expect.stringContaining('image1.jpg'));
  });
});
```

#### Hook Testing
```typescript
// src/hooks/useProperties.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProperties } from './useProperties';
import { propertyService } from '../services/propertyService';

// Mock the service
jest.mock('../services/propertyService');
const mockedPropertyService = propertyService as jest.Mocked<typeof propertyService>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useProperties', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches properties successfully', async () => {
    const mockProperties = [mockProperty];
    mockedPropertyService.getProperties.mockResolvedValue(mockProperties);

    const { result } = renderHook(() => useProperties({}), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockProperties);
    expect(result.current.error).toBe(null);
  });

  it('handles error states', async () => {
    const errorMessage = 'Failed to fetch properties';
    mockedPropertyService.getProperties.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useProperties({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });
});
```

### Integration Testing

#### API Integration Testing with MSW
```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/v1/properties', (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1';
    const limit = req.url.searchParams.get('limit') || '20';
    
    return res(
      ctx.status(200),
      ctx.json({
        status: 'success',
        data: {
          properties: [
            {
              _id: '1',
              title: 'Test Property',
              price: 100000,
              location: 'Test Location',
              images: ['test.jpg'],
              isVerified: true,
            },
          ],
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 1,
          pages: 1,
        },
      })
    );
  }),

  rest.post('/api/v1/properties', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        status: 'success',
        data: {
          property: {
            _id: '2',
            ...req.body,
            createdAt: new Date().toISOString(),
          },
        },
      })
    );
  }),

  rest.get('/api/v1/users/me', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'success',
        data: {
          user: {
            _id: 'user1',
            name: 'Test User',
            email: 'test@test.com',
            role: 'buyer',
          },
        },
      })
    );
  }),
];
```

```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Stop server after all tests
afterAll(() => server.close());
```

#### Property List Integration Test
```typescript
// src/pages/Properties.test.tsx
import { render, screen, waitFor } from '../test-utils';
import { Properties } from './Properties';
import { server } from '../mocks/server';
import { rest } from 'msw';

describe('Properties Page', () => {
  it('displays property list when data is loaded', async () => {
    render(<Properties />);

    // Initially shows loading state
    expect(screen.getByTestId('properties-loading')).toBeInTheDocument();

    // Wait for properties to load
    await waitFor(() => {
      expect(screen.getByText('Test Property')).toBeInTheDocument();
    });

    expect(screen.getByText('100,000 ETB')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
  });

  it('displays error message when API fails', async () => {
    // Override the handler to return an error
    server.use(
      rest.get('/api/v1/properties', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );

    render(<Properties />);

    await waitFor(() => {
      expect(screen.getByText(/error loading properties/i)).toBeInTheDocument();
    });
  });

  it('filters properties when search is used', async () => {
    render(<Properties />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Property')).toBeInTheDocument();
    });

    // Use search filter
    const searchInput = screen.getByPlaceholderText(/search properties/i);
    fireEvent.change(searchInput, { target: { value: 'apartment' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    // Should trigger new API call with filters
    await waitFor(() => {
      expect(screen.getByTestId('properties-loading')).toBeInTheDocument();
    });
  });
});
```

### Form Testing
```typescript
// src/components/PropertyForm.test.tsx
import { render, screen, fireEvent, waitFor } from '../test-utils';
import { PropertyForm } from './PropertyForm';

describe('PropertyForm', () => {
  it('validates required fields', async () => {
    const onSubmit = jest.fn();
    render(<PropertyForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/price is required/i)).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<PropertyForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New Property' },
    });
    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: '500000' },
    });
    fireEvent.change(screen.getByLabelText(/location/i), {
      target: { value: 'Addis Ababa' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'New Property',
        price: 500000,
        location: 'Addis Ababa',
      });
    });
  });
});
```

## Backend Testing

### Unit Testing

#### Service Layer Testing
```javascript
// backend/services/propertyService.test.js
const PropertyService = require('../services/PropertyService');
const Property = require('../models/propertyModel');

// Mock the model
jest.mock('../models/propertyModel');

describe('PropertyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProperties', () => {
    it('returns properties with pagination', async () => {
      const mockProperties = [
        { _id: '1', title: 'Property 1', price: 100000 },
        { _id: '2', title: 'Property 2', price: 200000 },
      ];

      Property.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockProperties),
      });

      Property.countDocuments.mockResolvedValue(2);

      const result = await PropertyService.getProperties({
        page: 1,
        limit: 20,
      });

      expect(result.properties).toEqual(mockProperties);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it('applies filters correctly', async () => {
      const buildFiltersSpy = jest.spyOn(PropertyService, 'buildFilters');
      
      Property.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });

      Property.countDocuments.mockResolvedValue(0);

      await PropertyService.getProperties({
        minPrice: 100000,
        maxPrice: 500000,
        location: 'Addis Ababa',
      });

      expect(buildFiltersSpy).toHaveBeenCalledWith({
        minPrice: 100000,
        maxPrice: 500000,
        location: 'Addis Ababa',
      });
    });
  });

  describe('buildFilters', () => {
    it('builds price range filter', () => {
      const filters = PropertyService.buildFilters({
        minPrice: 100000,
        maxPrice: 500000,
      });

      expect(filters.price).toEqual({
        $gte: 100000,
        $lte: 500000,
      });
    });

    it('builds location filter', () => {
      const filters = PropertyService.buildFilters({
        location: 'Addis',
      });

      expect(filters.location).toEqual({
        $regex: 'Addis',
        $options: 'i',
      });
    });
  });
});
```

#### Controller Testing
```javascript
// backend/controllers/propertyController.test.js
const request = require('supertest');
const app = require('../app');
const Property = require('../models/propertyModel');

jest.mock('../models/propertyModel');

describe('Property Controller', () => {
  describe('GET /api/v1/properties', () => {
    it('returns properties successfully', async () => {
      const mockProperties = [
        { _id: '1', title: 'Property 1', price: 100000 },
      ];

      Property.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockProperties),
      });

      Property.countDocuments.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/v1/properties')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.properties).toEqual(mockProperties);
    });

    it('handles query parameters', async () => {
      Property.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });

      Property.countDocuments.mockResolvedValue(0);

      await request(app)
        .get('/api/v1/properties?page=2&limit=10&minPrice=100000')
        .expect(200);

      expect(Property.find).toHaveBeenCalledWith(
        expect.objectContaining({
          price: { $gte: 100000 },
        })
      );
    });
  });

  describe('POST /api/v1/properties', () => {
    it('creates property successfully', async () => {
      const propertyData = {
        title: 'New Property',
        price: 500000,
        location: 'Addis Ababa',
      };

      const createdProperty = {
        _id: '123',
        ...propertyData,
        createdAt: new Date(),
      };

      Property.create.mockResolvedValue(createdProperty);

      const response = await request(app)
        .post('/api/v1/properties')
        .send(propertyData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.property.title).toBe('New Property');
    });

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/api/v1/properties')
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });
});
```

### Integration Testing

#### Database Integration Tests
```javascript
// backend/tests/integration/property.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Property = require('../../models/propertyModel');
const User = require('../../models/userModel');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Property.deleteMany({});
  await User.deleteMany({});
});

describe('Property Integration Tests', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: 'password123',
      role: 'seller',
    });

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'test@test.com',
        password: 'password123',
      });

    authToken = loginResponse.body.token;
  });

  it('creates and retrieves properties', async () => {
    // Create property
    const propertyData = {
      title: 'Integration Test Property',
      description: 'A test property',
      price: 300000,
      location: 'Test City',
    };

    const createResponse = await request(app)
      .post('/api/v1/properties')
      .set('Authorization', `Bearer ${authToken}`)
      .send(propertyData)
      .expect(201);

    const propertyId = createResponse.body.data.property._id;

    // Retrieve property
    const getResponse = await request(app)
      .get(`/api/v1/properties/${propertyId}`)
      .expect(200);

    expect(getResponse.body.data.property.title).toBe(propertyData.title);
    expect(getResponse.body.data.property.owner._id).toBe(testUser._id.toString());
  });

  it('filters properties by price range', async () => {
    // Create test properties
    await Property.create([
      {
        title: 'Cheap Property',
        price: 100000,
        location: 'City A',
        owner: testUser._id,
      },
      {
        title: 'Expensive Property',
        price: 1000000,
        location: 'City B',
        owner: testUser._id,
      },
    ]);

    // Filter by price range
    const response = await request(app)
      .get('/api/v1/properties?minPrice=200000&maxPrice=800000')
      .expect(200);

    expect(response.body.data.properties).toHaveLength(0);

    const response2 = await request(app)
      .get('/api/v1/properties?minPrice=50000&maxPrice=500000')
      .expect(200);

    expect(response2.body.data.properties).toHaveLength(1);
    expect(response2.body.data.properties[0].title).toBe('Cheap Property');
  });
});
```

## End-to-End Testing

### Playwright E2E Tests
```typescript
// tests/e2e/property-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Property Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'seller@test.com');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL('/dashboard');
  });

  test('creates a new property', async ({ page }) => {
    // Navigate to create property page
    await page.click('[data-testid=create-property-button]');
    await page.waitForURL('/properties/create');

    // Fill form
    await page.fill('[data-testid=property-title]', 'E2E Test Property');
    await page.fill('[data-testid=property-description]', 'A property created by E2E test');
    await page.fill('[data-testid=property-price]', '750000');
    await page.fill('[data-testid=property-location]', 'Test City');

    // Submit form
    await page.click('[data-testid=submit-property]');

    // Wait for success message
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    await expect(page.locator('[data-testid=success-message]')).toContainText('Property created successfully');

    // Verify redirect to property list
    await page.waitForURL('/properties');
    
    // Verify property appears in list
    await expect(page.locator('text=E2E Test Property')).toBeVisible();
  });

  test('edits existing property', async ({ page }) => {
    // Navigate to properties page
    await page.goto('/properties');

    // Click edit on first property
    await page.click('[data-testid=property-card]:first-child [data-testid=edit-button]');

    // Update title
    await page.fill('[data-testid=property-title]', 'Updated Property Title');
    
    // Save changes
    await page.click('[data-testid=save-property]');

    // Verify update
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    await expect(page.locator('text=Updated Property Title')).toBeVisible();
  });

  test('deletes property', async ({ page }) => {
    await page.goto('/properties');

    // Get initial property count
    const initialCount = await page.locator('[data-testid=property-card]').count();

    // Delete first property
    await page.click('[data-testid=property-card]:first-child [data-testid=delete-button]');
    
    // Confirm deletion
    await page.click('[data-testid=confirm-delete]');

    // Verify property is removed
    await expect(page.locator('[data-testid=property-card]')).toHaveCount(initialCount - 1);
  });
});
```

### User Journey Tests
```typescript
// tests/e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('buyer searches and views properties', async ({ page }) => {
    // Start at home page
    await page.goto('/');

    // Use search functionality
    await page.fill('[data-testid=search-input]', 'Addis Ababa');
    await page.fill('[data-testid=min-price]', '200000');
    await page.fill('[data-testid=max-price]', '800000');
    await page.click('[data-testid=search-button]');

    // Verify results page
    await page.waitForURL(/.*properties.*/);
    await expect(page.locator('[data-testid=property-card]')).toHaveCount.greaterThan(0);

    // Click on first property
    await page.click('[data-testid=property-card]:first-child');

    // Verify property detail page
    await expect(page.locator('[data-testid=property-title]')).toBeVisible();
    await expect(page.locator('[data-testid=property-price]')).toBeVisible();
    await expect(page.locator('[data-testid=property-description]')).toBeVisible();

    // Submit interest form
    await page.fill('[data-testid=interest-message]', 'I am interested in this property');
    await page.select('[data-testid=contact-time]', 'morning');
    await page.click('[data-testid=submit-interest]');

    // Verify success
    await expect(page.locator('[data-testid=interest-success]')).toBeVisible();
  });

  test('seller manages property listings', async ({ page }) => {
    // Login as seller
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'seller@test.com');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');

    // Navigate to dashboard
    await page.waitForURL('/dashboard');

    // View property statistics
    await expect(page.locator('[data-testid=total-properties]')).toBeVisible();
    await expect(page.locator('[data-testid=verified-properties]')).toBeVisible();

    // Check interest forms
    await page.click('[data-testid=view-interests]');
    await expect(page.locator('[data-testid=interest-list]')).toBeVisible();

    // Create new property
    await page.click('[data-testid=create-property]');
    await page.fill('[data-testid=property-title]', 'Journey Test Property');
    await page.fill('[data-testid=property-description]', 'Created during user journey test');
    await page.fill('[data-testid=property-price]', '500000');
    await page.fill('[data-testid=property-location]', 'Journey City');
    await page.click('[data-testid=submit-property]');

    // Verify creation
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
  });
});
```

## Performance Testing

### Frontend Performance Tests
```typescript
// tests/performance/lighthouse.spec.ts
import { test, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

test.describe('Performance Tests', () => {
  test('home page meets performance benchmarks', async ({ page, browserName }) => {
    await page.goto('/');
    
    const report = await playAudit({
      page,
      thresholds: {
        performance: 90,
        accessibility: 95,
        'best-practices': 90,
        seo: 90,
      },
      port: 9222,
    });

    expect(report.lhr.categories.performance.score * 100).toBeGreaterThan(90);
    expect(report.lhr.categories.accessibility.score * 100).toBeGreaterThan(95);
  });

  test('property listing page loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
```

### Load Testing
```javascript
// tests/load/loadTest.js
const { check } = require('k6');
const http = require('k6/http');

export let options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up
    { duration: '1m', target: 100 }, // Stay at 100 users
    { duration: '30s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
  },
};

export default function () {
  // Test property listing endpoint
  let response = http.get('http://localhost:3000/api/v1/properties');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Test property search
  response = http.get('http://localhost:3000/api/v1/properties?location=Addis&minPrice=100000');
  check(response, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 1000ms': (r) => r.timings.duration < 1000,
  });
}
```

## Testing Configuration

### Vitest Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'src/test-utils.tsx',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
    },
  },
});
```

### Jest Configuration (Backend)
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',
    '!**/*.test.js',
    '!**/*.spec.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## CI/CD Testing Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  backend-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install backend dependencies
        run: cd backend && npm ci
      
      - name: Run backend tests
        run: cd backend && npm test
        env:
          DATABASE_URI: mongodb://localhost:27017/test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Start servers
        run: |
          npm run build
          npm run preview &
          cd backend && npm start &
        
      - name: Wait for servers
        run: npx wait-on http://localhost:5173 http://localhost:3000
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Testing Best Practices

### General Guidelines
1. **Write tests before or alongside code** (TDD/BDD approach)
2. **Keep tests simple and focused** (one assertion per test when possible)
3. **Use descriptive test names** that explain what is being tested
4. **Arrange, Act, Assert** pattern for test structure
5. **Mock external dependencies** to isolate units under test
6. **Test both happy path and error cases**
7. **Maintain test data consistency** with proper setup/teardown

### Test Data Management
```typescript
// src/test-utils/factories.ts
export const createMockProperty = (overrides: Partial<Property> = {}): Property => ({
  _id: '1',
  title: 'Test Property',
  description: 'A test property',
  price: 100000,
  location: 'Test City',
  images: ['test.jpg'],
  isVerified: false,
  owner: 'user1',
  createdAt: '2023-01-01T00:00:00.000Z',
  ...overrides,
});

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  _id: 'user1',
  name: 'Test User',
  email: 'test@test.com',
  phone: '+251911234567',
  role: 'buyer',
  isVerified: true,
  active: true,
  createdAt: '2023-01-01T00:00:00.000Z',
  ...overrides,
});
```

This comprehensive testing strategy ensures high-quality, reliable code through automated testing at all levels of the application.