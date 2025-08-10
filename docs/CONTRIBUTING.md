# Contributing Guidelines

We welcome contributions to the Ethio-Home project! This document provides guidelines and instructions for contributing effectively.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Code Review Process](#code-review-process)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js >= 18.x installed
- Git configured with your name and email
- Understanding of React, TypeScript, and Express.js
- Familiarity with our [Architecture](./ARCHITECTURE.md)

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/ethio-home.git
   cd ethio-home
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/ethio-home.git
   ```

3. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd backend && npm install
   ```

4. **Set up environment variables**
   ```bash
   # Copy example files
   cp .env.example .env.local
   cd backend && cp .env.example .env
   ```

5. **Start development servers**
   ```bash
   # Frontend (from root)
   npm run dev
   
   # Backend (from backend directory)
   cd backend && npm run dev
   ```

## Development Workflow

### Branch Naming Convention

Use the following pattern for branch names:
```
<type>/<short-description>
```

**Types:**
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical production fixes
- `chore/` - Maintenance tasks
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests

**Examples:**
```bash
feature/property-search-filters
bugfix/authentication-token-refresh
hotfix/payment-gateway-error
chore/update-dependencies
docs/api-documentation-update
refactor/property-service-optimization
test/property-component-coverage
```

### Creating a New Branch

```bash
# Ensure you're on the main branch and it's up to date
git checkout main
git pull upstream main

# Create and switch to your new branch
git checkout -b feature/your-feature-name

# Push the branch to your fork
git push -u origin feature/your-feature-name
```

### Development Process

1. **Create a new branch** for your feature/fix
2. **Write tests** for new functionality
3. **Implement your changes** following our code standards
4. **Test thoroughly** (unit, integration, manual testing)
5. **Update documentation** if necessary
6. **Create a pull request** with a clear description

## Code Standards

### TypeScript/JavaScript

#### General Rules
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write self-documenting code with clear variable names
- Add JSDoc comments for complex functions

#### Code Style Example
```typescript
/**
 * Fetches properties based on search filters
 * @param filters - Search criteria for properties
 * @returns Promise resolving to filtered properties
 */
export const getFilteredProperties = async (
  filters: PropertyFilters
): Promise<Property[]> => {
  try {
    const response = await propertyService.getProperties(filters);
    return response.data.properties;
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    throw new Error('Unable to load properties');
  }
};
```

#### File Organization
```typescript
// 1. External imports
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal imports
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/property/PropertyCard';

// 3. Types and interfaces
interface PropertyListProps {
  filters: PropertyFilters;
  onPropertySelect: (id: string) => void;
}

// 4. Component implementation
export const PropertyList: React.FC<PropertyListProps> = ({
  filters,
  onPropertySelect,
}) => {
  // Component logic here
};
```

### React Components

#### Component Structure
```typescript
// Import order: external, internal, types
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Props interface
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

// Component with proper typing
export const MyComponent: React.FC<ComponentProps> = ({ 
  title, 
  onAction 
}) => {
  // Hooks at the top
  const [isLoading, setIsLoading] = useState(false);
  
  // Event handlers
  const handleClick = () => {
    setIsLoading(true);
    onAction?.();
  };
  
  // Early returns for loading/error states
  if (isLoading) return <div>Loading...</div>;
  
  // Main render
  return (
    <div className="component-container">
      <h2>{title}</h2>
      <Button onClick={handleClick}>Action</Button>
    </div>
  );
};
```

#### Hooks Usage
```typescript
// Custom hooks should start with 'use'
export const usePropertyFilters = () => {
  const [filters, setFilters] = useState<PropertyFilters>({});
  
  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  return { filters, updateFilter };
};

// Use hooks consistently
const MyComponent = () => {
  const { filters, updateFilter } = usePropertyFilters();
  const { data, isLoading } = useQuery(['properties', filters], 
    () => getProperties(filters)
  );
  
  // Component logic
};
```

### CSS/Styling

#### Tailwind CSS Guidelines
```typescript
// Use semantic class names and group related classes
<div className={cn(
  // Layout
  "flex items-center justify-between",
  // Spacing
  "p-4 mb-6",
  // Appearance
  "bg-white rounded-lg shadow-md",
  // State-based styles
  isActive && "ring-2 ring-primary",
  // Responsive design
  "md:p-6 lg:mb-8"
)} />

// Use design system tokens
<Button variant="primary" size="lg">
  Submit
</Button>

// Create reusable style variants
const cardVariants = cva(
  "rounded-lg border", // base styles
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200",
        featured: "bg-primary/5 border-primary/20",
      },
      size: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
      },
    },
  }
);
```

### Backend Code

#### Express.js Controller Pattern
```javascript
/**
 * Property controller handling property-related requests
 */
class PropertyController {
  /**
   * Get all properties with filtering and pagination
   */
  async getProperties(req, res, next) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;
      
      const result = await propertyService.getProperties({
        page: parseInt(page),
        limit: parseInt(limit),
        filters,
      });
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PropertyController();
```

#### Error Handling
```javascript
// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Usage in controllers
const getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return next(new AppError('Property not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: { property },
    });
  } catch (error) {
    next(error);
  }
};
```

## Testing Standards

### Test Structure
```typescript
// Component tests
describe('PropertyCard', () => {
  const mockProperty = {
    _id: '1',
    title: 'Test Property',
    price: 100000,
    location: 'Test Location',
  };

  it('renders property information correctly', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText('100,000 ETB')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<PropertyCard property={mockProperty} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith('1');
  });
});
```

### API Tests
```javascript
// Backend API tests
describe('Property API', () => {
  beforeEach(async () => {
    await Property.deleteMany({});
  });

  describe('GET /api/v1/properties', () => {
    it('should return properties with pagination', async () => {
      // Create test data
      await Property.create([
        { title: 'Property 1', price: 100000, location: 'Location 1' },
        { title: 'Property 2', price: 200000, location: 'Location 2' },
      ]);

      const response = await request(app)
        .get('/api/v1/properties')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.properties).toHaveLength(2);
    });
  });
});
```

## Commit Guidelines

### Commit Message Format
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```bash
feat(auth): add password reset functionality

fix(api): resolve property filter bug
- Fixed issue where price filters weren't being applied
- Added input validation for filter parameters

docs(readme): update installation instructions

test(property): add unit tests for PropertyCard component

chore(deps): update dependencies to latest versions
```

### Commit Best Practices
- Keep commits atomic and focused
- Write clear, descriptive commit messages
- Reference issue numbers when applicable
- Avoid committing work-in-progress code

```bash
# Good commits
git commit -m "feat(search): add location-based property search"
git commit -m "fix(auth): resolve token expiration handling"

# Bad commits
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "update"
```

## Pull Request Process

### Before Creating a PR

1. **Ensure your branch is up to date**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Run tests and checks**
   ```bash
   # Frontend tests
   npm run test
   npm run lint
   npm run type-check
   
   # Backend tests
   cd backend && npm test
   ```

3. **Build successfully**
   ```bash
   npm run build
   ```

### PR Title and Description

#### Title Format
```
<type>[scope]: Brief description
```

Examples:
- `feat(search): Add advanced property filtering`
- `fix(auth): Resolve login token persistence issue`
- `docs(api): Update authentication endpoints documentation`

#### Description Template
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Changes Made
- List the main changes
- Include any new dependencies
- Mention configuration changes

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] New tests added for new functionality

## Screenshots (if applicable)
Include screenshots for UI changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes (or clearly documented)

## Related Issues
Closes #123
Fixes #456
```

### PR Size Guidelines
- Keep PRs focused and reasonably sized (< 500 lines changed)
- For large features, break into multiple PRs
- Each PR should address a single concern

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Bug Description**
A clear and concise description of the bug.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. Windows 10, macOS Big Sur, Ubuntu 20.04]
- Browser: [e.g. Chrome 96, Firefox 94, Safari 15]
- Node.js version: [e.g. 18.12.0]
- App version: [e.g. 1.2.3]

**Additional Context**
Add any other context about the problem here.
```

### Feature Requests

```markdown
**Feature Description**
A clear and concise description of the feature you'd like to see.

**Problem/Use Case**
Describe the problem this feature would solve or the use case it addresses.

**Proposed Solution**
A clear description of what you want to happen.

**Alternatives Considered**
Describe any alternative solutions or features you've considered.

**Additional Context**
Add any other context, mockups, or examples about the feature request.
```

## Code Review Process

### For Authors

1. **Self-review first**
   - Review your own code before requesting review
   - Check for obvious issues and clean up
   - Ensure all tests pass

2. **Request appropriate reviewers**
   - Add reviewers with relevant expertise
   - Include at least one maintainer

3. **Respond to feedback promptly**
   - Address comments within 24-48 hours
   - Ask for clarification if needed
   - Update the PR based on feedback

### For Reviewers

1. **Review criteria**
   - Code quality and adherence to standards
   - Test coverage and quality
   - Performance implications
   - Security considerations
   - Documentation updates

2. **Provide constructive feedback**
   ```markdown
   # Good feedback
   "Consider using a more descriptive variable name here for clarity"
   "This could be simplified using the existing utility function"
   "Great implementation! This handles the edge case nicely"
   
   # Avoid
   "This is wrong"
   "Bad code"
   ```

3. **Review checklist**
   - [ ] Code follows project conventions
   - [ ] Logic is sound and efficient
   - [ ] Tests are comprehensive
   - [ ] Documentation is updated
   - [ ] No security vulnerabilities
   - [ ] Performance impact is acceptable

## Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect different viewpoints and experiences
- Take responsibility for mistakes and learn from them

### Communication

- Use clear, professional language
- Be patient with questions and discussions
- Provide context and examples when possible
- Use appropriate channels (GitHub issues for bugs, discussions for questions)

### Getting Help

- Check existing documentation first
- Search closed issues for similar problems
- Join our community discussions
- Ask for help in PR comments or issues

## Recognition

We value all contributions, whether it's:
- Code contributions
- Bug reports
- Documentation improvements
- Community support
- Testing and feedback

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Community highlights

Thank you for contributing to Ethio-Home! Your efforts help make this project better for everyone.