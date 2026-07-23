import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, ShieldAlert, Bell, Check, Trash } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';

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
    <header className="h-16 border-b border-slate-100 bg-white px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <span className="font-bold text-slate-800 text-lg hidden sm:inline-block">Campus Portal</span>
        <span className="font-bold text-indigo-600 text-lg sm:hidden">CSMS</span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notification dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full relative transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-55 max-h-96 overflow-y-auto">
              <div className="px-4 py-2 border-b border-slate-50 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">Notifications ({unreadCount} unread)</span>
              </div>
              <div className="divide-y divide-slate-50">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-4 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-indigo-50/20' : ''}`}>
                      <div className="flex items-start justify-between space-x-2">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{n.message}</p>
                          <span className="text-[9px] text-slate-400 block mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!n.isRead && (
                          <button
                            onClick={() => readMutation.mutate(n.id)}
                            className="p-1 hover:bg-slate-200 text-indigo-600 rounded transition-colors"
                            title="Mark as Read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 italic">
                    Inbox is empty.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info */}
        <div className="flex items-center space-x-2 text-right">
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-700">{email}</p>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{role}</p>
          </div>
          <div className="bg-slate-100 p-2 rounded-full text-slate-600">
            <User className="w-4 h-4" />
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs font-medium rounded-lg transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
export default Navbar;
