import api from './api';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    region: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  propertyType: 'apartment' | 'house' | 'villa' | 'condo' | 'townhouse';
  features: {
    bedrooms: number;
    bathrooms: number;
    area: number; // in square meters
    parking?: number;
    furnished?: boolean;
  };
  images: string[];
  amenities: string[];
  isVerified: boolean;
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  location?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  verified?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface CreatePropertyData {
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    region: string;
  };
  propertyType: string;
  features: {
    bedrooms: number;
    bathrooms: number;
    area: number;
    parking?: number;
    furnished?: boolean;
  };
  amenities: string[];
}

export interface PropertiesResponse {
  status: string;
  results: number;
  data: {
    properties: Property[];
  };
  pagination: {
    page: number;
    limit: number;
    pages: number;
    total: number;
  };
}

class PropertyService {
  // Get all properties with optional filters
  async getProperties(filters: PropertyFilters = {}): Promise<PropertiesResponse> {
    const response = await api.get('/properties', { params: filters });
    return response.data;
  }

  // Get single property by ID
  async getProperty(id: string): Promise<Property> {
    const response = await api.get(`/properties/${id}`);
    return response.data.data.property;
  }

  // Create new property (for sellers/agents)
  async createProperty(data: CreatePropertyData, images?: File[]): Promise<Property> {
    const formData = new FormData();
    
    // Append property data
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    // Append images
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await api.post('/properties', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.property;
  }

  // Update property (for sellers/agents)
  async updateProperty(id: string, data: Partial<CreatePropertyData>, images?: File[]): Promise<Property> {
    const formData = new FormData();
    
    // Append property data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Append images if provided
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await api.patch(`/properties/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.property;
  }

  // Delete property (for admins)
  async deleteProperty(id: string): Promise<void> {
    await api.delete(`/properties/${id}`);
  }

  // Search properties
  async searchProperties(query: string, filters: PropertyFilters = {}): Promise<PropertiesResponse> {
    const searchParams = {
      ...filters,
      search: query,
    };
    return this.getProperties(searchParams);
  }
}

export default new PropertyService();