import React, { useState } from 'react';
import { Phone, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../../auth/use-auth';

interface IntegrationStepProps {
  data: { phoneNumber: string };
  updateData: (data: Partial<{ phoneNumber: string }>) => void;
  onComplete: () => void;
  onBack: () => void;
  fullData: any; // Used to send the final payload
}

export const IntegrationStep: React.FC<IntegrationStepProps> = ({ data, updateData, onComplete, onBack, fullData }) => {
  const [areaCode, setAreaCode] = useState('');
  const [availableNumbers, setAvailableNumbers] = useState<{phoneNumber: string, formatted: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { session } = useAuth();

  const handleSearch = async () => {
    if (areaCode.length < 3) return;
    setIsSearching(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8787/api/v1/onboarding/numbers/search?areaCode=${areaCode}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      const result = await res.json();
      if (res.ok) setAvailableNumbers(result.data.numbers);
      else throw new Error(result.error.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleComplete = async () => {
    if (!data.phoneNumber) return;
    setIsProvisioning(true);
    setError(null);
    try {
      // Provision Number
      const res1 = await fetch('http://localhost:8787/api/v1/onboarding/numbers/provision', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify({ phoneNumber: data.phoneNumber })
      });
      if (!res1.ok) throw new Error('Failed to provision number');

      // Save Profile
      const res2 = await fetch('http://localhost:8787/api/v1/onboarding/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify(fullData)
      });
      if (!res2.ok) throw new Error('Failed to save profile');

      onComplete();
    } catch (err: any) {
      setError(err.message);
      setIsProvisioning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Get Your Number</h2>
        <p className="text-slate-500">Pick a local number to start receiving tracked calls.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg mb-4">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Search by Area Code</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              maxLength={3}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              placeholder="e.g. 512"
              value={areaCode}
              onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || areaCode.length < 3}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </div>
      </div>

      {availableNumbers.length > 0 && (
        <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
          {availableNumbers.map((num) => (
            <button
              key={num.phoneNumber}
              onClick={() => updateData({ phoneNumber: num.phoneNumber })}
              className={`w-full flex items-center justify-between p-4 border-b border-slate-100 last:border-0 transition-colors ${
                data.phoneNumber === num.phoneNumber ? 'bg-blue-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Phone className={`w-5 h-5 ${data.phoneNumber === num.phoneNumber ? 'text-primary' : 'text-slate-400'}`} />
                <span className={`font-medium ${data.phoneNumber === num.phoneNumber ? 'text-primary-dark' : 'text-slate-700'}`}>
                  {num.formatted}
                </span>
              </div>
              {data.phoneNumber === num.phoneNumber && (
                <div className="w-3 h-3 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          disabled={isProvisioning}
          className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleComplete}
          disabled={!data.phoneNumber || isProvisioning}
          className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
        >
          {isProvisioning ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Setup'}
        </button>
      </div>
    </div>
  );
};
