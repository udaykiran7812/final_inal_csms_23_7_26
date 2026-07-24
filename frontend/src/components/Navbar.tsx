import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, ShieldAlert, Bell, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const { email, role, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: notifRes } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getMyNotifications(),
    refetchInterval: 15000, // Poll every 15s to keep it real-time
  });

  const readMutation = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = notifRes?.data || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm transition-colors duration-300">
      <div className="flex items-center space-x-3">
        <motion.div 
          whileHover={{ rotate: 15 }}
          className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-600/30"
        >
          <ShieldAlert className="w-5 h-5" />
        </motion.div>
        <span className="font-bold text-slate-800 dark:text-white text-lg tracking-tight hidden sm:inline-block">Campus Service Portal</span>
        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg sm:hidden">CSMS</span>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Theme Toggle Icon (Dark / Light mode switcher) */}
        <ThemeToggle />

        {/* Notification dropdown */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 rounded-full relative transition-all border border-slate-200 dark:border-slate-700/50"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse glow-indigo" />
            )}
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-55 max-h-96 overflow-y-auto"
              >
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">Notifications ({unreadCount} unread)</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${!n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''}`}>
                        <div className="flex items-start justify-between space-x-2">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{n.message}</p>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-1">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {!n.isRead && (
                            <button
                              onClick={() => readMutation.mutate(n.id)}
                              className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 text-indigo-600 dark:text-indigo-400 rounded transition-colors"
                              title="Mark as Read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                      Inbox is empty.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Info */}
        <div className="flex items-center space-x-3 text-right">
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{email}</p>
            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{role}</p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 p-2 rounded-xl text-indigo-600 dark:text-indigo-400 shadow-sm">
            <User className="w-4 h-4" />
          </div>
        </div>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-500/50 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-medium rounded-xl transition-all shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </div>
    </header>
  );
};
export default Navbar;
