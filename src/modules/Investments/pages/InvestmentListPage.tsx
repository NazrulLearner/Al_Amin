// ==========================================
// Investment List (module home)
// - ONE load (investments + Somity participant rows), filtered/sorted/paged in memory.
// - "See More" shows the next 10 rows. Search + Status live in the address bar (?status=Active&q=INV),
//   so Back/Refresh keep them. Changing a filter returns to the first 10 rows.
// - Export (Excel) exports ALL investments matching the current search/status, with the full investment data.
// ==========================================
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Layers, Target, Wallet, ArrowDownToLine } from 'lucide-react';
import { toast } from 'sonner';
import '../investments.css';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Button } from '../../../shared/components/ui/button';
import { useInvestmentList } from '../hooks/useInvestmentData';
import type { InvestmentRow } from '../hooks/useInvestmentData';
import { MetricCard } from '../components/investment/Charts';
import ExportButton from '../components/investment/ExportButton';
import InvestmentTable from '../components/investment/InvestmentTable';
import ListFilters from '../components/investment/ListFilters';
import DeleteInvestmentDialog from '../components/investment/DeleteInvestmentDialog';
import { softDeleteInvestment } from '../services';
import { toActor } from '../utils/actor';
import { BDT } from '../utils/investmentUtils';
import { exportInvestmentsToExcel } from '../utils/investmentExport';
import { applyFilter, filterToParams, hasActiveFilter, parseFilter } from '../utils/investmentListFilters';
import type { ListFilter } from '../utils/investmentListFilters';
import { hasInvestmentPermission, investmentPermissions } from '../permissions';

const PAGE_SIZE = 10;

export default function InvestmentListPage() {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { rows, loading, error, capped, reload } = useInvestmentList();

  const [params, setParams] = useSearchParams();
  const filter = useMemo(() => parseFilter(params), [params]);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const [toDelete, setToDelete] = useState<InvestmentRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const role = userData?.role;
  const canEdit = hasInvestmentPermission(role, investmentPermissions.EDIT_INVESTMENT);
  const canDelete = hasInvestmentPermission(role, investmentPermissions.DELETE_INVESTMENT);

  // Any filter change -> back to the first 10 rows. Other filters are kept.
  const change = useCallback(
    (patch: Partial<ListFilter>) => {
      setVisible(PAGE_SIZE);
      setParams(filterToParams({ ...filter, ...patch }), { replace: true });
    },
    [filter, setParams]
  );
  const clear = useCallback(() => {
    setVisible(PAGE_SIZE);
    setParams({}, { replace: true });
  }, [setParams]);

  // Summary cards: ALL (non-deleted) investments, not just the filtered ones.
  const stats = useMemo(
    () => ({
      count: rows.length,
      committed: rows.reduce((s, r) => s + (r.somity_committed_amount || 0), 0),
      funded: rows.reduce((s, r) => s + (r.somity_funded || 0), 0),
      returned: rows.reduce((s, r) => s + (r.actual_return_amount || 0), 0),
    }),
    [rows]
  );

  const filtered = useMemo(() => applyFilter(rows, filter), [rows, filter]);
  const shown = filtered.slice(0, visible);

  const doExcelExport = () => {
    try {
      exportInvestmentsToExcel(filtered);
      toast.success(`Exported ${filtered.length} investment${filtered.length === 1 ? '' : 's'} to Excel`);
    } catch (e) {
      console.error('[investments] excel export failed', e);
      toast.error('Export failed. Please try again.');
    }
  };

  const confirmDelete = async (reason: string) => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await softDeleteInvestment(toDelete.id, reason, toActor(user, userData));
      toast.success('Investment deleted');
      setToDelete(null);
      await reload();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Could not delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investments</h1>
          <p className="text-sm text-muted-foreground">Money the Somity has put into projects, and what came back.</p>
        </div>
        <Button onClick={() => navigate('/investments/create')} className="h-10 gap-2">
          <Plus className="h-4 w-4" /> New Investment
        </Button>
      </div>

      {/* 4 cards in ONE row on laptops/desktops (lg+); 2 per row (2 rows) on phones */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <MetricCard variant="summary" tone="slate" label="Total Investments" value={loading ? '—' : stats.count} icon={Layers} />
        <MetricCard variant="summary" tone="indigo" label="Somity Committed" value={loading ? '—' : BDT(stats.committed)} icon={Target} />
        <MetricCard variant="summary" tone="emerald" label="Somity Funded" value={loading ? '—' : BDT(stats.funded)} icon={Wallet} />
        <MetricCard variant="summary" tone="amber" label="Returns Received" value={loading ? '—' : BDT(stats.returned)} icon={ArrowDownToLine} />
      </div>

      <ListFilters filter={filter} onChange={change} />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading…' : `${filtered.length} investment${filtered.length === 1 ? '' : 's'}`}
        </p>
        <ExportButton count={loading || error ? 0 : filtered.length} onExcel={doExcelExport} />
      </div>

      <InvestmentTable
        rows={shown}
        loading={loading}
        error={error}
        onRetry={reload}
        hasFilters={hasActiveFilter(filter)}
        totalAll={rows.length}
        onClearFilters={clear}
        onCreate={() => navigate('/investments/create')}
        onView={(r) => navigate(`/investments/${r.id}`)}
        onDelete={(r) => { setDeleteError(null); setToDelete(r); }}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      {!loading && !error && filtered.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing 1–{shown.length} of {filtered.length}
            {hasActiveFilter(filter) && rows.length !== filtered.length ? ` (filtered from ${rows.length})` : ''}
          </p>
          {shown.length < filtered.length && (
            <Button variant="outline" className="h-10 min-w-[140px]" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
              See More
            </Button>
          )}
        </div>
      )}

      {capped && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          Only the newest 100 investments are loaded. Server-side paging is needed before this list grows beyond that.
        </p>
      )}

      <DeleteInvestmentDialog row={toDelete} busy={deleting} error={deleteError} onConfirm={confirmDelete} onClose={() => setToDelete(null)} />
    </div>
  );
}
