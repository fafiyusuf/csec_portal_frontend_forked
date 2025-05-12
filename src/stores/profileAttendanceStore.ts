// stores/attendanceStore.ts
import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parse, format } from 'date-fns';

type RecordItem = {
  _id: string;
  date: string;
  status: 'Present' | 'Absent' | 'Excused';
  sessionTitle?: string;
  eventTitle?: string;
  startTime?: string;
  endTime?: string;
  headsUp?: string;
  type: 'session' | 'event';
  visibility?: 'public' | 'members';
  attendance?: 'Optional' | 'Mandatory';
  division?: string;
  groups?: string[];
};

type AttendanceState = {
  records: RecordItem[];
  loading: boolean;
  error: string | null;
  attendanceTaken: Set<string>;
  fetchRecords: (memberId: string) => Promise<void>;
  markAttendanceTaken: (id: string) => void;
  clearAttendanceTaken: (id: string) => void;
  clearAllAttendance: () => void;
  getAttendanceStatus: (id: string) => 'Present' | 'Absent' | 'Excused';
};

// Helper function to parse various date formats
const parseDate = (dateStr: string): Date | null => {
  const formats = ['yyyy-MM-dd', 'yy/MM/dd', 'yyyy/MM/dd', 'dd/MM/yy'];
  
  for (const fmt of formats) {
    try {
      const parsed = parse(dateStr, fmt, new Date());
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch {
      continue;
    }
  }
  return null;
};

// Helper function to format date consistently
const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const useProfileAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      records: [],
      loading: false,
      error: null,
      attendanceTaken: new Set<string>(),

      fetchRecords: async (memberId: string) => {
        set({ loading: true, error: null });
        try {
          // Fetch session attendance records
          const sessionRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE}/attendance/member/${memberId}`,
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }
          );

          // Fetch all events with pagination
          let allEvents: any[] = [];
          let currentPage = 1;
          let hasMorePages = true;

          while (hasMorePages) {
            const eventsRes = await axios.get(
              `${process.env.NEXT_PUBLIC_API_BASE}/events?page=${currentPage}&limit=10`,
              {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              }
            );

            const { events, totalPages } = eventsRes.data;
            allEvents = [...allEvents, ...events];
            
            if (currentPage >= totalPages) {
              hasMorePages = false;
            } else {
              currentPage++;
            }
          }

          // Map session records
          const sessionRecords = (sessionRes.data?.overall?.records || []).map((rec: any) => ({
            _id: rec._id,
            date: rec.date,
            status: rec.status,
            sessionTitle: rec.sessionTitle,
            startTime: rec.startTime ? String(rec.startTime) : '',
            endTime: rec.endTime ? String(rec.endTime) : '',
            headsUp: rec.headsUp ? String(rec.headsUp) : '',
            type: 'session' as const
          }));

          // Map event records (only for members visibility)
          const eventRecords = allEvents
            .filter((event: any) => 
              event.visibility?.toLowerCase() === 'members' && 
              event.attendance?.toLowerCase() === 'mandatory'
            )
            .map((event: any) => {
              const parsedDate = parseDate(event.eventDate);
              return {
                _id: event._id,
                date: parsedDate ? formatDate(parsedDate) : event.eventDate,
                status: get().getAttendanceStatus(event._id),
                eventTitle: event.eventTitle,
                startTime: event.startTime,
                endTime: event.endTime,
                type: 'event' as const,
                visibility: event.visibility?.toLowerCase(),
                attendance: event.attendance,
                division: event.division,
                groups: event.groups
              };
            })
            .filter((record: RecordItem) => record.date); // Filter out records with invalid dates

          // Combine and sort all records by date
          const allRecords = [...sessionRecords, ...eventRecords].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime();
          });

          set({ records: allRecords, error: null });
        } catch (error) {
          console.error('Error fetching attendance:', error);
          let errorMessage = 'Failed to fetch attendance records';
          
          if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.message || error.message;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          set({ 
            records: [],
            error: errorMessage
          });
        } finally {
          set({ loading: false });
        }
      },

      getAttendanceStatus: (id: string): 'Present' | 'Absent' | 'Excused' => {
        const { attendanceTaken } = get();
        return attendanceTaken.has(id) ? 'Present' : 'Absent';
      },

      markAttendanceTaken: (id: string) => {
        set((state) => {
          const newAttendanceTaken = new Set(state.attendanceTaken);
          newAttendanceTaken.add(id);
          return { attendanceTaken: newAttendanceTaken };
        });
      },

      clearAttendanceTaken: (id: string) => {
        set((state) => {
          const newAttendanceTaken = new Set(state.attendanceTaken);
          newAttendanceTaken.delete(id);
          return { attendanceTaken: newAttendanceTaken };
        });
      },

      clearAllAttendance: () => {
        set({ attendanceTaken: new Set<string>() });
      },
    }),
    {
      name: 'attendance-storage',
      partialize: (state) => ({ attendanceTaken: state.attendanceTaken }),
    }
  )
);
