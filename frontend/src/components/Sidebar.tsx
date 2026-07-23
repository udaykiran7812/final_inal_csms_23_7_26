import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-400 flex flex-col z-20 h-screen sticky top-0">
      {/* Brand area */}
      <div className="h-16 px-6 border-b border-slate-800 flex items-center">
        <span className="font-bold text-white tracking-wide text-sm uppercase">Campus Portal</span>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'hover:bg-slate-800 hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer information */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-center">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Campus Service Portal</p>
      </div>
    </aside>
  );
};
