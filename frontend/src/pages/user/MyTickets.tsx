import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { DataTable } from '../../components/DataTable';
import { Filter, X } from 'lucide-react';

export const MyTickets: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');

  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketService.getAll(),
  });

  if (isLoading) return <LoadingSpinner label="Loading tickets..." />;
  if (error) return <ErrorMessage message={(error as any).response?.data?.message || error.message} onRetry={refetch} />;

  const rawTickets = response?.data || [];

  const tickets = rawTickets.filter((t: any) => {
    if (statusFilter) {
      if (statusFilter === 'OPEN') {
        return t.status !== 'RESOLVED' && t.status !== 'CLOSED';
      } else if (statusFilter === 'PENDING') {
        return t.status === 'ASSIGNED' || t.status === 'ACCEPTED' || t.status === 'IN_PROGRESS' || t.status === 'PENDING_USER' || t.status === 'CREATED';
      } else if (statusFilter === 'RESOLVED') {
        return t.status === 'RESOLVED' || t.status === 'CLOSED';
      } else if (t.status !== statusFilter) {
        return false;
      }
    }
    return true;
  });

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'departmentName', label: 'Department', sortable: true },
    { key: 'issueCategoryName', label: 'Category', sortable: true },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (val: string) => {
        const colors: Record<string, string> = {
          LOW: 'bg-green-50 text-green-700 border-green-200',
          MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
          CRITICAL: 'bg-red-50 text-red-700 border-red-200',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-semibold border ${colors[val] || 'bg-slate-50'}`}>
            {val}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val: string) => {
        const colors: Record<string, string> = {
          CREATED: 'bg-blue-50 text-blue-700 border-blue-200',
          ASSIGNED: 'bg-sky-50 text-sky-700 border-sky-200',
          ACCEPTED: 'bg-pink-50 text-pink-700 border-pink-200',
          IN_PROGRESS: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          RESOLVED: 'bg-green-50 text-green-700 border-green-200',
          CLOSED: 'bg-slate-50 text-slate-700 border-slate-200',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-semibold border ${colors[val] || 'bg-slate-50'}`}>
            {val}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <Link
          to={`/user/tickets/${row.id}`}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-900 transition-colors"
        >
          View Details
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Support Tickets</h1>
          <p className="text-sm text-slate-500 mt-1">List of all support tickets you have submitted.</p>
        </div>
        <Link
          to="/user/create-ticket"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
        >
          Create New Ticket
        </Link>
      </div>

      {statusFilter && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900 font-medium">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>
              Filtered by Status: <strong className="font-bold">{statusFilter}</strong> ({tickets.length} of {rawTickets.length} tickets showing)
            </span>
          </div>
          <button
            onClick={() => setSearchParams({})}
            className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-indigo-100 border border-indigo-300 rounded-lg text-indigo-700 font-semibold transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filter</span>
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={tickets}
        searchPlaceholder="Search tickets by title, category..."
        searchKeys={['title', 'departmentName', 'issueCategoryName']}
      />
    </div>
  );
};
export default MyTickets;
