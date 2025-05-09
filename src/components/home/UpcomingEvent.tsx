'use client';

import { useSessionEventStore } from '@/stores/sessionEventstore';
import Image from 'next/image';
import { useEffect } from 'react';
import eventman from '../../assets/eventman.svg';

const UpcomingEvent = () => {
  const {
    events,
    loading,
    fetchEvents
  } = useSessionEventStore();

  useEffect(() => {
    console.log('Fetching events...');
    fetchEvents(1, 1); 
    console.log('Events fetched:', events);
  }, [fetchEvents]);

  const latestEvent = events.length > 0 ? events[0] : null;
  const latestEventTitle = latestEvent?.eventTitle || 'No upcoming event';
  const visibility = latestEvent?.visibility === 'onlymember' ? 'Only Members' : 'Public';

  return (
    <div className="w-full px-4 sm:px-6 mt-4 sm:mt-6 dark:bg-gray-800 dark:text-white">
      <div className="bg-blue-400 h-auto min-h-[200px] sm:min-h-[260px] rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
        {/* First row - Event title and Members tag */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Event</h2>
            <p className="text-gray-900 mt-1 text-sm sm:text-base">
              {loading ? 'Loading...' : latestEventTitle}
            </p>
          </div>
          <div className="flex items-center bg-red-500 w-[92px] h-[25px] rounded-lg justify-center">
            <h4 className="text-white text-sm">
              {loading ? '...' : visibility}
            </h4>
          </div>
        </div>

        {/* Image */}
        <div className="my-4 mx-auto w-[120px] sm:w-[150px] h-[80px] sm:h-[100px] bg-gray-300 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">
            <Image src={eventman} alt="man" className="w-full h-full object-contain" />
          </span>
        </div>

        {/* Add to calendar button */}
        <div className="flex justify-end">
         
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvent;
