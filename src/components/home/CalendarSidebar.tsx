'use client';

import { useSessionEventStore } from '@/stores/sessionEventstore';
import { Event, Session } from '@/types/eventSession';
import { useEffect, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface CalendarItem {
  type: 'session' | 'event';
  date: Date;
  time: string;
  title: string;
  description: string;
  rawData: Session | Event;
}

const CalendarSidebar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { sessions, events, fetchSessions, fetchEvents } = useSessionEventStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    fetchSessions(1, 100);
    fetchEvents(1, 100);
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = savedTheme;
    }
  }, [fetchSessions, fetchEvents]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const calendarItems = useMemo<CalendarItem[]>(() => {
    const sessionItems = sessions.flatMap(session => {
      if (session.sessions && Array.isArray(session.sessions)) {
        return session.sessions.map(sessionItem => ({
          type: 'session' as const,
          date: new Date(session.startDate),
          time: (sessionItem as { startTime: string }).startTime,
          title: session.sessionTitle || 'Session',
          description: `Session at ${(sessionItem as { startTime: string }).startTime}`,
          rawData: session
        }));
      }
      return {
        type: 'session' as const,
        date: new Date(session.startDate),
        time: (session.sessions[0] as { startTime: string } | undefined)?.startTime || '00:00',
        title: session.sessionTitle || 'Session',
        description: `Session at ${(session.sessions[0] as { startTime: string } | undefined)?.startTime || '00:00'}`,
        rawData: session
      };
    });

    const eventItems = events.map(event => ({
      type: 'event' as const,
      date: new Date(event.eventDate),
      time: event.startTime || '00:00',
      title: event.eventTitle || 'Event',
      description: `Event from ${event.startTime} to ${event.endTime}`,
      rawData: event
    }));

    return [...sessionItems, ...eventItems];
  }, [sessions, events]);

  // Get upcoming events (next 7 days)
  const upcomingItems = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return calendarItems
      .filter(item => item.date > today && item.date <= nextWeek)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5); // Limit to 5 upcoming items
  }, [calendarItems]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const days = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const hasItems = calendarItems.some(item => 
        item.date.getDate() === day && 
        item.date.getMonth() === month && 
        item.date.getFullYear() === year
      );
      
      const isCurrentDay = day === new Date().getDate() && 
                          month === new Date().getMonth() && 
                          year === new Date().getFullYear();

      days.push(
        <div 
          key={`day-${day}`}
          className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer ${
            isCurrentDay ? 'bg-blue-500 text-white' : 
            hasItems ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 
            'hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          onClick={() => setCurrentDate(date)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const currentItems = calendarItems.filter(item => 
    item.date.getDate() === currentDate.getDate() && 
    item.date.getMonth() === currentDate.getMonth() && 
    item.date.getFullYear() === currentDate.getFullYear()
  );

  return (
    <div className="w-full p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Calendar</h2>
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => changeMonth(-1)} 
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <FiChevronLeft className="text-gray-700 dark:text-gray-300" />
          </button>
          <span className="font-medium text-sm sm:text-base">
            {monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}
          </span>
          <button 
            onClick={() => changeMonth(1)} 
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <FiChevronRight className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-600 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-sm">
          {renderCalendar()}
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-bold mb-2 text-xs">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
          
          {currentItems.length > 0 ? (
            <div className="space-y-3">
              {currentItems.map((item, index) => (
                <div 
                  key={index} 
                  className={`border-l-4 pl-3 py-1 ${
                    item.type === 'session' ? 'border-blue-500' : 'border-green-500'
                  }`}
                >
                  <div className="font-medium text-xs">
                    {item.time} <span className={item.type === 'session' ? 'text-blue-500' : 'text-green-500'}>
                      {item.title}
                    </span>
                  </div>
                  {item.description && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-xs">No items scheduled</p>
          )}
        </div>

        <div>
          <h3 className="font-bold mb-3 text-xs">Upcoming in 7 Days</h3>
          {upcomingItems.length > 0 ? (
            <div className="space-y-3">
              {upcomingItems.map((item, index) => (
                <div 
                  key={index} 
                  className={`border-l-4 pl-3 py-1 ${
                    item.type === 'session' ? 'border-blue-500' : 'border-green-500'
                  }`}
                >
                  <div className="font-medium text-xs">
                    <span className="text-gray-600 dark:text-gray-400 mr-2">
                      {item.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    {item.time} <span className={item.type === 'session' ? 'text-blue-500' : 'text-green-500'}>
                      {item.title}
                    </span>
                  </div>
                  {item.description && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-xs">No upcoming events</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarSidebar;