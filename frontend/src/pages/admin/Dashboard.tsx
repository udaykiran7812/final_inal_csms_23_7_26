import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { HealthScoreModal, ScoreEvent } from '../../components/HealthScoreModal';
import { Users, Building2, Ticket, AlertTriangle, Clock, CheckCircle, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

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

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Score Modal state
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
    queryKey: ['adminDashboardStats'],
    queryFn: () => reportService.getDashboardStats(),
  });

  if (isLoading) return <LoadingSpinner label="Compiling system stats..." />;
  if (error) {
    return (
      <ErrorMessage 
        message="An error occurred while compiling system metrics. Please ensure you are logged in as an ADMIN/SUPER_ADMIN." 
      />
    );
  }

  const stats = statsRes?.data;
  if (!stats) return null;

  // Process department statistics for chart
  const deptChartData = Object.entries(stats.ticketsByDepartment || {}).map(([name, count]) => ({
    name,
    tickets: count,
  }));

  // Process SLA Breach rates
  const slaChartData = Object.entries(stats.departmentSlaBreachRates || {}).map(([name, rate]) => ({
    name,
    rate,
  }));

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

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Admin Command Center</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">ITSM engine analytics, service level compliance rates, and department health metrics.</p>
      </motion.div>

      {/* Summary Cards Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5"
      >
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/users')}
          className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center space-x-4 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/50 transition-all group backdrop-blur-xl"
        >
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Users</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.totalUsers}</p>
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
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Departments</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.totalDepartments}</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/tickets')}
          className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center space-x-4 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all group backdrop-blur-xl"
        >
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Tickets</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.totalTickets}</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/tickets?status=PENDING')}
          className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center space-x-4 cursor-pointer hover:border-amber-400 dark:hover:border-amber-500/50 transition-all group backdrop-blur-xl"
        >
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Tasks</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.pendingTickets}</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/tickets?slaBreached=true')}
          className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center space-x-4 cursor-pointer hover:border-red-400 dark:hover:border-red-500/50 transition-all group backdrop-blur-xl"
        >
          <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">SLA Breaches</p>
            <p className="text-xl font-black text-red-600 dark:text-red-400 mt-0.5">{stats.slaBreaches}</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/tickets?status=RESOLVED')}
          className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center space-x-4 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all group backdrop-blur-xl"
        >
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Avg Resolve</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.averageResolutionTimeHours} hrs</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Department Health Scores Table */}
      <motion.div 
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 25 }}
        viewport={{ once: true }}
        className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl"
      >
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">Department Health Scores & SLA Audit</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click any health score to view transparent deduction and bonus events.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Health Score</th>
                <th className="px-6 py-3.5">Total Tickets</th>
                <th className="px-6 py-3.5">Active</th>
                <th className="px-6 py-3.5">Resolved</th>
                <th className="px-6 py-3.5">SLA Breaches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
              {(stats.departmentPerformance || []).map((dept) => {
                const score = dept.healthScore !== undefined ? dept.healthScore : 100;
                return (
                  <tr key={dept.departmentName} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">{dept.departmentName}</td>
                    <td className="px-6 py-3.5">
                      <button
                        onClick={() => openAuditModal(`${dept.departmentName} Department`, score, dept.scoreBreakdown)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer inline-flex items-center space-x-1.5 ${getScoreBadgeClass(score)}`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{score}% Score</span>
                      </button>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">{dept.totalTickets}</td>
                    <td className="px-6 py-3.5 text-indigo-600 dark:text-indigo-400 font-semibold">{dept.openTickets}</td>
                    <td className="px-6 py-3.5 text-emerald-600 dark:text-emerald-400 font-semibold">{dept.resolvedTickets}</td>
                    <td className="px-6 py-3.5 text-red-600 dark:text-red-400 font-semibold">{dept.slaBreachedTickets}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Charts Sections */}
      <motion.div 
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 25 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Ticket distribution chart */}
        <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 backdrop-blur-xl">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Tickets by Department</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Comparing active service ticket volume.</p>
          </div>

          <div className="h-64 w-full">
            {deptChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} />
                  <Bar dataKey="tickets" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm italic">
                No department distribution data available.
              </div>
            )}
          </div>
        </div>

        {/* SLA Breach rate chart */}
        <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 backdrop-blur-xl">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Department SLA Breach Rate</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Compliance failure percentages across operating departments.</p>
          </div>

          <div className="h-64 w-full">
            {slaChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={slaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} />
                  <Bar dataKey="rate" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm italic">
                No SLA breach statistics available.
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default AdminDashboard;
