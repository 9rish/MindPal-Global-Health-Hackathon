// src/services/apiService.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface JournalEntry {
  id: string;
  mood: string;
  wordCount: number;
  coinsEarned: number;
  date: string;
  content?: string;
  aiAnalysis?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  totalCoins: number;
  currentStreak: number;
  level: number;
  petData: {
    name: string;
    breed: string;
    happiness: number;
    health: number;
    items: string[];
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('mindpal_token');
};

// Helper function to make authenticated requests
const makeRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'An error occurred' };
    }

    return { data };
  } catch (error) {
    console.error('API Request failed:', error);
    return { error: 'Network error occurred' };
  }
};

// Auth API calls
export const authAPI = {
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    petName?: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> => {
    return makeRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: {
    username: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> => {
    return makeRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    return makeRequest('/users/profile');
  },

  getLeaderboard: async (type: 'coins' | 'streak' = 'coins', limit: number = 10): Promise<ApiResponse<{
    type: string;
    leaderboard: Array<{
      rank: number;
      username: string;
      petName: string;
      totalCoins: number;
      currentStreak: number;
      level: number;
    }>;
  }>> => {
    return makeRequest(`/users/leaderboard?type=${type}&limit=${limit}`);
  }
};

// Journal API calls
export const journalAPI = {
  createEntry: async (entryData: {
    content: string;
    mood: string;
    confidence?: number;
    aiAnalysis?: string;
  }): Promise<ApiResponse<{
    message: string;
    entry: JournalEntry;
    userStats: {
      totalCoins: number;
      currentStreak: number;
      level: number;
      petHappiness: number;
      leveledUp: boolean;
    };
  }>> => {
    return makeRequest('/journal/entry', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  },

  getEntries: async (page: number = 1, limit: number = 10): Promise<ApiResponse<{
    entries: JournalEntry[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalEntries: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> => {
    return makeRequest(`/journal/entries?page=${page}&limit=${limit}`);
  },

  getEntry: async (id: string): Promise<ApiResponse<{ entry: JournalEntry & { content: string } }>> => {
    return makeRequest(`/journal/entry/${id}`);
  },

  getStats: async (): Promise<ApiResponse<{
    totalEntries: number;
    entriesThisMonth: number;
    moodDistribution: Array<{ _id: string; count: number }>;
    recentMoodTrend: Array<{ mood: string; date: string }>;
  }>> => {
    return makeRequest('/journal/stats');
  }
};

// Token management
export const tokenManager = {
  saveToken: (token: string): void => {
    localStorage.setItem('mindpal_token', token);
  },

  removeToken: (): void => {
    localStorage.removeItem('mindpal_token');
  },

  getToken: (): string | null => {
    return getAuthToken();
  },

  isAuthenticated: (): boolean => {
    const token = getAuthToken();
    if (!token) return false;

    try {
      // Basic token validation (check if it's expired)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};

// User management
export const userManager = {
  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem('mindpal_user');
    return userData ? JSON.parse(userData) : null;
  },

  saveUser: (user: User): void => {
    localStorage.setItem('mindpal_user', JSON.stringify(user));
  },

  removeUser: (): void => {
    localStorage.removeItem('mindpal_user');
  },

  logout: (): void => {
    tokenManager.removeToken();
    userManager.removeUser();
  }
};