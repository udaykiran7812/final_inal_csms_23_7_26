import React from 'react';
import { X, Award, AlertTriangle, CheckCircle2, TrendingUp, Info } from 'lucide-react';

export interface ScoreEvent {
  ticketId?: number;
  ticketTitle?: string;
  eventType?: string;
  points: number;
  reason: string;
  timestamp: string;
}

interface HealthScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  score: number;
  breakdown?: ScoreEvent[];
}

export const HealthScoreModal: React.FC<HealthScoreModalProps> = ({
  isOpen,
  onClose,
  title,
  score,
  breakdown = [],
}) => {
  if (!isOpen) return null;

  const getScoreColor = (val: number) => {
    if (val >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (val >= 75) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const totalDeductions = breakdown.filter((e) => e.points < 0).reduce((acc, curr) => acc + curr.points, 0);
  const totalBonuses = breakdown.filter((e) => e.points > 0).reduce((acc, curr) => acc + curr.points, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600/30 rounded-lg border border-indigo-500/30 text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-wide text-white">{title} Score Audit Log</h2>
              <p className="text-xs text-slate-400">Transparent mathematical point calculation breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Summary Box */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-3 rounded-xl border font-black text-3xl tracking-tight ${getScoreColor(score)}`}>
              {score}%
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-slate-400">Current Clamped Score</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {score >= 90 ? 'Excellent Performance' : score >= 75 ? 'Good Performance' : 'Attention Required'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-medium text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400">Base:</span> <span className="font-bold text-slate-900">100</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400">Deductions:</span>{' '}
              <span className="font-bold text-red-600">{totalDeductions}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400">Bonuses:</span>{' '}
              <span className="font-bold text-emerald-600">+{totalBonuses}</span>
            </div>
          </div>
        </div>

        {/* Events Breakdown List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2 flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-indigo-500" />
            <span>Calculation Event History ({breakdown.length})</span>
          </h3>

          {breakdown.length > 0 ? (
            breakdown.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg mt-0.5 ${
                      item.points > 0
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-red-50 text-red-600 border border-red-100'
                    }`}
                  >
                    {item.points > 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.reason}</p>
                    {item.ticketTitle && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">Ticket #{item.ticketId}</span>: {item.ticketTitle}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.timestamp}</p>
                  </div>
                </div>

                <div
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold border ${
                    item.points > 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {item.points > 0 ? `+${item.points}` : item.points} pts
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium">No point deductions or penalty events recorded.</p>
              <p className="text-[11px] text-slate-400 mt-1">Maintaining default 100% baseline score.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
