import { membersApi } from '@/lib/api/membersApi';
import { Member } from '@/types/member';
import {
    canAddMembers,
    canDeleteMembers,
    isPresident
} from '@/utils/roles';
import { create } from 'zustand';
import { useUserStore } from './userStore';

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

interface MembersState {
  members: Member[];
  heads: Member[];
  loading: boolean;
  error: string | null;
  totalMembers: number;
  currentPage: number;
  totalPages: number;
  fetchMembers: (options?: FetchMembersOptions) => Promise<void>;
  fetchHeads: () => Promise<void>;
  addMember: (member: Omit<Member, '_id' | 'createdAt'>) => Promise<Member>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  canAddMember: () => boolean;
  canEditMember: (targetDivision?: string) => boolean;
  canDeleteMember: () => boolean;
  deleteHead: (id: string) => Promise<void>;
  resetError: () => void;
}

const useMembersStore = create<MembersState>((set, get) => ({
  members: [],
  heads: [],
  loading: false,
  error: null,
  totalMembers: 0,
  currentPage: 1,
  totalPages: 1,

  // Permission checks
  canAddMember: () => {
    const { user } = useUserStore.getState();
    return user?.member?.clubRole ? canAddMembers(user.member.clubRole) : false;
  },
  
  canEditMember: (targetDivision?: string) => {
    const { user } = useUserStore.getState();
    if (!user?.member?.clubRole) return false;
    return isPresident(user.member.clubRole) || 
           (user.member.division === targetDivision && user.member.clubRole.includes('President'));
  },
  
  canDeleteMember: () => {
    const { user } = useUserStore.getState();
    return user?.member?.clubRole ? canDeleteMembers(user.member.clubRole) : false;
  },

  // In your members store
fetchMembers: async (options: FetchMembersOptions = {}) => {
  set({ loading: true, error: null });
  try {
    const data = await membersApi.fetchMembers(options);
    console.log(data,'data')
    
    // Handle API response structure correctly
    set({
      members: data.members || [], // Fixed property name
      totalMembers: data.totalMembers,
      currentPage: options.page || 1,
      totalPages: data.totalPages || Math.ceil(data.totalMembers / (options.limit || 10)),
      loading: false
    });
  } catch (err) {
    set({
      error: err instanceof Error ? err.message : 'Failed to load members',
      loading: false
    });
    throw err;
  }
},

  fetchHeads: async () => {
    set({ loading: true, error: null });
    try {
      const heads = await membersApi.fetchHeads();
      set({ heads, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load heads',
        loading: false
      });
      throw err;
    }
  },

  addMember: async (newMember: Omit<Member, "createdAt" | "_id">): Promise<Member> => {
    const { user } = useUserStore.getState();
    if (!user || !get().canAddMember()) {
      throw new Error('Unauthorized: You do not have permission to add members');
    }

    set({ loading: true });
    try {
      const addedMember = await membersApi.addMember(newMember);
      set((state) => ({
        members: [...state.members, addedMember],
        heads: addedMember.clubRole && 
          (isPresident(addedMember.clubRole) || 
           (typeof addedMember.clubRole === 'string' && addedMember.clubRole.includes('President')))
          ? [...state.heads, addedMember]
          : state.heads,
        loading: false
      }));
      return addedMember;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to add member';
      set({ error, loading: false });
      throw error;
    }
  },

  updateMember: async (id, updates) => {
    const { user } = useUserStore.getState();
    const memberToUpdate = get().members.find(m => m._id === id);

    if (!user || !memberToUpdate || !get().canEditMember(memberToUpdate.division)) {
      throw new Error('Unauthorized: You do not have permission to edit this member');
    }

    set({ loading: true });
    try {
      const updatedMember = await membersApi.updateMember(id, updates);
      set((state) => ({
        members: state.members.map(member =>
          member._id === id ? { ...member, ...updatedMember } : member
        ),
        heads: state.heads.map(head =>
          head._id === id ? { ...head, ...updatedMember } : head
        ),
        loading: false
      }));
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update member';
      set({ error, loading: false });
      throw error;
    }
  },

  deleteMember: async (id) => {
    const { user } = useUserStore.getState();
    if (!user || !get().canDeleteMember()) {
      throw new Error('Unauthorized: Only presidents can delete members');
    }

    set({ loading: true });
    try {
      await membersApi.deleteMember(id);
      set((state) => ({
        members: state.members.filter(member => member._id !== id),
        heads: state.heads.filter(head => head._id !== id),
        loading: false
      }));
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete member';
      set({ error, loading: false });
      throw error;
    }
  },

  deleteHead: async (id) => {
    const { user } = useUserStore.getState();
    if (!user) throw new Error('Not authenticated');

    set({ loading: true });
    try {
      await membersApi.deleteMember(id);
      set((state) => ({
        heads: state.heads.filter(head => head._id !== id),
        members: state.members.filter(member => member._id !== id),
        loading: false
      }));
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete head';
      set({ error, loading: false });
      throw error;
    }
  },

  resetError: () => set({ error: null })
}));

export default useMembersStore;
