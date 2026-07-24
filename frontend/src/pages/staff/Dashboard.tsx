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
import { Briefcase, CheckCircle, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 } 
  },
};

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
          LOW: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
          MEDIUM: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
          HIGH: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30',
          CRITICAL: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30 glow-red-pulse',
        };
        return (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${colors[val] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
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
          CREATED: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
          ASSIGNED: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30',
          ACCEPTED: 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-500/30',
          IN_PROGRESS: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
          PENDING_USER: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
          RESOLVED: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
          CLOSED: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        };
        return (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${colors[val] || 'bg-slate-100 dark:bg-slate-800'}`}>
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
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
        >
          Manage Ticket →
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Score Audit Log Modal */}
      <HealthScoreModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        score={modalScore}
        breakdown={modalBreakdown}
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Staff Workstation HQ</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor assigned service tasks, performance scores, and SLA compliance metrics.</p>
      </motion.div>

      {/* Personal Performance Score Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-xl"
      >
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-2xl shadow-lg glow-indigo">
            #{rank}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Personal Performance Index</span>
              <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-200 dark:border-emerald-500/40">
                Rank #{rank} in Dept
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">Engineer SLA & Quality Rating</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {badges.map((b, idx) => (
                <span key={idx} className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-lg text-xs font-semibold">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Score</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{personalScore}%</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openAuditModal('Personal Performance', personalScore, currentStaffPerf?.scoreBreakdown)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
          >
            <Award className="w-4 h-4" />
            <span>Audit Score Log</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Interactive Summary Cards Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/staff/my-tickets')}
          className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center space-x-4 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all group backdrop-blur-xl"
        >
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Assigned Tickets</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalCount}</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/staff/my-tickets?status=PENDING')}
          className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center space-x-4 cursor-pointer hover:border-amber-400 dark:hover:border-amber-500/50 transition-all group backdrop-blur-xl"
        >
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pending Tasks</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{pendingCount}</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/staff/my-tickets')}
          className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center space-x-4 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all group backdrop-blur-xl"
        >
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Completed Tickets</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{completedCount}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Tickets List */}
      <motion.div 
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 25 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Assigned Support Tasks</h2>
        <DataTable
          columns={columns}
          data={tickets}
          searchPlaceholder="Search by title, requester..."
          searchKeys={['title', 'userName', 'departmentName']}
        />
      </motion.div>
    </div>
  );
};
export default StaffDashboard;
