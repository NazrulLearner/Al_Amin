// Export button with a small menu: Excel (works) and PDF (coming soon).
import { useEffect, useRef, useState } from 'react';
import { Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface Props {
  count: number; // how many investments would be exported
  onExcel: () => void;
}

export default function ExportButton({ count, onExcel }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={count === 0}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <p className="border-b border-border px-4 py-2 text-xs text-muted-foreground">
            Exports all {count} investment{count === 1 ? '' : 's'} matching the current search/status.
          </p>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onExcel();
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted"
          >
            <FileSpreadsheet className="h-4 w-4 text-green-600" /> Export as Excel
          </button>
          <button type="button" role="menuitem" disabled className="flex w-full cursor-not-allowed items-center gap-3 px-4 py-3 text-left text-sm opacity-60">
            <FileText className="h-4 w-4 text-red-600" /> Export as PDF
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">Coming soon</span>
          </button>
        </div>
      )}
    </div>
  );
}
