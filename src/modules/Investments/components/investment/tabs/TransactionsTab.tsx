// ==========================================
// Transactions Tab
// ==========================================

import React from 'react';
import { BDT, formatDate } from '../../../utils/investmentUtils';
import { ArrowDownLeft, ArrowUpRight, Activity } from 'lucide-react';
import type { InvestmentTransaction } from '../../../types/investment.types';

interface Props {
  transactions: InvestmentTransaction[];
}

export default function TransactionsTab({ transactions }: Props) {
  const sorted = [...transactions].sort(
    (a, b) =>
      new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        All financial events tied to this investment — funding outflows and return
        inflows. Distinct from the investment's core details.
      </p>
      <div className="overflow-x-auto rounded-lg border border-border scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-4 py-2.5 label-eyebrow">Date</th>
              <th className="px-4 py-2.5 label-eyebrow">Investor</th>
              <th className="px-4 py-2.5 label-eyebrow">Transaction Type</th>
              <th className="px-4 py-2.5 label-eyebrow text-right">Amount</th>
              <th className="px-4 py-2.5 label-eyebrow">Direction</th>
              <th className="px-4 py-2.5 label-eyebrow">Reference</th>
              <th className="px-4 py-2.5 label-eyebrow">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  <Activity className="mx-auto mb-2 h-6 w-6 opacity-40" />
                  No transactions recorded yet.
                </td>
              </tr>
            ) : (
              sorted.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{formatDate(t.transaction_date)}</td>
                  <td className="px-4 py-3 font-medium">
                    {t.investor_name || '—'}
                  </td>
                  <td className="px-4 py-3">{t.transaction_type}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {BDT(t.amount || 0)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs">
                      {t.direction === 'Inflow' ? (
                        <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                      ) : t.direction === 'Outflow' ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-indigo-600" />
                      ) : (
                        <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      {t.direction}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {t.reference || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}