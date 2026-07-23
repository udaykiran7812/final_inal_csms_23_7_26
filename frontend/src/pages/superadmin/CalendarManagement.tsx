import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarService } from '../../services/calendarService';
import { useAuth } from '../../context/AuthContext';
import {
  BusinessHoursResponse,
  CreateBusinessHoursRequest,
  HolidayResponse,
  CreateHolidayRequest,
} from '../../types';
import { CalendarDays, Clock3, Plus, Trash2, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

export const CalendarManagement: React.FC = () => {
  const { role } = useAuth();
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const queryClient = useQueryClient();

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Business hours modal state
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [editingHours, setEditingHours] = useState<BusinessHoursResponse | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  // Holiday modal state
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayResponse | null>(null);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayName, setHolidayName] = useState('');

  const { data: hoursRes, isLoading: hoursLoading } = useQuery({
    queryKey: ['businessHours'],
    queryFn: () => calendarService.getAllBusinessHours(),
  });

  const { data: holidaysRes, isLoading: holidaysLoading } = useQuery({
    queryKey: ['holidays'],
    queryFn: () => calendarService.getAllHolidays(),
  });

  const businessHours = hoursRes?.data || [];
  const holidays = holidaysRes?.data || [];

  // ----- Business Hours mutations -----
  const saveHoursMutation = useMutation({
    mutationFn: (data: CreateBusinessHoursRequest) => {
      if (editingHours) {
        return calendarService.updateBusinessHours(editingHours.id, data);
      }
      return calendarService.createBusinessHours(data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['businessHours'] });
      setStatusMsg({ type: 'success', text: res.message || 'Business hours saved' });
      setIsHoursModalOpen(false);
    },
    onError: (err: any) => {
      setStatusMsg({ type: 'error', text: err?.response?.data?.message || err.message || 'Failed to save business hours' });
    },
  });

  const deleteHoursMutation = useMutation({
    mutationFn: (id: number) => calendarService.deleteBusinessHours(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['businessHours'] });
      setStatusMsg({ type: 'success', text: res.message || 'Business hours removed' });
    },
    onError: (err: any) => {
      setStatusMsg({ type: 'error', text: err?.response?.data?.message || err.message || 'Failed to remove business hours' });
    },
  });

  // ----- Holiday mutations -----
  const saveHolidayMutation = useMutation({
    mutationFn: (data: CreateHolidayRequest) => {
      if (editingHoliday) {
        return calendarService.updateHoliday(editingHoliday.id, data);
      }
      return calendarService.createHoliday(data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      setStatusMsg({ type: 'success', text: res.message || 'Holiday saved' });
      setIsHolidayModalOpen(false);
    },
    onError: (err: any) => {
      setStatusMsg({ type: 'error', text: err?.response?.data?.message || err.message || 'Failed to save holiday' });
    },
  });

  const deleteHolidayMutation = useMutation({
    mutationFn: (id: number) => calendarService.deleteHoliday(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      setStatusMsg({ type: 'success', text: res.message || 'Holiday removed' });
    },
    onError: (err: any) => {
      setStatusMsg({ type: 'error', text: err?.response?.data?.message || err.message || 'Failed to remove holiday' });
    },
  });

  const handleOpenHoursModal = (hours?: BusinessHoursResponse) => {
    setStatusMsg(null);
    if (hours) {
      setEditingHours(hours);
      setDayOfWeek(hours.dayOfWeek);
      setStartTime(hours.startTime.slice(0, 5));
      setEndTime(hours.endTime.slice(0, 5));
    } else {
      setEditingHours(null);
      setDayOfWeek(1);
      setStartTime('09:00');
      setEndTime('17:00');
    }
    setIsHoursModalOpen(true);
  };

  const handleOpenHolidayModal = (holiday?: HolidayResponse) => {
    setStatusMsg(null);
    if (holiday) {
      setEditingHoliday(holiday);
      setHolidayDate(holiday.holidayDate);
      setHolidayName(holiday.name);
    } else {
      setEditingHoliday(null);
      setHolidayDate('');
      setHolidayName('');
    }
    setIsHolidayModalOpen(true);
  };

  const handleHoursSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveHoursMutation.mutate({ dayOfWeek, startTime: `${startTime}:00`, endTime: `${endTime}:00` });
  };

  const handleHolidaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveHolidayMutation.mutate({ holidayDate, name: holidayName });
  };

  const dayLabel = (value: number) => DAYS.find((d) => d.value === value)?.label || value;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Working Hours & Holiday Calendar</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            This calendar governs how SLA deadlines are counted — only Super Admin can configure it.
          </p>
        </div>
        {!isSuperAdmin && (
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-lg flex items-center space-x-1">
            <CalendarDays className="w-4 h-4" />
            <span>Read-Only Mode (Super Admin modifies calendar)</span>
          </div>
        )}
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-xs font-semibold uppercase tracking-wider">
            Dismiss
          </button>
        </div>
      )}

      {/* Business Hours */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Clock3 className="w-4 h-4 text-slate-500" />
            <h2 className="font-bold text-slate-900 text-base">Working Hours</h2>
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => handleOpenHoursModal()}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-3 py-2 rounded-lg shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Day</span>
            </button>
          )}
        </div>

        {hoursLoading ? (
          <div className="p-8 text-center text-slate-400">Loading working hours...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="px-6 py-3">Day</th>
                  <th className="px-6 py-3">Start</th>
                  <th className="px-6 py-3">End</th>
                  {isSuperAdmin && <th className="px-6 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {businessHours.length > 0 ? (
                  businessHours.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-4 font-medium text-slate-900">{h.dayName || dayLabel(h.dayOfWeek)}</td>
                      <td className="px-6 py-4 text-slate-600">{h.startTime.slice(0, 5)}</td>
                      <td className="px-6 py-4 text-slate-600">{h.endTime.slice(0, 5)}</td>
                      {isSuperAdmin && (
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenHoursModal(h)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Remove working hours for this day? SLA deadlines will fall back to 24/7 counting for that day.')) {
                                deleteHoursMutation.mutate(h.id);
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No working hours configured. SLA deadlines are currently counted 24/7.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Holidays */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            <h2 className="font-bold text-slate-900 text-base">Holidays</h2>
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => handleOpenHolidayModal()}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-3 py-2 rounded-lg shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Holiday</span>
            </button>
          )}
        </div>

        {holidaysLoading ? (
          <div className="p-8 text-center text-slate-400">Loading holidays...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Name</th>
                  {isSuperAdmin && <th className="px-6 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {holidays.length > 0 ? (
                  holidays.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-4 font-medium text-slate-900">{h.holidayDate}</td>
                      <td className="px-6 py-4 text-slate-600">{h.name}</td>
                      {isSuperAdmin && (
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenHolidayModal(h)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Remove this holiday?')) {
                                deleteHolidayMutation.mutate(h.id);
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      No holidays configured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Business Hours Modal */}
      {isHoursModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingHours ? 'Edit Working Hours' : 'Add Working Hours'}
              </h3>
              <button onClick={() => setIsHoursModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>
            <form onSubmit={handleHoursSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Day of Week *
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  required
                  className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsHoursModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveHoursMutation.isPending}
                  className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
                >
                  {saveHoursMutation.isPending ? 'Saving...' : 'Save Working Hours'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Holiday Modal */}
      {isHolidayModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">{editingHoliday ? 'Edit Holiday' : 'Add Holiday'}</h3>
              <button onClick={() => setIsHolidayModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>
            <form onSubmit={handleHolidaySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Holiday Name *
                </label>
                <input
                  type="text"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  required
                  placeholder="e.g. Independence Day"
                  className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsHolidayModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveHolidayMutation.isPending}
                  className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
                >
                  {saveHolidayMutation.isPending ? 'Saving...' : 'Save Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarManagement;
