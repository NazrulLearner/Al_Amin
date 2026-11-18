// ==========================================
// Investment List (also the module's home page)
// ==========================================
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, Wallet, ArrowDownToLine, Layers } from 'lucide-react';
import '../investments.css';
import { useInvestmentList } from '../hooks/useInvestmentData';
import { MetricCard } from '../components/investment/Charts';
import { StatusBadge } from '../components/investment/Badges';
import { STATUSES } from '../constants/investmentConstants';
import { BDT, formatDate } from '../utils/investmentUtils';

export default function InvestmentListPage() {
  const navigate = useNavigate();
  const { investments, participants, loading, error, reload } = useInvestmentList();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const stats = useMemo(() => {
    const somityFunded = participants
      .filter((p) => p.participant_type === 'Somity')
      .reduce((s, p) => s + (p.funded_amount || 0), 0);
    return {
      count: investments.length,
      committed: investments.reduce((s, i) => s + (i.somity_committed_amount || 0), 0),
      somityFunded,
      returned: investments.reduce((s, i) => s + (i.actual_return_amount || 0), 0),
    };
  }, [investments, participants]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return investments.filter(
      (i) =>
        (!status || i.status === status) &&
        (!q ||
          i.investment_name?.toLowerCase().includes(q) ||
          i.reference_number?.toLowerCase().includes(q))
    );
  }, [investments, search, status]);

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Investments</h1>
          <p className="text-sm text-slate-500">Money the Somity has put into projects, and what came back.</p>
        </div>
        <button
          onClick={() => navigate('/investments/create')}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4" /> New Investment
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Investments" value={stats.count} icon={Layers} />
        <MetricCard label="Somity Committed" value={BDT(stats.committed)} icon={TrendingUp} tone="indigo" />
        <MetricCard label="Somity Funded" value={BDT(stats.somityFunded)} icon={Wallet} tone="emerald" />
        <MetricCard label="Returns Received" value={BDT(stats.returned)} icon={ArrowDownToLine} tone="amber" />
      </div>

      <div className="flex flex-wrap gap-3">
        <input className="inp max-w-xs" placeholder="Search name or reference…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="inp max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Could not load investments: {error}{' '}
          <button className="font-semibold underline" onClick={reload}>Retry</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Investment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Required</th>
              <th className="px-4 py-3 text-right">Somity Committed</th>
              <th className="px-4 py-3 text-right">Returned</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No investments found.</td></tr>
            )}
            {rows.map((i) => (
              <tr key={i.id} onClick={() => navigate(`/investments/${i.id}`)} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{i.investment_name}</div>
                  <div className="text-xs text-slate-500">{i.reference_number} · {i.category}</div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                <td className="px-4 py-3 text-right">{BDT(i.total_required_investment)}</td>
                <td className="px-4 py-3 text-right">{BDT(i.somity_committed_amount)}</td>
                <td className="px-4 py-3 text-right">{BDT(i.actual_return_amount)}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(i.created_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
