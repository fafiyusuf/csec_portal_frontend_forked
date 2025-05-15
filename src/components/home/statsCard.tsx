'use client';
import { useAttendanceStore } from '@/stores/attendanceStore';
import { useDivisionsStore } from '@/stores/DivisionStore';
import useMembersStore from '@/stores/membersStore';
import { useSessionEventStore } from '@/stores/sessionEventstore';
import { useUserStore } from '@/stores/userStore';
import React, { useEffect, useMemo } from 'react';
import { FiCalendar, FiClock, FiLayers, FiUsers } from 'react-icons/fi';


interface StatsCardProps {
  title: string;
  value: number | string;
  updateDate: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  percentageColor: string;
  percentageBgColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  updateDate,
  icon,
  iconBgColor,
  iconColor,
  percentageBgColor
}) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full h-auto min-h-[160px] dark:bg-gray-800 dark:text-white">
      <div className='flex flex-row'>
        <div className={`${iconBgColor} w-[40px] h-[40px] rounded-md flex items-center justify-center`}>
          {React.cloneElement(icon as React.ReactElement, { className: `${iconColor} text-lg sm:text-xl` })}
        </div>
        <div className="text-black text-sm sm:text-base font-medium ml-3 mt-2 dark:text-white">{title}</div>
      </div>

      <div className='flex flex-row justify-between items-center mt-4'>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black dark:text-white">{value}</h1>
        <div className={`flex flex-row gap-1 ${percentageBgColor} px-2 py-1 rounded-md`}>
         
        </div>
      </div>
      
      <div className="text-gray-400 text-xs sm:text-sm mt-4 dark:text-white">Update: {updateDate}</div>
    </div>
  );
};

const StatsPage = () => {
  // Get data and actions from stores
  const { totalMembers, fetchMembers } = useMembersStore();
  const { divisions, fetchDivisions } = useDivisionsStore();
  const { sessions, fetchSessions } = useSessionEventStore();
  const { memberAttendanceRecords, fetchMemberAttendanceRecords } = useAttendanceStore();
  const {user} = useUserStore();


  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchMembers(),
          fetchDivisions(),
          fetchSessions(1, 10), 
          fetchMemberAttendanceRecords(user?.member._id || '') 
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [fetchMembers, fetchDivisions, fetchSessions, fetchMemberAttendanceRecords]);

  // Debugging logs

  const parseSessionDate = (day: string, time: string): Date | null => {
    if (!day || !time) return null;
    
    try {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayIndex = days.indexOf(day);
      if (dayIndex === -1) return null;

      const [hours, minutes] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return null;

      const date = new Date();
      // Find next occurrence of this day
      const daysToAdd = (dayIndex - date.getDay() + 7) % 7;
      date.setDate(date.getDate() + daysToAdd);
      date.setHours(hours, minutes, 0, 0);

      return date;
    } catch (error) {
      console.error('Error parsing session date:', error);
      return null;
    }
  };
  // Calculate upcoming sessions
  const upcomingSessions = useMemo(() => {
    if (!sessions) return 0;

    let count = 0;
    sessions.forEach(session => {
      if (session.sessions) {
        session.sessions.forEach(sessionItem => {
          if (sessionItem.day && sessionItem.startTime) {
            const sessionDate = parseSessionDate(sessionItem.day, sessionItem.startTime);
            if (sessionDate && sessionDate > new Date()) {
              count++;
            }
          }
        });
      }
    });
    return count;
  }, [sessions]);

  // Calculate attendance percentage with fallback
  const attendancePercentage = memberAttendanceRecords?.overall?.percentage ?? 0;
  useEffect(() => {
    console.group('Stats Data');
    console.log('Total Members:', totalMembers);
    console.log('Divisions:', divisions);
    console.log('Sessions:', sessions);
    console.log('Attendance Records:', memberAttendanceRecords);
    console.log('Upcoming Sessions:', upcomingSessions);
    console.log('Attendance Percentage:', attendancePercentage);
    console.groupEnd();
  }, [totalMembers, divisions, sessions, memberAttendanceRecords]);

  // Format current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full max-w-7xl mx-auto dark:bg-gray-800 dark:text-white">
      <StatsCard 
        title="Total Members"
        value={totalMembers ?? 'Loading...'}
        updateDate={currentDate}
        icon={<FiUsers />}
        iconBgColor="bg-[#7152F30D]"
        iconColor="text-[#7152F3]"
        percentageColor="text-[#30BE82]"
        percentageBgColor="bg-[#30BE821A]"
      />
      
      <StatsCard 
        title="Total Divisions "
        value={divisions?.length ?? 'Loading...'}
        updateDate={currentDate}
        icon={<FiLayers />}
        iconBgColor="bg-[#FF7A2F0D]"
        iconColor="text-[#FF7A2F]"
        percentageColor="text-[#FF7A2F]"
        percentageBgColor="bg-[#FF7A2F1A]"
      />
      
      <StatsCard 
        title="Attendance Rate"
        value={typeof attendancePercentage === 'number' ? `${attendancePercentage}%` : 'Loading...'}
        updateDate={currentDate}
        icon={<FiCalendar />}
        iconBgColor="bg-[#3AC9D60D]"
        iconColor="text-[#3AC9D6]"
        percentageColor="text-[#3AC9D6]"
        percentageBgColor="bg-[#3AC9D61A]"
      />
      
      <StatsCard 
        title="Upcoming Sessions"
        value={upcomingSessions?? 'Loading...'}
        updateDate={currentDate}
        icon={<FiClock />}
        iconBgColor="bg-[#FFC7360D]"
        iconColor="text-[#FFC736]"
        percentageColor="text-[#FFC736]"
        percentageBgColor="bg-[#FFC7361A]"
      />
    </div>
  );
};

export default StatsPage;