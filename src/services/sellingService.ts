import api from './api';

export interface PaymentData {
  propertyId: string;
  amount: number;
  paymentMethod?: string;
}

export interface SellingRecord {
  _id: string;
  property: string;
  buyer: string;
  seller: string;
  amount: number;
  transactionRef: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface CreateSellingData {
  property: string;
  buyer: string;
  amount: number;
  transactionRef: string;
}

class SellingService {
  // Initiate payment
  async initiatePayment(data: PaymentData): Promise<any> {
    const response = await api.post('/selling/process-payment', data);
    return response.data;
  }

  // Verify payment
  async verifyPayment(txRef: string): Promise<any> {
    const response = await api.get(`/selling/verify-payment/${txRef}`);
    return response.data;
  }

  // Get all selling records (admin/employee only)
  async getAllSellingRecords(): Promise<SellingRecord[]> {
    const response = await api.get('/selling');
    return response.data.data.sellingRecords;
  }

  // Create selling record (admin only)
  async createSellingRecord(data: CreateSellingData): Promise<SellingRecord> {
    const response = await api.post('/selling', data);
    return response.data.data.sellingRecord;
  }

  // Get selling statistics (admin only)
  async getSellingStats(): Promise<any> {
    const response = await api.get('/selling/selling-stats');
    return response.data;
  }

  // Get selling record by ID (admin only)
  async getSellingRecord(id: string): Promise<SellingRecord> {
    const response = await api.get(`/selling/${id}`);
    return response.data.data.sellingRecord;
  }

  // Update selling record (admin only)
  async updateSellingRecord(id: string, data: Partial<CreateSellingData>): Promise<SellingRecord> {
    const response = await api.patch(`/selling/${id}`, data);
    return response.data.data.sellingRecord;
  }

  // Delete selling record (admin only)
  async deleteSellingRecord(id: string): Promise<void> {
    await api.delete(`/selling/${id}`);
  }
}

export default new SellingService();