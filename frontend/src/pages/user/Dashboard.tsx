import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { DataTable } from '../../components/DataTable';
import { FolderOpen, CheckCircle, Ticket, Plus } from 'lucide-react';
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
          to={`/user/tickets/${row.id}`}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
        >
          View Details →
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">User Support Portal</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and track your submitted support tickets.</p>
      </motion.div>

      {/* Summary Cards */}
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
          onClick={() => navigate('/user/my-tickets')}
          className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center space-x-4 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all group backdrop-blur-xl"
        >
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">My Tickets</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalCount}</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/user/my-tickets?status=OPEN')}
          className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center space-x-4 cursor-pointer hover:border-amber-400 dark:hover:border-amber-500/50 transition-all group backdrop-blur-xl"
        >
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Open Tickets</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{openCount}</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/user/my-tickets?status=RESOLVED')}
          className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center space-x-4 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all group backdrop-blur-xl"
        >
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Resolved Tickets</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{resolvedCount}</p>
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Support Requests</h2>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/user/create-ticket"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Ticket</span>
            </Link>
          </motion.div>
        </div>

        <DataTable
          columns={columns}
          data={tickets}
          searchPlaceholder="Search tickets..."
          searchKeys={['title', 'departmentName', 'issueCategoryName']}
        />
      </motion.div>
    </div>
  );
};
export default UserDashboard;
