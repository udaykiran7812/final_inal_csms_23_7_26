import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { HealthScoreModal, ScoreEvent } from '../../components/HealthScoreModal';
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
  TrendingUp,
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl">
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
    if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
    if (score >= 75) return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
    return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise IT Service Management HQ</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time SLA tracking, department health scores, and staff performance analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {stats.totalTickets > 0 && (
            <button
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
              className="flex items-center space-x-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-lg border border-red-200 shadow-xs transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Tickets ({stats.totalTickets})</span>
            </button>
          )}
          <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold">
            <Clock className="w-4 h-4" />
            <span>Avg Resolution Time: {stats.averageResolutionTimeHours} hrs</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Row 1 (INTERACTIVE - Click to Navigate) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div
          onClick={() => navigate('/admin/users')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Users</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.totalUsers}</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/staff')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Staff</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.totalStaff}</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/departments')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Departments</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.totalDepartments}</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/departments')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <GitMerge className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sub-Depts</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.totalSubDepartments}</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/tickets')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4 cursor-pointer hover:border-amber-300 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tickets</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.totalTickets}</p>
          </div>
        </div>
      </div>

      {/* Ticket Status Cards Row 2 (INTERACTIVE - Click to Navigate) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/admin/tickets?status=OPEN')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Open Tickets</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.openTickets}</p>
            <p className="text-[11px] text-indigo-500 font-medium mt-1">Click to view open tickets →</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            {stats.totalTickets > 0 ? Math.round((stats.openTickets / stats.totalTickets) * 100) : 0}%
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/tickets?status=PENDING')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Tickets</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingTickets}</p>
            <p className="text-[11px] text-amber-500 font-medium mt-1">Click to view pending list →</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-sm group-hover:bg-amber-600 group-hover:text-white transition-colors">
            {stats.totalTickets > 0 ? Math.round((stats.pendingTickets / stats.totalTickets) * 100) : 0}%
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/tickets?status=RESOLVED')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resolved Tickets</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.completedTickets}</p>
            <p className="text-[11px] text-emerald-500 font-medium mt-1">Click to view resolved list →</p>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/tickets?slaBreached=true')}
          className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-red-500 shadow-xs flex items-center justify-between cursor-pointer hover:border-red-400 hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">SLA Breaches</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.slaBreaches}</p>
            <p className="text-[11px] text-red-500 font-medium mt-1">Click to view breached list →</p>
          </div>
          <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* System Infrastructure Card */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-base tracking-wide">Enterprise Infrastructure & System Performance</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Status: HEALTHY</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-800">
            <p className="text-[11px] text-slate-400 font-medium uppercase">API Throughput</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">99.94%</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Response Time &lt; 45ms</p>
          </div>
          <div
            onClick={() => navigate('/admin/tickets?slaBreached=true')}
            className="p-3 bg-slate-800/60 rounded-lg border border-slate-800 cursor-pointer hover:border-indigo-500 transition-colors"
          >
            <p className="text-[11px] text-slate-400 font-medium uppercase">Active SLA Compliance</p>
            <p className="text-xl font-bold text-indigo-400 mt-1">
              {stats.totalTickets > 0 ? Math.round(((stats.totalTickets - stats.slaBreaches) / stats.totalTickets) * 100) : 100}%
            </p>
            <p className="text-[10px] text-indigo-300 mt-0.5 font-medium">{stats.slaBreaches} total breaches (Click to view)</p>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-800">
            <p className="text-[11px] text-slate-400 font-medium uppercase">Database Connection Pool</p>
            <p className="text-xl font-bold text-purple-400 mt-1">10 / 10 Active</p>
            <p className="text-[10px] text-slate-500 mt-0.5">MySQL HikariCP pool</p>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-800">
            <p className="text-[11px] text-slate-400 font-medium uppercase">System Engine Status</p>
            <p className="text-xl font-bold text-blue-400 mt-1">SLA Scheduler Active</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Runs every 60s</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Department Performance Breakdown</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.departmentPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="departmentName" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalTickets" fill="#6366f1" name="Total Tickets" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolvedTickets" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} />
                <Bar dataKey="slaBreachedTickets" fill="#ef4444" name="SLA Breached" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Status Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Ticket Status Distribution</h2>
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
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Health Score & Compliance Overview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Department Health Scores & Transparent Audit</h3>
            <p className="text-xs text-slate-500">Every department starts at 100%. Click any score to view transparent point calculations.</p>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 font-semibold">
            <Award className="w-4 h-4" />
            <span>Explainable Scoring Engine</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                <th className="px-6 py-3">Department Name</th>
                <th className="px-6 py-3">Department Health Score</th>
                <th className="px-6 py-3">Total Tickets</th>
                <th className="px-6 py-3">Open / Active</th>
                <th className="px-6 py-3">Resolved</th>
                <th className="px-6 py-3">SLA Breaches</th>
                <th className="px-6 py-3">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(stats.departmentPerformance || []).map((dept) => {
                const score = dept.healthScore !== undefined ? dept.healthScore : 100;
                return (
                  <tr key={dept.departmentName} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{dept.departmentName}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openAuditModal(`${dept.departmentName} Department`, score, dept.scoreBreakdown)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer flex items-center space-x-1.5 ${getScoreBadgeClass(score)}`}
                        title="Click to view transparent point calculation breakdown"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{score}% Score</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{dept.totalTickets}</td>
                    <td className="px-6 py-4 text-indigo-600 font-medium">{dept.openTickets}</td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">{dept.resolvedTickets}</td>
                    <td className="px-6 py-4 text-red-600 font-medium">{dept.slaBreachedTickets}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
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
                        <span className="font-bold text-xs text-slate-700">{dept.slaCompliancePercentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Performance & Workload Section with Explainable Scores */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Staff Performance Scores & Achievement Directory</h3>
            <p className="text-xs text-slate-500">Track personal scores (0-100%), rankings, and achievement badges per engineer</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="border border-slate-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="ALL">All Departments</option>
                {uniqueDepartments.map((d) => (
                  <option key={String(d)} value={String(d)}>
                    {String(d)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                <th className="px-6 py-3">Rank</th>
                <th className="px-6 py-3">Staff Engineer</th>
                <th className="px-6 py-3">Performance Score</th>
                <th className="px-6 py-3">Badges & Honors</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Assigned / Resolved</th>
                <th className="px-6 py-3">SLA Breaches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStaffPerformance.length > 0 ? (
                filteredStaffPerformance.map((staff) => {
                  const score = staff.healthScore !== undefined ? staff.healthScore : 100;
                  return (
                    <tr key={staff.staffId} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-extrabold text-xs flex items-center justify-center border border-slate-200">
                          #{staff.rank || 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{staff.staffName}</p>
                        <p className="text-xs text-slate-400">{staff.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openAuditModal(`${staff.staffName}`, score, staff.scoreBreakdown)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer flex items-center space-x-1.5 ${getScoreBadgeClass(score)}`}
                          title="Click to view transparent point calculation breakdown"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{score}% Score</span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(staff.achievementBadges || []).length > 0 ? (
                            (staff.achievementBadges || []).map((badge: string, bIdx: number) => (
                              <span
                                key={bIdx}
                                className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[11px] font-semibold"
                              >
                                {badge}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">Standard</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{staff.departmentName}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        <span className="text-indigo-600">{staff.assignedTickets}</span> /{' '}
                        <span className="text-emerald-600">{staff.resolvedTickets}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-semibold ${
                            staff.slaBreaches > 0 ? 'text-red-600' : 'text-slate-400'
                          }`}
                        >
                          {staff.slaBreaches}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No staff members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
