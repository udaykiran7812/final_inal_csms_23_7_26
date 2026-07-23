import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { escalationService } from '../../services/escalationService';
import { slaService } from '../../services/slaService';
import { useAuth } from '../../context/AuthContext';
import { EscalationRuleResponse, CreateEscalationRuleRequest } from '../../types';
import { AlarmClockOff, Plus, Trash2, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';

const NOTIFY_ROLES = ['DEPARTMENT_ADMIN', 'ADMIN', 'SUPER_ADMIN'];

const roleBadgeClasses: Record<string, string> = {
  DEPARTMENT_ADMIN: 'bg-blue-100 text-blue-700 border-blue-200',
  ADMIN: 'bg-orange-100 text-orange-700 border-orange-200',
  SUPER_ADMIN: 'bg-red-100 text-red-700 border-red-200',
};

export const EscalationManagement: React.FC = () => {
  const { role } = useAuth();
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<EscalationRuleResponse | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [slaRuleId, setSlaRuleId] = useState<number | ''>('');
  const [triggerAfterMinutes, setTriggerAfterMinutes] = useState<number>(30);
  const [escalationLevel, setEscalationLevel] = useState<number>(1);
  const [notifyRole, setNotifyRole] = useState('DEPARTMENT_ADMIN');

  const { data: rulesRes, isLoading } = useQuery({
    queryKey: ['escalationRules'],
    queryFn: () => escalationService.getAll(),
  });

  const { data: slaRes } = useQuery({
    queryKey: ['slaRules'],
    queryFn: () => slaService.getAll(),
  });

  const escalationRules = rulesRes?.data || [];
  const slaRules = slaRes?.data || [];

  const handleOpenModal = (rule?: EscalationRuleResponse) => {
    setStatusMsg(null);
    if (rule) {
      setEditingRule(rule);
      setSlaRuleId(rule.slaRuleId);
      setTriggerAfterMinutes(rule.triggerAfterMinutes);
      setEscalationLevel(rule.escalationLevel);
      setNotifyRole(rule.notifyRole);
    } else {
      setEditingRule(null);
      setSlaRuleId(slaRules[0]?.id ?? '');
      setTriggerAfterMinutes(30);
      setEscalationLevel(1);
      setNotifyRole('DEPARTMENT_ADMIN');
    }
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data: CreateEscalationRuleRequest) => {
      if (editingRule) {
        return escalationService.update(editingRule.id, data);
      }
      return escalationService.create(data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['escalationRules'] });
      setStatusMsg({ type: 'success', text: res.message || 'Escalation rule saved successfully' });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setStatusMsg({ type: 'error', text: err?.response?.data?.message || err.message || 'Failed to save escalation rule' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => escalationService.delete(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['escalationRules'] });
      setStatusMsg({ type: 'success', text: res.message || 'Escalation rule deleted' });
    },
    onError: (err: any) => {
      setStatusMsg({ type: 'error', text: err?.response?.data?.message || err.message || 'Failed to delete escalation rule' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slaRuleId) return;
    saveMutation.mutate({
      slaRuleId: Number(slaRuleId),
      triggerAfterMinutes: Number(triggerAfterMinutes),
      escalationLevel: Number(escalationLevel),
      notifyRole,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Escalation Rules</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure who gets notified, and how many minutes past an SLA breach, before a ticket escalates further. Super Admin only.
          </p>
        </div>
        {isSuperAdmin ? (
          <button
            onClick={() => handleOpenModal()}
            disabled={slaRules.length === 0}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Escalation Rule</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-lg flex items-center space-x-1">
            <AlarmClockOff className="w-4 h-4" />
            <span>Read-Only Mode (Super Admin modifies escalation rules)</span>
          </div>
        )}
      </div>

      {isSuperAdmin && slaRules.length === 0 && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          No SLA rules exist yet. Configure at least one SLA rule first, then attach escalation levels to it here.
        </div>
      )}

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
          <h2 className="font-bold text-slate-900 text-base">Active Escalation Rules</h2>
          <span className="text-xs text-slate-500 font-semibold">{escalationRules.length} Configured</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading escalation rules...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="px-6 py-3">SLA Rule</th>
                  <th className="px-6 py-3">Level</th>
                  <th className="px-6 py-3">Triggers After</th>
                  <th className="px-6 py-3">Notifies</th>
                  {isSuperAdmin && <th className="px-6 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {escalationRules.length > 0 ? (
                  escalationRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">{rule.priorityName || '—'}</span>
                        <span className="block text-xs text-slate-500">{rule.slaUserRole || 'ALL'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                          {rule.escalationLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{rule.triggerAfterMinutes} mins overdue</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                            roleBadgeClasses[rule.notifyRole] || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {rule.notifyRole}
                        </span>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenModal(rule)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md"
                            title="Edit Escalation Rule"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this escalation rule?')) {
                                deleteMutation.mutate(rule.id);
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                            title="Delete Escalation Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No escalation rules configured yet.
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingRule ? 'Edit Escalation Rule' : 'Add Escalation Rule'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  SLA Rule *
                </label>
                <select
                  value={slaRuleId}
                  onChange={(e) => setSlaRuleId(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select an SLA rule</option>
                  {slaRules.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.priorityName} · {r.userRole} · {r.departmentName || 'All Depts'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Escalation Level *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={escalationLevel}
                    onChange={(e) => setEscalationLevel(Number(e.target.value))}
                    required
                    className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">1, 2, 3 — increasing severity</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Trigger After (Minutes Overdue) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={triggerAfterMinutes}
                    onChange={(e) => setTriggerAfterMinutes(Number(e.target.value))}
                    required
                    className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Notify Role *
                </label>
                <select
                  value={notifyRole}
                  onChange={(e) => setNotifyRole(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {NOTIFY_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
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
                  {saveMutation.isPending ? 'Saving...' : 'Save Escalation Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscalationManagement;
