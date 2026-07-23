import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { issueCategoryService } from '../../services/issueCategoryService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const AdminIssueCategories: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['adminIssueCategoriesList'],
    queryFn: () => issueCategoryService.getAll(),
  });

  if (isLoading) return <LoadingSpinner label="Loading categories..." />;
  if (error) return <ErrorMessage message={(error as any).response?.data?.message || error.message} onRetry={refetch} />;

  const categories = response?.data || [];

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description || '');
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this issue category?')) return;
    try {
      await issueCategoryService.delete(id);
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete issue category.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setFormError('Category name is required.');
      return;
    }

    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      const payload = { name, description };
      if (editingId) {
        await issueCategoryService.update(editingId, payload);
        setFormSuccess('Category updated successfully!');
      } else {
        await issueCategoryService.create(payload);
        setFormSuccess('Category created successfully!');
      }

      refetch();
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
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'description', label: 'Description' },
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
          <h1 className="text-2xl font-bold text-slate-800">Issue Categories</h1>
          <p className="text-sm text-slate-500 mt-1">Configure categories (e.g. WiFi, Plumbing, Billing) for ticket classification.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        searchPlaceholder="Search categories..."
        searchKeys={['name', 'description']}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Category' : 'Create Category'}>
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
            <label className="block text-xs font-medium text-slate-700">Category Name *</label>
            <input
              type="text"
              required
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
            {submitting ? 'Saving...' : 'Save Category'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
export default AdminIssueCategories;
