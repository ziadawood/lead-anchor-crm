import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/use-auth';
import { CreditCard, DollarSign, FileText, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:8787/api/v1';

export const PaymentsPage = () => {
  const { session } = useAuth();
  const [isOnboarding, setIsOnboarding] = useState(false);

  // Check URL for onboarding success mock
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
      case 'paid': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Paid</span>;
      case 'sent': return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Sent</span>;
      case 'overdue': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Overdue</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full capitalize">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Payments & Invoicing</h2>
          <p className="text-slate-500">Manage your connected Stripe account and invoices.</p>
        </div>
        {!isSuccess && (
          <button 
            onClick={handleConnectStripe}
            disabled={isOnboarding}
            className="bg-[#635BFF] hover:bg-[#4B45D6] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
          >
            {isOnboarding ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            Connect with Stripe
          </button>
        )}
      </div>

      {isSuccess && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <div>
            <h4 className="font-semibold">Stripe Connected Successfully!</h4>
            <p className="text-sm text-emerald-600/90">Your account is now ready to process payments and send invoices directly from deals.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="glass rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Collected</p>
            <h3 className="text-2xl font-bold text-slate-900">$0.00</h3>
          </div>
        </div>
        <div className="glass rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Outstanding Invoices</p>
            <h3 className="text-2xl font-bold text-slate-900">0</h3>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Recent Invoices</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : invoices && invoices.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="px-6 py-3 font-medium">Invoice ID</th>
                  <th className="px-6 py-3 font-medium">Deal</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Date Sent</th>
                  <th className="px-6 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        {invoice.id.split('-')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {invoice.deal?.title || 'Unknown Deal'}
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-semibold">
                      ${Number(invoice.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {getStatusBadge(invoice.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-medium text-slate-700">No invoices yet</p>
              <p className="text-sm mt-1">Connect your Stripe account to start billing clients.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
