import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/use-auth';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Loader2, Play } from 'lucide-react';

export const CallLogs = () => {
  const { session } = useAuth();

  const fetchCalls = async () => {
    // For MVP, mock data to demonstrate the UI
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
      case 'completed': return <span className="badge badge-green">Completed</span>;
      case 'abandoned': return <span className="badge badge-red">Abandoned</span>;
      default: return <span className="badge badge-slate">{status}</span>;
    }
  };

  const getDirectionIcon = (direction: string, status: string) => {
    if (status === 'abandoned') return <PhoneMissed className="w-5 h-5 text-red-400" />;
    if (direction === 'inbound') return <PhoneIncoming className="w-5 h-5 text-blue-400" />;
    return <PhoneOutgoing className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col animate-fade-in-up">
      <div className="mb-6 page-header">
        <h2>Call Logs</h2>
        <p>History of all inbound and outbound calls.</p>
      </div>

      <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {calls?.map((call) => (
                <div key={call.id} className="glass-light p-4 rounded-xl flex items-center justify-between transition-all hover:border-blue-500/10" style={{ border: '1px solid rgba(148,163,184,0.06)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.08)' }}>
                      {getDirectionIcon(call.direction, call.status)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200 text-sm">
                        {call.direction === 'inbound' ? call.from : call.to}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(call.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-5">
                    <div className="text-sm font-medium text-slate-400">
                      {call.duration > 0 ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s` : '--'}
                    </div>
                    {getStatusBadge(call.status)}
                    <button 
                      disabled={call.duration === 0}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-400 transition-colors disabled:opacity-30"
                      style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(148,163,184,0.1)' }}
                    >
                      <Play className="w-3.5 h-3.5 ml-0.5" />
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
