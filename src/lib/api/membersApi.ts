// membersApi.ts
import { useUserStore } from '@/stores/userStore';
import { Member } from '@/types/member';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

// Helper to safely access localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Helper to get current storage
const getAuthStorage = () => {
  if (typeof window === 'undefined') return null;
  const rememberMe = localStorage.getItem('rememberMe') === 'true';
  const storage = rememberMe ? localStorage : sessionStorage;
  
  // Verify storage has required items
  const hasToken = storage.getItem('token');
  const hasRefreshToken = storage.getItem('refreshToken');
  
  if (!hasToken || !hasRefreshToken) {
    // If items are missing, try the other storage
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    if (otherStorage.getItem('token') && otherStorage.getItem('refreshToken')) {
      return otherStorage;
    }
  }
  
  return storage;
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(async (config) => {
  const storage = getAuthStorage();
  const token = storage?.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    const storage = getAuthStorage();
    
    // Handle 401 errors and avoid infinite retries
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh token using user store
        await useUserStore.getState().refreshSession();
        
        // Update request with new token
        const newToken = storage?.getItem('token');
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout user
        useUserStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

interface FetchMembersOptions {
  search?: string;
  division?: string;
  group?: string;
  campusStatus?: string;
  attendance?: string;
  membershipStatus?: string;
  divisionRole?: string;
  page?: number;
  limit?: number;
}

export const membersApi = {
  // Fetch members with optional filters
  fetchMembers: async (options: FetchMembersOptions = {}): Promise<{
    members: Member[];
    totalMembers: number;
    totalPages: number;
  }> => {
    try {
      const queryString = new URLSearchParams(
        Object.entries(options)
          .filter(([_, value]) => value !== undefined && value !== '')
          .map(([key, value]) => [key, String(value)])
      ).toString();

      const response = await apiClient.get(`/members?${queryString}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to load members');
      }
      throw new Error('Failed to load members');
    }
  },

  // Fetch heads
  fetchHeads: async (): Promise<Member[]> => {
    try {
      const response = await apiClient.get('/members/heads');
      const validRoles = [
        'Vice President',
        'Competitive Programming Division President',
        'Development Division President',
        'Capacity Building Division President',
        'Cybersecurity Division President',
        'Data Science Division President'
      ];
      return response.data.members.filter((member: Member) =>
        member.clubRole && validRoles.includes(member.clubRole)
      );
    } catch (error) {
      throw new Error(axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to load heads'
        : 'Failed to load heads');
    }
  },

  // Add member
  addMember: async (newMember: Omit<Member, '_id' | 'createdAt'>): Promise<Member> => {
    try {
      const response = await apiClient.post('/members/createMember', newMember);
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to add member'
        : 'Failed to add member');
    }
  },

  // Update member
  updateMember: async (id: string, updates: Partial<Member>): Promise<Member> => {
    try {
      const response = await apiClient.put(`/members/${id}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to update member'
        : 'Failed to update member');
    }
  },

  // Delete member
  deleteMember: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/members/${id}`);
    } catch (error) {
      throw new Error(axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to delete member'
        : 'Failed to delete member');
    }
  }
};