import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/use-auth';
import { CreditCard, DollarSign, FileText, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'https://leadanchor-api.ziadawood.workers.dev/api/v1');

export const PaymentsPage = () => {
  const { session } = useAuth();
  const [isOnboarding, setIsOnboarding] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const isSuccess = urlParams.get('success') === 'true';

  const fetchInvoices = async () => {
    const res = await fetch(`${API_URL}/billing/invoices`, {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch invoices');
    const json = await res.json();
    return json.data;
  };

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
    enabled: !!session,
  });

  const handleConnectStripe = async () => {
    setIsOnboarding(true);
    try {
      const res = await fetch(`${API_URL}/billing/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ return_url: window.location.origin + '/payments' })
      });
      const json = await res.json();
      if (json.data?.url) {
        window.location.href = json.data.url;
      }
    } catch (e) {
      console.error('Failed to start Stripe onboarding', e);
    } finally {
      setIsOnboarding(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="badge badge-green gap-1"><CheckCircle className="w-3 h-3"/> Paid</span>;
      case 'sent': return <span className="badge badge-blue">Sent</span>;
      case 'overdue': return <span className="badge badge-red">Overdue</span>;
      default: return <span className="badge badge-slate capitalize">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col animate-fade-in-up">
      <div className="mb-6 flex justify-between items-end page-header">
        <div>
          <h2>Payments & Invoicing</h2>
          <p>Manage your connected Stripe account and invoices.</p>
        </div>
        {!isSuccess && (
          <button 
            onClick={handleConnectStripe}
            disabled={isOnboarding}
            className="font-semibold py-2 px-4 rounded-xl transition-all flex items-center gap-2 text-sm text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #635BFF, #4B45D6)', boxShadow: '0 2px 10px rgba(99,91,255,0.25)' }}
          >
            {isOnboarding ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            Connect with Stripe
          </button>
        )}
      </div>

      {isSuccess && (
        <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <div>
            <h4 className="font-semibold text-emerald-300 text-sm">Stripe Connected Successfully!</h4>
            <p className="text-xs text-emerald-400/70">Your account is now ready to process payments.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.1))' }}>
            <DollarSign className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Collected</p>
            <h3 className="text-xl font-bold text-white">$0.00</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(100,116,139,0.1)' }}>
            <FileText className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Outstanding Invoices</p>
            <h3 className="text-xl font-bold text-white">0</h3>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden">
        <div className="p-5" style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
          <h3 className="font-bold text-white text-sm">Recent Invoices</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : invoices && invoices.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Deal</th>
                  <th>Amount</th>
                  <th>Date Sent</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice: any) => (
                  <tr key={invoice.id}>
                    <td>
                      <div className="font-medium text-slate-300 flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-slate-500" />
                        {invoice.id.split('-')[0]}
                      </div>
                    </td>
                    <td className="text-slate-400 font-medium text-sm">{invoice.deal?.title || 'Unknown Deal'}</td>
                    <td className="text-emerald-400 font-semibold">${Number(invoice.amount).toFixed(2)}</td>
                    <td className="text-slate-500 text-sm">{new Date(invoice.created_at).toLocaleDateString()}</td>
                    <td className="text-right">{getStatusBadge(invoice.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(100,116,139,0.05)' }}>
                <FileText className="w-8 h-8 text-slate-600" />
              </div>
              <p className="font-medium text-slate-400 text-sm">No invoices yet</p>
              <p className="text-xs mt-1 text-slate-500">Connect your Stripe account to start billing clients.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
