# Code Style Guide

This document defines the coding standards and style guidelines for the Ethio-Home project. Consistent code style improves readability, maintainability, and team collaboration.

## General Principles

1. **Consistency**: Follow established patterns within the codebase
2. **Readability**: Write code that tells a story
3. **Simplicity**: Prefer simple, clear solutions over clever ones
4. **Performance**: Consider performance implications of style choices
5. **Maintainability**: Write code that's easy to modify and extend

## TypeScript/JavaScript Standards

### File Naming Conventions

```bash
# Components (PascalCase)
PropertyCard.tsx
UserProfile.tsx
SearchFilters.tsx

# Hooks (camelCase with 'use' prefix)
useProperties.ts
useAuth.ts
useLocalStorage.ts

# Services (camelCase)
propertyService.ts
authService.ts
apiClient.ts

# Utilities (camelCase)
formatCurrency.ts
validateEmail.ts
dateHelpers.ts

# Types (camelCase)
index.ts
propertyTypes.ts
userTypes.ts

# Constants (camelCase or SCREAMING_SNAKE_CASE for file names)
constants.ts
apiConstants.ts
APP_CONFIG.ts
```

### Variable Naming

```typescript
// Use descriptive, self-documenting names
const userAuthenticationToken = getToken(); // Good
const t = getToken(); // Bad

// Use camelCase for variables and functions
const propertyList = [];
const calculateTotalPrice = () => {};

// Use PascalCase for classes and constructors
class PropertyService {}
const userInstance = new User();

// Use SCREAMING_SNAKE_CASE for constants
const API_BASE_URL = 'https://api.example.com';
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

// Use descriptive boolean names
const isLoading = true; // Good
const loading = true; // Acceptable
const flag = true; // Bad

// Avoid negated booleans when possible
const isEnabled = true; // Good
const isNotDisabled = true; // Bad
```

### Function Declaration

```typescript
// Use function expressions for most cases
const calculatePropertyPrice = (basePrice: number, taxes: number): number => {
  return basePrice + taxes;
};

// Use arrow functions for short, inline functions
const properties = data.filter(property => property.isVerified);

// Use function declarations for main component functions
function PropertyCard({ property }: PropertyCardProps) {
  return <div>{property.title}</div>;
}

// Use async/await instead of promises chains
const fetchProperty = async (id: string): Promise<Property> => {
  try {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch property: ${error.message}`);
  }
};

// Avoid promise chains
const fetchPropertyBad = (id: string) => {
  return api.get(`/properties/${id}`)
    .then(response => response.data)
    .catch(error => {
      throw new Error(`Failed to fetch property: ${error.message}`);
    });
};
```

### Type Definitions

```typescript
// Use interfaces for object shapes
interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  isVerified: boolean;
  createdAt: string;
}

// Use type aliases for unions, primitives, and complex types
type PropertyStatus = 'draft' | 'published' | 'sold';
type PropertyId = string;
type PropertyFilters = Partial<Pick<Property, 'location' | 'isVerified'>> & {
  minPrice?: number;
  maxPrice?: number;
};

// Use enums for related constants
enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  AGENT = 'agent',
  ADMIN = 'admin',
}

// Extend interfaces when needed
interface CreatePropertyData extends Omit<Property, '_id' | 'createdAt'> {
  images?: File[];
}

// Use generic types for reusable interfaces
interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

### Import/Export Patterns

```typescript
// Group imports: external libraries, internal modules, types
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useAuth } from '@/hooks/useAuth';

import type { Property, PropertyFilters } from '@/types';

// Use default exports for components
export default function PropertyList() {
  // Component implementation
}

// Use named exports for utilities, hooks, and services
export const usePropertyFilters = () => {
  // Hook implementation
};

export const formatPrice = (price: number): string => {
  // Utility implementation
};

// Re-export from index files
export { PropertyCard } from './PropertyCard';
export { PropertyList } from './PropertyList';
export { PropertyForm } from './PropertyForm';

// Use type-only imports when needed
import type { ComponentProps } from 'react';
import type { Property } from '@/types';
```

### Error Handling

```typescript
// Use try-catch for async operations
const fetchProperties = async (): Promise<Property[]> => {
  try {
    const response = await api.get('/properties');
    return response.data.properties;
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    throw new Error('Unable to load properties');
  }
};

// Handle specific error types
const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

// Use Result pattern for operations that might fail
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

const safeParseJson = <T>(json: string): Result<T> => {
  try {
    const data = JSON.parse(json);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};
```

## React Component Standards

### Component Structure

```typescript
// Component file structure template
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import type { Property } from '@/types';

// Props interface
interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

// Component implementation
export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  variant = 'default',
  showActions = false,
  onEdit,
  onDelete,
  onView,
}) => {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // 2. Computed values and derived state
  const canEdit = user?.role === 'seller' && user.id === property.owner;
  const formattedPrice = formatCurrency(property.price);

  // 3. Event handlers
  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(property._id);
    }
  }, [onEdit, property._id]);

  const handleDelete = useCallback(() => {
    if (onDelete && window.confirm('Are you sure?')) {
      onDelete(property._id);
    }
  }, [onDelete, property._id]);

  // 4. Effects
  useEffect(() => {
    // Side effects here
  }, []);

  // 5. Early returns for loading/error states
  if (isLoading) {
    return <PropertyCardSkeleton />;
  }

  // 6. Main render
  return (
    <Card className={cn(cardVariants({ variant }))}>
      <div className="property-image">
        <img 
          src={property.images[0]} 
          alt={property.title}
          loading="lazy"
        />
      </div>
      
      <div className="property-content">
        <h3 className="property-title">{property.title}</h3>
        <p className="property-price">{formattedPrice}</p>
        <p className="property-location">{property.location}</p>
        
        {showActions && canEdit && (
          <div className="property-actions">
            <Button size="sm" onClick={handleEdit}>
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

// Default props (if needed)
PropertyCard.defaultProps = {
  variant: 'default',
  showActions: false,
};
```

### Hooks Patterns

```typescript
// Custom hook structure
export const usePropertyManagement = (userId: string) => {
  // 1. State
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Queries and mutations
  const { data, isLoading: isQueryLoading } = useQuery({
    queryKey: ['properties', userId],
    queryFn: () => propertyService.getUserProperties(userId),
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: propertyService.createProperty,
    onSuccess: (newProperty) => {
      setProperties(prev => [...prev, newProperty]);
      toast.success('Property created successfully');
    },
    onError: (error) => {
      setError(handleApiError(error));
      toast.error('Failed to create property');
    },
  });

  // 3. Memoized handlers
  const createProperty = useCallback((data: CreatePropertyData) => {
    createMutation.mutate(data);
  }, [createMutation]);

  const updateProperty = useCallback((id: string, data: Partial<Property>) => {
    setProperties(prev => 
      prev.map(prop => prop._id === id ? { ...prop, ...data } : prop)
    );
  }, []);

  // 4. Effects
  useEffect(() => {
    if (data) {
      setProperties(data);
    }
  }, [data]);

  // 5. Return stable object
  return {
    properties,
    isLoading: isLoading || isQueryLoading,
    error,
    createProperty,
    updateProperty,
    isCreating: createMutation.isLoading,
  };
};
```

### Conditional Rendering

```typescript
// Use ternary for simple conditions
const PropertyStatus = ({ isVerified }: { isVerified: boolean }) => (
  <span className={isVerified ? 'text-green-600' : 'text-yellow-600'}>
    {isVerified ? 'Verified' : 'Pending'}
  </span>
);

// Use logical AND for presence checks
const PropertyActions = ({ canEdit, onEdit, onDelete }) => (
  <div>
    {canEdit && (
      <div className="actions">
        <Button onClick={onEdit}>Edit</Button>
        <Button onClick={onDelete}>Delete</Button>
      </div>
    )}
  </div>
);

// Use early returns for complex conditions
const PropertyCard = ({ property }) => {
  if (!property) {
    return <div>No property data</div>;
  }

  if (property.isDeleted) {
    return <div>Property no longer available</div>;
  }

  return (
    <div>
      {/* Main component content */}
    </div>
  );
};

// Use helper functions for complex logic
const getPropertyStatusColor = (status: PropertyStatus): string => {
  switch (status) {
    case 'published':
      return 'text-green-600';
    case 'draft':
      return 'text-yellow-600';
    case 'sold':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};
```

## CSS and Styling Standards

### Tailwind CSS Guidelines

```typescript
// Group related classes together
<div className={cn(
  // Layout
  "flex items-center justify-between",
  // Spacing
  "p-4 mb-6",
  // Appearance
  "bg-white rounded-lg shadow-md border",
  // Typography
  "text-sm font-medium text-gray-900",
  // State classes
  isActive && "ring-2 ring-primary ring-offset-2",
  // Responsive
  "sm:p-6 md:mb-8 lg:text-base"
)} />

// Use design system tokens
<Button 
  variant="primary" 
  size="lg"
  className="w-full sm:w-auto"
>
  Submit
</Button>

// Create component variants with CVA
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### CSS-in-JS Patterns (when needed)

```typescript
// Use styled-components for complex dynamic styles
import styled from 'styled-components';

const PropertyCardContainer = styled.div<{ featured?: boolean }>`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  ${props => props.featured && `
    border: 2px solid var(--primary);
    background: var(--primary-50);
  `}
  
  @media (min-width: 768px) {
    padding: 24px;
  }
`;

// Prefer CSS custom properties for theming
const theme = {
  colors: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};
```

## Backend Code Standards

### Express.js Controllers

```javascript
// Controller class pattern
class PropertyController {
  /**
   * Get all properties with filtering and pagination
   * @route GET /api/v1/properties
   * @access Public
   */
  async getProperties(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        sort = '-createdAt',
        fields,
        ...filters
      } = req.query;

      // Validate pagination parameters
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

      const result = await propertyService.getProperties({
        page: pageNum,
        limit: limitNum,
        sort,
        fields,
        filters,
      });

      res.status(200).json({
        status: 'success',
        results: result.properties.length,
        data: {
          properties: result.properties,
        },
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new property
   * @route POST /api/v1/properties
   * @access Private (Seller/Agent/Admin)
   */
  async createProperty(req, res, next) {
    try {
      const propertyData = {
        ...req.body,
        owner: req.user.id,
        images: req.files?.map(file => file.filename) || [],
      };

      const property = await propertyService.createProperty(propertyData);

      res.status(201).json({
        status: 'success',
        data: {
          property,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PropertyController();
```

### Service Layer Pattern

```javascript
// Service class for business logic
class PropertyService {
  /**
   * Get properties with advanced filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Properties with pagination
   */
  async getProperties(options) {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      fields,
      filters = {},
    } = options;

    // Build MongoDB filter object
    const mongoFilter = this.buildFilterQuery(filters);

    // Build MongoDB query
    let query = Property.find(mongoFilter);

    // Apply field selection
    if (fields) {
      query = query.select(fields);
    }

    // Apply sorting
    query = query.sort(sort);

    // Apply pagination
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // Use lean for better performance
    query = query.lean();

    // Execute query and count
    const [properties, total] = await Promise.all([
      query.exec(),
      Property.countDocuments(mongoFilter),
    ]);

    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: skip + limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Build MongoDB filter query from request filters
   * @param {Object} filters - Filter parameters
   * @returns {Object} MongoDB filter object
   */
  buildFilterQuery(filters) {
    const mongoFilter = {};

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      mongoFilter.price = {};
      if (filters.minPrice) {
        mongoFilter.price.$gte = parseFloat(filters.minPrice);
      }
      if (filters.maxPrice) {
        mongoFilter.price.$lte = parseFloat(filters.maxPrice);
      }
    }

    // Location filter (case-insensitive partial match)
    if (filters.location) {
      mongoFilter.location = {
        $regex: filters.location,
        $options: 'i',
      };
    }

    // Boolean filters
    if (filters.isVerified !== undefined) {
      mongoFilter.isVerified = filters.isVerified === 'true';
    }

    // Array filters
    if (filters.propertyType) {
      mongoFilter.propertyType = {
        $in: Array.isArray(filters.propertyType) 
          ? filters.propertyType 
          : [filters.propertyType],
      };
    }

    return mongoFilter;
  }

  /**
   * Create a new property
   * @param {Object} propertyData - Property data
   * @returns {Promise<Object>} Created property
   */
  async createProperty(propertyData) {
    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'location'];
    const missingFields = requiredFields.filter(field => !propertyData[field]);
    
    if (missingFields.length > 0) {
      throw new AppError(
        `Missing required fields: ${missingFields.join(', ')}`,
        400
      );
    }

    // Create property
    const property = await Property.create(propertyData);

    // Populate owner information
    await property.populate('owner', 'name email');

    return property;
  }
}

module.exports = new PropertyService();
```

### Error Handling Patterns

```javascript
// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(field, value) {
    super(`Invalid value '${value}' for field '${field}'`, 400);
    this.field = field;
    this.value = value;
  }
}

// Global error handler middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    } else if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    } else if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    } else if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    } else if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, res);
  }
};

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Usage in routes
router.get('/properties', catchAsync(propertyController.getProperties));
```

## Testing Standards

### Test File Organization

```typescript
// Test file naming
PropertyCard.test.tsx
propertyService.test.js
authController.test.js

// Test structure
describe('PropertyCard Component', () => {
  // Test data setup
  const mockProperty = {
    _id: '1',
    title: 'Test Property',
    price: 100000,
    location: 'Test Location',
    isVerified: true,
  };

  // Grouped tests
  describe('Rendering', () => {
    it('renders property information correctly', () => {
      render(<PropertyCard property={mockProperty} />);
      
      expect(screen.getByText('Test Property')).toBeInTheDocument();
      expect(screen.getByText('100,000 ETB')).toBeInTheDocument();
    });

    it('shows verified badge when property is verified', () => {
      render(<PropertyCard property={mockProperty} />);
      
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onEdit when edit button is clicked', () => {
      const onEdit = jest.fn();
      render(<PropertyCard property={mockProperty} onEdit={onEdit} />);
      
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      expect(onEdit).toHaveBeenCalledWith('1');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing image gracefully', () => {
      const propertyWithoutImage = { ...mockProperty, images: [] };
      render(<PropertyCard property={propertyWithoutImage} />);
      
      expect(screen.getByAltText('No image available')).toBeInTheDocument();
    });
  });
});
```

## Documentation Standards

### JSDoc Comments

```typescript
/**
 * Fetches properties based on search criteria
 * @param filters - Object containing search filters
 * @param filters.location - Location to search for
 * @param filters.minPrice - Minimum price filter
 * @param filters.maxPrice - Maximum price filter
 * @param options - Additional query options
 * @param options.page - Page number for pagination
 * @param options.limit - Number of items per page
 * @returns Promise that resolves to filtered properties
 * @throws {ApiError} When the API request fails
 * 
 * @example
 * ```typescript
 * const properties = await getProperties(
 *   { location: 'Addis Ababa', minPrice: 100000 },
 *   { page: 1, limit: 20 }
 * );
 * ```
 */
export const getProperties = async (
  filters: PropertyFilters,
  options: QueryOptions = {}
): Promise<Property[]> => {
  // Implementation
};

/**
 * React component for displaying property information
 * @component
 * 
 * @param props - Component props
 * @param props.property - Property object to display
 * @param props.variant - Visual variant of the card
 * @param props.onEdit - Callback fired when edit button is clicked
 * 
 * @example
 * ```tsx
 * <PropertyCard 
 *   property={propertyData}
 *   variant="featured"
 *   onEdit={(id) => navigate(`/edit/${id}`)}
 * />
 * ```
 */
export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  variant = 'default',
  onEdit,
}) => {
  // Component implementation
};
```

### README Documentation

```markdown
# Component Name

Brief description of what this component does.

## Usage

```tsx
import { PropertyCard } from '@/components/property/PropertyCard';

<PropertyCard 
  property={propertyData}
  variant="featured"
  onEdit={handleEdit}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| property | Property | - | Property object to display |
| variant | 'default' \| 'featured' | 'default' | Visual variant |
| onEdit | (id: string) => void | - | Edit button callback |

## Examples

### Basic Usage
```tsx
<PropertyCard property={property} />
```

### With Actions
```tsx
<PropertyCard 
  property={property}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```
```

This code style guide ensures consistency across the Ethio-Home codebase and helps maintain high code quality standards.