import React from 'react';
import { MapPin, Clock } from 'lucide-react';

interface LocationStepProps {
  data: { address: string; city: string; state: string; zip: string; hours: string };
  updateData: (data: Partial<{ address: string; city: string; state: string; zip: string; hours: string }>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const LocationStep: React.FC<LocationStepProps> = ({ data, updateData, onNext, onBack }) => {
  const isComplete = data.address && data.city && data.state && data.zip;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Location & Hours</h2>
        <p className="text-slate-500">Where are you located?</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              value={data.address}
              onChange={(e) => updateData({ address: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={data.city}
              onChange={(e) => updateData({ city: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={data.state}
                onChange={(e) => updateData({ state: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ZIP</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={data.zip}
                onChange={(e) => updateData({ zip: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Operating Hours</label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <select
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none appearance-none"
              value={data.hours}
              onChange={(e) => updateData({ hours: e.target.value })}
            >
              <option value="9-5">Mon-Fri: 9:00 AM - 5:00 PM</option>
              <option value="8-6">Mon-Fri: 8:00 AM - 6:00 PM</option>
              <option value="24-7">24/7 Emergency Service</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!isComplete}
          className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
