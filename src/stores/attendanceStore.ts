import {
    fetchAllSessions as apiFetchAllSessions,
    fetchMemberAttendanceRecords as apiFetchMemberAttendance,
    fetchMemberAttendanceRecords as apiFetchMemberAttendanceRecords,
    fetchSessionData as apiFetchSessionData,
    submitAttendance as apiSubmitAttendance,
    fetchSessionAttendance as apiFetchSessionAttendance
} from "@/lib/api/attendanceApi";
import type { Member, MemberAttendanceRecords, Session } from "@/types/attendance";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { toast } from '@/components/ui/use-toast';
import { canManageDivision } from '@/lib/divisionPermissions';
import { UserRole } from '@/utils/roles';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type AttendanceRecord = {
  id: string;
  memberId: string;
  memberName: string;
  division: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
};

interface AttendanceState {
  currentSession: Session | null;
  members: Member[];
  selectedMember: string | null;
  memberSummary: MemberAttendanceRecords | null;
  memberAttendanceRecords: MemberAttendanceRecords | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  sessions: Session[];
  totalSessions: number;
  currentPage: number;
  itemsPerPage: number;
  attendanceTakenSessions: string[];
  sessionAttendance: Record<string, any> | null;

  // Actions
  fetchSessions: (page?: number, limit?: number) => Promise<void>;
  setPagination: (page: number, limit: number) => void;
  fetchSessionMembers: (sessionId: string) => Promise<void>;
  fetchMemberSummary: (memberId: string) => Promise<void>;
  fetchMemberAttendanceRecords: (memberId: string) => Promise<void>;
  updateMemberAttendance: (memberId: string, status: "Present" | "Absent" | "Excused") => void;
  updateMemberExcused: (memberId: string, excused: boolean) => void;
  addHeadsUpNote: (memberId: string, note: string) => void;
  saveAttendance: (sessionId: string) => Promise<{ status: string; error?: string }>;
  setSelectedMember: (memberId: string | null) => void;
  clearError: () => void;
  clearSuccess: () => void;
  fetchSessionAttendance: (sessionId: string) => Promise<void>;
  setAttendanceTakenSessions: (callback: (prev: string[]) => string[]) => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  devtools(
    persist(
      (set, get) => ({
        currentSession: null,
        members: [],
        selectedMember: null,
        memberSummary: null,
        memberAttendanceRecords: null,
        isLoading: false,
        error: null,
        success: null,
        sessions: [],
        totalSessions: 0,
        currentPage: 1,
        itemsPerPage: 4,
        attendanceTakenSessions: [],
        sessionAttendance: null,

        fetchSessions: async (page = get().currentPage, limit = get().itemsPerPage) => {
          set({ isLoading: true, error: null });
          try {
            const { sessions, totalSessions } = await apiFetchAllSessions(page, limit);
            set({ sessions, totalSessions, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Failed to fetch sessions",
              isLoading: false,
            });
          }
        },

        setPagination: (page, limit) => {
          set({ currentPage: page, itemsPerPage: limit });
        },

        fetchSessionMembers: async (sessionId) => {
          set({ isLoading: true, error: null });
          try {
            const { session, members } = await apiFetchSessionData(sessionId);
            const mappedMembers = members.map((member) => ({
              ...member,
              attendance: null,
              excused: false,
            }));
            set({
              currentSession: session,
              members: mappedMembers,
              isLoading: false,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Failed to fetch session data",
              isLoading: false,
            });
          }
        },

        fetchMemberSummary: async (memberId) => {
          set({ isLoading: true, error: null });
          try {
            const summary = await apiFetchMemberAttendance(memberId);
            set({ memberSummary: summary, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Failed to fetch member summary",
              isLoading: false,
            });
          }
        },

        fetchMemberAttendanceRecords: async (memberId) => {
          set({ isLoading: true, error: null });
          try {
            const data = await apiFetchMemberAttendanceRecords(memberId);
            set({ memberAttendanceRecords: data, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Failed to fetch member records",
              isLoading: false,
            });
          }
        },

        updateMemberAttendance: (memberId, status) => {
          set((state) => ({
            members: state.members.map((member) =>
              member._id === memberId ? { ...member, attendance: status } : member
            ),
          }));
        },

        updateMemberExcused: (memberId, excused) => {
          set((state) => ({
            members: state.members.map((member) =>
              member._id === memberId ? { ...member, excused } : member
            ),
          }));
        },

        addHeadsUpNote: (memberId, note) => {
          set((state) => ({
            members: state.members.map((member) =>
              member._id === memberId ? { ...member, headsUpNote: note } : member
            ),
          }));
        },

        saveAttendance: async (sessionId) => {
          set({ isLoading: true, error: null });
          try {
            const { members } = get();
            const payload = {
              sessionId,
              records: members.map(member => ({
                memberId: member._id,
                status: member.attendance || "Absent",
                excused: member.excused || false,
                ...(member.headsUpNote && { headsUp: member.headsUpNote })
              }))
            };
            await apiSubmitAttendance(payload);
            set(state => ({
              attendanceTakenSessions: [...state.attendanceTakenSessions, sessionId],
              isLoading: false,
              success: "Attendance saved successfully!"
            }));
            return { status: "success" };
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Failed to save attendance",
              isLoading: false,
            });
            return { 
              status: "error", 
              error: error instanceof Error ? error.message : "Failed to save attendance" 
            };
          }
        },

        setSelectedMember: (memberId) => {
          set({ selectedMember: memberId });
        },

        clearError: () => {
          set({ error: null });
        },

        clearSuccess: () => {
          set({ success: null });
        },

        fetchSessionAttendance: async (sessionId) => {
          set({ isLoading: true, error: null });
          try {
            const attendance = await apiFetchSessionAttendance(sessionId);
            set({ sessionAttendance: attendance, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Failed to fetch session attendance",
              isLoading: false,
            });
          }
        },

        setAttendanceTakenSessions: (callback) => {
          set((state) => ({
            attendanceTakenSessions: callback(state.attendanceTakenSessions)
          }));
        },
      }),
      {
        name: "attendance-storage",
      }
    )
  )
); 