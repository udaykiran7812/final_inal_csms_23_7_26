import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetService } from '../../services/assetService';
import { departmentService } from '../../services/departmentService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { AssetResponse, CreateAssetRequest, TicketResponse } from '../../types';
import { Laptop, Plus, History, Building2, Tag, MapPin, CheckCircle2, Wrench } from 'lucide-react';

export const AssetManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssetForHistory, setSelectedAssetForHistory] = useState<AssetResponse | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [type, setType] = useState('HARDWARE');
  const [location, setLocation] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [status, setStatus] = useState('ACTIVE');
  const [formError, setFormError] = useState<string | null>(null);

  const { data: assetsRes, isLoading: assetsLoading, error: assetsError, refetch: refetchAssets } = useQuery({
    queryKey: ['assetsList'],
    queryFn: () => assetService.getAll(),
  });

  const { data: deptsRes } = useQuery({
    queryKey: ['adminDeptsDropdown'],
    queryFn: () => departmentService.getAll(),
  });

  const { data: historyRes, isLoading: historyLoading } = useQuery({
    queryKey: ['assetHistory', selectedAssetForHistory?.id],
    queryFn: () => assetService.getHistory(selectedAssetForHistory!.id),
    enabled: !!selectedAssetForHistory,
  });

  const assets = assetsRes?.data || [];
  const departments = deptsRes?.data || [];
  const historyTickets = historyRes?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: CreateAssetRequest) => assetService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetsList'] });
      setIsModalOpen(false);
      setName('');
      setAssetTag('');
      setLocation('');
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to register asset.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !assetTag || !departmentId) {
      setFormError('Name, Asset Tag, and Department are required.');
      return;
    }
    setFormError(null);
    createMutation.mutate({
      name,
      assetTag,
      type,
      location,
      departmentId: Number(departmentId),
      status,
    });
  };

  if (assetsLoading) return <LoadingSpinner label="Loading campus assets..." />;
  if (assetsError) return <ErrorMessage message={(assetsError as any).response?.data?.message || assetsError.message} onRetry={refetchAssets} />;

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'assetTag', label: 'Asset Tag', sortable: true, render: (val: string) => <span className="font-mono font-bold text-indigo-700 text-xs">{val}</span> },
    { key: 'name', label: 'Item Name', sortable: true, render: (val: string) => <span className="font-semibold text-slate-800">{val}</span> },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'departmentName', label: 'Department', sortable: true },
    { key: 'location', label: 'Location' },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val: string) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          val === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          {val}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Service History',
      render: (_: any, row: AssetResponse) => (
        <button
          onClick={() => setSelectedAssetForHistory(row)}
          className="flex items-center space-x-1 text-xs px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded font-medium border border-indigo-200 transition-colors"
        >
          <History className="w-3.5 h-3.5" />
          <span>View Ticket History</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campus Asset Management & Service History</h1>
          <p className="text-sm text-slate-500 mt-1">Track hardware, AV setups, smart classroom equipment, and maintenance history.</p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Asset</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={assets}
        searchPlaceholder="Search assets by tag, name, location, department..."
        searchKeys={['assetTag', 'name', 'type', 'location', 'departmentName']}
      />

      {/* New Asset Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Campus Asset">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">{formError}</div>}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Lab 401 Projector"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Tag *</label>
              <input
                type="text"
                required
                placeholder="e.g. AST-AV-401"
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="HARDWARE">HARDWARE</option>
                <option value="SMART_CLASSROOM">SMART_CLASSROOM</option>
                <option value="NETWORK">NETWORK</option>
                <option value="AV">AV</option>
                <option value="FACILITY">FACILITY</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Classroom</label>
            <input
              type="text"
              placeholder="e.g. Lab 401, Floor 4, Block B"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="RETIRED">RETIRED</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm"
          >
            {createMutation.isPending ? 'Registering...' : 'Register Asset'}
          </button>
        </form>
      </Modal>

      {/* Ticket History Drawer/Modal */}
      {selectedAssetForHistory && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAssetForHistory(null)}
          title={`Ticket & Repair History: ${selectedAssetForHistory.name} (${selectedAssetForHistory.assetTag})`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div><strong>Location:</strong> {selectedAssetForHistory.location || 'N/A'}</div>
              <div><strong>Department:</strong> {selectedAssetForHistory.departmentName}</div>
              <div><strong>Current Status:</strong> {selectedAssetForHistory.status}</div>
            </div>

            <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-1">
              <Wrench className="w-4 h-4 text-indigo-600" />
              <span>Past Maintenance & Complaints ({historyTickets.length})</span>
            </h4>

            {historyLoading ? (
              <LoadingSpinner label="Fetching service history..." />
            ) : historyTickets.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">No past tickets linked to this asset.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {historyTickets.map((t: TicketResponse) => (
                  <div key={t.id} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-700">Ticket #{t.id}: {t.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-slate-600 line-clamp-2">{t.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Raised by: {t.userName}</span>
                      <span>Assigned: {t.assignedStaffName || 'Unassigned'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AssetManagement;
