'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchMemberAttendanceRecords } from '@/lib/api/attendanceApi';

interface AttendanceRecord {
  _id: string;
  date: string;
  status: string;
  sessionTitle: string;
  day: string;
  startTime: string;
  endTime: string;
  headsUp?: string;
}

interface AttendanceData {
  overall: {
    records: AttendanceRecord[];
  };
}

const Attendance: React.FC<{ id: string }> = ({ id }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchMemberAttendanceRecords(id)
      .then(data => {
        setRecords(data.overall.records || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch attendance records');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading attendance records...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 dark:border-gray-700">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="px-4 py-2">Session Title</th>
            <th className="px-4 py-2">Day</th>
            <th className="px-4 py-2">Start Time</th>
            <th className="px-4 py-2">End Time</th>
            <th className="px-4 py-2">Heads Up</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-4">No attendance records found.</td>
            </tr>
          ) : (
            records.map((rec) => (
              <tr key={rec._id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-2">{rec.sessionTitle}</td>
                <td className="px-4 py-2">{rec.day}</td>
                <td className="px-4 py-2">{rec.startTime}</td>
                <td className="px-4 py-2">{rec.endTime}</td>
                <td className="px-4 py-2">{rec.headsUp || '-'}</td>
                <td className="px-4 py-2">{rec.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Attendance;
