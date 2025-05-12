// This file contains the API client for managing divisions and groups.
import { useUserStore } from "@/stores/userStore";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

const getAuthStorage = () => {
  const rememberMe = localStorage.getItem('rememberMe') === 'true';
  return rememberMe ? localStorage : sessionStorage;
};

apiClient.interceptors.request.use(async (config) => {
  const storage = getAuthStorage();
  const token = storage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    const storage = getAuthStorage();
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await useUserStore.getState().refreshSession();
        const newToken = storage.getItem('token');
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        useUserStore.getState().logout();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

interface GroupMembersResponse {
  currentPage: number;
  totalPages: number;
  totalGroupMembers: number;
  groupMembers: any[];
}

export const divisionsApi = {
  getAllDivisions: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get("/divisions/allDivisions");
      console.log("API Response:", response.data);
      if (!response.data.divisions) {
        throw new Error("Invalid response format from server");
      }
      return response.data.divisions;
    } catch (error) {
      console.error("Division fetch error:", error);
      throw error;
    }
  },

  getDivisionGroups: async (divisionName: string): Promise<any> => {
    try {
      const response = await apiClient.get(
        `/divisions/getGroups/${encodeURIComponent(divisionName)}`
      );
      return {
        groups: response.data.groups || [],
        groupMemberCounts: response.data.groupMemberCounts || {},
        totalMembers: response.data.totalMembers || 0
      };
    } catch (error) {
      console.error("Groups fetch error:", error);
      return { groups: [], groupMemberCounts: {}, totalMembers: 0 };
    }
  },

  getGroupMembers: async (
    division: string,
    group: string,
    filters: { 
      search?: string; 
      page?: number; 
      limit?: number; 
      attendance?: string;
      membershipStatus?: string;
      campusStatus?: string;
    } = {}
  ): Promise<GroupMembersResponse> => {
    try {
      console.log(`[API] Starting request for members:`, {
        division,
        group,
        filters,
        url: `${API_BASE}/groups/getMembers`
      });

      const params = new URLSearchParams({
        division: division,
        group: group,
        search: filters.search || '',
        attendance: filters.attendance || '',
        membershipStatus: filters.membershipStatus || '',
        campusStatus: filters.campusStatus || '',
        page: filters.page?.toString() || '1',
        limit: filters.limit?.toString() || '10'
      });

      const response = await apiClient.get(`/groups/getMembers?${params.toString()}`);

      console.log(`[API] Full response data:`, {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      return {
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
        totalGroupMembers: response.data.totalGroupMembers || 0,
        groupMembers: response.data.groupMembers || []
      };
    } catch (error: any) {
      console.error(`[API] Error fetching members:`, {
        error: error?.message || 'Unknown error',
        status: error?.response?.status,
        data: error?.response?.data,
        division,
        group,
        filters
      });
      throw error;
    }
  },

  createDivision: async (payload: { divisionName: string }) => {
    try {
      console.log("Creating division with payload:", payload);
      const response = await apiClient.post("/divisions/createDivision", payload);
      console.log("Create division response:", response.data);
      
      // Only return success if we actually get a success response
      if (response.data.success === true) {
        return payload.divisionName;
      }
      
      // If we get here, something went wrong
      throw new Error(response.data.message || 'Failed to create division');
    } catch (error: any) {
      console.error("Create division error:", error.response?.data || error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Failed to create division');
    }
  },

  createGroup: async (divisionName: string, groupName: string) => {
    try {
      await apiClient.post("/groups/createGroup", {
        division: divisionName,
        group: groupName
      });
      return groupName;
    } catch (error) {
      console.error("Group creation error:", error);
      throw error;
    }
  },

  createMember: async (
    division: string,
    group: string,
    member: { firstName: string; lastName: string; email: string; generatedPassword: string }
  ) => {
    try {
      const response = await apiClient.post("/members/createMember", {
        division,
        group,
        email: member.email,
        generatedPassword: member.generatedPassword,
        firstName: member.firstName,
        lastName: member.lastName,
        role: "member"
      });
      return response.data;
    } catch (error) {
      console.error("Error creating member:", error);
      throw error;
    }
  },

  getDivisionSummary: async () => {
    const response = await apiClient.get("/divisions/divisionSummary");
    return response.data;
  },
};