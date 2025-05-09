import { useUserStore } from "@/stores/userStore";
import { Head, Role, Rule } from "@/types/admin";
import { Member } from "@/types/member";
import axios from "axios";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface ClubRules {
  _id: string;
  fireAfter: number;
  maxAbsences: number;
  suspendAfter: number;
  warningAfter: number;
  updatedAt: string;
  __v: number;
}

interface AdminState {
  members: Member[];
  roles: Role[];
  rules: Rule[];
  divisions: string[];
  loading: boolean;
  error: string | null;
  heads: Head[];
  updateHead: (id: string, updates: Partial<Head>) => Promise<void>;
  updateRole: (id: string, updates: Partial<Role>) => Promise<void>;
  getActiveMembers: () => Member[];

  // Actions
  fetchHeads: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  fetchRules: () => Promise<void>;
  updateRule: (id: string, value: number) => Promise<void>;
  addHead: (head: Omit<Head, "id">) => Promise<void>;
  addRole: (role: Omit<Role, "id">) => Promise<void>;
  banMember: (id: string) => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 403) {
      window.location.href = `/unauthorized?message=${encodeURIComponent(error.response.data?.message || 'You do not have permission to access this resource')}`;
      return;
    }
    if (error.response?.status === 401) {
      window.location.href = `/auth/login?from=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
  }
  throw error;
};

export const useAdminStore = create<AdminState>()(
  devtools(
    persist(
      (set, get) => {
        const { getAuthHeader, refreshSession } = useUserStore.getState();

        const getAuthHeaders = async () => {
          let headers = getAuthHeader();
          if (!headers) {
            await refreshSession();
            headers = getAuthHeader();
            if (!headers) {
              window.location.href = `/auth/login?from=${encodeURIComponent(window.location.pathname)}`;
              throw new Error("Authentication failed");
            }
          }
          return headers;
        };

        return {
          members: [],
          heads: [],
          roles: [],
          rules: [
            { id: "1", name: "New Absences", description: "Head must approve this for request for review", value: 1 },
            { id: "2", name: "Warning After", description: "Send warning notification after this many absences", value: 3 },
            { id: "3", name: "Suspend After", description: "Suspend member automatically", value: 5 },
            { id: "4", name: "Fire After", description: "Remove member from the team after this many absences", value: 7 },
          ],
          divisions: ["CPO", "Development", "Cyber", "Data Science", "Design", "Marketing", "HR"],
          loading: false,
          error: null,

          fetchHeads: async () => {
            set({ loading: true, error: null });
            try {
              const headers = await getAuthHeaders();
              const response = await axios.get(`${API_BASE_URL}/members/heads`, { headers });
              
              const processedHeads = response.data.heads.map((head: any) => ({
                id: head._id,
                name: `${head.firstName} ${head.lastName}`,
                division: head.division || "Unknown Division",
                role: head.clubRole || "Unknown Role",
                email: head.email,
                avatar: head.profilePicture,
                permissions: head.permissions || [],
                permissionStatus: head.permissionStatus || "inactive",
              }));

              set({ heads: processedHeads, loading: false });
            } catch (error: any) {
              handleApiError(error);
              set({
                error: error.message || "Failed to fetch heads",
                loading: false,
                heads: []
              });
            }
          },

          fetchRoles: async () => {
            set({ loading: true, error: null });
            try {
              const headers = await getAuthHeaders();
              const response = await axios.get(`${API_BASE_URL}/admin/permissions`, { headers });
              set({ roles: response.data, loading: false });
            } catch (error: any) {
              handleApiError(error);
              set({
                error: error.message || "Failed to fetch roles",
                loading: false,
                roles: []
              });
            }
          },

          fetchRules: async () => {
            set({ loading: true, error: null });
            try {
              const headers = await getAuthHeaders();
              const response = await axios.get(`${API_BASE_URL}/rules`, { headers });
              set({ rules: response.data, loading: false });
            } catch (error: any) {
              handleApiError(error);
              set({
                error: error.message || "Failed to fetch rules",
                loading: false,
                rules: []
              });
            }
          },

          updateRule: async (id: string, value: number) => {
            try {
              const headers = await getAuthHeaders();
              await axios.patch(`${API_BASE_URL}/rules/${id}`, { value }, { headers });
              set(state => ({
                rules: state.rules.map(rule => 
                  rule.id === id ? { ...rule, value } : rule
                )
              }));
            } catch (error: any) {
              handleApiError(error);
              throw new Error(error.message || "Failed to update rule");
            }
          },

          addHead: async (headData: Omit<Head, "id">) => {
            try {
              const headers = await getAuthHeaders();
              const response = await axios.post(`${API_BASE_URL}/admin/heads`, headData, { headers });
              return response.data;
            } catch (error: any) {
              handleApiError(error);
              console.error('Add head error:', error);
              throw error;
            }
          },

          addRole: async (role: Omit<Role, "id">) => {
            set({ loading: true, error: null });
            try {
              const headers = await getAuthHeaders();
              const response = await axios.post(`${API_BASE_URL}/admin/permissions`, role, { headers });
              
              set(state => ({
                roles: [...state.roles, {
                  ...role,
                  id: response.data._id
                }],
                loading: false
              }));
            } catch (error: any) {
              handleApiError(error);
              set({
                error: error.message || "Failed to add role",
                loading: false
              });
            }
          },

          banMember: async (id: string) => {
            try {
              const headers = await getAuthHeaders();
              await axios.post(`${API_BASE_URL}/admin/ban`, { id }, { headers });
            } catch (error: any) {
              handleApiError(error);
              throw new Error(error.message || "Failed to ban member");
            }
          },

          updateHead: async (id: string, updates: Partial<Head>) => {
            try {
              const headers = await getAuthHeaders();
              await axios.patch(`${API_BASE_URL}/admin/heads/${id}`, updates, { headers });
              set(state => ({
                heads: state.heads.map(head => 
                  head.id === id ? { ...head, ...updates } : head
                )
              }));
            } catch (error: any) {
              handleApiError(error);
              throw new Error(error.message || "Failed to update head");
            }
          },

          updateRole: async (id: string, updates: Partial<Role>) => {
            try {
              const headers = await getAuthHeaders();
              await axios.patch(`${API_BASE_URL}/admin/permissions/${id}`, updates, { headers });
              set(state => ({
                roles: state.roles.map(role => 
                  role.id === id ? { ...role, ...updates } : role
                )
              }));
            } catch (error: any) {
              handleApiError(error);
              throw new Error(error.message || "Failed to update role");
            }
          },

          getActiveMembers: () => {
            return get().members.filter(member => member.status === "active");
          },
        };
      },
      {
        name: "admin-store",
      }
    )
  )
);