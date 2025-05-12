import { divisionsApi } from '@/lib/api/divisions-api';
import { Member } from '@/types/member';
import { create } from 'zustand';
import { useUserStore } from './userStore';

interface Division {
  _id?: string;
  name: string;
  description?: string;
  members: Member[];
  slug: string;
  groups: string[];
  memberCount: number;
  groupMemberCounts: { [key: string]: number };
  groupMembers?: { [group: string]: Member[] };
  currentPage?: number;
  totalPages?: number;
  totalGroupMembers?: number;
}

interface DivisionsState {
  divisions: Division[];
  currentDivision: Division | null;
  members: Member[];
  totalMembers: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  showAddDivisionDialog: boolean;
  showAddGroupDialog: boolean;
  showAddMemberDialog: boolean;
  divisionSummaries: any[];
  setShowAddDivisionDialog: (show: boolean) => void;
  setShowAddGroupDialog: (show: boolean) => void;
  setShowAddMemberDialog: (show: boolean) => void;
  fetchDivisions: () => Promise<void>;
  fetchDivisionGroups: (divisionName: string) => Promise<void>;
  fetchGroupMembers: (
    division: string, 
    group: string, 
    query?: { 
      search?: string; 
      page?: number; 
      limit?: number; 
      attendance?: string;
      membershipStatus?: string;
      campusStatus?: string;
    }
  ) => Promise<void>;
  addDivision: (division: { divisionName: string }) => Promise<boolean>;
  updateDivision: (id: string, updates: Partial<Division>) => Promise<void>;
  deleteDivision: (id: string) => Promise<void>;
  addMemberToDivision: (division: string, member: Omit<Member, '_id'>) => Promise<void>;
  addMember: (division: string, group: string, member: { firstName: string; lastName: string; email: string; generatedPassword: string }) => Promise<void>;
  addGroup: (division: string, groupName: string) => Promise<void>;
  fetchDivisionSummaries: () => Promise<void>;
}

const useDivisionsStore = create<DivisionsState>((set, get) => ({
  divisions: [],
  currentDivision: null,
  members: [],
  totalMembers: 0,
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,
  showAddDivisionDialog: false,
  showAddGroupDialog: false,
  showAddMemberDialog: false,
  divisionSummaries: [],

  setShowAddDivisionDialog: (show) => set({ showAddDivisionDialog: show }),
  setShowAddGroupDialog: (show) => set({ showAddGroupDialog: show }),
  setShowAddMemberDialog: (show) => set({ showAddMemberDialog: show }),

  fetchDivisions: async () => {
    set({ loading: true, error: null });
    try {
      const divisions = await divisionsApi.getAllDivisions();
      console.log("Divisions from API:", divisions);
      set({ 
        divisions: Array.isArray(divisions) ? divisions.map((division: any) => ({
          name: division.name || division,
          slug: (division.name || division).toLowerCase().replace(/\s+/g, "-"),
          groups: division.groups || [],
          members: [],
          memberCount: division.memberCount || 0,
          groupMemberCounts: division.groupMemberCounts || {},
        })) : [],
        loading: false,
        error: null
      });
    } catch (error) {
      console.error("Failed to fetch divisions:", error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch divisions', 
        loading: false,
        divisions: []
      });
    }
  },

  fetchDivisionGroups: async (divisionName) => {
    set({ loading: true, error: null });
    try {
      const response = await divisionsApi.getDivisionGroups(divisionName);
      set((state) => ({
        currentDivision: {
          name: divisionName,
          slug: divisionName.toLowerCase().replace(/\s+/g, "-"),
          groups: response.groups || [],
          members: [],
          memberCount: response.totalMembers || 0,
          groupMemberCounts: response.groupMemberCounts || {},
        },
        loading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch division groups', loading: false });
    }
  },

  fetchGroupMembers: async (division, group, query) => {
    set({ loading: true, error: null });
    try {
      const response = await divisionsApi.getGroupMembers(division, group, {
        search: query?.search || '',
        page: query?.page || 1,
        limit: query?.limit || 10,
        attendance: query?.attendance || '',
        membershipStatus: query?.membershipStatus || '',
        campusStatus: query?.campusStatus || ''
      });

      console.log('[Store] Received group members response:', {
        groupMembers: response.groupMembers,
        totalGroupMembers: response.totalGroupMembers
      });

      set((state) => {
        // Create a new groupMembers map with the updated members for this group
        const groupMembersMap = { 
          ...(state.currentDivision?.groupMembers || {}),
          [group]: response.groupMembers 
        };

        // Update group member counts
        const groupMemberCounts = { 
          ...(state.currentDivision?.groupMemberCounts || {}),
          [group]: response.totalGroupMembers 
        };

        // Update the current division with new data
        const updatedDivision = state.currentDivision ? {
          ...state.currentDivision,
          groupMembers: groupMembersMap,
          groupMemberCounts,
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalGroupMembers: response.totalGroupMembers
        } : null;

        return {
          members: response.groupMembers || [],
          totalMembers: response.totalGroupMembers,
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          loading: false,
          currentDivision: updatedDivision,
        };
      });
    } catch (error) {
      console.error('[Store] Error fetching group members:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch group members', 
        loading: false 
      });
    }
  },

  addDivision: async (division: { divisionName: string }) => {
    set({ loading: true, error: null });
    try {
      const newDivisionName = await divisionsApi.createDivision(division);
      
      // Only update state if we get a successful response
      if (newDivisionName) {
        // Refetch divisions to get the latest data
        const divisions = await divisionsApi.getAllDivisions();
        set((state) => ({ 
          divisions: divisions.map((division: any) => ({
            name: division.name || division,
            slug: (division.name || division).toLowerCase().replace(/\s+/g, "-"),
            groups: division.groups || [],
            members: [],
            memberCount: division.memberCount || 0,
            groupMemberCounts: division.groupMemberCounts || {},
          })),
          loading: false,
          error: null
        }));
        return true; // Indicate success
      }
      throw new Error('Failed to create division');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add division';
      set({ error: errorMessage, loading: false });
      throw error; // Re-throw to be handled by the UI
    }
  },

  addGroup: async (division, groupName) => {
    set({ loading: true, error: null });
    try {
      const newGroupName = await divisionsApi.createGroup(division, groupName);
      set((state) => ({
        divisions: state.divisions.map((div) => 
          div.name === division ? {
            ...div,
            groups: [...div.groups, newGroupName],
            groupMemberCounts: {
              ...div.groupMemberCounts,
              [newGroupName]: 0
            }
          } : div
        ),
        currentDivision: state.currentDivision?.name === division ? {
          ...state.currentDivision,
          groups: [...state.currentDivision.groups, newGroupName],
          groupMemberCounts: {
            ...state.currentDivision.groupMemberCounts,
            [newGroupName]: 0
          }
        } : state.currentDivision,
        loading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add group', loading: false });
    }
  },

  addMember: async (division, group, member) => {
    set({ loading: true, error: null });
    try {
      const newMember = await divisionsApi.createMember(division, group, member);
      set((state) => ({
        divisions: state.divisions.map((div) => 
          div.name === division ? {
            ...div,
            memberCount: div.memberCount + 1,
            groupMemberCounts: {
              ...div.groupMemberCounts,
              [group]: (div.groupMemberCounts[group] || 0) + 1
            }
          } : div
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add member to group', loading: false });
    }
  },

  // These methods need to be implemented in the divisionsApi first
  updateDivision: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const token = useUserStore.getState().token;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/divisions/${id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update division');
      const updatedDivision = await response.json();
      set((state) => ({
        divisions: state.divisions.map((div) => 
          div._id === id ? {
            ...div,
            ...updatedDivision,
            slug: updatedDivision.name.toLowerCase().replace(/\s+/g, "-"),
          } : div
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update division', loading: false });
    }
  },

  deleteDivision: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = useUserStore.getState().token;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/divisions/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete division');
      set((state) => ({
        divisions: state.divisions.filter((div) => div._id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete division', loading: false });
    }
  },

  addMemberToDivision: async (division, member) => {
    set({ loading: true, error: null });
    try {
      const token = useUserStore.getState().token;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/divisions/${encodeURIComponent(division)}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(member),
      });

      if (!response.ok) {
        throw new Error('Failed to add member');
      }

      const newMember = await response.json();
      set((state) => ({
        divisions: state.divisions.map(d => {
          if (d._id === division) {
            const groupName = member.group || 'default';
            return {
              ...d,
              members: [...d.members, newMember],
              memberCount: d.memberCount + 1,
              groupMemberCounts: {
                ...d.groupMemberCounts,
                [groupName]: (d.groupMemberCounts[groupName] || 0) + 1
              }
            };
          }
          return d;
        }),
        loading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add member', loading: false });
    }
  },

  fetchDivisionSummaries: async () => {
    set({ loading: true, error: null });
    try {
      const summaries = await divisionsApi.getDivisionSummary();
      set({ divisionSummaries: summaries, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch division summaries', loading: false });
    }
  },
}));

export { useDivisionsStore };

