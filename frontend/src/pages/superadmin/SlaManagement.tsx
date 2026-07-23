import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { slaService } from '../../services/slaService';
import { departmentService } from '../../services/departmentService';
import { subDepartmentService } from '../../services/subDepartmentService';
import { useAuth } from '../../context/AuthContext';
import { SlaRuleResponse, CreateSlaRuleRequest } from '../../types';
import { Clock, Plus, Trash2, Edit2, ShieldAlert, CheckCircle2, Building2, GitMerge, AlertCircle } from 'lucide-react';

export const SlaManagement: React.FC = () => {
  const { role } = useAuth();
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<SlaRuleResponse | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [subDepartmentId, setSubDepartmentId] = useState<number | ''>('');
  const [priorityId, setPriorityId] = useState<number>(1);
  const [userRole, setUserRole] = useState('ALL');
  const [responseTime, setResponseTime] = useState<number>(30); // in minutes
  const [resolutionTime, setResolutionTime] = useState<number>(240); // in minutes

  // Fetch SLA Rules
  const { data: slaRes, isLoading: slaLoading } = useQuery({
    queryKey: ['slaRules'],
    queryFn: () => slaService.getAll(),
  });

  // Fetch Departments
  const { data: deptsRes } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getAll(),
  });

  // Fetch SubDepartments based on selected Department
  const { data: subDeptsRes } = useQuery({
    queryKey: ['subDepartments', departmentId],
    queryFn: () => subDepartmentService.getByDepartmentId(Number(departmentId)),
    enabled: !!departmentId,
  });

  const slaRules = slaRes?.data || [];
  const departments = deptsRes?.data || [];
  const subDepartments = subDeptsRes?.data || [];

  const handleOpenModal = (rule?: SlaRuleResponse) => {
    setStatusMsg(null);
    if (rule) {
      setEditingRule(rule);
      setDepartmentId(rule.departmentId || '');
      setSubDepartmentId(rule.subDepartmentId || '');
      setPriorityId(rule.priorityId || 1);
      setUserRole(rule.userRole || 'ALL');
      setResponseTime(rule.responseTimeLimitMinutes);
      setResolutionTime(rule.resolutionTimeLimitMinutes);
    } else {
      setEditingRule(null);
      setDepartmentId('');
      setSubDepartmentId('');
      setPriorityId(1);
      setUserRole('ALL');
      setResponseTime(30);
      setResolutionTime(240);
    }
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data: CreateSlaRuleRequest) => {
      if (editingRule) {
        return slaService.update(editingRule.id, data);
      }
      return slaService.create(data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['slaRules'] });
      setStatusMsg({ type: 'success', text: res.message || 'SLA Rule saved successfully' });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save SLA Rule' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => slaService.delete(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['slaRules'] });
      setStatusMsg({ type: 'success', text: res.message || 'SLA Rule deleted' });
    },
    onError: (err: any) => {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete SLA Rule' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      departmentId: departmentId ? Number(departmentId) : null,
      subDepartmentId: subDepartmentId ? Number(subDepartmentId) : null,
      priorityId: Number(priorityId),
      userRole,
      responseTimeLimitMinutes: Number(responseTime),
      resolutionTimeLimitMinutes: Number(resolutionTime),
    });
  };

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins} mins`;
    const hours = (mins / 60).toFixed(1);
    return `${hours.endsWith('.0') ? Math.round(mins / 60) : hours} hrs (${mins} mins)`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SLA Policy & Timings Matrix</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure response & resolution deadlines per Department, Sub-Department, and Priority
          </p>
        </div>
        {isSuperAdmin ? (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Configure SLA Rule</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-lg flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Read-Only Mode (Super Admin modifies rules)</span>
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

      {/* SLA Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="font-bold text-slate-900 text-base">Active SLA Configuration Rules</h2>
          <span className="text-xs text-slate-500 font-semibold">{slaRules.length} Rules Configured</span>
        </div>

        {slaLoading ? (
          <div className="p-8 text-center text-slate-400">Loading SLA rules...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Sub-Department</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Target User Role</th>
                  <th className="px-6 py-3">Response Limit</th>
                  <th className="px-6 py-3">Resolution Limit</th>
                  {isSuperAdmin && <th className="px-6 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {slaRules.length > 0 ? (
                  slaRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <span className="inline-flex items-center space-x-1">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{rule.departmentName}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                          <GitMerge className="w-3 h-3" />
                          <span>{rule.subDepartmentName}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            rule.priorityName === 'CRITICAL'
                              ? 'bg-red-100 text-red-700'
                              : rule.priorityName === 'HIGH'
                              ? 'bg-amber-100 text-amber-700'
                              : rule.priorityName === 'MEDIUM'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {rule.priorityName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600">{rule.userRole}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {formatMinutes(rule.responseTimeLimitMinutes)}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {formatMinutes(rule.resolutionTimeLimitMinutes)}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenModal(rule)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md"
                            title="Edit SLA Rule"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this SLA rule?')) {
                                deleteMutation.mutate(rule.id);
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                            title="Delete SLA Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No custom SLA rules configured. System defaults (24h response / 72h resolution) are active.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SLA Modal */}
      {isModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingRule ? 'Edit SLA Rule' : 'Configure SLA Rule'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Department Dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value ? Number(e.target.value) : '');
                    setSubDepartmentId('');
                  }}
                  className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Departments (Global Rule)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-Department Dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Sub-Department
                </label>
                <select
                  value={subDepartmentId}
                  onChange={(e) => setSubDepartmentId(e.target.value ? Number(e.target.value) : '')}
                  disabled={!departmentId}
                  className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">All Sub-Departments in Department</option>
                  {subDepartments.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Ticket Priority *
                </label>
                <select
                  value={priorityId}
                  onChange={(e) => setPriorityId(Number(e.target.value))}
                  required
                  className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={1}>LOW</option>
                  <option value={2}>MEDIUM</option>
                  <option value={3}>HIGH</option>
                  <option value={4}>CRITICAL</option>
                </select>
              </div>

              {/* Response Time & Resolution Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Response Limit (Minutes) *
                  </label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={responseTime}
                    onChange={(e) => setResponseTime(Number(e.target.value))}
                    required
                    className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">e.g. 10 mins, 30 mins, 60 mins</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Resolution Limit (Minutes) *
                  </label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={resolutionTime}
                    onChange={(e) => setResolutionTime(Number(e.target.value))}
                    required
                    className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">e.g. 120 mins (2h), 360 mins (6h)</p>
                </div>
              </div>

              {/* Submit Buttons */}
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
                  {saveMutation.isPending ? 'Saving...' : 'Apply SLA Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SLA Requests Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="font-bold text-slate-900 text-base">SLA Change Requests (Admin to Super Admin)</h2>
            <p className="text-xs text-slate-500">Admins raise requests to modify SLA timings; Super Admin approves or rejects.</p>
          </div>
          {!isSuperAdmin && (
            <button
              onClick={() => {
                const pName = prompt('Enter Priority Name (LOW, MEDIUM, HIGH, CRITICAL):', 'HIGH');
                if (!pName) return;
                const roleName = prompt('Enter User Role (FACULTY, STUDENT, ALL):', 'FACULTY');
                if (!roleName) return;
                const respMins = prompt('Enter Proposed Response Time in Minutes:', '15');
                if (!respMins) return;
                const resMins = prompt('Enter Proposed Resolution Time in Minutes:', '120');
                if (!resMins) return;
                const just = prompt('Enter Justification for Super Admin:', 'Increased campus support demand');

                slaService.submitRequest({
                  priorityName: pName.toUpperCase(),
                  userRole: roleName.toUpperCase(),
                  proposedResponseTimeLimitMinutes: Number(respMins),
                  proposedResolutionTimeLimitMinutes: Number(resMins),
                  justification: just || '',
                }).then(() => {
                  alert('SLA Change Request submitted successfully to Super Admin!');
                  queryClient.invalidateQueries({ queryKey: ['slaChangeRequests'] });
                }).catch((err: any) => {
                  alert(err.response?.data?.message || 'Failed to submit request');
                });
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm"
            >
              + Raise SLA Change Request
            </button>
          )}
        </div>

        <SlaRequestsTable isSuperAdmin={isSuperAdmin} />
      </div>
    </div>
  );
};

const SlaRequestsTable: React.FC<{ isSuperAdmin: boolean }> = ({ isSuperAdmin }) => {
  const queryClient = useQueryClient();
  const { data: requestsRes, isLoading } = useQuery({
    queryKey: ['slaChangeRequests'],
    queryFn: () => slaService.getRequests(),
  });

  const requests = requestsRes?.data || [];

  if (isLoading) return <div className="p-6 text-center text-xs text-slate-400">Loading requests...</div>;
  if (requests.length === 0) return <div className="p-6 text-center text-xs text-slate-400">No SLA change requests found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-200">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Requester</th>
            <th className="px-4 py-3">Priority / Role</th>
            <th className="px-4 py-3">Proposed Response</th>
            <th className="px-4 py-3">Proposed Resolution</th>
            <th className="px-4 py-3">Justification</th>
            <th className="px-4 py-3">Status</th>
            {isSuperAdmin && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold text-slate-900">#{req.id}</td>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-800">{req.requesterName}</div>
                <div className="text-[10px] text-slate-400">{req.requesterEmail}</div>
              </td>
              <td className="px-4 py-3 font-semibold text-indigo-700">
                {req.priorityName} ({req.userRole})
              </td>
              <td className="px-4 py-3 text-slate-700">{req.proposedResponseTimeLimitMinutes} mins</td>
              <td className="px-4 py-3 text-slate-700">{req.proposedResolutionTimeLimitMinutes} mins</td>
              <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{req.justification || 'N/A'}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {req.status}
                </span>
              </td>
              {isSuperAdmin && (
                <td className="px-4 py-3 text-right space-x-2">
                  {req.status === 'PENDING' && (
                    <>
                      <button
                        onClick={async () => {
                          const notes = prompt('Approval notes for Admin:', 'Approved by Super Admin');
                          try {
                            await slaService.approveRequest(req.id, notes || undefined);
                            queryClient.invalidateQueries({ queryKey: ['slaChangeRequests'] });
                            queryClient.invalidateQueries({ queryKey: ['slaRules'] });
                          } catch (err: any) {
                            alert(err.response?.data?.message || 'Failed to approve');
                          }
                        }}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold"
                      >
                        Approve & Update SLA
                      </button>
                      <button
                        onClick={async () => {
                          const notes = prompt('Rejection reason:', 'Time limits do not align with operational guidelines');
                          try {
                            await slaService.rejectRequest(req.id, notes || undefined);
                            queryClient.invalidateQueries({ queryKey: ['slaChangeRequests'] });
                          } catch (err: any) {
                            alert(err.response?.data?.message || 'Failed to reject');
                          }
                        }}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-semibold"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SlaManagement;
