// ==========================================
// Investment Table (list page)
// Columns: Investment Name | Investment ID | Total Required | Somity Committed | Funded | Returned | Status | Created | Actions
// Mobile: the whole table scrolls sideways (no frozen columns).
// ==========================================
import { Eye, Pencil, Trash2, SearchX, Inbox, AlertTriangle } from 'lucide-react';
import { StatusBadge } from './Badges';
import { ProgressBar } from './Charts';
import { BDT, formatDate } from '../../utils/investmentUtils';
import { showsFundingProgress } from '../../utils/investmentListFilters';
import type { InvestmentRow } from '../../hooks/useInvestmentData';
import { cn } from '../../../../lib/utils';

interface Props {
  rows: InvestmentRow[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  hasFilters: boolean;
  totalAll: number;
  onClearFilters: () => void;
  onCreate: () => void;
  onView: (r: InvestmentRow) => void;
  onDelete: (r: InvestmentRow) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const TH = 'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap';
// Same size on every device; 44px on touch screens so a finger can hit it.
const ICON_BTN =
  'inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors sm:h-9 sm:w-9 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-t border-border">
          {Array.from({ length: 9 }).map((__, j) => (
            <td key={j} className="px-4 py-4">
              <div className={cn('h-4 animate-pulse rounded bg-muted', j === 0 ? 'w-40' : 'ml-auto w-20')} />
              {j === 0 && <div className="mt-2 h-3 w-24 animate-pulse rounded bg-muted" />}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function InvestmentTable(p: Props) {
  const { rows, loading, error, hasFilters, totalAll } = p;

  if (error && !loading) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-red-600" />
        <p className="mt-2 font-semibold text-red-800">Could not load investments</p>
        <p className="mt-1 text-sm text-red-700">{error}</p>
        <button onClick={p.onRetry} className="mt-4 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
          Try again
        </button>
      </div>
    );
  }

  if (!loading && rows.length === 0) {
    const none = totalAll === 0;
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        {none ? <Inbox className="mx-auto h-9 w-9 text-muted-foreground" /> : <SearchX className="mx-auto h-9 w-9 text-muted-foreground" />}
        <p className="mt-3 font-semibold text-foreground">{none ? 'No investments yet' : 'No investments match your filters'}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {none ? 'Create the first investment to see it here.' : 'Try a different search or clear the filters.'}
        </p>
        <button
          onClick={none ? p.onCreate : p.onClearFilters}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {none ? 'New Investment' : hasFilters ? 'Clear filters' : 'Reload'}
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className={TH}>Investment Name</th>
              <th className={TH}>Investment ID</th>
              <th className={cn(TH, 'text-right')}>Total Required</th>
              <th className={cn(TH, 'text-right')}>Somity Committed</th>
              <th className={cn(TH, 'text-right')}>Funded</th>
              <th className={cn(TH, 'text-right')} title="Total returns received for this investment (all investors)">Returned</th>
              <th className={TH}>Status</th>
              <th className={TH}>Created</th>
              <th className={cn(TH, 'text-center')}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonRows />}
            {!loading &&
              rows.map((r) => {
                const progress = showsFundingProgress(r.status, r.somity_committed_amount || 0);
                return (
                  <tr
                    key={r.id}
                    onClick={() => p.onView(r)}
                    className="cursor-pointer border-t border-border transition-colors hover:bg-muted/60"
                  >
                    <td className="px-4 py-3">
                      <div className="max-w-[240px] truncate font-medium text-foreground" title={r.investment_name}>
                        {r.investment_name}
                      </div>
                      <div className="mt-1">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{r.category}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-foreground">{r.reference_number}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{BDT(r.total_required_investment)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{BDT(r.somity_committed_amount)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <div>{BDT(r.somity_funded)}</div>
                      {progress && (
                        <div className="ml-auto mt-1.5 flex w-28 items-center gap-2">
                          <ProgressBar value={r.somity_funded} max={r.somity_committed_amount} height="h-1.5" />
                          <span className="text-[11px] text-muted-foreground">
                            {Math.min(100, Math.round((r.somity_funded / r.somity_committed_amount) * 100))}%
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{BDT(r.actual_return_amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(r.created_date)}</td>
                    <td className="px-2 py-1" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-0.5">
                        <button type="button" aria-label={`View ${r.investment_name}`} title="View" className={cn(ICON_BTN, 'hover:bg-muted hover:text-foreground')} onClick={() => p.onView(r)}>
                          <Eye className="h-4 w-4" />
                        </button>
                        {p.canEdit && (
                          <button type="button" disabled aria-label="Edit (coming in the next step)" title="Edit — coming in the next step" className={cn(ICON_BTN, 'cursor-not-allowed opacity-40')}>
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {p.canDelete && (
                          <button type="button" aria-label={`Delete ${r.investment_name}`} title="Delete" className={cn(ICON_BTN, 'hover:bg-red-50 hover:text-red-600')} onClick={() => p.onDelete(r)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
