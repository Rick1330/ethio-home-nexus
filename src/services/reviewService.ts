import api from './api';

export interface Review {
  _id: string;
  rating: number; // 1-5
  review: string;
  property: string; // Property ID
  user: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export interface CreateReviewData {
  rating: number;
  review: string;
  property?: string; // Property ID (optional if using nested route)
}

export interface ReviewResponse {
  status: string;
  data: {
    review: Review;
  };
}

export interface ReviewListResponse {
  status: string;
  results: number;
  data: {
    reviews: Review[];
  };
}

class ReviewService {
  // Get all reviews
  async getAllReviews(): Promise<Review[]> {
    const response = await api.get('/reviews');
    return response.data.data.reviews;
  }

  // Create a new review for a property
  async createReview(data: CreateReviewData): Promise<Review> {
    const response = await api.post('/reviews', data);
    return response.data.data.review;
  }

  // Create a new review for a specific property (nested route)
  async createPropertyReview(propertyId: string, data: CreateReviewData): Promise<Review> {
    const response = await api.post(`/properties/${propertyId}/reviews`, data);
    return response.data.data.review;
  }

  // Get single review by ID
  async getReview(id: string): Promise<Review> {
    const response = await api.get(`/reviews/${id}`);
    return response.data.data.review;
  }

  // Get all reviews for a specific property
  async getPropertyReviews(propertyId: string): Promise<Review[]> {
    const response = await api.get(`/properties/${propertyId}/reviews`);
    return response.data.data.reviews;
  }

  // Update review by ID
  async updateReview(id: string, data: Partial<CreateReviewData>): Promise<Review> {
    const response = await api.patch(`/reviews/${id}`, data);
    return response.data.data.review;
  }

  // Delete review by ID
  async deleteReview(id: string): Promise<void> {
    await api.delete(`/reviews/${id}`);
  }
}

export default new ReviewService();