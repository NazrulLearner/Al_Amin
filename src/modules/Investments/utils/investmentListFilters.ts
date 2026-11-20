// ==========================================
// List filtering / URL handling — pure functions (no Firebase, easy to test).
// The list holds at most ~50 investments, so everything runs in memory.
// Filters: search (name or Investment ID) + status. Order is always newest first.
// ==========================================
import { STATUSES } from '../constants/investmentConstants';
import type { Investment } from '../types';

export interface ListFilter {
  q: string;
  status: string; // '' = all statuses
}

export const DEFAULT_FILTER: ListFilter = { q: '', status: '' };

// Reads the address-bar query (?status=Active&q=INV) safely; unknown values are ignored.
export function parseFilter(params: URLSearchParams): ListFilter {
  const status = params.get('status') || '';
  return {
    q: (params.get('q') || '').slice(0, 100),
    status: (STATUSES as readonly string[]).includes(status) ? status : '',
  };
}

// Only non-default values go into the address bar.
export function filterToParams(f: ListFilter): Record<string, string> {
  const out: Record<string, string> = {};
  if (f.q) out.q = f.q;
  if (f.status) out.status = f.status;
  return out;
}

export const hasActiveFilter = (f: ListFilter) => !!(f.q.trim() || f.status);

const time = (v?: string) => new Date(v || 0).getTime() || 0;

// "Investment ID" is the reference number shown in the table.
export function applyFilter<T extends Investment>(rows: T[], f: ListFilter): T[] {
  const q = f.q.trim().toLowerCase();
  return rows
    .filter((r) => {
      if (f.status && r.status !== f.status) return false;
      if (!q) return true;
      return (
        (r.investment_name || '').toLowerCase().includes(q) ||
        (r.reference_number || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => time(b.created_date) - time(a.created_date));
}

// The funding progress bar only makes sense once money can actually be paid in.
export const PROGRESS_STATUSES = ['Approved', 'Funding', 'Active', 'Return Received', 'Matured', 'Settlement', 'Closed'];
export const showsFundingProgress = (status: string, somityCommitted: number) =>
  PROGRESS_STATUSES.includes(status) && somityCommitted > 0;
