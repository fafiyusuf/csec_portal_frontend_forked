import {
    createEvent,
    createSession,
    deleteEventById,
    deleteSessionById,
    getEvents,
    getSessions,
    updateEvent,
    updateSession,
} from '@/lib/api/sessionEventApi';
import { Event, Session } from '@/types/eventSession';
import { create } from 'zustand';

interface SessionEventStore {
  sessions: Session[];
  events: Event[];
  loading: boolean;
  fetchSessions: (page: number, limit: number) => Promise<void>;
  fetchEvents: (page: number, limit: number) => Promise<void>;
  addSession: (data: Partial<Session>) => Promise<void>;
  addEvent: (data: Partial<Event>) => Promise<void>;
  editSession: (id: string, data: Partial<Session>) => Promise<void>;
  editEvent: (id: string, data: Partial<Event>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  sessionsTotalCount: number | null;
  eventsTotalCount: number | null;
  setSessionsTotalCount: (count: number) => void;
  setEventsTotalCount: (count: number) => void;
}

export const useSessionEventStore = create<SessionEventStore>((set) => ({
  sessions: [],
  events: [],
  loading: false,
  sessionsTotalCount: null,
  eventsTotalCount: null,

  setSessionsTotalCount: (count) => set({ sessionsTotalCount: count }),
  setEventsTotalCount: (count) => set({ eventsTotalCount: count }),

  fetchSessions: async (page: number, limit: number): Promise<void> => {
    set({ loading: true });
    try {
      const res = await getSessions(page, limit);
      
      // Only update if we got valid data
      if (res?.sessions && typeof res.totalSessions === 'number') {
        set({
          sessions: res.sessions,
          sessionsTotalCount: res.totalSessions,
          loading: false
        });
      } else {
        throw new Error('Invalid sessions response');
      }
    } catch (err) {
      console.error('Failed to fetch sessions', err);
      set({
        sessions: [],
        sessionsTotalCount: null,  // Reset to null on error
        loading: false
      });
    }
  },
  
  fetchEvents: async (page: number, limit: number): Promise<void> => {
    set({ loading: true });
    try {
      const res = await getEvents(page, limit);
      
      if (res?.events && typeof res.totalEvents === 'number') {
        set({
          events: res.events,
          eventsTotalCount: res.totalEvents,
          loading: false
        });
      } else {
        throw new Error('Invalid events response');
      }
    } catch (err) {
      console.error('Failed to fetch events', err);
      set({
        events: [],
        eventsTotalCount: null,  // Reset to null on error
        loading: false
      });
    }
  },

  addSession: async (data: Partial<Session>): Promise<void> => {
    try {
      await createSession(data);
      console.log('Session created successfully');
    } catch (err) {
      console.error('Failed to create session', err);
    }
  },

  addEvent: async (data: Partial<Event>): Promise<void> => {
    try {
      const response = await createEvent(data);
      if (!response) {
        throw new Error('No response from server');
      }
      console.log('Event created successfully:', response);
      // Refresh the events list after successful creation
      const currentPage = Math.ceil((useSessionEventStore.getState().events.length + 1) / 8);
      await useSessionEventStore.getState().fetchEvents(currentPage, 8);
    } catch (err) {
      console.error('Failed to create event:', err);
      throw err; // Re-throw to handle in the UI
    }
  },

  editSession: async (id: string, data: Partial<Session>): Promise<void> => {
    try {
      await updateSession(id, data);
      console.log('Session updated successfully');
    } catch (err) {
      console.error('Failed to update session', err);
    }
  },

  editEvent: async (id: string, data: Partial<Event>): Promise<void> => {
    try {
      await updateEvent(id, data);
      console.log('Event updated successfully');
    } catch (err) {
      console.error('Failed to update event', err);
    }
  },

  deleteSession: async (id: string): Promise<void> => {
    try {
      await deleteSessionById(id);
      console.log('Session deleted successfully');
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  },

  deleteEvent: async (id: string): Promise<void> => {
    try {
      await deleteEventById(id);
      console.log('Event deleted successfully');
    } catch (err) {
      console.error('Failed to delete event', err);
    }
  },
}));
