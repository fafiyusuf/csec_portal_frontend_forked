'use client';
import { useHeadsUpStore } from '@/stores/headsupStore';
import { InfoCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';

interface HeadsUpProps {
  id: string;
}

interface HeadsUpRecord {
  _id: string;
  date: string;
  headsUp: string | string[] | null;
  status?: string;
  sessionTitle?: string;
  day?: string;
  startTime?: string;
  endTime?: string;
}

interface HeadsUpData {
  week: { records: HeadsUpRecord[] };
  month: { records: HeadsUpRecord[] };
  overall: {
    records: HeadsUpRecord[];
    headsUp: { count: number; percentage: number };
    percentage: number;
    present: number;
  };
}

const HeadsUp: React.FC<HeadsUpProps> = ({ id }) => {
  const { headsUp, fetchHeadsUp } = useHeadsUpStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (token && id) {
      setLoading(true);
      fetchHeadsUp(id)
        .then(() => setLoading(false))
        .catch((err: any) => {
          setError('Failed to fetch notifications.');
          setLoading(false);
          console.error('Fetch error:', err);
        });
    }
  }, [token, id, fetchHeadsUp]);

  const overallRecords: HeadsUpRecord[] =
    headsUp && typeof headsUp === 'object' && 'overall' in headsUp
      ? ((headsUp as unknown) as HeadsUpData).overall.records
      : [];

  console.log('All overall records:', overallRecords);

  const headsUpRecords = overallRecords.filter(record => {
    if (record.headsUp === null || record.headsUp === undefined) return false;
    if (Array.isArray(record.headsUp)) return record.headsUp.length > 0;
    if (typeof record.headsUp === 'string') return record.headsUp.trim() !== '';
    return false;
  });

  console.log('Filtered headsUpRecords:', headsUpRecords);

  if (loading) {
    return (
      <div className="p-8 text-center w-160">
        <p className="text-gray-600">Loading heads-up notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center w-160">
        <p className="text-red-600">Error loading notifications: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 w-160">
      <div className="grid grid-cols-1 gap-4">
        {headsUpRecords.length > 0 ? (
          headsUpRecords.map(record => (
            <div key={record._id} className="rounded-xl shadow p-6 bg-white dark:bg-gray-800">
              <div className="flex items-start gap-4">
                <InfoCircleOutlined className="text-blue-800 text-xl mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
                    Heads-up Notification
                  </h2>
                  {Array.isArray(record.headsUp) ? (
                    record.headsUp.map((msg, idx) => (
                      <p key={idx} className="text-sm text-gray-600 dark:text-gray-300">
                        {msg}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-300">{record.headsUp}</p>
                  )}
                  {record.date && (
                    <p className="text-xs text-gray-500 mt-2">
                      Date: {new Date(record.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl shadow p-6 bg-white dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-300">No heads-up notifications available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeadsUp;
