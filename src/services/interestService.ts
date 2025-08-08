import api from './api';

export interface InterestForm {
  _id: string;
  property: string; // Property ID
  message: string;
  preferredContactTime: string;
  status: 'pending' | 'reviewed' | 'contacted' | 'closed' | 'schedule';
  visitDate?: string;
  buyer: {
    _id: string;
    name: string;
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

  // Submit interest form for a specific property (buyers) - nested route
  async submitPropertyInterest(propertyId: string, data: CreateInterestData): Promise<InterestForm> {
    const response = await api.post(`/properties/${propertyId}/interest/buyer`, data);
    return response.data.data.interest;
  }

  // Get all interest forms submitted by current user (buyers)
  async getMyInterests(): Promise<InterestForm[]> {
    const response = await api.get('/interest/buyer');
    return response.data.data.interests;
  }

  // Get single interest form for buyer
  async getMyInterest(id: string): Promise<InterestForm> {
    const response = await api.get(`/interest/buyer/${id}`);
    return response.data.data.interest;
  }

  // Update interest form (buyer)
  async updateInterest(id: string, data: Partial<CreateInterestData>): Promise<InterestForm> {
    const response = await api.patch(`/interest/buyer/${id}`, data);
    return response.data.data.interest;
  }

  // Delete interest form (buyer)
  async deleteInterest(id: string): Promise<void> {
    await api.delete(`/interest/buyer/${id}`);
  }

  // Get all interest forms for a specific property (admin/employee)
  async getPropertyInterests(propertyId: string): Promise<InterestForm[]> {
    const response = await api.get(`/properties/${propertyId}/interest`);
    return response.data.data.interests;
  }

  // Get all interest forms for a seller
  async getSellerInterests(ownerId: string): Promise<InterestForm[]> {
    const response = await api.get(`/interest/${ownerId}`);
    return response.data.data.interests;
  }

  // Update interest form status (admin/employee)
  async updateInterestStatus(id: string, status: string, visitDate?: string): Promise<InterestForm> {
    const payload: any = { status };
    if (visitDate) payload.visitDate = visitDate;
    
    const response = await api.patch(`/interest/status/${id}`, payload);
    return response.data.data.interest;
  }
}

export default new InterestService();