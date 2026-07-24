import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Contact, 
  Building2, 
  Tags, 
  UserCheck, 
  Ticket, 
  PlusCircle,
  ShieldCheck,
  Clock,
  Flag,
  AlarmClockOff,
  CalendarDays
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
  },
};

export const Sidebar: React.FC = () => {
  const { role } = useAuth();

  const superAdminLinks = [
    { to: '/super-admin/dashboard', label: 'Super Admin HQ', icon: ShieldCheck },
    { to: '/admin/dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/super-admin/users', label: 'User Management', icon: Users },
    { to: '/admin/staff', label: 'Staff Management', icon: Contact },
    { to: '/super-admin/departments', label: 'Departments & Subs', icon: Building2 },
    { to: '/admin/assets', label: 'Campus Assets', icon: CalendarDays },
    { to: '/super-admin/roles', label: 'Role Management', icon: UserCheck },
    { to: '/super-admin/sla', label: 'SLA Configuration', icon: Clock },
    { to: '/super-admin/priorities', label: 'Priority Configuration', icon: Flag },
    { to: '/super-admin/escalations', label: 'Escalation Rules', icon: AlarmClockOff },
    { to: '/super-admin/calendar', label: 'Working Hours & Holidays', icon: CalendarDays },
    { to: '/super-admin/audit-logs', label: 'System Audit Logs', icon: ShieldCheck },
    { to: '/admin/categories', label: 'Issue Categories', icon: Tags },
    { to: '/admin/tickets', label: 'All Tickets', icon: Ticket },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/staff', label: 'Staff', icon: Contact },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/assets', label: 'Campus Assets', icon: CalendarDays },
    { to: '/admin/categories', label: 'Categories', icon: Tags },
    { to: '/admin/roles', label: 'Roles', icon: UserCheck },
    { to: '/super-admin/sla', label: 'SLA Rules', icon: Clock },
    { to: '/admin/tickets', label: 'All Tickets', icon: Ticket },
  ];

  const departmentAdminLinks = [
    { to: '/department/dashboard', label: 'Dept Dashboard', icon: LayoutDashboard },
    { to: '/admin/staff', label: 'Dept Staff Roster', icon: Contact },
    { to: '/admin/assets', label: 'Dept Assets', icon: CalendarDays },
    { to: '/admin/tickets', label: 'Dept Tickets', icon: Ticket },
    { to: '/super-admin/sla', label: 'SLA Rules', icon: Clock },
  ];

  const staffLinks = [
    { to: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/staff/my-tickets', label: 'My Tickets', icon: Ticket },
  ];

  const userLinks = [
    { to: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/user/create-ticket', label: 'Create Ticket', icon: PlusCircle },
    { to: '/user/my-tickets', label: 'My Tickets', icon: Ticket },
  ];

  let links = userLinks;
  if (role === 'SUPER_ADMIN') {
    links = superAdminLinks;
  } else if (role === 'ADMIN') {
    links = adminLinks;
  } else if (role === 'DEPARTMENT_ADMIN') {
    links = departmentAdminLinks;
  } else if (role === 'STAFF') {
    links = staffLinks;
  }

  return (
    <aside className="w-64 bg-white/95 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex flex-col z-20 h-screen sticky top-0 backdrop-blur-xl shadow-xl transition-colors duration-300">
      {/* Brand area */}
      <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800/80 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <span className="font-bold text-slate-900 dark:text-white tracking-wider text-xs uppercase">Campus Service</span>
      </div>

      {/* Navigation links with staggered reveal & sliding active pill */}
      <motion.nav 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 p-4 space-y-1.5 overflow-y-auto"
      >
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <motion.div key={link.to} variants={itemVariants}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `relative flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white font-semibold shadow-lg'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-pill"
                        className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30 -z-10"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 relative z-10 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    </motion.div>
                    <span className="relative z-10">{link.label}</span>
                  </>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </motion.nav>

      {/* Footer information */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60 text-center">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Campus Service Portal</p>
      </div>
    </aside>
  );
};

export default Sidebar;
