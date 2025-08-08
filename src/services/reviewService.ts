import api from './api';

export interface Review {
  id: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  property: string; // Property ID
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface CreateReviewData {
  rating: number;
  title: string;
  comment: string;
  property: string; // Property ID
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
  // Create a new review for a property
  async createReview(data: CreateReviewData): Promise<Review> {
    const response = await api.post('/reviews', data);
    return response.data.data.review;
  }

  // Get all reviews for a specific property
  async getPropertyReviews(propertyId: string): Promise<Review[]> {
    const response = await api.get(`/properties/${propertyId}/reviews`);
    return response.data.data.reviews;
  }
}

export default new ReviewService();