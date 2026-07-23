import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentService } from '../../services/departmentService';
import { subDepartmentService } from '../../services/subDepartmentService';
import { DepartmentResponse, SubDepartmentResponse, CreateDepartmentRequest } from '../../types';
import { Building2, GitMerge, Plus, Trash2, Edit2, ChevronRight, CheckCircle2, AlertCircle, UserCheck, ShieldCheck } from 'lucide-react';

export const DepartmentManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);

  // Modals state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentResponse | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubDepartmentResponse | null>(null);
  const [subName, setSubName] = useState('');
  const [subDesc, setSubDesc] = useState('');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch Departments
  const { data: deptsRes } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getAll(),
  });

  // Fetch SubDepartments
  const { data: subDeptsRes } = useQuery({
    queryKey: ['subDepartments'],
    queryFn: () => subDepartmentService.getAll(),
  });

  const departments = deptsRes?.data || [];
  const subDepartments = subDeptsRes?.data || [];

  const activeSubDepts = selectedDeptId
    ? subDepartments.filter((s) => s.departmentId === selectedDeptId)
    : subDepartments;

  // Department Mutations
  const deptSaveMutation = useMutation({
    mutationFn: (data: CreateDepartmentRequest) => {
      if (editingDept) {
        return departmentService.update(editingDept.id, data);
      }
      return departmentService.create(data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setStatusMsg({ type: 'success', text: res.message || 'Department & Head Admin updated successfully' });
      setIsDeptModalOpen(false);
    },
    onError: (err: any) => {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to save department' });
    },
  });

  // SubDepartment Mutations
  const subSaveMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; departmentId: number }) => {
      if (editingSub) {
        return subDepartmentService.update(editingSub.id, data);
      }
      return subDepartmentService.create(data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['subDepartments'] });
      setStatusMsg({ type: 'success', text: res.message || 'Sub-department saved successfully' });
      setIsSubModalOpen(false);
    },
    onError: (err: any) => {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to save sub-department' });
    },
  });

  const subDeleteMutation = useMutation({
    mutationFn: (id: number) => subDepartmentService.delete(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['subDepartments'] });
      setStatusMsg({ type: 'success', text: res.message || 'Sub-department deleted successfully' });
    },
    onError: (err: any) => {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to delete sub-department' });
    },
  });

  const handleOpenEditDept = (dept: DepartmentResponse, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptDesc(dept.description || '');
    setAdminEmail(dept.adminEmail || '');
    setAdminFirstName(dept.adminName || '');
    setAdminPassword('');
    setIsDeptModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Departments & Sub-Departments</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage organizational hierarchy and assign Department Admins/Heads to primary departments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setEditingDept(null);
              setDeptName('');
              setDeptDesc('');
              setAdminEmail('');
              setAdminPassword('');
              setAdminFirstName('');
              setIsDeptModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department & Admin</span>
          </button>
        </div>
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

      {/* Main Grid: Left = Departments, Right = SubDepartments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Departments Panel */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>Primary Departments</span>
            </h2>
            <span className="text-xs text-slate-500 font-semibold">{departments.length} Depts</span>
          </div>

          <div className="divide-y divide-slate-200 flex-1 overflow-y-auto max-h-[500px]">
            <button
              onClick={() => setSelectedDeptId(null)}
              className={`w-full px-6 py-3.5 text-left text-sm font-semibold flex items-center justify-between transition-colors ${
                selectedDeptId === null
                  ? 'bg-indigo-50/80 text-indigo-700 border-l-4 border-l-indigo-600'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>View All Sub-Departments</span>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                {subDepartments.length}
              </span>
            </button>

            {departments.map((dept) => {
              const childCount = subDepartments.filter((s) => s.departmentId === dept.id).length;
              const isSelected = selectedDeptId === dept.id;

              return (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`px-6 py-4 cursor-pointer transition-colors flex items-center justify-between group ${
                    isSelected
                      ? 'bg-indigo-50/80 text-indigo-900 border-l-4 border-l-indigo-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                      <span>{dept.name}</span>
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{dept.description || 'No description'}</p>

                    {dept.adminEmail ? (
                      <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] font-semibold text-emerald-800">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Head: {dept.adminEmail}</span>
                      </div>
                    ) : (
                      <span className="inline-block text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                        No Admin Head Assigned
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleOpenEditDept(dept, e)}
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                      title="Edit Department & Admin Head"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                      {childCount} subs
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform ${
                        isSelected ? 'rotate-90 text-indigo-600' : ''
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sub-Departments Panel */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <GitMerge className="w-5 h-5 text-purple-600" />
                <span>
                  {selectedDeptId
                    ? `Sub-Departments in ${departments.find((d) => d.id === selectedDeptId)?.name}`
                    : 'All Sub-Departments'}
                </span>
              </h2>
            </div>
            {selectedDeptId && (
              <button
                onClick={() => {
                  setEditingSub(null);
                  setSubName('');
                  setSubDesc('');
                  setIsSubModalOpen(true);
                }}
                className="inline-flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs px-3 py-2 rounded-lg shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Sub-Dept</span>
              </button>
            )}
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {activeSubDepts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeSubDepts.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 text-sm">{sub.name}</span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                          {sub.departmentName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{sub.description || 'No description provided'}</p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingSub(sub);
                          setSubName(sub.name);
                          setSubDesc(sub.description || '');
                          setSelectedDeptId(sub.departmentId);
                          setIsSubModalOpen(true);
                        }}
                        className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded"
                        title="Edit Sub-Department"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete sub-department "${sub.name}"?`)) {
                            subDeleteMutation.mutate(sub.id);
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete Sub-Department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <GitMerge className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-medium text-slate-600 text-sm">No sub-departments found</p>
                <p className="text-xs text-slate-400 mt-1">Select a primary department to add new sub-departments</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingDept ? `Manage ${editingDept.name}` : 'Create Primary Department'}
              </h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                deptSaveMutation.mutate({
                  name: deptName.trim(),
                  description: deptDesc.trim(),
                  adminEmail: adminEmail.trim() || undefined,
                  adminPassword: adminPassword.trim() || undefined,
                  adminFirstName: adminFirstName.trim() || undefined,
                });
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. IT Support, Facilities, Campus Operations"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Summary of department scope..."
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Department Admin Credentials Section (Enabled for both Create & Edit) */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center space-x-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Assign / Update Department Admin Head</span>
                </h4>
                <p className="text-xs text-slate-500">
                  {editingDept
                    ? `Set or update login credentials for the Department Admin head of ${editingDept.name}.`
                    : 'Provide login credentials to auto-create a Department Admin account.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Head Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Robert"
                      value={adminFirstName}
                      onChange={(e) => setAdminFirstName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg text-xs px-3 py-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Admin Email *</label>
                    <input
                      type="email"
                      placeholder="itadmin@csms.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg text-xs px-3 py-2 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {editingDept ? 'New Password (Leave blank to keep existing password)' : 'Admin Password *'}
                  </label>
                  <input
                    type="password"
                    placeholder="e.g. admin123"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg text-xs px-3 py-2 bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deptSaveMutation.isPending}
                  className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm"
                >
                  {deptSaveMutation.isPending ? 'Saving...' : 'Save & Assign Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Sub-Department Modal */}
      {isSubModalOpen && selectedDeptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingSub ? 'Edit Sub-Department' : 'Create Sub-Department'}
              </h3>
              <button onClick={() => setIsSubModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                subSaveMutation.mutate({
                  name: subName.trim(),
                  description: subDesc.trim(),
                  departmentId: selectedDeptId,
                });
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Parent Department
                </label>
                <input
                  type="text"
                  disabled
                  value={departments.find((d) => d.id === selectedDeptId)?.name || ''}
                  className="w-full border border-slate-200 bg-slate-100 rounded-lg text-sm px-3.5 py-2.5 font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Sub-Department Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. WiFi, Electrical, Security"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Sub-department scope and services..."
                  value={subDesc}
                  onChange={(e) => setSubDesc(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subSaveMutation.isPending}
                  className="px-5 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm"
                >
                  {subSaveMutation.isPending ? 'Saving...' : 'Save Sub-Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
