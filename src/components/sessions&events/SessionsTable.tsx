import { format, parse } from 'date-fns';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

type SessionItem = {
  id?: string;
  _id?: string;
  startDate?: string;
  endDate?: string;
  sessionTitle?: string;
  division?: string;
  category?: string;
  groups?: string[];
  status?: string;
};

type SessionsTableProps = {
  items: SessionItem[];
  contentType: 'sessions' | 'events';
  onEdit: (item: SessionItem & { startDate: string; sessionTitle: string }) => void;
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

const SessionsTable = ({ items, contentType, onEdit, onDelete }: SessionsTableProps) => {
  const statusColors: Record<string, string> = {
    planned: 'bg-yellow-50 text-yellow-400',
    ongoing: 'bg-blue-50 text-blue-400',
    ended: 'bg-red-50 text-red-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden dark:shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
              {contentType === 'sessions' ? (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Division</th>
              ) : (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
              )}
              {contentType === 'sessions' && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Groups</th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item) => {
              const key = item.id || item._id;
              const status = (item.status || 'planned').toLowerCase();
              const parsedDate = parseFlexibleDate(item.startDate);
              const formattedDate = parsedDate ? format(parsedDate, 'MMM d, yyyy') : 'Date not specified';

              return (
                <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-sm dark:text-gray-200">{formattedDate}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium dark:text-gray-100">{item.sessionTitle}</td>
                  {contentType === 'sessions' ? (
                    <td className="px-4 py-4 whitespace-nowrap text-sm dark:text-gray-300">{item.division}</td>
                  ) : (
                    <td className="px-4 py-4 whitespace-nowrap text-sm dark:text-gray-300">{item.category}</td>
                  )}
                  {contentType === 'sessions' && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm dark:text-gray-300">
                      {item.groups?.join(', ')}
                    </td>
                  )}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[status] || 'bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-200'
                    }`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap flex gap-2">
                    {item.startDate && item.sessionTitle && (
                      <button 
                        onClick={() => onEdit({ 
                          ...item, 
                          startDate: item.startDate as string, 
                          sessionTitle: item.sessionTitle as string 
                        })}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        <FiEdit2 size={18} />
                      </button>
                    )}
                    {key && (
                      <button 
                        onClick={() => onDelete(key)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    )}
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

export default SessionsTable;