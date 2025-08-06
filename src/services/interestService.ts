import api from './api';

export interface InterestForm {
  id: string;
  property: string; // Property ID
  message: string;
  preferredContactTime: string;
  status: 'pending' | 'reviewed' | 'contacted' | 'closed';
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  createdAt: string;
}

export interface CreateInterestData {
  property: string; // Property ID
  message: string;
  preferredContactTime: string;
}

export interface InterestResponse {
  status: string;
  data: {
    interest: InterestForm;
  };
}

export interface InterestListResponse {
  status: string;
  results: number;
  data: {
    interests: InterestForm[];
  };
}

class InterestService {
  // Submit interest form for a property (buyers)
  async submitInterest(data: CreateInterestData): Promise<InterestForm> {
    const response = await api.post('/interest/buyer', data);
    return response.data.data.interest;
  }

  // Get all interest forms submitted by current user (buyers)
  async getMyInterests(): Promise<InterestForm[]> {
    const response = await api.get('/interest/buyer');
    return response.data.data.interests;
  }

  // Get all interest forms for a specific property (sellers/admins)
  async getPropertyInterests(propertyId: string): Promise<InterestForm[]> {
    const response = await api.get(`/properties/${propertyId}/interest`);
    return response.data.data.interests;
  }
}

export default new InterestService();