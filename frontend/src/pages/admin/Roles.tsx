import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { roleService } from '../../services/roleService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { Plus } from 'lucide-react';

export const AdminRoles: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['adminRolesList'],
    queryFn: () => roleService.getAllRoles(),
  });

  if (isLoading) return <LoadingSpinner label="Loading roles..." />;
  if (error) return <ErrorMessage message={(error as any).response?.data?.message || error.message} onRetry={refetch} />;

  const roles = response?.data || [];

  const handleOpenCreate = () => {
    setName('');
    setDescription('');
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setFormError('Role name is required.');
      return;
    }

    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      await roleService.createRole({ name, description });
      setFormSuccess('Role created successfully!');
      refetch();
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(null);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to create role.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    {
      key: 'name',
      label: 'Role Name',
      sortable: true,
      render: (val: string) => (
        <span className="font-semibold text-slate-700 uppercase tracking-wide">{val}</span>
      ),
    },
    { key: 'description', label: 'Description' },
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Roles</h1>
          <p className="text-sm text-slate-500 mt-1">Configure authorization boundaries. By default, roles should map to ADMIN, STAFF, or USER.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Role</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={roles}
        searchPlaceholder="Search roles..."
        searchKeys={['name', 'description']}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create User Role">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-xs font-medium text-slate-700">Role Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. USER, STAFF, ADMIN"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 mt-4 transition-all"
          >
            {submitting ? 'Creating...' : 'Create Role'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
export default AdminRoles;
