import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { DataTable } from '../../components/DataTable';
import { FileText, FolderOpen, CheckCircle, Ticket } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { email } = useAuth();

  // Fetch tickets for the authenticated student/faculty user
  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketService.getAll(),
  });

  if (isLoading) return <LoadingSpinner label="Fetching your tickets..." />;
  if (error) return <ErrorMessage message={(error as any).response?.data?.message || error.message} onRetry={refetch} />;

  const tickets = response?.data || [];

  const openCount = tickets.filter((t) => t.status === 'CREATED' || t.status === 'ASSIGNED' || t.status === 'ACCEPTED' || t.status === 'IN_PROGRESS' || t.status === 'PENDING_USER').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const totalCount = tickets.length;

  const columns = [
    { key: 'id', label: 'Ticket ID', sortable: true },
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
          <span className={`px-2 py-1 rounded text-xs font-semibold border ${colors[val] || 'bg-slate-50 text-slate-700'}`}>
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
          IN_PROGRESS: 'bg-purple-50 text-purple-700 border-purple-200',
          PENDING_USER: 'bg-amber-50 text-amber-700 border-amber-200',
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">User Support Portal</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and track your submitted support tickets.</p>
      </div>

      {/* Summary Cards (INTERACTIVE - Click to Navigate) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/user/my-tickets')}
          className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">My Tickets</p>
            <p className="text-2xl font-bold text-slate-800">{totalCount}</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/user/my-tickets?status=OPEN')}
          className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-yellow-300 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg group-hover:bg-yellow-600 group-hover:text-white transition-colors">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Open Tickets</p>
            <p className="text-2xl font-bold text-slate-800">{openCount}</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/user/my-tickets?status=RESOLVED')}
          className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Resolved Tickets</p>
            <p className="text-2xl font-bold text-slate-800">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Support Requests</h2>
          <Link
            to="/user/create-ticket"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
          >
            Create New Ticket
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={tickets}
          searchPlaceholder="Search tickets..."
          searchKeys={['title', 'departmentName', 'issueCategoryName']}
        />
      </div>
    </div>
  );
};
export default UserDashboard;
