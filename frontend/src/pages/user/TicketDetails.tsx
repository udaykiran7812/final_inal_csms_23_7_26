import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ticketService } from '../../services/ticketService';
import { historyService } from '../../services/historyService';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { ArrowLeft, Clock, User, Building, Tag, UserCheck, AlertCircle } from 'lucide-react';
import { TicketInteractions } from '../../components/TicketInteractions';

export const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
  const { role } = useAuth();

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

  if (ticketLoading || historyLoading) return <LoadingSpinner label="Fetching ticket details..." />;
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

  if (!ticket) return <div className="text-center py-8 text-slate-500">Ticket not found.</div>;

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
      {/* Back button */}
      <div className="flex items-center space-x-2">
        <Link
          to={role === 'ADMIN' || role === 'SUPER_ADMIN' ? '/admin/tickets' : role === 'STAFF' ? '/staff/my-tickets' : '/user/dashboard'}
          className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Info Card */}
        <div className="lg:col-span-2 space-y-6">
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
                  <p className="text-sm font-medium text-slate-700">{ticket.departmentName}</p>
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
                    {/* Dot Indicator */}
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
export default TicketDetails;
