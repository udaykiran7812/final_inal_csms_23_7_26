import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { HealthScoreModal, ScoreEvent } from '../../components/HealthScoreModal';
import { Users, Building2, Ticket, AlertTriangle, Clock, CheckCircle, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

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

  // Process status distribution for pie chart
  const statusColors = {
    CREATED: '#3b82f6',
    ASSIGNED: '#6366f1',
    ACCEPTED: '#ec4899',
    IN_PROGRESS: '#8b5cf6',
    PENDING_USER: '#f59e0b',
    RESOLVED: '#10b981',
    CLOSED: '#64748b',
  };

  const statusChartData = Object.entries(stats.ticketsByStatus || {}).map(([name, count]) => ({
    name,
    value: count,
    color: statusColors[name as keyof typeof statusColors] || '#6366f1',
  }));

  // Process staff workload
  const workloadChartData = Object.entries(stats.staffWorkload || {}).map(([name, count]) => ({
    name,
    tickets: count,
  }));

  // Process SLA Breach rates
  const slaChartData = Object.entries(stats.departmentSlaBreachRates || {}).map(([name, rate]) => ({
    name,
    rate,
  }));

  const getScoreBadgeClass = (score: number) => {
    if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
    if (score >= 75) return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
    return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
  };

  return (
    <div className="space-y-8">
      {/* Explainability Audit Modal */}
      <HealthScoreModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        score={modalScore}
        breakdown={modalBreakdown}
      />

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Command Center</h1>
        <p className="text-sm text-slate-500 mt-1">ITSM engine analytics, service level compliance rates, and department health metrics.</p>
      </div>

      {/* Summary Cards Grid (INTERACTIVE - Click to Navigate) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
        <div
          onClick={() => navigate('/admin/users')}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.totalUsers}</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/departments')}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Departments</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.totalDepartments}</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/tickets')}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tickets</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.totalTickets}</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/tickets?status=PENDING')}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-amber-300 hover:shadow-md transition-all group"
        >
          <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-lg group-hover:bg-yellow-600 group-hover:text-white transition-colors">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Tasks</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.pendingTickets}</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/tickets?slaBreached=true')}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-red-300 hover:shadow-md transition-all group"
        >
          <div className="p-2.5 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SLA Breaches</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5 text-red-600">{stats.slaBreaches}</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/tickets?status=RESOLVED')}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <div className="p-2.5 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Resolve Time</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{stats.averageResolutionTimeHours} hrs</p>
          </div>
        </div>
      </div>

      {/* Department Health Scores Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Department Health Scores & SLA Audit</h3>
            <p className="text-xs text-slate-400">Click any health score to view transparent deduction and bonus events.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-semibold tracking-wider">
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Health Score</th>
                <th className="px-6 py-3">Total Tickets</th>
                <th className="px-6 py-3">Active</th>
                <th className="px-6 py-3">Resolved</th>
                <th className="px-6 py-3">SLA Breaches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(stats.departmentPerformance || []).map((dept) => {
                const score = dept.healthScore !== undefined ? dept.healthScore : 100;
                return (
                  <tr key={dept.departmentName} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 font-semibold text-slate-900">{dept.departmentName}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => openAuditModal(`${dept.departmentName} Department`, score, dept.scoreBreakdown)}
                        className={`px-2.5 py-1 rounded text-xs font-extrabold border transition-all cursor-pointer inline-flex items-center space-x-1 ${getScoreBadgeClass(score)}`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{score}% Score</span>
                      </button>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{dept.totalTickets}</td>
                    <td className="px-6 py-3 text-indigo-600 font-medium">{dept.openTickets}</td>
                    <td className="px-6 py-3 text-emerald-600 font-medium">{dept.resolvedTickets}</td>
                    <td className="px-6 py-3 text-red-600 font-medium">{dept.slaBreachedTickets}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Ticket distribution chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Tickets by Department</h3>
            <p className="text-xs text-slate-400">Comparing active service ticket volume.</p>
          </div>

          <div className="h-64 w-full">
            {deptChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="tickets" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                No department distribution data available.
              </div>
            )}
          </div>
        </div>

        {/* SLA Breach rate chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Department SLA Breach Rate</h3>
            <p className="text-xs text-slate-400">Compliance failure percentages across operating departments.</p>
          </div>

          <div className="h-64 w-full">
            {slaChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={slaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                No SLA breach statistics available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
