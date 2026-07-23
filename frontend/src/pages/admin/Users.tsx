import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { roleService } from '../../services/roleService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { Plus, UserPlus } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export const AdminUsers: React.FC = () => {
  const { role: currentUserRole } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch users list
  const { data: usersRes, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery({
    queryKey: ['adminUsersList'],
    queryFn: () => userService.getAllUsers(),
  });

  // Fetch roles list for dropdown
  const { data: rolesRes } = useQuery({
    queryKey: ['adminRolesDropdown'],
    queryFn: () => roleService.getAllRoles(),
  });

  if (usersLoading) return <LoadingSpinner label="Loading users list..." />;
  if (usersError) return <ErrorMessage message={(usersError as any).response?.data?.message || usersError.message} onRetry={refetchUsers} />;

  const users = usersRes?.data || [];
  const roles = rolesRes?.data || [];

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email || !password || !roleId) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      await userService.createUser({
        firstName,
        lastName: lastName || undefined,
        email,
        password,
        phone: phone || undefined,
        roleId: Number(roleId),
      });

      setFormSuccess('User account created successfully!');
      refetchUsers();
      setTimeout(() => {
        setIsModalOpen(false);
        // Clear form
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setRoleId('');
        setFormSuccess(null);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to create user account.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'id', label: 'User ID', sortable: true },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (_: any, row: any) => `${row.firstName} ${row.lastName || ''}`,
    },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone' },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (val: string) => (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 uppercase">
          {val}
        </span>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      sortable: true,
      render: (val: boolean) => (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
          val ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {val ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => {
        const isTargetProtected = row.role === 'SUPER_ADMIN' || row.role === 'ADMIN';
        const isAdminUser = currentUserRole === 'ADMIN';

        // Admin cannot modify Admin or Super Admin accounts
        if (isAdminUser && isTargetProtected) {
          return <span className="text-xs text-slate-400 italic font-mono">No access</span>;
        }

        // Super Admin cannot deactivate self
        const isSelf = currentUserRole === 'SUPER_ADMIN' && row.role === 'SUPER_ADMIN';

        return (
          <div className="flex space-x-2">
            <button
              onClick={async () => {
                const newPass = prompt(`Enter new password for ${row.firstName} (${row.email}):`, 'admin123');
                if (newPass === null) return;
                try {
                  await userService.resetPassword(row.id, newPass);
                  alert(`Password updated successfully for ${row.email}`);
                } catch (err: any) {
                  alert(err.response?.data?.message || 'Failed to reset password.');
                }
              }}
              title="Reset Password"
              className="px-2 py-1 text-xs bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded font-medium border border-slate-200 transition-colors"
            >
              Reset Pass
            </button>

            {row.active && !isSelf && (
              <button
                onClick={async () => {
                  if (!confirm(`Deactivate user account for ${row.firstName} (${row.email})?`)) return;
                  try {
                    await userService.deleteUser(row.id);
                    refetchUsers();
                  } catch (err: any) {
                    alert(err.response?.data?.message || 'Failed to deactivate user.');
                  }
                }}
                title="Deactivate Account"
                className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded font-medium border border-red-200 transition-colors"
              >
                Deactivate
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">Manage system logins and configure portal access roles.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="Search users by name, email..."
        searchKeys={['firstName', 'lastName', 'email', 'role']}
      />

      {/* Creation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create User Account">
        <form onSubmit={handleCreateUser} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Select Role *</label>
            <select
              required
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">Choose a role</option>
              {roles
                .filter((r) => {
                  if (currentUserRole === 'ADMIN') {
                    return r.name !== 'ADMIN' && r.name !== 'SUPER_ADMIN';
                  }
                  return true;
                })
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 mt-4 transition-all"
          >
            {submitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
export default AdminUsers;
