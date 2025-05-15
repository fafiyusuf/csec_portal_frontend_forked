'use client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { useAttendanceStore } from "@/stores/progressStore";

interface AttendanceProgressProps {
  id: string;
}

interface AttendanceData {
  overall?: {
    percentage?: number;
    present?: number;
    total?: number;
    headsUp?: {
      percentage?: number;
      count?: number;
    };
  };
  week?: {
    percentage?: number;
  };
  month?: {
    percentage?: number;
  };
}

export default function AttendanceProgress({ id }: AttendanceProgressProps) {
  const { attendanceData, fetchAttendanceData } = useAttendanceStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        await fetchAttendanceData(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch attendance data');
        console.error("Error fetching attendance data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, fetchAttendanceData]);

  const handleRetry = () => {
    if (id) {
      fetchAttendanceData(id).catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 max-w-3xl rounded-xl shadow-md p-6 w-160 dark:border dark:border-gray-700">
        <Skeleton className="h-8 w-48 mb-6 mx-auto" />
        <Skeleton className="w-48 h-48 rounded-full mx-auto mb-8" />
        <div className="flex justify-around mt-8">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="w-160">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <button 
            onClick={handleRetry}
            className="ml-2 text-sm font-medium underline"
          >
            Retry
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!attendanceData) {
    return (
      <div className="bg-white dark:bg-gray-800 max-w-3xl rounded-xl shadow-md p-6 w-160 dark:border dark:border-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No attendance data available
        </p>
        <button
          onClick={handleRetry}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Load Data
        </button>
      </div>
    );
  }

  // Safely extract data with proper fallbacks
  const overall = attendanceData.overall || {};
  const week = attendanceData.week || {};
  const month = attendanceData.month || {};
  const headsUp = overall.headsUp || {};

  const overallPercentage = overall.percentage ?? 0;
  const lastWeek = week.percentage ?? 0;
  const lastMonth = month.percentage ?? 0;
  const headsUpPercent = headsUp.percentage ?? 0;
  const headsUpCount = headsUp.count ?? 0;
  const present = overall.present ?? 0;
  const total = overall.total ?? 0;
  const absent = total > 0 ? Math.max(0, 100 - overallPercentage) : 0;

  const progressData = [
    {
      label: 'Heads Up',
      percent: headsUpPercent,
      color: '#003087',
      par: `${headsUpCount} notification${headsUpCount !== 1 ? 's' : ''}`
    },
    {
      label: 'Present',
      percent: overallPercentage,
      color: '#003087',
      par: `${present}/${total} session${total !== 1 ? 's' : ''}`
    },
    {
      label: 'Absent',
      percent: absent,
      color: '#003087',
      par: `${Math.max(0, total - present)} session${total - present !== 1 ? 's' : ''}`
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 max-w-3xl rounded-xl shadow-md p-6 w-160 dark:border dark:border-gray-700 transition-colors duration-200">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-6 dark:text-white">
          Overall Attendance Progress
        </h3>

        <div className="relative w-48 h-48 mx-auto">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="90"
              cx="96"
              cy="96"
            />
            <circle
              className="text-blue-900 dark:text-blue-400"
              strokeWidth="10"
              strokeDasharray={565.48}
              strokeDashoffset={565.48 - (565.48 * overallPercentage) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="90"
              cx="96"
              cy="96"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-black dark:text-white">
              {overallPercentage}%
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Overall</p>
          </div>
        </div>

        <div className="flex justify-around mt-8">
          <div className="text-center">
            <p className="text-lg font-semibold text-black dark:text-white">
              {lastWeek}%
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Last week</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-black dark:text-white">
              {lastMonth}%
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Last month</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {progressData.map((item, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 h-full flex flex-col items-center dark:shadow-gray-900/50 dark:border dark:border-gray-700"
          >
            <div className="relative w-20 h-20 mb-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-gray-200 dark:text-gray-700"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="36"
                  cx="40"
                  cy="40"
                />
                <circle
                  strokeWidth="8"
                  strokeDasharray={226.2}
                  strokeDashoffset={226.2 - (226.2 * item.percent) / 100}
                  strokeLinecap="round"
                  stroke={item.color}
                  fill="transparent"
                  r="36"
                  cx="40"
                  cy="40"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-semibold text-sm dark:text-white">
                  {item.percent}%
                </span>
              </div>
            </div>

            <h4 className="text-md font-semibold mb-1 dark:text-gray-200">
              {item.label}
            </h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
              {item.par}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}