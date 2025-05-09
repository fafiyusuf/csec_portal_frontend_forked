import { Event, Session } from '@/types/eventSession';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE



// Sessions API
export const getSessions = async (page: number, limit: number): Promise<{sessions: Session[]; totalSessions: number}> => {
  const res = await axios.get(`${BASE_URL}/sessions?page=${page}&limit=${limit}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    }
    
  );
      console.log('Sessions data:', res.data); // Debugging line

  return {
    sessions: res.data.sessions,
    totalSessions: res.data.totalSessions,
  };
};

export const createSession = async (sessionData: Partial<Session>): Promise<Session> => {
  const res = await axios.post(`${BASE_URL}/sessions/createSession`, sessionData,{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data.session;
};

export const updateSession = async (id: string, sessionData: Partial<Session>): Promise<Session> => {
  const res = await axios.put(`${BASE_URL}/sessions/${id}`, sessionData,{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data.session;
};

export const deleteSessionById = async (id: string): Promise<void> => {
  console.log('Deleting session with ID:', id); // Log the ID
  if (!id) {
    throw new Error('Session ID is undefined or invalid');
  }

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found. User not authenticated.');
  }

  try {
    const response = await axios.delete(`${BASE_URL}/sessions/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (![200, 204].includes(response.status)) {
      throw new Error(`Unexpected status code: ${response.status}`);
    }

    console.log(`Session with ID ${id} deleted successfully.`);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Failed to delete session', error.response.data || error.message);
      throw new Error(error.response.data?.message || 'Failed to delete session');
    } else {
      console.error('Failed to delete session', (error as Error).message);
      throw new Error((error as Error).message || 'Failed to delete session');
    }
  }
};


// Events API
export const getEvents = async (page: number, limit: number): Promise<{events: Event[]; totalEvents: number;}> => {
  const res = await axios.get(`${BASE_URL}/events?page=${page}&limit=${limit}`,
    {
      headers: {
        'Content-Type': 'application/json',     
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  console.log('Events data:', res.data); // Debugging line
  return {
    events: res.data.events,
    totalEvents: res.data.totalEvents,
  };};

export const createEvent = async (eventData: Partial<Event>): Promise<Event> => {
const res = await axios.post(`${BASE_URL}/events/addEvent`, eventData, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data.event;
};

export const updateEvent = async (id: string, eventData: Partial<Event>): Promise<Event> => {
  const res = await axios.put(`${BASE_URL}/events/${id}`, eventData, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data.event;
};

export const deleteEventById = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/events/${id}`,{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
};
