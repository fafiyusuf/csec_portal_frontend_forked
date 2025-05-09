import { Member } from '@/types/member';
import { UserRole } from '@/utils/roles';
import axios from 'axios';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type Division = 'CPD' | 'Dev' | 'CBD' | 'SEC' | 'DS';

interface User {
  _id: string;
  email: string;
  member: Member;
}

interface UserStore {
  user: User | null;
  refreshToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  token: string | null;
  isAuthenticated: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateLastSeen: () => Promise<void>;

  fetchUserById: (id: string) => Promise<User>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;

  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasDivisionAccess: (division: Division) => boolean;
  isPresident: () => boolean;
  isDivisionHead: () => boolean;

  getAuthHeader: () => { Authorization: string } | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

const isPresidentRole = (role: UserRole) =>
  role === 'President' || role === 'Vice President';

const isDivisionHeadRole = (role: UserRole) =>
  role.includes('President') && !isPresidentRole(role);

const getDivisionFromRole = (role: UserRole): Division | null => {
  if (role.includes('CPD')) return 'CPD';
  if (role.includes('Dev')) return 'Dev';
  if (role.includes('CBD')) return 'CBD';
  if (role.includes('SEC')) return 'SEC';
  if (role.includes('DS')) return 'DS';
  return null;
};

const parseJwt = (token: string | null) => {
  if (!token) return null;
  try {
    const base64Payload = token.split('.')[1];
    return JSON.parse(atob(base64Payload));
  } catch {
    return null;
  }
};

const updateLastSeen = async (user: User | null, token: string | null, set: any) => {
  if (!user || !token) return;

  try {
    const response = await axios.patch(
      `${BASE_URL}/api/members/lastSeen`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.data) {
      throw new Error('Failed to update last seen');
    }

    set((state: UserStore) => ({
      user: {
        ...state.user!,
        member: {
          ...state.user!.member,
          lastSeen: response.data.lastSeen
        }
      }
    }));
  } catch (error) {
    console.error('Failed to update last seen:', error);
    // Don't throw the error, just log it to avoid breaking the app
  }
};

const handleApiError = (error: any, pathname?: string) => {
  if (error?.response?.status === 403) {
    // Use window.location for hard redirect to unauthorized page
    window.location.href = `/unauthorized?message=You do not have permission to access this resource`;
    return null;
  }
  throw error;
};

const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      refreshToken: null,
      isLoading: false,
      isInitialized: false,
      error: null,
      token: null,
      isAuthenticated: false,

      initialize: async () => {
        if (get().isInitialized) return;

        set({ isLoading: true });
        try {
          // Try to get token from storage
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
          const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

          if (token && refreshToken && storedUser) {
            try {
              // Parse stored user data
              const user = JSON.parse(storedUser);
              
              // Validate user data structure
              if (!user.member?.clubRole) {
                throw new Error('Invalid stored user data');
              }

              // Set initial state with stored data
              set({
                token,
                refreshToken,
                user,
                isInitialized: true,
                isAuthenticated: true
              });

              // Try to refresh user data from server
              try {
                const response = await fetch(`${BASE_URL}/members/me`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });

                if (response.ok) {
                  const data = await response.json();
                  if (data.member?.clubRole) {
                    set({ user: data });
                  }
                }
              } catch (error) {
                console.warn('Failed to refresh user data:', error);
                // Continue with stored data
              }
            } catch (error) {
              console.error('Failed to parse stored user data:', error);
              // Clear invalid data
              localStorage.removeItem('user');
              sessionStorage.removeItem('user');
              set({ isInitialized: true });
            }
          } else {
            set({ isInitialized: true });
          }
        } catch (error) {
          console.error('Initialization error:', error);
          set({ error: 'Failed to initialize session' });
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (email: string, password: string, rememberMe: boolean) => {
        try {
          // First, attempt login to get tokens
          const loginResponse = await fetch(`${BASE_URL}/members/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const loginData = await loginResponse.json();
          console.log('Login response:', loginData);

          if (!loginResponse.ok) {
            throw new Error(loginData.message || 'Login failed');
          }

          // Get tokens from login response
          const token = loginData.token;
          const refreshToken = loginData.refreshToken;

          if (!token || !refreshToken) {
            throw new Error('Missing token in response');
          }

          // Get user ID from token
          const tokenPayload = parseJwt(token);
          if (!tokenPayload?.id) {
            throw new Error('Invalid token: missing user ID');
          }

          // Fetch user data using the ID
          const userResponse = await fetch(`${BASE_URL}/members/${tokenPayload.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
          }

          const userData = await userResponse.json();
          console.log('User data:', userData);

          // Validate user data
          if (!userData.member?.clubRole) {
            throw new Error('Invalid user data: missing club role');
          }

          // Store rememberMe preference
          localStorage.setItem('rememberMe', rememberMe.toString());

          // Store tokens in appropriate storage
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('token', token);
          storage.setItem('refreshToken', refreshToken);
          storage.setItem('userRole', userData.member.clubRole);
          storage.setItem('user', JSON.stringify(userData));

          // Set cookies with appropriate expiration and secure flags
          const cookieOptions = rememberMe ? 
            { expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } : // 30 days
            { expires: new Date(Date.now() + 24 * 60 * 60 * 1000) }; // 1 day
          
          const cookieAttributes = [
            `path=/`,
            `expires=${cookieOptions.expires.toUTCString()}`,
            process.env.NODE_ENV === 'production' ? 'secure' : '',
            process.env.NODE_ENV === 'production' ? 'SameSite=Strict' : ''
          ].filter(Boolean).join('; ');

          document.cookie = `token=${token}; ${cookieAttributes}`;
          document.cookie = `refreshToken=${refreshToken}; ${cookieAttributes}`;

          set({
            token,
            refreshToken,
            user: userData,
            isAuthenticated: true,
            error: null,
          });

          return true;
        } catch (error) {
          console.error('Login error:', error);
          set({ error: error instanceof Error ? error.message : 'Login failed' });
          return false;
        }
      },

      logout: () => {
        // Clear all storage
        ['localStorage', 'sessionStorage'].forEach(storageType => {
          const storage = window[storageType as 'localStorage' | 'sessionStorage'];
          storage.removeItem('token');
          storage.removeItem('refreshToken');
          storage.removeItem('userRole');
          storage.removeItem('user');
        });

        // Clear cookies
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshSession: async () => {
        const { refreshToken } = get();
        const storage = localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
        
        try {
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await fetch(`${BASE_URL}/members/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshToken}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to refresh session');
          }

          const data = await response.json();
          if (!data.token || !data.refreshToken) {
            throw new Error('Invalid refresh response');
          }

          // Store new tokens in the appropriate storage
          storage.setItem('token', data.token);
          storage.setItem('refreshToken', data.refreshToken);

          // Update store state
          set({
            token: data.token,
            refreshToken: data.refreshToken,
            isAuthenticated: true
          });

          return data;
        } catch (error) {
          console.error('Session refresh failed:', error);
          // Only logout if it's not a network error
          if (error instanceof Error && !error.message.includes('network')) {
            get().logout();
          }
          throw error;
        }
      },

      updateLastSeen: async () => {
        const { user, token } = get();
        if (!user || !token) {
          console.warn('Cannot update last seen: user or token is missing');
          return;
        }
        await updateLastSeen(user, token, set);
      },

      fetchUserById: async (id) => {
        try {
          const { token } = get();
          if (!token) throw new Error('Not authenticated');

          const response = await fetch(`${BASE_URL}/members/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (response.status === 403) {
            window.location.href = `/unauthorized?message=You do not have permission to access this resource`;
            return null;
          }

          if (response.status === 401) {
            await get().refreshSession();
            return get().fetchUserById(id);
          }

          if (!response.ok) {
            throw new Error(`User fetch failed: ${response.status}`);
          }

          const user = await response.json();
          set({ user });
          return user;
        } catch (error) {
          return handleApiError(error);
        }
      },

      updateUserProfile: async (updates) => {
        const { user, token } = get();
        if (!user || !token) throw new Error('Not authenticated');

        try {
          const response = await fetch(`${BASE_URL}/members/${user.member._id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });

          if (response.status === 403) {
            window.location.href = `/unauthorized?message=You do not have permission to update this profile`;
            return null;
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to update profile: ${response.status} ${response.statusText}`);
          }

          const updatedUser = await response.json();
          if (!updatedUser || !updatedUser.member) {
            throw new Error('Invalid response format from server');
          }

          set({ user: updatedUser });
          
          const storage = localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
          storage.setItem('user', JSON.stringify(updatedUser));

          return updatedUser;
        } catch (error) {
          return handleApiError(error);
        }
      },

      hasRole: (role: UserRole) => {
        const { user } = get();
        if (!user?.member?.clubRole) return false;
        return user.member.clubRole === role;
      },

      hasAnyRole: (roles: UserRole[]) => {
        const { user } = get();
        if (!user?.member?.clubRole) return false;
        return roles.includes(user.member.clubRole);
      },

      hasDivisionAccess: (division: Division) => {
        const { user } = get();
        if (!user?.member?.clubRole) return false;
        
        // Presidents and Vice Presidents have access to all divisions
        if (isPresidentRole(user.member.clubRole)) return true;
        
        // Division heads have access to their own division
        const userDivision = getDivisionFromRole(user.member.clubRole);
        return userDivision === division;
      },

      isPresident: () => {
        const { user } = get();
        if (!user?.member?.clubRole) return false;
        return isPresidentRole(user.member.clubRole);
      },

      isDivisionHead: () => {
        const { user } = get();
        if (!user?.member?.clubRole) return false;
        return isDivisionHeadRole(user.member.clubRole);
      },

      getAuthHeader: () => {
        const { token } = get();
        return token ? { Authorization: `Bearer ${token}` } : null;
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          const rememberMe = localStorage.getItem('rememberMe') === 'true';
          return rememberMe ? localStorage : sessionStorage;
        }
        return localStorage;
      }),
    }
  )
);

// Set up periodic last seen updates
if (typeof window !== 'undefined') {
  setInterval(() => {
    const { isAuthenticated, updateLastSeen } = useUserStore.getState();
    if (isAuthenticated) {
      updateLastSeen();
    }
  }, 60000); // Update every minute
}

export { useUserStore };
export type { Division, UserRole };

