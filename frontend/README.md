# Ethio-Home Frontend

React frontend application for the Ethio-Home real estate platform.

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **React Query** for server state
- **Axios** for API calls
- **Shadcn/UI** component library

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.local.example .env.local
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # Base UI components (shadcn)
│   ├── auth/         # Authentication components
│   ├── property/     # Property-related components
│   └── shared/       # Shared components (Navbar, Footer)
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── services/         # API service layers
├── store/            # Zustand state stores
├── types/            # TypeScript type definitions
└── lib/              # Utility functions
```

## Features

- 🏠 Property browsing with advanced filters
- 🔍 Search functionality
- 👤 User authentication (buyers/sellers)
- 📝 Property management for sellers
- 💌 Interest forms and reviews
- 📱 Fully responsive design
- 🎨 Modern Ethiopian-inspired design

## API Integration

The frontend integrates with a Node.js/Express backend:
- JWT authentication via HTTP-only cookies
- RESTful API endpoints
- Image upload support
- Real-time data with React Query

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```