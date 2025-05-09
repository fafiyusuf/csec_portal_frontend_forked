'use client';

import { toast } from '@/components/ui/use-toast';
import { divisionsApi } from '@/lib/api/divisions-api';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

type Session = {
  day: string;
  startTime: string;
  endTime: string;
};

type CreateSessionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sessionData: {
    sessionTitle: string;
    division: string;
    startDate: string;
    endDate: string;
    sessions: Session[];
    groups: string[];
  }) => void;
  editingItem: {
    sessionTitle?: string;
    groups?: string;
    division?: string;
    startDate?: string;
    endDate?: string;
    sessions?: Session[];
  } | null;
};

const CreateSessionModal = ({ isOpen, onClose, onSubmit, editingItem }: CreateSessionModalProps) => {
  const formik = useFormik({
    initialValues: {
      sessionTitle: editingItem?.sessionTitle || '',
      division: editingItem?.division || '',
      groups: editingItem?.groups
        ? Array.isArray(editingItem.groups)
          ? editingItem.groups
          : editingItem.groups.split(/,\s*/)
        : ['Group 1'],
      startDate: editingItem?.startDate || '',
      endDate: editingItem?.endDate || '',
      sessions: editingItem?.sessions || [],
      newSession: { day: '', startTime: '', endTime: '' },
    },
    enableReinitialize: true, // This ensures that the form will reinitialize when `editingItem` changes
    onSubmit: (values) => {
      // Always include the last session if filled
      let sessions = values.sessions;
      const { day, startTime, endTime } = values.newSession;
      if (day && startTime && endTime) {
        sessions = [...sessions, { day, startTime, endTime }];
      }
      // Ensure groups is always an array
      const groups = Array.isArray(values.groups) ? values.groups : [values.groups];
      // Ensure date strings are in YYYY-MM-DD format
      const formatDate = (date: string) => date ? new Date(date).toISOString().slice(0, 10) : '';
      const sessionData = {
        sessionTitle: values.sessionTitle,
        division: values.division,
        groups,
        startDate: formatDate(values.startDate),
        endDate: formatDate(values.endDate),
        sessions,
      };
      // Logging for debugging
      console.log('Submitting session:', sessionData);
      // Extra validation
      if (!sessionData.sessionTitle || !sessionData.division || !sessionData.startDate || !sessionData.endDate) {
        toast({ title: 'Error', description: 'Please fill all required fields.', variant: 'destructive' });
        return;
      }
      if (!Array.isArray(sessionData.groups) || sessionData.groups.length === 0) {
        toast({ title: 'Error', description: 'Please select at least one group.', variant: 'destructive' });
        return;
      }
      if (!Array.isArray(sessionData.sessions) || sessionData.sessions.length === 0) {
        toast({ title: 'Error', description: 'Please add at least one session.', variant: 'destructive' });
        return;
      }
      // Check each session object
      for (const s of sessionData.sessions) {
        if (!s.day || !s.startTime || !s.endTime) {
          toast({ title: 'Error', description: 'Each session must have a day, start time, and end time.', variant: 'destructive' });
          return;
        }
      }
      handleSubmit(sessionData);
    }
  });

  const [loading, setLoading] = useState(false);
  const [divisionOptions, setDivisionOptions] = useState<string[]>([]);
  const [divisionsLoading, setDivisionsLoading] = useState(false);

  const handleAddSession = () => {
    const { day, startTime, endTime } = formik.values.newSession;
    if (day && startTime && endTime) {
      const updatedSessions = [...formik.values.sessions, { day, startTime, endTime }];
      formik.setFieldValue('sessions', updatedSessions);
      formik.setFieldValue('newSession', { day: '', startTime: '', endTime: '' });
    }
  };

  const handleRemoveSession = (index: number) => {
    const updatedSessions = formik.values.sessions.filter((_, i) => i !== index);
    formik.setFieldValue('sessions', updatedSessions);
  };

  // Reset form when modal is closed or editingItem changes
  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
    }
  }, [isOpen, editingItem]);

  useEffect(() => {
    if (isOpen) {
      setDivisionsLoading(true);
      divisionsApi.getAllDivisions()
        .then((divisions) => {
          console.log('Fetched divisions:', divisions);
          setDivisionOptions(Array.isArray(divisions) ? divisions : []);
        })
        .catch((error) => {
          console.error('Error fetching divisions:', error);
          setDivisionOptions([]);
        })
        .finally(() => setDivisionsLoading(false));
    }
  }, [isOpen]);

  const handleSubmit = async (sessionData: {
    sessionTitle: string;
    division: string;
    startDate: string;
    endDate: string;
    sessions: Session[];
    groups: string[];
  }) => {
    setLoading(true);
    try {
      await onSubmit(sessionData);
      toast({ title: 'Success', description: 'Session created successfully!', variant: 'default' });
      onClose();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to create session. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm dark:bg-black/50"></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl z-10 max-h-[90vh] overflow-y-auto dark:border dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">{editingItem ? 'Edit Session' : 'Add New Session'}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input 
              className="border rounded px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" 
              placeholder="Title" 
              name="sessionTitle" 
              value={formik.values.sessionTitle} 
              onChange={formik.handleChange} 
              required 
            />
            <select 
              className="border rounded px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              name="division" 
              value={formik.values.division} 
              onChange={formik.handleChange} 
              required
              disabled={divisionsLoading}
            >
              <option value="">Select Division</option>
              {divisionOptions.map((division) => (
                <option key={division} value={division} className="dark:bg-gray-700">
                  {division}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <select
              name="groups"
              value={formik.values.groups}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                formik.setFieldValue('groups', selected);
              }}
              className="border rounded px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              multiple
            >
              <option value="Group 1" className="dark:bg-gray-700">Group 1</option>
              <option value="Group 2" className="dark:bg-gray-700">Group 2</option>
              <option value="Group 3" className="dark:bg-gray-700">Group 3</option>
              <option value="Group 4" className="dark:bg-gray-700">Group 4</option>
            </select>

            <input 
              type="date" 
              className="border rounded px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              placeholder="Start Date" 
              name="startDate" 
              value={formik.values.startDate} 
              onChange={formik.handleChange} 
            />
            <input 
              type="date" 
              className="border rounded px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              placeholder="End Date" 
              name="endDate" 
              value={formik.values.endDate} 
              onChange={formik.handleChange} 
            />
          </div>

          {formik.values.sessions.map((s, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-2">
              <input 
                className="border rounded px-4 py-2 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300" 
                value={s.day} 
                disabled 
              />
              <input 
                className="border rounded px-4 py-2 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300" 
                value={s.startTime} 
                disabled 
              />
              <input 
                className="border rounded px-4 py-2 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300" 
                value={s.endTime} 
                disabled 
              />
              <button
                type="button"
                className="border border-red-500 text-red-500 px-4 py-2 rounded dark:border-red-400 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                onClick={() => handleRemoveSession(i)}
              >
                Remove
              </button>
            </div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <select
              value={formik.values.newSession.day}
              onChange={(e) => formik.setFieldValue('newSession', { ...formik.values.newSession, day: e.target.value })}
              className="border rounded px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="" className="dark:bg-gray-700">Select Day</option>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <option key={day} value={day} className="dark:bg-gray-700">{day}</option>
              ))}
            </select>
            <input
              type="time"
              className="border rounded px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formik.values.newSession.startTime}
              onChange={(e) => formik.setFieldValue('newSession', { ...formik.values.newSession, startTime: e.target.value })}
            />
            <input
              type="time"
              className="border rounded px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formik.values.newSession.endTime}
              onChange={(e) => formik.setFieldValue('newSession', { ...formik.values.newSession, endTime: e.target.value })}
            />
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
              onClick={handleAddSession}
            >
              Add
            </button>
          </div>

          <div className="flex justify-end gap-4">
            <button 
              type="button" 
              className="px-6 py-2 border rounded dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
              disabled={loading}
            >
              {loading ? 'Creating...' : (editingItem ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateSessionModal;
