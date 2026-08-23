import React from 'react';
import { Building2 } from 'lucide-react';

interface ProfileStepProps {
  data: { companyName: string; track: 'trades' | 'predictable' };
  updateData: (data: Partial<{ companyName: string; track: 'trades' | 'predictable' }>) => void;
  onNext: () => void;
}

export const ProfileStep: React.FC<ProfileStepProps> = ({ data, updateData, onNext }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Business Profile</h2>
        <p className="text-slate-500">Let's set up your core business information.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            value={data.companyName}
            onChange={(e) => updateData({ companyName: e.target.value })}
            placeholder="e.g. Acme Plumbing"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Business Track</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => updateData({ track: 'trades' })}
            className={`p-4 border rounded-xl text-left transition-all ${
              data.track === 'trades' 
                ? 'border-primary bg-blue-50 ring-2 ring-primary ring-opacity-20' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <h3 className="font-semibold text-slate-900 mb-1">Trades</h3>
            <p className="text-xs text-slate-500">Plumbers, Electricians, HVAC, Landscaping</p>
          </button>
          
          <button
            onClick={() => updateData({ track: 'predictable' })}
            className={`p-4 border rounded-xl text-left transition-all ${
              data.track === 'predictable' 
                ? 'border-primary bg-blue-50 ring-2 ring-primary ring-opacity-20' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <h3 className="font-semibold text-slate-900 mb-1">Predictable</h3>
            <p className="text-xs text-slate-500">Cleaners, Consultants, Standardized Services</p>
          </button>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!data.companyName}
        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-colors mt-8 disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
};
