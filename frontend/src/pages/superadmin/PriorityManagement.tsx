import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { priorityService } from '../../services/priorityService';
import { useAuth } from '../../context/AuthContext';
import { PriorityResponse, CreatePriorityRequest } from '../../types';
import { Flag, Plus, Trash2, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';

const COLOR_OPTIONS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'slate'];

const colorClasses: Record<string, string> = {
  red: 'bg-red-100 text-red-700 border-red-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const PriorityManagement: React.FC = () => {
  const { role } = useAuth();
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState<PriorityResponse | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [name, setName] = useState('');
  const [displayColor, setDisplayColor] = useState('slate');

  const { data: priorityRes, isLoading } = useQuery({
    queryKey: ['priorities'],
    queryFn: () => priorityService.getAll(),
  });

  const priorities = priorityRes?.data || [];

  const handleOpenModal = (priority?: PriorityResponse) => {
    setStatusMsg(null);
    if (priority) {
      setEditingPriority(priority);
      setName(priority.name);
      setDisplayColor(priority.displayColor || 'slate');
    } else {
      setEditingPriority(null);
      setName('');
      setDisplayColor('slate');
    }
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data: CreatePriorityRequest) => {
      if (editingPriority) {
        return priorityService.update(editingPriority.id, data);
      }
      return priorityService.create(data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      setStatusMsg({ type: 'success', text: res.message || 'Priority saved successfully' });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setStatusMsg({ type: 'error', text: err?.response?.data?.message || err.message || 'Failed to save priority' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => priorityService.delete(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      setStatusMsg({ type: 'success', text: res.message || 'Priority deleted' });
    },
    onError: (err: any) => {
      setStatusMsg({ type: 'error', text: err?.response?.data?.message || err.message || 'Failed to delete priority' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ name: name.trim().toUpperCase(), displayColor });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Priority Configuration</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Priorities drive SLA selection and escalation timing across the whole platform. Only Super Admin may change these.
          </p>
        </div>
        {isSuperAdmin ? (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Priority</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-lg flex items-center space-x-1">
            <Flag className="w-4 h-4" />
            <span>Read-Only Mode (Super Admin modifies priorities)</span>
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

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="font-bold text-slate-900 text-base">Active Priorities</h2>
          <span className="text-xs text-slate-500 font-semibold">{priorities.length} Configured</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading priorities...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Display Color</th>
                  {isSuperAdmin && <th className="px-6 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {priorities.length > 0 ? (
                  priorities.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                            colorClasses[p.displayColor || 'slate'] || colorClasses.slate
                          }`}
                        >
                          {p.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600 capitalize">{p.displayColor || '—'}</td>
                      {isSuperAdmin && (
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenModal(p)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md"
                            title="Edit Priority"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this priority? Tickets and SLA rules referencing it may be affected.')) {
                                deleteMutation.mutate(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                            title="Delete Priority"
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
                      No priorities configured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingPriority ? 'Edit Priority' : 'Add Priority'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Priority Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. CRITICAL, HIGH, MEDIUM, LOW"
                  className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Display Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDisplayColor(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border capitalize transition ${
                        colorClasses[c]
                      } ${displayColor === c ? 'ring-2 ring-offset-1 ring-indigo-500' : 'opacity-60 hover:opacity-100'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Priority'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityManagement;
