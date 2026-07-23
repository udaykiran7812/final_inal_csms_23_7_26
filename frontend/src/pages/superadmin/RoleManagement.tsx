import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../../services/roleService';
import { departmentService } from '../../services/departmentService';
import { subDepartmentService } from '../../services/subDepartmentService';
import { RoleResponse, CreateRoleRequest } from '../../types';
import { Plus, Trash2, Edit2, ShieldAlert, CheckCircle2, Building2, GitMerge } from 'lucide-react';

export const RoleManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [subDepartmentId, setSubDepartmentId] = useState<number | ''>('');

  // Fetch Roles
  const { data: rolesRes, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getAllRoles(),
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

  const roles = rolesRes?.data || [];
  const departments = deptsRes?.data || [];
  const subDepartments = subDeptsRes?.data || [];

  const handleOpenModal = (role?: RoleResponse) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (role) {
      setEditingRole(role);
      setName(role.name);
      setDescription(role.description || '');
      setDepartmentId(role.departmentId || '');
      setSubDepartmentId(role.subDepartmentId || '');
    } else {
      setEditingRole(null);
      setName('');
      setDescription('');
      setDepartmentId('');
      setSubDepartmentId('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setErrorMsg(null);
  };

  const saveMutation = useMutation({
    mutationFn: (data: CreateRoleRequest) => {
      if (editingRole) {
        return roleService.updateRole(editingRole.id, data);
      }
      return roleService.createRole(data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setSuccessMsg(res.message || 'Role saved successfully');
      handleCloseModal();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to save role';
      setErrorMsg(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => roleService.deleteRole(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setSuccessMsg(res.message || 'Role deleted successfully');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to delete role';
      setErrorMsg(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId) {
      setErrorMsg('Department selection is mandatory for role creation.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Role name is required.');
      return;
    }

    saveMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      departmentId: Number(departmentId),
      subDepartmentId: subDepartmentId ? Number(subDepartmentId) : null,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Department Role Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Define department-specific roles and sub-department bindings with duplicate validation
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Role</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {errorMsg && !isModalOpen && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Role Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">Active Department Roles</h2>
          <span className="text-xs text-slate-500 font-medium">Total: {roles.length} Roles</span>
        </div>

        {rolesLoading ? (
          <div className="p-8 text-center text-slate-400">Loading roles...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="px-6 py-3">Role Name</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Sub Department</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-900">{role.name}</td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{role.departmentName || 'Global'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {role.subDepartmentName ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                            <GitMerge className="w-3 h-3 text-slate-500" />
                            <span>{role.subDepartmentName}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">All Sub-Depts</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate">
                        {role.description || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(role)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Role"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete role "${role.name}"?`)) {
                              deleteMutation.mutate(role.id);
                            }
                          }}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No roles configured yet. Click "Create New Role" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Creating / Editing Role */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingRole ? 'Edit Department Role' : 'Create Department Role'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Department Dropdown (Mandatory) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value ? Number(e.target.value) : '');
                    setSubDepartmentId(''); // Reset sub-dept on dept change
                  }}
                  required
                  className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Target Department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Roles must belong to a primary department to prevent duplicate assignment conflicts.
                </p>
              </div>

              {/* Sub-Department Dropdown (Filtered) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Sub-Department (Optional)
                </label>
                <select
                  value={subDepartmentId}
                  onChange={(e) => setSubDepartmentId(e.target.value ? Number(e.target.value) : '')}
                  disabled={!departmentId}
                  className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">All Sub-Departments in Department</option>
                  {subDepartments.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Network Engineer, Electrician"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Brief summary of duties and permissions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {saveMutation.isPending ? 'Saving...' : editingRole ? 'Update Role' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
