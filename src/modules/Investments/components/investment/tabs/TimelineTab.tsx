// ==========================================
// Timeline Tab
// ==========================================

import React from 'react';
import { formatDate } from '../../../utils/investmentUtils';
import {
  CheckCircle2, Circle, FilePlus, FileText, Wallet,
  TrendingUp, CalendarClock, Lock, Trash2, RotateCcw,
} from 'lucide-react';
import type { InvestmentHistory } from '../../../types/investment.types';

const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Created: FilePlus,
  Updated: FileText,
  Submitted: FileText,
  Approved: CheckCircle2,
  Rejected: Circle,
  'Funding Recorded': Wallet,
  'Return Recorded': TrendingUp,
  Maturity: CalendarClock,
  Settlement: Lock,
  Closed: CheckCircle2,
  'Revision Requested': Circle,
  Withdrawn: Circle,
  Cancelled: Circle,
  Deleted: Trash2,
  Restored: RotateCcw,
};

interface Props {
  history: InvestmentHistory[];
}

export default function TimelineTab({ history }: Props) {
  const sorted = [...history].sort(
    (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
  );

  return (
    <div className="space-y-4">
      <h3 className="font-display text-sm font-semibold">Investment Timeline</h3>
      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No timeline events yet.
        </p>
      ) : (
        <ol className="relative space-y-5 border-l-2 border-border pl-6">
          {sorted.map((h, i) => {
            const Icon = EVENT_ICONS[h.event] || Circle;
            return (
              <li key={h.id || i} className="relative">
                <span className="absolute -left-[1.85rem] flex h-6 w-6 items-center justify-center rounded-full border-2 border-border bg-card">
                  <Icon className="h-3 w-3 text-primary" />
                </span>
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-sm font-semibold">{h.event}</p>
                    <time className="text-xs text-muted-foreground">
                      {formatDate(h.event_date)}
                    </time>
                  </div>
                  {h.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{h.description}</p>
                  )}
                  {h.performed_by && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      by {h.performed_by}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}