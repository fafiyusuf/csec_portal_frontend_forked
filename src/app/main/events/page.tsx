'use client';

import CreateEventModal from '@/components/sessions&events/CreateEventModal';
import CreateSessionModal from '@/components/sessions&events/CreateSessionModal';
import EventItem from '@/components/sessions&events/EventItem';
import EventTable from '@/components/sessions&events/EventTable';
import Pagination from '@/components/sessions&events/Pagination';
import SessionItem from '@/components/sessions&events/SessionItem';
import SessionsTable from '@/components/sessions&events/SessionsTable';
import ViewToggle from '@/components/sessions&events/ViewToggle';
import { useSessionEventStore } from '@/stores/sessionEventstore';
import { Event, Session } from '@/types/eventSession';
import { calculateStatus, formatDisplayDate } from '@/utils/date';
import { useEffect, useState } from 'react';
import { FiArrowLeft, FiChevronDown, FiPlus } from 'react-icons/fi';

type NavigationState = {
  contentType: 'sessions' | 'events';
  viewMode: 'list' | 'table';
};

const SessionsPage = () => {
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [contentType, setContentType] = useState<'sessions' | 'events'>('sessions');
  const [editingItem, setEditingItem] = useState<Session | Event | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [navigationStack, setNavigationStack] = useState<NavigationState[]>([]);
  const [currentStackIndex, setCurrentStackIndex] = useState(-1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const itemsPerPage = 8;

  const {
    sessions,
    events,
    loading,
    fetchSessions,
    fetchEvents,
    addSession,
    addEvent,
    editSession,
    editEvent,
    deleteSession,
    deleteEvent,
    sessionsTotalCount,
    eventsTotalCount,
  } = useSessionEventStore();

  // Initialize navigation stack
  useEffect(() => {
    const initialState = { contentType, viewMode };
    setNavigationStack([initialState]);
    setCurrentStackIndex(0);
  }, []);

  // Update navigation stack when state changes
  useEffect(() => {
    if (currentStackIndex === -1) return;

    const newState = { contentType, viewMode };
    const currentState = navigationStack[currentStackIndex];

    // Only add to stack if state actually changed
    if (currentState.contentType !== newState.contentType || 
        currentState.viewMode !== newState.viewMode) {
      
      // If we're not at the end of the stack, truncate future history
      const newStack = navigationStack.slice(0, currentStackIndex + 1);
      newStack.push(newState);
      
      setNavigationStack(newStack);
      setCurrentStackIndex(newStack.length - 1);
    }
  }, [contentType, viewMode]);

  // Fetch data when needed
  useEffect(() => {
    if (contentType === 'sessions') {
      fetchSessions(currentPage, itemsPerPage);
    } else {
      fetchEvents(currentPage, itemsPerPage);
    }
  }, [contentType, currentPage]);

  const mappedSessions = sessions.map((s) => ({
    ...s,
    id: s._id || (s as any).id,
    _id: s._id || (s as any).id,
    date: s.startDate ? formatDisplayDate(s.startDate) : 'Date not specified',
    venue: (s as any).venue || 'N/A',
    visibility: (s as any).visibility || 'public',
    status: calculateStatus(s.startDate as string, s.endDate as string),
  })) as any[];
  const mappedEvents = events.map((e) => ({
    ...e,
    id: e._id || (e as any).id,
    _id: e._id || (e as any).id,
    date: e.eventDate ? formatDisplayDate(e.eventDate) : 'Date not specified',
    venue: (e as any).venue || 'N/A',
    visibility: (e as any).visibility || 'public',
    status: calculateStatus(e.eventDate as string, e.eventDate as string),
  })) as any[];

  const items: any[] = contentType === 'sessions' ? mappedSessions : mappedEvents;
  const totalCount = contentType === 'sessions' ? sessionsTotalCount : eventsTotalCount;
  const totalPages = Math.ceil((typeof totalCount === 'number' ? totalCount : 0) / itemsPerPage);

  const handleBack = () => {
    if (currentStackIndex > 0) {
      const previousState = navigationStack[currentStackIndex - 1];
      setContentType(previousState.contentType);
      setViewMode(previousState.viewMode);
      setCurrentStackIndex(currentStackIndex - 1);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    if (contentType === 'sessions') {
      await deleteSession(deleteId);
      await fetchSessions(currentPage, itemsPerPage);
    } else {
      await deleteEvent(deleteId);
      await fetchEvents(currentPage, itemsPerPage);
    }
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleEdit = (item: Session | Event) => {
    setEditingItem(item);
    if ('sessionTitle' in item) {
      setShowCreateModal(true);
    } else {
      setShowEventModal(true);
    }
  };

  const handleSessionSubmit = async (data: Partial<Session>) => {
    try {
      if (editingItem && 'sessionTitle' in editingItem) {
        await editSession(editingItem._id as string, data);
      } else {
        await addSession(data);
      }
      await fetchSessions(currentPage, itemsPerPage);
    } catch (err) {
      console.error(err);
    }
    setShowCreateModal(false);
    setEditingItem(null);
  };

  const handleEventSubmit = async (data: Partial<Event>) => {
    try {
      if (editingItem && 'eventTitle' in editingItem) {
        await editEvent(editingItem._id as string, data);
      } else {
        await addEvent(data);
      }
      await fetchEvents(currentPage, itemsPerPage);
    } catch (err) {
      console.error(err);
    }
    setShowEventModal(false);
    setEditingItem(null);
  };

  const canGoBack = currentStackIndex > 0;

  return (
    <div className="p-4 md:p-6 text-foreground bg-background min-h-screen transition-colors dark:bg-gray-900 dark:text-gray-100">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors
              ${canGoBack ? 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300' 
              : 'bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'}`}
            disabled={!canGoBack}
            aria-label="Go back"
          >
            <FiArrowLeft className="text-lg" />
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold dark:text-white">
              {contentType === 'sessions' ? 'Sessions' : 'Events'}
            </h1>
            <div className="relative">
              <select
                value={contentType}
                onChange={(e) => {
                  setContentType(e.target.value as 'sessions' | 'events');
                  setCurrentPage(1);
                }}
                className="appearance-none bg-background border border-border text-foreground rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-ring
                         dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="sessions">Sessions</option>
                <option value="events">Events</option>
              </select>
              <FiChevronDown className="absolute right-3 top-3 text-muted-foreground dark:text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <button
            onClick={() => {
              setEditingItem(null);
              contentType === 'sessions' ? setShowCreateModal(true) : setShowEventModal(true);
            }}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors
                     dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <FiPlus className="mr-2" />
            {contentType === 'sessions' ? 'Create Session' : 'Create Event'}
          </button>
        </div>
      </div>

      {/* Main View */}
      {loading ? (
        <div className="text-center text-muted-foreground dark:text-gray-400">Loading...</div>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {items.length > 0 ? (
            items.map((item) =>
              'sessionTitle' in item ? (
                <SessionItem
                  key={item._id}
                  item={item as any}
                  onEdit={handleEdit as any}
                  onDelete={handleDelete as any}
                  allowAttendance={item.status === 'ongoing'}
                />
              ) : (
                <EventItem
                  key={item._id}
                  item={item as any}
                  onEdit={handleEdit as any}
                  onDelete={handleDelete as any}
                />
              )
            )
          ) : (
            <div className="text-center text-muted-foreground dark:text-gray-400 py-8">
              No {contentType} found
            </div>
          )}
        </div>
      ) : contentType === 'sessions' ? (
        <SessionsTable
          {...{
            items: items as any[],
            contentType,
            onEdit: handleEdit as any,
            onDelete: handleDelete as any,
            date: items.length > 0 ? formatDisplayDate((items[0] as any).startDate) : '',
            className: "dark:bg-gray-800"
          } as any}
        />
      ) : (
        <EventTable
          {...{
            items: items as any,
            onEdit: handleEdit as any,
            onDelete: handleDelete as any,
            className: "dark:bg-gray-800"
          } as any}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          {...{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage,
            className: "dark:text-gray-300 dark:border-gray-700"
          } as any}
        />
      )}

      {/* Modals */}
      <CreateSessionModal
        {...{
          isOpen: showCreateModal,
          onClose: () => {
            setShowCreateModal(false);
            setEditingItem(null);
          },
          onSubmit: handleSessionSubmit,
          editingItem: editingItem as any,
          overlayClassName: "dark:bg-gray-900/80",
          contentClassName: "dark:bg-gray-800"
        } as any}
      />

      <CreateEventModal
        {...{
          isOpen: showEventModal,
          onClose: () => {
            setShowEventModal(false);
            setEditingItem(null);
          },
          onSubmit: handleEventSubmit,
          editingItem: editingItem as any,
          overlayClassName: "dark:bg-gray-900/80",
          contentClassName: "dark:bg-gray-800"
        } as any}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm dark:bg-black/50"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md z-10">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Confirm Deletion</h2>
            <p className="mb-6 dark:text-gray-200">Are you sure you want to delete this item?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border rounded dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SessionsPage;