const API_BASE_URL = 'http://localhost:3001/api';

// Типы данных
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  company?: string;
  address?: string;
  isActive: boolean;
  stats: {
    totalOrders: number;
    totalSpent: number;
    memberSince: string;
  };
}

export interface Tool {
  _id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  images: string[];
  description: string;
  fullDescription?: string;
  specifications: Record<string, string>;
  features: string[];
  included?: string[];
  condition: string;
  status: 'available' | 'rented' | 'maintenance' | 'retired';
  inStock: number;
  totalStock: number;
  rating: number;
  reviewCount: number;
  totalRentals: number;
  totalRevenue: number;
  isActive: boolean;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId?: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
  };
  items: Array<{
    toolId: string;
    toolName: string;
    quantity: number;
    pricePerDay: number;
    days: number;
    total: number;
  }>;
  startDate: string;
  endDate: string;
  totalDays: number;
  subtotal: number;
  tax: number;
  total: number;
  deposit: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'overdue';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  paymentMethod: string;
  deliveryInfo: {
    address: string;
    date?: string;
    timeSlot?: string;
    instructions?: string;
  };
  deliveryStatus: 'pending' | 'scheduled' | 'delivered' | 'returned';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  toolId: string;
  customerId: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  isVerified: boolean;
  isApproved: boolean;
  helpfulVotes: number;
  reportCount: number;
  response?: {
    text: string;
    author: string;
    createdAt: string;
  };
  createdAt: string;
}

export interface Booking {
  _id: string;
  toolId: string;
  customerId?: string;
  startDate: string;
  endDate: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  pricePerDay: number;
  totalPrice: number;
  notes: string;
  createdAt: string;
}

// Утилиты для работы с API
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth API
  async login(email: string, password: string) {
    return this.request<{ success: boolean; data: { user: User; token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    company?: string;
  }) {
    return this.request<{ success: boolean; data: { user: User; token: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request<{ success: boolean; data: User }>('/auth/profile');
  }

  // Tools API
  async getTools(params?: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    available?: boolean;
    sort?: string;
    order?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<{
      success: boolean;
      data: {
        tools: Tool[];
        pagination: {
          current: number;
          total: number;
          count: number;
          totalItems: number;
        };
      };
    }>(`/tools?${searchParams}`);
  }

  async getTool(id: string) {
    return this.request<{ success: boolean; data: Tool }>(`/tools/${id}`);
  }

  async createTool(toolData: Partial<Tool>) {
    return this.request<{ success: boolean; data: Tool }>('/tools', {
      method: 'POST',
      body: JSON.stringify(toolData),
    });
  }

  async updateTool(id: string, toolData: Partial<Tool>) {
    return this.request<{ success: boolean; message: string }>(`/tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toolData),
    });
  }

  async deleteTool(id: string) {
    return this.request<{ success: boolean; message: string }>(`/tools/${id}`, {
      method: 'DELETE',
    });
  }

  async getCategories() {
    return this.request<{ success: boolean; data: Array<{ name: string; subcategories: string[] }> }>('/tools/meta/categories');
  }

  async getPopularTools(limit = 10) {
    return this.request<{ success: boolean; data: Tool[] }>(`/tools/meta/popular?limit=${limit}`);
  }

  // Orders API
  async createOrder(orderData: {
    items: Array<{ toolId: string; quantity: number; days: number }>;
    startDate: string;
    endDate: string;
    customerInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      company?: string;
    };
    deliveryInfo: {
      address: string;
      date?: string;
      timeSlot?: string;
      instructions?: string;
    };
    paymentMethod: string;
    notes?: string;
  }) {
    return this.request<{ success: boolean; data: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(params?: {
    status?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<{
      success: boolean;
      data: {
        orders: Order[];
        pagination: {
          current: number;
          total: number;
          count: number;
          totalItems: number;
        };
      };
    }>(`/orders?${searchParams}`);
  }

  async getOrder(id: string) {
    return this.request<{ success: boolean; data: Order }>(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string, note?: string) {
    return this.request<{ success: boolean; message: string }>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    });
  }

  async cancelOrder(id: string, reason?: string) {
    return this.request<{ success: boolean; message: string }>(`/orders/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async getOrderStatistics(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return this.request<{ success: boolean; data: any }>(`/orders/meta/statistics?${params}`);
  }

  // Reviews API
  async createReview(reviewData: {
    toolId: string;
    orderId?: string;
    rating: number;
    title?: string;
    comment: string;
    pros?: string[];
    cons?: string[];
    wouldRecommend?: boolean;
  }) {
    return this.request<{ success: boolean; data: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getToolReviews(toolId: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<{
      success: boolean;
      data: {
        reviews: Review[];
        rating: {
          rating: number;
          count: number;
          distribution: Record<string, number>;
        };
        pagination: {
          current: number;
          total: number;
          count: number;
          totalItems: number;
        };
      };
    }>(`/reviews/tool/${toolId}?${searchParams}`);
  }

  async getUserReviews() {
    return this.request<{ success: boolean; data: Review[] }>('/reviews/my');
  }

  async getAllReviews(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<{
      success: boolean;
      data: {
        reviews: Review[];
        pagination: {
          current: number;
          total: number;
          count: number;
          totalItems: number;
        };
      };
    }>(`/reviews?${searchParams}`);
  }

  async approveReview(id: string) {
    return this.request<{ success: boolean; message: string }>(`/reviews/${id}/approve`, {
      method: 'PUT',
    });
  }

  async rejectReview(id: string, reason?: string) {
    return this.request<{ success: boolean; message: string }>(`/reviews/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // Bookings API
  async createBooking(bookingData: {
    toolId: string;
    startDate: string;
    endDate: string;
    quantity: number;
    notes?: string;
  }) {
    return this.request<{ success: boolean; data: Booking }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getUserBookings(status?: string) {
    const params = status ? `?status=${status}` : '';
    return this.request<{ success: boolean; data: Booking[] }>(`/bookings/my${params}`);
  }

  async getAllBookings(params?: {
    status?: string;
    toolId?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<{
      success: boolean;
      data: {
        bookings: Booking[];
        pagination: {
          current: number;
          total: number;
          count: number;
          totalItems: number;
        };
      };
    }>(`/bookings?${searchParams}`);
  }

  async confirmBooking(id: string) {
    return this.request<{ success: boolean; message: string }>(`/bookings/${id}/confirm`, {
      method: 'PUT',
    });
  }

  async cancelBooking(id: string, reason?: string) {
    return this.request<{ success: boolean; message: string }>(`/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async checkToolAvailability(toolId: string, startDate: string, endDate: string, quantity = 1) {
    return this.request<{
      success: boolean;
      data: {
        totalStock: number;
        availableStock: number;
        bookedQuantity: number;
        isAvailable: boolean;
        canBook: boolean;
      };
    }>(`/tools/${toolId}/availability?startDate=${startDate}&endDate=${endDate}&quantity=${quantity}`);
  }
}

export const api = new ApiClient(API_BASE_URL);