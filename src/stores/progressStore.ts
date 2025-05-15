import { create } from 'zustand';
import axios from 'axios';

interface HeadsUpData {
  percentage: number;
  count: number;
}

interface TimePeriodData {
  percentage: number;
}

interface AttendanceData {
  overall: {
    percentage: number;
    present: number;
    total: number;
    headsUp: HeadsUpData;
  };
  week: TimePeriodData;
  month: TimePeriodData;
}

interface AttendanceStore {
  attendanceData: AttendanceData | null;
  loading: boolean;
  error: string | null;
  fetchAttendanceData: (memberId: string) => Promise<void>;
  reset: () => void;
}

export const useAttendanceStore = create<AttendanceStore>((set) => ({
  attendanceData: null,
  loading: false,
  error: null,
  
  fetchAttendanceData: async (memberId: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/attendance/member/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      set({ 
        attendanceData: response.data, 
        loading: false 
      });
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message
        : 'Failed to fetch attendance data';
      
      console.error('Error fetching attendance data:', error);
      set({ 
        error: errorMessage, 
        loading: false 
      });
    }
  },
  
  reset: () => set({ 
    attendanceData: null, 
    loading: false, 
    error: null 
  })
}));