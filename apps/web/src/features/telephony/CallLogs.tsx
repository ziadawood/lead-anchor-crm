import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/use-auth';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Loader2, Play } from 'lucide-react';

export const CallLogs = () => {
  const { session } = useAuth();

  const fetchCalls = async () => {
    // For MVP, we use Supabase client directly to fetch raw logs for the tenant
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://leadanchor-api.ziadawood.workers.dev/api/v1'}/contacts`, { // Re-using contacts endpoint to just show the concept, or better, we can query interactions directly
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    // In a real implementation we would hit a specific /interactions?type=call endpoint.
    // For this UI mockup, we will mock data to demonstrate the UI requested by the user.
    return [
      { id: '1', type: 'call', direction: 'inbound', from: '+15125550101', status: 'completed', duration: 145, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { id: '2', type: 'call', direction: 'inbound', from: '+15125550102', status: 'abandoned', duration: 0, timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
      { id: '3', type: 'call', direction: 'outbound', to: '+15125550103', status: 'completed', duration: 320, timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
    ];
  };

  const { data: calls, isLoading } = useQuery({
    queryKey: ['call-logs'],
    queryFn: fetchCalls,
    enabled: !!session,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Completed</span>;
      case 'abandoned': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">Abandoned</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">{status}</span>;
    }
  };

  const getDirectionIcon = (direction: string, status: string) => {
    if (status === 'abandoned') return <PhoneMissed className="w-5 h-5 text-red-500" />;
    if (direction === 'inbound') return <PhoneIncoming className="w-5 h-5 text-blue-500" />;
    return <PhoneOutgoing className="w-5 h-5 text-emerald-500" />;
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Call Logs</h2>
        <p className="text-slate-500">History of all inbound and outbound calls.</p>
      </div>

      <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden shadow-sm">
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {calls?.map((call) => (
                <div key={call.id} className="bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                      {getDirectionIcon(call.direction, call.status)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">
                        {call.direction === 'inbound' ? call.from : call.to}
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(call.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-sm font-medium text-slate-600">
                      {call.duration > 0 ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s` : '--'}
                    </div>
                    {getStatusBadge(call.status)}
                    <button 
                      disabled={call.duration === 0}
                      className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-colors disabled:opacity-50"
                    >
                      <Play className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallLogs;
