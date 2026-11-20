// ==========================================
// Investment Detail — header + tabs (existing tab components)
// ==========================================
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import '../investments.css';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useInvestmentDetail } from '../hooks/useInvestmentData';
import { StatusBadge } from '../components/investment/Badges';
import OverviewTab from '../components/investment/tabs/OverviewTab';
import InvestorsTab from '../components/investment/tabs/InvestorsTab';
import FundingTab from '../components/investment/tabs/FundingTab';
import ReturnsTab from '../components/investment/tabs/ReturnsTab';
import TransactionsTab from '../components/investment/tabs/TransactionsTab';
import DocumentsTab from '../components/investment/tabs/DocumentsTab';
import TimelineTab from '../components/investment/tabs/TimelineTab';
import ApprovalTab from '../components/investment/tabs/ApprovalTab';
import { NEXT_STATUS, changeStatus } from '../services';
import { toActor } from '../utils/actor';
import type { InvestmentStatus } from '../types';

const TABS = ['Overview', 'Investors', 'Funding', 'Returns', 'Transactions', 'Documents', 'Approval', 'Timeline'] as const;
type Tab = (typeof TABS)[number];

export default function InvestmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const d = useInvestmentDetail(id);
  const [tab, setTab] = useState<Tab>('Overview');
  const [busy, setBusy] = useState(false);

  if (d.loading) return <div className="p-6 text-slate-400">Loading…</div>;
  if (d.error)
    return (
      <div className="p-6">
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Could not load this investment: {d.error}{' '}
          <button className="font-semibold underline" onClick={d.reload}>Retry</button>
        </div>
      </div>
    );
  if (!d.investment) return <div className="p-6 text-slate-500">Investment not found.</div>;

  const inv = d.investment;
  // Approve / Reject live in the Approval tab; every other step is a button here.
  const nextSteps = (NEXT_STATUS[inv.status] ?? []).filter((s) => s !== 'Approved' && s !== 'Rejected');

  const move = async (to: InvestmentStatus) => {
    if (!window.confirm(`Move this investment to "${to}"?`)) return;
    setBusy(true);
    try {
      await changeStatus(inv.id, to, toActor(user, userData));
      toast.success(`Status: ${to}`);
      await d.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not change status');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 p-4 md:p-6">
      <button onClick={() => navigate('/investments')} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> All investments
      </button>

      {inv.is_deleted && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          This investment was deleted{inv.deleted_by ? ` by ${inv.deleted_by}` : ''}
          {inv.delete_reason ? ` — reason: ${inv.delete_reason}` : ''}. It is hidden from the list and cannot receive new funding or returns.
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{inv.investment_name}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            {inv.reference_number} · {inv.category} <StatusBadge status={inv.status} />
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {nextSteps.map((s) => (
            <button key={s} disabled={busy} onClick={() => move(s)} className="rounded-md border border-emerald-700 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
              {s === 'Pending Review' ? 'Submit for review' : s === 'Draft' ? 'Send back to draft' : `Move to ${s}`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${tab === t ? 'border-b-2 border-emerald-700 text-emerald-700' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div>
        {tab === 'Overview' && <OverviewTab investment={inv} participants={d.participants} />}
        {tab === 'Investors' && <InvestorsTab investment={inv} participants={d.participants} />}
        {tab === 'Funding' && <FundingTab investment={inv} participants={d.participants} funding={d.funding} onReload={d.reload} />}
        {tab === 'Returns' && <ReturnsTab investment={inv} participants={d.participants} returns={d.returns} onReload={d.reload} />}
        {tab === 'Transactions' && <TransactionsTab transactions={d.transactions} />}
        {tab === 'Documents' && <DocumentsTab investment={inv} documents={d.documents} participants={d.participants} onReload={d.reload} />}
        {tab === 'Approval' && <ApprovalTab investment={inv} onReload={d.reload} />}
        {tab === 'Timeline' && <TimelineTab history={d.history} />}
      </div>
    </div>
  );
}
