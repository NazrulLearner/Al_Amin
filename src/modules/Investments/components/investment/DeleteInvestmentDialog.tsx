// ==========================================
// Confirmation dialog for SOFT delete.
// The investment is only hidden; all its money records stay in the database.
// ==========================================
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { BDT } from '../../utils/investmentUtils';
import type { InvestmentRow } from '../../hooks/useInvestmentData';

interface Props {
  row: InvestmentRow | null;
  busy: boolean;
  error: string | null;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export default function DeleteInvestmentDialog({ row, busy, error, onConfirm, onClose }: Props) {
  const [reason, setReason] = useState('');
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (row) {
      setReason('');
      setTimeout(() => box.current?.focus(), 0);
    }
  }, [row]);

  useEffect(() => {
    if (!row) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [row, busy, onClose]);

  if (!row) return null;
  const tooShort = reason.trim().length < 3;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onMouseDown={() => !busy && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="del-title"
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl bg-card p-5 shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 id="del-title" className="text-base font-semibold text-foreground">Delete this investment?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{row.investment_name}</span> ({row.reference_number}, {BDT(row.total_required_investment)}) will be hidden from the list.
              Nothing is erased: investors, funding, returns and history stay in the database.
            </p>
          </div>
        </div>

        <label className="mt-4 block text-sm font-medium text-foreground" htmlFor="del-reason">
          Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          id="del-reason"
          ref={box}
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Created by mistake / duplicate entry"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {error && <p role="alert" className="mt-2 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" disabled={busy} onClick={onClose} className="h-10 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted disabled:opacity-50">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || tooShort}
            onClick={() => onConfirm(reason.trim())}
            className="h-10 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
