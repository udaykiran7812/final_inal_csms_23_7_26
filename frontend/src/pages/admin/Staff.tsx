import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { staffService } from '../../services/staffService';
import { departmentService } from '../../services/departmentService';
import { subDepartmentService } from '../../services/subDepartmentService';
import { roleService } from '../../services/roleService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { Plus, Edit2, Trash2, Key, Building2, GitMerge } from 'lucide-react';

export const AdminStaff: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<number[]>([]);
  const [selectedSubDepartmentIds, setSelectedSubDepartmentIds] = useState<number[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch staff list
  const { data: staffRes, isLoading: staffLoading, error: staffError, refetch: refetchStaff } = useQuery({
    queryKey: ['adminStaffList'],
    queryFn: () => staffService.getAll(),
  });

  // Fetch departments list
  const { data: deptsRes } = useQuery({
    queryKey: ['adminDeptsDropdown'],
    queryFn: () => departmentService.getAll(),
  });

  // Fetch all sub-departments
  const { data: allSubDeptsRes } = useQuery({
    queryKey: ['allSubDepartments'],
    queryFn: () => subDepartmentService.getAll(),
  });

  // Fetch all roles
  const { data: allRolesRes } = useQuery({
    queryKey: ['allRolesList'],
    queryFn: () => roleService.getAllRoles(),
  });

  if (staffLoading) return <LoadingSpinner label="Loading staff resources..." />;
  if (staffError)
    return <ErrorMessage message={(staffError as any).response?.data?.message || staffError.message} onRetry={refetchStaff} />;

  const staff = staffRes?.data || [];
  const departments = deptsRes?.data || [];
  const allSubDepartments = allSubDeptsRes?.data || [];
  const allRoles = allRolesRes?.data || [];

  // Filter sub-departments based on selected departments
  const availableSubDepartments = allSubDepartments.filter(
    (sd) => selectedDepartmentIds.length === 0 || selectedDepartmentIds.includes(sd.departmentId)
  );

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setSelectedDepartmentIds(departments.length === 1 ? [departments[0].id] : []);
    setSelectedSubDepartmentIds([]);
    setSelectedRoleIds([]);
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setEmail(item.email);
    setPhone(item.phone || '');
    setPassword('');

    const deptIds = item.departmentIds && item.departmentIds.length > 0
      ? item.departmentIds
      : (item.departmentId ? [item.departmentId] : []);
    const subDeptIds = item.subDepartmentIds && item.subDepartmentIds.length > 0
      ? item.subDepartmentIds
      : (item.subDepartmentId ? [item.subDepartmentId] : []);
    const rIds = item.roleIds && item.roleIds.length > 0
      ? item.roleIds
      : (item.roleId ? [item.roleId] : []);

    setSelectedDepartmentIds(deptIds);
    setSelectedSubDepartmentIds(subDeptIds);
    setSelectedRoleIds(rIds);
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await staffService.delete(id);
      refetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete staff member.');
    }
  };

  const toggleDeptSelection = (dId: number) => {
    if (selectedDepartmentIds.includes(dId)) {
      const updated = selectedDepartmentIds.filter((id) => id !== dId);
      setSelectedDepartmentIds(updated);
      // Remove sub-departments that belong to removed department
      const remainingSubDeptIds = selectedSubDepartmentIds.filter((sdId) => {
        const sd = allSubDepartments.find((s) => s.id === sdId);
        return sd && updated.includes(sd.departmentId);
      });
      setSelectedSubDepartmentIds(remainingSubDeptIds);
    } else {
      setSelectedDepartmentIds([...selectedDepartmentIds, dId]);
    }
  };

  const toggleSubDeptSelection = (sdId: number) => {
    if (selectedSubDepartmentIds.includes(sdId)) {
      setSelectedSubDepartmentIds(selectedSubDepartmentIds.filter((id) => id !== sdId));
    } else {
      setSelectedSubDepartmentIds([...selectedSubDepartmentIds, sdId]);
    }
  };

  const toggleRoleSelection = (rId: number) => {
    if (selectedRoleIds.includes(rId)) {
      setSelectedRoleIds(selectedRoleIds.filter((id) => id !== rId));
    } else {
      setSelectedRoleIds([...selectedRoleIds, rId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || selectedDepartmentIds.length === 0) {
      setFormError('Name, Email, and at least one Department are required.');
      return;
    }

    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      const primaryDeptId = selectedDepartmentIds[0];
      const primarySubDeptId = selectedSubDepartmentIds.length > 0 ? selectedSubDepartmentIds[0] : null;
      const primaryRoleId = selectedRoleIds.length > 0 ? selectedRoleIds[0] : null;

      const payload = {
        name,
        email,
        phone: phone || undefined,
        password: password || undefined,
        departmentId: primaryDeptId,
        departmentIds: selectedDepartmentIds,
        subDepartmentId: primarySubDeptId,
        subDepartmentIds: selectedSubDepartmentIds,
        roleId: primaryRoleId,
        roleIds: selectedRoleIds,
      };

      if (editingId) {
        await staffService.update(editingId, payload);
        setFormSuccess('Staff profile updated successfully!');
      } else {
        await staffService.create(payload);
        setFormSuccess('Staff member registered & user account provisioned!');
      }

      refetchStaff();
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(null);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'id', label: 'Staff ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone' },
    {
      key: 'departmentNames',
      label: 'Departments',
      render: (_: any, row: any) => {
        const list = row.departmentNames && row.departmentNames.length > 0
          ? row.departmentNames
          : (row.departmentName ? [row.departmentName] : []);
        if (list.length === 0) return <span className="text-slate-400 text-xs italic">N/A</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {list.map((d: string, idx: number) => (
              <span key={idx} className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-semibold rounded-md flex items-center space-x-1">
                <Building2 className="w-3 h-3 text-blue-500" />
                <span>{d}</span>
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'subDepartmentNames',
      label: 'Sub Departments',
      render: (_: any, row: any) => {
        const list = row.subDepartmentNames && row.subDepartmentNames.length > 0
          ? row.subDepartmentNames
          : (row.subDepartmentName ? [row.subDepartmentName] : []);
        if (list.length === 0) return <span className="text-slate-400 text-xs italic">N/A</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {list.map((sd: string, idx: number) => (
              <span key={idx} className="px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 text-[11px] font-semibold rounded-md flex items-center space-x-1">
                <GitMerge className="w-3 h-3 text-purple-500" />
                <span>{sd}</span>
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'roleNames',
      label: 'Skills & Roles',
      render: (_: any, row: any) => {
        const list = row.roleNames && row.roleNames.length > 0
          ? row.roleNames
          : (row.roleName ? [row.roleName] : []);
        if (list.length === 0) return <span className="text-slate-400 text-xs italic">Staff</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {list.map((r: string, idx: number) => (
              <span key={idx} className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-semibold rounded-full">
                {r}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex space-x-3">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff Directory & Skill Roster</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage department staff engineers across multiple departments, sub-departments, and skill roles.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member & User</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={staff}
        searchPlaceholder="Search staff by name, email, department, skills..."
        searchKeys={['name', 'email', 'departmentName', 'subDepartmentName', 'roleName']}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Staff Profile' : 'Add Staff Member & User Account'}>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          {formSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-lg">
              {formSuccess}
            </div>
          )}
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ravi Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (Login Username) *</label>
            <input
              type="email"
              required
              placeholder="ravi@csms.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              <span>Login Password {editingId ? '(Leave blank to keep unchanged)' : '(Default: staff123 if blank)'}</span>
            </label>
            <input
              type="password"
              placeholder="e.g. staff123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
            <input
              type="text"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-indigo-500"
            />
          </div>

          {/* Multi-Department Checkboxes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Assigned Departments (Select Multiple) *
            </label>
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto">
              {departments.map((d) => (
                <label key={d.id} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer hover:text-indigo-600 font-medium">
                  <input
                    type="checkbox"
                    checked={selectedDepartmentIds.includes(d.id)}
                    onChange={() => toggleDeptSelection(d.id)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{d.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Multi Sub-Department Checkboxes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Assigned Sub-Departments (Select Multiple)
            </label>
            {availableSubDepartments.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-2 bg-slate-50 border border-slate-200 rounded-lg">
                Select a department above to view available sub-departments
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto">
                {availableSubDepartments.map((sd) => (
                  <label key={sd.id} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer hover:text-indigo-600 font-medium">
                    <input
                      type="checkbox"
                      checked={selectedSubDepartmentIds.includes(sd.id)}
                      onChange={() => toggleSubDeptSelection(sd.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{sd.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Multi-Role / Skills Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Assigned Skills / Roles (Select Multiple)
            </label>
            {allRoles.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No roles available</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto">
                {allRoles.map((r) => (
                  <label key={r.id} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer hover:text-indigo-600 font-medium">
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(r.id)}
                      onChange={() => toggleRoleSelection(r.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{r.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 mt-4 transition-all"
          >
            {submitting ? 'Saving...' : 'Save Profile & Account'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminStaff;
