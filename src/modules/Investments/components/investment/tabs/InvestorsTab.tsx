// ==========================================
// Investors Tab
// ==========================================

import React, { useMemo } from 'react';
import { BDT, PCT } from '../../../utils/investmentUtils';
import { RoleBadge } from '../Badges';
import { DonutChart, Legend, StackedShareBar, type ChartSegment } from '../Charts';
import { PARTICIPANT_COLORS } from '../../../constants/investmentConstants';
import { Star } from 'lucide-react';
import type { Investment, InvestmentParticipant } from '../../../types/investment.types';

interface Props {
  investment: Investment;
  participants: InvestmentParticipant[];
}

export default function InvestorsTab({ participants }: Props) {
  const segments: ChartSegment[] = useMemo(() => {
    return participants.map((p, i) => ({
      label: p.name,
      value: p.committed_amount || 0,
      color: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length],
      displayValue: PCT(p.participation_pct) + ' · ' + BDT(p.committed_amount || 0),
    }));
  }, [participants]);

  const totalCommitted = participants.reduce(
    (s, p) => s + (p.committed_amount || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border p-5">
        <h3 className="font-display text-sm font-semibold">
          Investment Participation
        </h3>
        <p className="text-xs text-muted-foreground">
          Total committed: {BDT(totalCommitted)}
        </p>
        <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          {segments.length > 0 && (
            <DonutChart
              segments={segments}
              centerLabel="Capital"
              centerValue={BDT(totalCommitted)}
              size={160}
            />
          )}
          <Legend segments={segments} className="flex-1" />
        </div>
        <div className="mt-4">
          <p className="label-eyebrow mb-2">Capital Allocation</p>
          <StackedShareBar segments={segments} height="h-4" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-4 py-2.5 label-eyebrow">Investor</th>
              <th className="px-4 py-2.5 label-eyebrow">Role</th>
              <th className="px-4 py-2.5 label-eyebrow text-right">Committed</th>
              <th className="px-4 py-2.5 label-eyebrow text-right">Funded</th>
              <th className="px-4 py-2.5 label-eyebrow text-right">
                Participation %
              </th>
              <th className="px-4 py-2.5 label-eyebrow text-right">
                Return Share %
              </th>
              <th className="px-4 py-2.5 label-eyebrow">Funding Status</th>
              <th className="px-4 py-2.5 label-eyebrow">Settlement Status</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p, i) => {
              const fundPct =
                p.committed_amount > 0
                  ? (p.funded_amount / p.committed_amount) * 100
                  : 0;
              return (
                <tr key={p.id || i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{
                          backgroundColor:
                            PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length],
                        }}
                      />
                      <span className="font-medium">{p.name}</span>
                      {p.role === 'Lead Investor' && (
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      )}
                    </div>
                    <div className="ml-4.5 text-xs text-muted-foreground">
                      {p.participant_type}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={p.role} lead={p.role === 'Lead Investor'} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {BDT(p.committed_amount || 0)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {BDT(p.funded_amount || 0)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {PCT(p.participation_pct)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {PCT(p.return_share_pct)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-emerald-600"
                          style={{ width: fundPct + '%' }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {fundPct.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                        p.status === 'Settled'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {p.status || 'Active'}
                    </span>
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