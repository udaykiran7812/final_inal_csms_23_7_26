import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { HealthScoreModal, ScoreEvent } from '../../components/HealthScoreModal';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  Building2,
  GitMerge,
  Ticket,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Trash2,
  Award,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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

export const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Audit Log Modal State
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

  const { data: statsRes, isLoading, error } = useQuery({
    queryKey: ['superAdminStats'],
    queryFn: () => reportService.getDashboardStats(),
    refetchInterval: 30000,
  });

  const stats = statsRes?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-200 rounded-2xl shadow-xl">
        Failed to load Super Admin dashboard analytics.
      </div>
    );
  }

  // Chart colors
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const statusPieData = stats.ticketsByStatus
    ? Object.entries(stats.ticketsByStatus).map(([name, value]) => ({ name, value }))
    : [];

  const filteredStaffPerformance = (stats.staffPerformance || []).filter((staff) => {
    const matchesSearch =
      staff.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || staff.departmentName === deptFilter;
    return matchesSearch && matchesDept;
  });

  const uniqueDepartments = Array.from(
    new Set((stats.staffPerformance || []).map((s) => s.departmentName))
  );

  const getScoreBadgeClass = (score: number) => {
    if (score >= 90) return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/80';
    if (score >= 75) return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/40 hover:bg-amber-100 dark:hover:bg-amber-900/80';
    return 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/40 hover:bg-red-100 dark:hover:bg-red-900/80';
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Explainability Audit Modal */}
      <HealthScoreModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        score={modalScore}
        breakdown={modalBreakdown}
      />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Enterprise IT Service Management HQ</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time SLA tracking, department health scores, and staff performance analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {stats.totalTickets > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={async () => {
                if (!window.confirm(`🚨 DANGER: Are you sure you want to PERMANENTLY clear ALL ${stats.totalTickets} tickets?\n\nThis will remove all active tickets across all portals.`)) return;
                try {
                  const { ticketService } = await import('../../services/ticketService');
                  await ticketService.clearAll();
                  alert('All tickets cleared successfully!');
                  window.location.reload();
                } catch (err: any) {
                  alert(err.response?.data?.message || 'Failed to clear all tickets.');
                }
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/80 text-red-700 dark:text-red-300 font-semibold text-xs rounded-xl border border-red-200 dark:border-red-500/30 shadow-md transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Tickets ({stats.totalTickets})</span>
            </motion.button>
          )}
          <div className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Avg Resolution: {stats.averageResolutionTimeHours} hrs</span>
          </div>
        </div>
      </motion.div>

      {/* Metric Cards Row 1 */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/users')}
          className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center space-x-4 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/50 transition-all group backdrop-blur-xl"
        >
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Users</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.totalUsers}</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/staff')}
          className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center space-x-4 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all group backdrop-blur-xl"
        >
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Staff</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.totalStaff}</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/departments')}
          className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center space-x-4 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all group backdrop-blur-xl"
        >
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Departments</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.totalDepartments}</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/departments')}
          className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center space-x-4 cursor-pointer hover:border-purple-400 dark:hover:border-purple-500/50 transition-all group backdrop-blur-xl"
        >
          <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <GitMerge className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sub-Depts</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.totalSubDepartments}</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/tickets')}
          className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center space-x-4 cursor-pointer hover:border-amber-400 dark:hover:border-amber-500/50 transition-all group backdrop-blur-xl"
        >
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Tickets</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.totalTickets}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Ticket Status Cards Row 2 */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/tickets?status=OPEN')}
          className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all group backdrop-blur-xl"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Open Tickets</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.openTickets}</p>
            <p className="text-[11px] text-indigo-500 dark:text-indigo-300 font-medium mt-1">View open tickets →</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center font-extrabold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            {stats.totalTickets > 0 ? Math.round((stats.openTickets / stats.totalTickets) * 100) : 0}%
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/tickets?status=PENDING')}
          className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between cursor-pointer hover:border-amber-400 dark:hover:border-amber-500/50 transition-all group backdrop-blur-xl"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pending Tickets</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.pendingTickets}</p>
            <p className="text-[11px] text-amber-500 dark:text-amber-300 font-medium mt-1">View pending list →</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center font-extrabold text-sm group-hover:bg-amber-600 group-hover:text-white transition-colors">
            {stats.totalTickets > 0 ? Math.round((stats.pendingTickets / stats.totalTickets) * 100) : 0}%
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/tickets?status=RESOLVED')}
          className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all group backdrop-blur-xl"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Resolved Tickets</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.completedTickets}</p>
            <p className="text-[11px] text-emerald-500 dark:text-emerald-300 font-medium mt-1">View resolved list →</p>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/tickets?slaBreached=true')}
          className={`bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-red-500 shadow-xl flex items-center justify-between cursor-pointer hover:border-red-400 dark:hover:border-red-500/50 transition-all group backdrop-blur-xl ${
            stats.slaBreaches > 0 ? 'glow-red-pulse' : ''
          }`}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">SLA Breaches</p>
            <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{stats.slaBreaches}</p>
            <p className="text-[11px] text-red-500 dark:text-red-300 font-medium mt-1">View breached list →</p>
          </div>
          <div className="p-2.5 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </motion.div>
      </motion.div>

      {/* System Infrastructure Card */}
      <motion.div 
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        viewport={{ once: true }}
        className="bg-slate-900 text-white dark:bg-slate-900/95 p-6 rounded-2xl shadow-2xl border border-slate-800 space-y-4 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse glow-indigo" />
            <h3 className="font-extrabold text-base tracking-wide text-white">Enterprise Infrastructure & System Performance</h3>
          </div>
          <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/30">STATUS: HEALTHY</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">API Throughput</p>
            <p className="text-xl font-extrabold text-emerald-400 mt-1">99.94%</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Response Time &lt; 45ms</p>
          </div>
          <div
            onClick={() => navigate('/admin/tickets?slaBreached=true')}
            className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 cursor-pointer hover:border-indigo-500/50 transition-colors"
          >
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active SLA Compliance</p>
            <p className="text-xl font-extrabold text-indigo-400 mt-1">
              {stats.totalTickets > 0 ? Math.round(((stats.totalTickets - stats.slaBreaches) / stats.totalTickets) * 100) : 100}%
            </p>
            <p className="text-[10px] text-indigo-300 mt-0.5 font-medium">{stats.slaBreaches} total breaches (Click to view)</p>
          </div>
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Database Connection Pool</p>
            <p className="text-xl font-extrabold text-purple-400 mt-1">10 / 10 Active</p>
            <p className="text-[10px] text-slate-500 mt-0.5">MySQL HikariCP pool</p>
          </div>
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Engine Status</p>
            <p className="text-xl font-extrabold text-blue-400 mt-1">SLA Scheduler Active</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Runs every 60s</p>
          </div>
        </div>
      </motion.div>

      {/* Charts Section */}
      <motion.div 
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 25 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Department Performance Bar Chart */}
        <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Department Performance Breakdown</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.departmentPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.3} />
                <XAxis dataKey="departmentName" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} />
                <Legend />
                <Bar dataKey="totalTickets" fill="#6366f1" name="Total Tickets" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolvedTickets" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} />
                <Bar dataKey="slaBreachedTickets" fill="#ef4444" name="SLA Breached" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Status Pie Chart */}
        <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Ticket Status Distribution</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Department Health Score Overview */}
      <motion.div 
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 25 }}
        viewport={{ once: true }}
        className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl"
      >
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">Department Health Scores & Transparent Audit</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Every department starts at 100%. Click any score to view transparent point calculations.</p>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 font-semibold shadow-sm">
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Explainable Scoring Engine</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-3.5">Department Name</th>
                <th className="px-6 py-3.5">Department Health Score</th>
                <th className="px-6 py-3.5">Total Tickets</th>
                <th className="px-6 py-3.5">Open / Active</th>
                <th className="px-6 py-3.5">Resolved</th>
                <th className="px-6 py-3.5">SLA Breaches</th>
                <th className="px-6 py-3.5">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
              {(stats.departmentPerformance || []).map((dept) => {
                const score = dept.healthScore !== undefined ? dept.healthScore : 100;
                return (
                  <tr key={dept.departmentName} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{dept.departmentName}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openAuditModal(`${dept.departmentName} Department`, score, dept.scoreBreakdown)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center space-x-1.5 ${getScoreBadgeClass(score)}`}
                        title="Click to view transparent point calculation breakdown"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{score}% Score</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{dept.totalTickets}</td>
                    <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-semibold">{dept.openTickets}</td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-semibold">{dept.resolvedTickets}</td>
                    <td className="px-6 py-4 text-red-600 dark:text-red-400 font-semibold">{dept.slaBreachedTickets}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-300 dark:border-slate-800">
                          <div
                            className={`h-full ${
                              dept.slaCompliancePercentage >= 90
                                ? 'bg-emerald-500'
                                : dept.slaCompliancePercentage >= 75
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${dept.slaCompliancePercentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{dept.slaCompliancePercentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default SuperAdminDashboard;
