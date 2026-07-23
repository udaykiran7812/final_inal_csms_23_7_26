import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { DataTable } from '../../components/DataTable';
import { Plus, Trash2, Filter, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminTickets: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useAuth();
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdminOrSuperAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';

  const statusFilter = searchParams.get('status');
  const slaBreachedFilter = searchParams.get('slaBreached');
  const priorityFilter = searchParams.get('priority');
  const assignedFilter = searchParams.get('assigned');

  const [deleting, setDeleting] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['adminTicketsListAll'],
    queryFn: () => ticketService.getAll(),
  });

  if (isLoading) return <LoadingSpinner label="Loading tickets list..." />;
  if (error) return <ErrorMessage message={(error as any).response?.data?.message || error.message} onRetry={refetch} />;

  const rawTickets = response?.data || [];

  // Apply URL Pre-filters automatically
  const tickets = rawTickets.filter((t: any) => {
    if (statusFilter) {
      if (statusFilter === 'OPEN') {
        const isClosed = t.status === 'RESOLVED' || t.status === 'CLOSED';
        if (isClosed) return false;
      } else if (statusFilter === 'PENDING') {
        const isPending = t.status === 'ASSIGNED' || t.status === 'ACCEPTED' || t.status === 'IN_PROGRESS' || t.status === 'PENDING_USER' || t.status === 'CREATED';
        if (!isPending) return false;
      } else if (statusFilter === 'RESOLVED') {
        const isResolved = t.status === 'RESOLVED' || t.status === 'CLOSED';
        if (!isResolved) return false;
      } else if (t.status !== statusFilter) {
        return false;
      }
    }
    if (slaBreachedFilter === 'true' && !t.slaBreached) {
      return false;
    }
    if (priorityFilter && t.priority !== priorityFilter) {
      return false;
    }
    if (assignedFilter === 'true' && !t.assignedStaffName) {
      return false;
    }
    return true;
  });

  const clearFilters = () => {
    setSearchParams({});
  };

  const handleDeleteTicket = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete Ticket #${id} ("${title}")? This will remove it from all role portals.`)) {
      return;
    }
    setDeleting(true);
    setActionMsg(null);
    try {
      await ticketService.delete(id);
      setActionMsg(`Ticket #${id} deleted successfully.`);
      queryClient.invalidateQueries({ queryKey: ['adminTicketsListAll'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminStats'] });
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete ticket.');
    } finally {
      setDeleting(false);
    }
  };

  const handleClearAllTickets = async () => {
    if (!window.confirm(`🚨 DANGER: Are you sure you want to PERMANENTLY clear ALL ${rawTickets.length} tickets from the system?\n\nThis will remove all active tickets across all user, staff, and admin portals.`)) {
      return;
    }
    setDeleting(true);
    setActionMsg(null);
    try {
      await ticketService.clearAll();
      setActionMsg('All tickets cleared successfully!');
      queryClient.invalidateQueries({ queryKey: ['adminTicketsListAll'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminStats'] });
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to clear all tickets.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'id', label: 'Ticket ID', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'userName', label: 'Requested By', sortable: true },
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
        <div className="flex items-center space-x-3">
          <Link
            to={`/admin/tickets/${row.id}`}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-900 transition-colors"
          >
            Manage Details
          </Link>
          {isAdminOrSuperAdmin && (
            <button
              disabled={deleting}
              onClick={() => handleDeleteTicket(row.id, row.title)}
              title="Delete Ticket"
              className="p-1 text-slate-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const hasActiveFilter = statusFilter || slaBreachedFilter || priorityFilter || assignedFilter;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Support Tickets</h1>
          <p className="text-sm text-slate-500 mt-1">Review, assign, resolve, and manage all campus service requests.</p>
        </div>
        <div className="flex items-center space-x-2">
          {isSuperAdmin && rawTickets.length > 0 && (
            <button
              disabled={deleting}
              onClick={handleClearAllTickets}
              className="flex items-center space-x-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-lg border border-red-200 shadow-xs transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Tickets ({rawTickets.length})</span>
            </button>
          )}
          <Link
            to="/user/create-ticket"
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </Link>
        </div>
      </div>

      {hasActiveFilter && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900 font-medium">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>
              Active Filter:{' '}
              <strong className="font-bold">
                {statusFilter && `Status: ${statusFilter} `}
                {slaBreachedFilter && `SLA Breaches Only `}
                {priorityFilter && `Priority: ${priorityFilter} `}
                {assignedFilter && `Assigned Tickets `}
              </strong>
              ({tickets.length} of {rawTickets.length} tickets showing)
            </span>
          </div>
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-indigo-100 border border-indigo-300 rounded-lg text-indigo-700 font-semibold transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filter</span>
          </button>
        </div>
      )}

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-medium">
          {actionMsg}
        </div>
      )}

      <DataTable
        columns={columns}
        data={tickets}
        searchPlaceholder="Search tickets..."
        searchKeys={['title', 'userName', 'departmentName', 'issueCategoryName']}
      />
    </div>
  );
};
export default AdminTickets;
