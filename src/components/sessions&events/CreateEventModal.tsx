'use client';

import { toast } from '@/components/ui/use-toast';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useUserStore } from "@/stores/userStore"
import { canCreateSessionsAndEvents, canManageSessionsAndEvents } from "@/lib/divisionPermissions"

type CreateEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: { 
    eventTitle: string; 
    visibility: string; 
    division: string; 
    groups: string[]; 
    eventDate: string; 
    startTime: string; 
    endTime: string; 
    attendance: string; 
  }) => void;
  editingItem: {
    eventTitle?: string;
    visibility?: string;
    division?: string;
    groups?: string;
    eventDate?: string;
    startTime?: string;
    endTime?: string;
    attendance?: string;
  } | null;
};

const CreateEventModal = ({ isOpen, onClose, onSubmit, editingItem }: CreateEventModalProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();
  const userRole = user?.member?.clubRole;

  // Check if user can create events
  if (!canCreateSessionsAndEvents(userRole)) {
    return null;
  }

  // Check if user can manage events for the selected division
  if (editingItem?.division && !canManageSessionsAndEvents(userRole, editingItem.division)) {
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You don't have permission to manage events for this division."
    });
    return null;
  }

  // Handle form reset when modal is closed
  const formik = useFormik({
    initialValues: {
      eventTitle: editingItem?.eventTitle || '',
      visibility: editingItem?.visibility || 'public',
      division: editingItem?.division || '',
      groups: editingItem?.groups
        ? Array.isArray(editingItem.groups)
          ? editingItem.groups
          : editingItem.groups.split(/,\s*/)
        : ['Group 1'],
      eventDate: editingItem?.eventDate || '',
      startTime: editingItem?.startTime || '',
      endTime: editingItem?.endTime || '',
      attendance: editingItem?.attendance || 'optional',
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      // Validate required fields
      if (!values.eventTitle || !values.division || !values.eventDate || !values.startTime || !values.endTime) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill in all required fields."
        });
        return;
      }

      // Ensure groups is always an array
      const groups = Array.isArray(values.groups) ? values.groups : [values.groups];
      // Ensure eventDate is in YYYY-MM-DD format
      const formatDate = (date: string) => date ? new Date(date).toISOString().slice(0, 10) : '';
      const eventData: any = {
        eventTitle: values.eventTitle,
        division: values.division,
        groups,
        eventDate: formatDate(values.eventDate),
        startTime: values.startTime,
        endTime: values.endTime,
        visibility: values.visibility,
      };
      // Only include attendance if present and not empty
      if (values.attendance) {
        eventData.attendance = values.attendance;
      }
      try {
        setLoading(true);
        await onSubmit(eventData);
        toast({ 
          title: 'Success', 
          description: 'Event created successfully!', 
          variant: 'default',
          className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800"
        });
        onClose();
      } catch (err) {
        toast({ 
          title: 'Error', 
          description: 'Failed to create event. Please try again.', 
          variant: 'destructive' 
        });
      } finally {
        setLoading(false);
      }
    }
  });

  // Reset form only when modal is closed, and `editingItem` changes
  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
    }
  }, [isOpen, editingItem]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm dark:bg-black/50"></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md z-10 max-h-[90vh] overflow-y-auto dark:border dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">{editingItem ? 'Edit Event' : 'Add New Event'}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              className="border rounded px-4 py-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              placeholder="Event Title"
              name="eventTitle"
              value={formik.values.eventTitle}
              onChange={formik.handleChange}
              required
            />
            <div>
              <label className="font-semibold mb-1 dark:text-gray-300">Visibility</label>
              <div className="flex gap-4">
                {['public', 'members'].map((v) => (
                  <label key={v} className="flex items-center gap-1 dark:text-gray-300">
                    <input
                      type="radio"
                      name="visibility"
                      value={v}
                      checked={formik.values.visibility === v}
                      onChange={formik.handleChange}
                      className="dark:accent-blue-500"
                    />
                    {v === 'public' ? 'Public' : 'Members'}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {formik.values.visibility === 'members' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <select
                  className="border rounded px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  name="division"
                  value={formik.values.division}
                  onChange={formik.handleChange}
                  required
                >
                  <option value="" className="dark:bg-gray-700">Select Division</option>
                  <option value="Div 1" className="dark:bg-gray-700">Div 1</option>
                  <option value="Div 2" className="dark:bg-gray-700">Div 2</option>
                </select>
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
              </div>
              <div className="mb-4">
                <label className="font-semibold mb-1 dark:text-gray-300">Attendance</label>
                <div className="flex gap-4">
                  <label className="dark:text-gray-300">
                    <input
                      type="radio"
                      name="attendance"
                      value="mandatory"
                      checked={formik.values.attendance === 'mandatory'}
                      onChange={formik.handleChange}
                      className="dark:accent-blue-500 mr-1"
                    /> Mandatory
                  </label>
                  <label className="dark:text-gray-300">
                    <input
                      type="radio"
                      name="attendance"
                      value="optional"
                      checked={formik.values.attendance === 'optional'}
                      onChange={formik.handleChange}
                      className="dark:accent-blue-500 mr-1"
                    /> Optional
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input 
              type="date" 
              className="border rounded px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              name="eventDate" 
              value={formik.values.eventDate} 
              onChange={formik.handleChange} 
              required 
            />
            <input 
              type="time" 
              className="border rounded px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              name="startTime" 
              value={formik.values.startTime} 
              onChange={formik.handleChange} 
              required 
            />
            <input 
              type="time" 
              className="border rounded px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              name="endTime" 
              value={formik.values.endTime} 
              onChange={formik.handleChange} 
              required 
            />
          </div>

          <div className="flex justify-end gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 border rounded dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
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

export default CreateEventModal;
