import React, { useState } from 'react';
import { Lock, ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';

interface DashboardGateProps {
  onAccessGranted: () => void;
  onBack: () => void;
}

export function DashboardGate({ onAccessGranted, onBack }: DashboardGateProps) {
  const [id, setId] = useState('');
  const [error, setError] = useState('');
  const ALLOWED_ID = '4709059';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === ALLOWED_ID) {
      onAccessGranted();
    } else {
      setError('Access denied: Invalid ID');
      setId('');
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Simulation
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-amber-50 text-amber-600 rounded-2xl mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Admin Access</h2>
        <p className="text-slate-500 mt-2">Enter the supervisor ID to view the dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Supervisor ID
          </label>
          <input
            type="password"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setError('');
            }}
            placeholder="•••••••"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-mono tracking-widest"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-in shake duration-300">
            <ShieldAlert className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:gap-3 focus:outline-none focus:ring-4 focus:ring-slate-500/20"
        >
          Verify Access
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
