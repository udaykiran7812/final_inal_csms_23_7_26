import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '../../services/auditService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { DataTable } from '../../components/DataTable';
import { ShieldCheck, Activity, User, Clock } from 'lucide-react';

export const AuditLogManagement: React.FC = () => {
  const { data: auditRes, isLoading, error, refetch } = useQuery({
    queryKey: ['auditLogsList'],
    queryFn: () => auditService.getAll(),
  });

  if (isLoading) return <LoadingSpinner label="Loading system audit logs..." />;
  if (error) return <ErrorMessage message={(error as any).response?.data?.message || error.message} onRetry={refetch} />;

  const logs = auditRes?.data || [];

  const columns = [
    { key: 'id', label: 'Log ID', sortable: true },
    {
      key: 'performedBy',
      label: 'Performed By',
      sortable: true,
      render: (val: string) => (
        <span className="font-semibold text-slate-800 flex items-center space-x-1">
          <User className="w-3.5 h-3.5 text-indigo-600" />
          <span>{val}</span>
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (val: string) => (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
          {val}
        </span>
      ),
    },
    { key: 'entityName', label: 'Target Entity', sortable: true },
    { key: 'entityId', label: 'Entity ID', sortable: true },
    {
      key: 'oldValue',
      label: 'Old Value',
      render: (val: string) => val ? <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-mono text-[11px]">{val}</span> : <span className="text-slate-400 italic">None</span>,
    },
    {
      key: 'newValue',
      label: 'New Value',
      render: (val: string) => val ? <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono text-[11px]">{val}</span> : <span className="text-slate-400 italic">None</span>,
    },
    {
      key: 'createdAt',
      label: 'Timestamp',
      sortable: true,
      render: (val: string) => new Date(val).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <span>Enterprise System Audit Logs</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Complete security audit tracking for SLA modifications, priority changes, user creation, and status transitions.</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        searchPlaceholder="Search audit logs by user, action, entity..."
        searchKeys={['performedBy', 'action', 'entityName', 'oldValue', 'newValue']}
      />
    </div>
  );
};

export default AuditLogManagement;
