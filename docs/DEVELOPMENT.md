# Development Guide

This guide covers the development setup, workflow, and best practices for the Ethio-Home project.

## Prerequisites

### System Requirements
- **Node.js**: >= 18.x (LTS recommended)
- **npm**: >= 9.x (comes with Node.js)
- **Git**: Latest version
- **MongoDB**: >= 6.x (for backend development)
- **VS Code**: Recommended IDE

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "yoavbls.pretty-ts-errors"
  ]
}
```

## Project Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd ethio-home
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Edit environment variables
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_ENV=development
```

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Edit environment variables
NODE_ENV=development
PORT=3000
DATABASE_URI=mongodb://localhost:27017/ethio-home
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email configuration (for development)
EMAIL_FROM=noreply@ethio-home.com
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
```

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# Or use MongoDB Atlas (cloud)
# Update DATABASE_URI in .env to your Atlas connection string
```

## Development Workflow

### Starting Development Servers

#### Frontend Development
```bash
# Start frontend development server
npm run dev

# Server will start at http://localhost:5173
```

#### Backend Development
```bash
# Navigate to backend directory
cd backend

# Start backend development server
npm run dev

# Server will start at http://localhost:3000
```

#### Full-Stack Development
```bash
# In root directory, start both servers
npm run dev:all
```

### Available Scripts

#### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

#### Backend Scripts
```bash
npm run dev          # Start development server with nodemon
npm run start        # Start production server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## Code Organization

### Frontend Structure
```
src/
├── components/
│   ├── auth/              # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── property/          # Property-related components
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyList.tsx
│   │   └── PropertyForm.tsx
│   ├── shared/            # Shared components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── SearchBar.tsx
│   └── ui/               # Base UI components (shadcn/ui)
├── hooks/                # Custom hooks
│   ├── useAuth.ts
│   ├── useProperties.ts
│   └── useLocalStorage.ts
├── pages/                # Page components
├── services/             # API services
├── store/                # Global state
├── types/                # TypeScript types
├── utils/                # Utility functions
└── lib/                  # Library configurations
```

### Backend Structure
```
backend/
├── controllers/          # Route controllers
├── models/              # Database models
├── routes/              # Express routes
├── middleware/          # Custom middleware
├── utils/               # Utility functions
├── config/              # Configuration files
└── tests/               # Test files
```

## Development Best Practices

### Code Style

#### TypeScript/JavaScript
```typescript
// Use descriptive names
const getUserProperties = async (userId: string): Promise<Property[]> => {
  // Implementation
};

// Use proper typing
interface CreatePropertyData {
  title: string;
  description: string;
  price: number;
  location: string;
  images?: string[];
}

// Use enums for constants
enum PropertyStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SOLD = 'sold',
}
```

#### React Components
```typescript
// Use functional components with hooks
const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onEdit, 
  onDelete 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <Card className="property-card">
      {/* Component content */}
    </Card>
  );
};

// Export with proper typing
export type PropertyCardProps = {
  property: Property;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};
```

#### CSS/Tailwind
```typescript
// Use semantic class names
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
  }
);
```

### Git Workflow

#### Branch Naming
```bash
feature/property-search
bugfix/authentication-error
hotfix/payment-gateway
chore/update-dependencies
```

#### Commit Messages
```bash
feat: add property search functionality
fix: resolve authentication token expiry issue
docs: update API documentation
style: format code with prettier
refactor: optimize property query performance
test: add unit tests for auth service
```

#### Pull Request Process
1. Create feature branch from `develop`
2. Implement changes with tests
3. Update documentation if needed
4. Create pull request
5. Code review and approval
6. Merge to `develop`
7. Deploy to staging for testing

### Testing Strategy

#### Frontend Testing
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyCard } from './PropertyCard';

describe('PropertyCard', () => {
  const mockProperty = {
    _id: '1',
    title: 'Test Property',
    price: 100000,
    location: 'Addis Ababa',
  };

  it('renders property information', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText('Addis Ababa')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<PropertyCard property={mockProperty} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith('1');
  });
});
```

#### API Testing
```typescript
// Service testing with mock API
import { propertyService } from '../services/propertyService';
import { api } from '../services/api';

jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('PropertyService', () => {
  it('fetches properties successfully', async () => {
    const mockProperties = [{ _id: '1', title: 'Test Property' }];
    mockedApi.get.mockResolvedValue({ data: { data: { properties: mockProperties } } });

    const result = await propertyService.getProperties();
    
    expect(result).toEqual(mockProperties);
    expect(mockedApi.get).toHaveBeenCalledWith('/properties');
  });
});
```

## Debugging

### Frontend Debugging

#### React DevTools
Install React Developer Tools browser extension for component inspection.

#### Console Debugging
```typescript
// Use proper logging levels
console.log('Debug info:', data);
console.warn('Warning:', warning);
console.error('Error:', error);

// Use debugger statements for breakpoints
debugger;
```

#### Network Inspection
1. Open browser DevTools (F12)
2. Go to Network tab
3. Monitor API calls and responses
4. Check for errors, timeouts, or unexpected responses

### Backend Debugging

#### Node.js Debugging
```bash
# Start with debugging enabled
npm run dev:debug

# Or use VS Code debugging configuration
```

#### Database Debugging
```javascript
// Enable Mongoose debugging
mongoose.set('debug', true);

// Log database queries
console.log('Query:', User.find({ email }));
```

## Environment Management

### Environment Variables

#### Frontend (.env.local)
```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_ENV=development
VITE_APP_NAME=Ethio-Home
```

#### Backend (.env)
```bash
NODE_ENV=development
PORT=3000
DATABASE_URI=mongodb://localhost:27017/ethio-home
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=http://localhost:5173
```

### Configuration Management
```typescript
// src/config/environment.ts
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  environment: import.meta.env.VITE_APP_ENV,
  isDevelopment: import.meta.env.VITE_APP_ENV === 'development',
  isProduction: import.meta.env.VITE_APP_ENV === 'production',
};
```

## Common Development Tasks

### Adding a New Feature

1. **Create Types**
   ```typescript
   // src/types/index.ts
   export interface NewFeature {
     id: string;
     name: string;
     createdAt: string;
   }
   ```

2. **Create Service**
   ```typescript
   // src/services/newFeatureService.ts
   class NewFeatureService {
     async getFeatures(): Promise<NewFeature[]> {
       const response = await api.get('/features');
       return response.data.data.features;
     }
   }
   ```

3. **Create Hook**
   ```typescript
   // src/hooks/useNewFeature.ts
   export const useNewFeature = () => {
     return useQuery({
       queryKey: ['features'],
       queryFn: newFeatureService.getFeatures,
     });
   };
   ```

4. **Create Component**
   ```typescript
   // src/components/NewFeatureComponent.tsx
   export const NewFeatureComponent = () => {
     const { data: features, isLoading } = useNewFeature();
     
     if (isLoading) return <Skeleton />;
     
     return (
       <div>
         {features?.map(feature => (
           <div key={feature.id}>{feature.name}</div>
         ))}
       </div>
     );
   };
   ```

### Database Operations

#### Adding New Model (Backend)
```javascript
// backend/models/newModel.js
const mongoose = require('mongoose');

const newModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('NewModel', newModelSchema);
```

### API Integration

#### Adding New Endpoint
1. **Backend Route**
   ```javascript
   // backend/routes/newRoutes.js
   router.get('/', authController.protect, newController.getAll);
   router.post('/', authController.protect, newController.create);
   ```

2. **Frontend Service**
   ```typescript
   // src/services/newService.ts
   async create(data: CreateData): Promise<NewItem> {
     const response = await api.post('/new-endpoint', data);
     return response.data.data.item;
   }
   ```

## Performance Optimization

### Frontend Performance
1. **Code Splitting**
   ```typescript
   const LazyComponent = lazy(() => import('./LazyComponent'));
   ```

2. **Memoization**
   ```typescript
   const MemoizedComponent = memo(({ data }) => {
     return <div>{data.name}</div>;
   });
   ```

3. **Virtual Scrolling**
   For large lists, implement virtual scrolling.

### Backend Performance
1. **Database Indexing**
   ```javascript
   userSchema.index({ email: 1 });
   propertySchema.index({ location: 1, price: 1 });
   ```

2. **Query Optimization**
   ```javascript
   // Use projection to limit fields
   const users = await User.find({}, 'name email');
   
   // Use population efficiently
   const properties = await Property.find().populate('owner', 'name email');
   ```

## Troubleshooting

### Common Issues

#### CORS Errors
```javascript
// backend/app.js
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
```

#### Authentication Issues
```typescript
// Check cookie settings
const api = axios.create({
  withCredentials: true, // Essential for cookies
});
```

#### Database Connection Issues
```javascript
// Add connection error handling
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
```

### Debug Checklist

1. **API not responding**
   - Check server is running
   - Verify correct port
   - Check network connectivity

2. **Authentication failing**
   - Verify JWT secret matches
   - Check cookie settings
   - Validate token expiry

3. **Database errors**
   - Check MongoDB is running
   - Verify connection string
   - Check collection names

4. **Build errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify import paths

## Code Quality Tools

### ESLint Configuration
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Husky Git Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```