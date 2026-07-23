import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { DataTable } from '../../components/DataTable';
import { HealthScoreModal, ScoreEvent } from '../../components/HealthScoreModal';
import { Briefcase, CheckCircle, Clock, Award, TrendingUp, ShieldCheck } from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { email } = useAuth();

  // Audit log modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalScore, setModalScore] = useState(100);
  const [modalBreakdown, setModalBreakdown] = useState<ScoreEvent[]>([]);

  const openAuditModal = (title: string, score: number, breakdown: ScoreEvent[] = []) => {
    setModalTitle(title);
    setModalScore(score);
    setModalBreakdown(breakdown);
    setModalOpen(true);
  };

  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketService.getAll(),
  });

  const { data: statsRes } = useQuery({
    queryKey: ['staffDashboardStats'],
    queryFn: () => reportService.getDashboardStats(),
  });

  if (isLoading) return <LoadingSpinner label="Fetching assigned tickets..." />;
  if (error) return <ErrorMessage message={(error as any).response?.data?.message || error.message} onRetry={refetch} />;

  const tickets = response?.data || [];
  const stats = statsRes?.data;

  // Extract staff member's personal score data from report stats
  const staffPerfList = stats?.staffPerformance || [];
  const currentStaffPerf = staffPerfList.find((s) => s.email?.toLowerCase() === email?.toLowerCase()) || staffPerfList[0];

  const personalScore = currentStaffPerf?.healthScore !== undefined ? currentStaffPerf.healthScore : 100;
  const rank = currentStaffPerf?.rank || 1;
  const badges = currentStaffPerf?.achievementBadges || ['🌟 Top Performer', '🛡️ SLA Master'];

  const pendingCount = tickets.filter((t) => t.status === 'CREATED' || t.status === 'ASSIGNED' || t.status === 'ACCEPTED' || t.status === 'IN_PROGRESS' || t.status === 'PENDING_USER').length;
  const completedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const totalCount = tickets.length;

  const columns = [
    { key: 'id', label: 'Ticket ID', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'userName', label: 'Requested By', sortable: true },
    { key: 'departmentName', label: 'Department', sortable: true },
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
          to={`/staff/tickets/${row.id}`}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-900 transition-colors"
        >
          Manage Ticket
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Score Audit Log Modal */}
      <HealthScoreModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        score={modalScore}
        breakdown={modalBreakdown}
      />

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Staff Workstation HQ</h1>
        <p className="text-sm text-slate-500 mt-1">Monitor assigned service tasks, performance scores, and SLA compliance metrics.</p>
      </div>

      {/* Personal Performance Score Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-2xl">
            #{rank}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Personal Performance Index</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30">
                Rank #{rank} in Dept
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">Engineer SLA & Quality Rating</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {badges.map((b, idx) => (
                <span key={idx} className="px-2.5 py-0.5 bg-indigo-900/80 text-indigo-200 border border-indigo-700/50 rounded-md text-xs font-semibold">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Current Score</p>
            <p className="text-3xl font-black text-emerald-400 mt-0.5">{personalScore}%</p>
          </div>
          <button
            onClick={() => openAuditModal('Personal Performance', personalScore, currentStaffPerf?.scoreBreakdown)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
          >
            <Award className="w-4 h-4" />
            <span>Audit Score Log</span>
          </button>
        </div>
      </div>

      {/* Interactive Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/staff/my-tickets')}
          className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Tickets</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{totalCount}</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/staff/my-tickets?status=PENDING')}
          className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-amber-300 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Tasks</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{pendingCount}</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/staff/my-tickets')}
          className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed Tickets</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Assigned Support Tasks</h2>
        <DataTable
          columns={columns}
          data={tickets}
          searchPlaceholder="Search by title, requester..."
          searchKeys={['title', 'userName', 'departmentName']}
        />
      </div>
    </div>
  );
};
export default StaffDashboard;
