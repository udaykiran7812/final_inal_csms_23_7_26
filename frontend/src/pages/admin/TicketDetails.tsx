import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ticketService } from '../../services/ticketService';
import { historyService } from '../../services/historyService';
import { staffService } from '../../services/staffService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { ArrowLeft, Clock, User, Building, Tag, UserCheck, CheckSquare, Trash2, ShieldAlert } from 'lucide-react';
import { TicketStatus, TicketPriority } from '../../types';
import { TicketInteractions } from '../../components/TicketInteractions';

export const AdminTicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
  const navigate = useNavigate();

  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Fetch ticket details
  const { data: ticketRes, isLoading: ticketLoading, error: ticketError, refetch: refetchTicket } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketService.getById(ticketId),
    enabled: !isNaN(ticketId),
  });

  // Fetch ticket history
  const { data: historyRes, isLoading: historyLoading, error: historyError, refetch: refetchHistory } = useQuery({
    queryKey: ['ticketHistory', ticketId],
    queryFn: () => historyService.getByTicketId(ticketId),
    enabled: !isNaN(ticketId),
  });

  // Fetch staff list for assignment dropdown
  const { data: staffRes, isLoading: staffLoading } = useQuery({
    queryKey: ['staffListForAssign'],
    queryFn: () => staffService.getAll(),
  });

  if (ticketLoading || historyLoading || staffLoading) return <LoadingSpinner label="Loading ticket management control..." />;
  if (ticketError) {
    return (
      <ErrorMessage 
        message={(ticketError as any).response?.data?.message || ticketError.message} 
        onRetry={() => { refetchTicket(); refetchHistory(); }} 
      />
    );
  }

  const ticket = ticketRes?.data;
  const history = historyRes?.data || [];
  const staffMembers = staffRes?.data || [];

  if (!ticket) return <div className="text-center py-8 text-slate-500">Ticket not found.</div>;

  const handleUpdateStatus = async (status: TicketStatus) => {
    setActionError(null);
    setActionSuccess(null);
    setUpdating(true);
    try {
      await ticketService.updateStatus(ticketId, { status });
      setActionSuccess(`Status updated to ${status} successfully!`);
      refetchTicket();
      refetchHistory();
    } catch (err: any) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePriority = async (priority: TicketPriority) => {
    setActionError(null);
    setActionSuccess(null);
    setUpdating(true);
    try {
      await ticketService.updatePriority(ticketId, { priority });
      setActionSuccess(`Priority updated to ${priority} successfully!`);
      refetchTicket();
      refetchHistory();
    } catch (err: any) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Failed to update priority.');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignStaff = async (staffIdStr: string) => {
    if (!staffIdStr) return;
    setActionError(null);
    setActionSuccess(null);
    setUpdating(true);
    try {
      await ticketService.assignStaff(ticketId, { staffId: Number(staffIdStr) });
      setActionSuccess('Staff member assigned to ticket successfully!');
      refetchTicket();
      refetchHistory();
    } catch (err: any) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Failed to assign staff.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action is permanent.')) return;
    setActionError(null);
    setActionSuccess(null);
    setUpdating(true);
    try {
      await ticketService.delete(ticketId);
      alert('Ticket deleted successfully!');
      navigate('/admin/tickets');
    } catch (err: any) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Failed to delete ticket.');
      setUpdating(false);
    }
  };

  const priorityColors = {
    LOW: 'bg-green-50 text-green-700 border-green-200',
    MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    CRITICAL: 'bg-red-50 text-red-700 border-red-200',
  };

  const statusColors = {
    CREATED: 'bg-blue-50 text-blue-700 border-blue-200',
    ASSIGNED: 'bg-sky-50 text-sky-700 border-sky-200',
    ACCEPTED: 'bg-pink-50 text-pink-700 border-pink-200',
    IN_PROGRESS: 'bg-purple-50 text-purple-700 border-purple-200',
    PENDING_USER: 'bg-amber-50 text-amber-700 border-amber-200',
    RESOLVED: 'bg-green-50 text-green-700 border-green-200',
    CLOSED: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <div className="space-y-6">
      {/* Header Back & Delete */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/tickets"
          className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tickets</span>
        </Link>

        <button
          onClick={handleDeleteTicket}
          disabled={updating}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 text-red-600 hover:text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Ticket</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg">
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Details & Action Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Ticket #{ticket.id}
                </span>
                <h1 className="text-xl font-bold text-slate-800 mt-0.5">{ticket.title}</h1>
              </div>
              <div className="flex space-x-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${priorityColors[ticket.priority]}`}>
                  {ticket.priority} Priority
                </span>
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${statusColors[ticket.status]}`}>
                  {ticket.status}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-700">Description</h3>
              <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center space-x-3 text-slate-600">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Created By</p>
                  <p className="text-sm font-medium text-slate-700">{ticket.userName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-slate-600">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Department</p>
                  <p className="text-sm font-medium text-slate-700">
                    {ticket.departmentName}
                    {ticket.subDepartmentName && <span className="text-xs text-indigo-600 font-semibold ml-1.5">({ticket.subDepartmentName})</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-slate-600">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Category</p>
                  <p className="text-sm font-medium text-slate-700">{ticket.issueCategoryName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-slate-600">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Assigned Staff</p>
                  <p className="text-sm font-medium text-slate-700">
                    {ticket.assignedStaffName || <span className="text-slate-400 italic">Unassigned</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Control Center */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              <span>Admin Resolution Controls</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Assign Staff */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Assign Staff Member</label>
                <select
                  disabled={updating}
                  onChange={(e) => handleAssignStaff(e.target.value)}
                  defaultValue=""
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-indigo-500"
                >
                  <option value="" disabled>Assign personnel...</option>
                  {staffMembers.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.departmentName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Set Priority */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Set Ticket Priority</label>
                <select
                  disabled={updating}
                  value={ticket.priority}
                  onChange={(e) => handleUpdatePriority(e.target.value as TicketPriority)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-indigo-500"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              {/* Set Status */}
              <div className="sm:col-span-2 space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-700">Update Resolution Status</label>
                <div className="flex flex-wrap gap-2">
                  {(['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as TicketStatus[]).map((status) => (
                    <button
                      key={status}
                      disabled={updating || ticket.status === status}
                      onClick={() => handleUpdateStatus(status)}
                      className={`px-4 py-2 text-xs font-semibold border rounded-lg transition-all ${
                        ticket.status === status
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Log Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Clock className="w-5 h-5 text-slate-500" />
              <span>Ticket History</span>
            </h2>

            <div className="relative border-l border-slate-100 pl-4 space-y-6 ml-2 pt-2">
              {history.length > 0 ? (
                history.map((log) => (
                  <div key={log.id} className="relative">
                    <span className="absolute -left-[21px] top-1 bg-white border-2 border-indigo-600 rounded-full w-2.5 h-2.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{log.action}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">No history logged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Interactions section */}
      <TicketInteractions ticket={ticket} refetchTicket={refetchTicket} />
    </div>
  );
};
export default AdminTicketDetails;
