// ==========================================
// Search + Status filter (side by side).
// One object (ListFilter): changing one never resets the other.
// ==========================================
import { Search, X } from 'lucide-react';
import { Input } from '../../../../shared/components/ui/Input';
import { STATUSES } from '../../constants/investmentConstants';
import type { ListFilter } from '../../utils/investmentListFilters';

interface Props {
  filter: ListFilter;
  onChange: (patch: Partial<ListFilter>) => void;
}

const SELECT =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function ListFilters({ filter, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filter.q}
          onChange={(e) => onChange({ q: e.target.value })}
          placeholder="Search by investment name or ID"
          className="pl-9 pr-9"
          aria-label="Search investments by name or ID"
          maxLength={100}
        />
        {filter.q && (
          <button type="button" aria-label="Clear search" onClick={() => onChange({ q: '' })} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="sm:w-56">
        <select aria-label="Filter by status" className={SELECT} value={filter.status} onChange={(e) => onChange({ status: e.target.value })}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
