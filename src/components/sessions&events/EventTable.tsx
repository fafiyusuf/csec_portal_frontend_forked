import { format, parse } from 'date-fns';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

type EventTableProps = {
  items: {
    status: 'planned' | 'ongoing' | 'ended';
    category: string;
    eventTitle: string;
    startDate?: string;
    endDate?: string;
    eventDate?: string;
    date?: string;
    visibility: 'public' | 'members';
    timeRemaining: string;
    venue: string;
    _id: string;
    groups: string[];
    startTime: string;
    endTime: string;
    division: string;
    attendance: string; 
  }[];
  onEdit: (item: EventTableProps['items'][number]) => void;
  onDelete: (id: string) => void;
};

// Helper to parse both 'YYYY-MM-DD' and 'YY/MM/DD'
const parseFlexibleDate = (dateString: string | undefined) => {
  if (!dateString) return null;
  let parsed: Date | null = null;
  try {
    parsed = parse(dateString, 'yyyy-MM-dd', new Date());
    if (isNaN(parsed.getTime())) {
      parsed = parse(dateString, 'yy/MM/dd', new Date());
    }
  } catch {
    parsed = null;
  }
  return parsed && !isNaN(parsed.getTime()) ? parsed : null;
};

const EventTable = ({ items, onEdit, onDelete }: EventTableProps) => {
  const statusColors = {
    planned: 'bg-yellow-50 text-yellow-400',
    ongoing: 'bg-blue-50 text-blue-400',
    ended: 'bg-red-50 text-red-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden dark:shadow-xl dark:border dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visibility</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item) => {
              // Try all possible date fields
              const dateToFormat = item.eventDate || item.startDate || item.date;
              const parsedDate = parseFlexibleDate(dateToFormat);
              const formattedDate = parsedDate ? format(parsedDate, 'MMM d, yyyy') : 'Date not specified';

              return (
                <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-sm dark:text-gray-200">
                    {formattedDate}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium dark:text-gray-100">{item.eventTitle}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm dark:text-gray-300">{item.division}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.visibility === 'public' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
                    }`}>
                      {item.visibility === 'public' ? 'Public' : 'Members'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[item.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap flex gap-2">
                    <button 
                      onClick={() => onEdit(item)}
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(item._id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventTable;