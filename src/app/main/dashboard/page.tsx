'use client';

import CalendarSidebar from "@/components/home/CalendarSidebar";
import StatsPage from "@/components/home/statsCard";
import UpcomingEvent from "@/components/home/UpcomingEvent";
import LoadingSpinner from '@/components/LoadingSpinner'; // Create this component
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, initialize, isInitialized } = useUserStore();

  useEffect(() => {
    // Initialize authentication state
    initialize();
    
    // Redirect if not authenticated after initialization
    if (isInitialized && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [initialize, isAuthenticated, isInitialized, router]);

  // Show loading state while checking authentication
  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
        <p className="ml-2 text-gray-600">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main content area */}
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
        {/* Left content */}
        <div className="flex-1 space-y-6">
          <UpcomingEvent />
          <StatsPage />
          {/* <AttendanceOverview /> */}
        </div>

        {/* Calendar sidebar - moves to bottom on mobile */}
        <div className="w-full lg:w-[280px] xl:w-[320px] lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] bg-white dark:bg-gray-800 shadow-sm border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 overflow-y-auto dark:text-gray-100">
          <CalendarSidebar />
        </div>
      </div>
    </div>
  );
}                                                 