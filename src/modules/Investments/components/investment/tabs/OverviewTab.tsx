// ==========================================
// Overview Tab
// ==========================================

import React from 'react';
import { BDT, formatDate, computeTotals } from '../../../utils/investmentUtils';
import { RiskBadge, StructureBadge, RoleBadge } from '../Badges';
import type { Investment, InvestmentParticipant } from '../../../types/investment.types';

interface Props {
  investment: Investment;
  participants: InvestmentParticipant[];
}

export default function OverviewTab({ investment, participants }: Props) {
  const t = computeTotals(investment, participants);
  const somityP = participants.find((p) => p.participant_type === 'Somity');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Investment Information">
          <Row label="Opportunity" value={investment.opportunity || '—'} />
          <Row label="Purpose" value={investment.purpose || '—'} />
          <Row label="Description" value={investment.description || '—'} />
          <Row label="Category" value={investment.category} />
          <Row label="Location" value={investment.location || '—'} />
        </Section>

        <Section title="Investment Structure">
          <Row
            label="Investment Type"
            value={<StructureBadge structure={investment.investment_structure} />}
          />
          <Row
            label="Somity Role"
            value={
              <RoleBadge
                role={investment.somity_role}
                lead={investment.somity_role === 'Lead Investor'}
              />
            }
          />
          <Row label="Lead Investor" value={investment.lead_investor_name || '—'} />
          <Row
            label="Number of Co-Investors"
            value={String(participants.filter((p) => p.role === 'Co-Investor').length)}
          />
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Financial Summary">
          <Row label="Required Amount" value={BDT(investment.total_required_investment)} />
          <Row label="Committed Amount" value={BDT(t.totalCommitted)} />
          <Row label="Funded Amount" value={BDT(t.totalFunded)} />
          <Row
            label="Funding Gap"
            value={BDT(t.fundingGap)}
            tone={t.fundingGap > 0 ? 'amber' : 'default'}
          />
          <Row
            label="Somity Commitment"
            value={BDT(somityP?.committed_amount || investment.somity_committed_amount || 0)}
          />
          <Row label="External Commitment" value={BDT(t.externalCommitted)} />
        </Section>

        <Section title="Return Terms">
          <Row label="Return Model" value={investment.return_model} />
          <Row
            label="Rate"
            value={investment.return_rate ? investment.return_rate + '%' : '—'}
          />
          <Row label="Duration" value={investment.return_duration || '—'} />
          <Row
            label="Expected Profit"
            value={BDT(investment.expected_return_amount)}
            tone="emerald"
          />
          <Row
            label="Expected Total Return"
            value={BDT((investment.total_required_investment || 0) + (investment.expected_return_amount || 0))}
          />
          <Row label="Start Date" value={formatDate(investment.start_date)} />
          <Row label="Maturity Date" value={formatDate(investment.maturity_date)} />
        </Section>
      </div>

      <Section title="Risk Assessment">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="label-eyebrow">Risk Level</span>
          <RiskBadge level={investment.risk_level} />
          {investment.risk_category && (
            <span className="text-sm text-muted-foreground">· {investment.risk_category}</span>
          )}
        </div>
        <Row label="Risk Description" value={investment.risk_description || '—'} />
        <Row label="Mitigation Plan" value={investment.mitigation_plan || '—'} />
        <Row label="Collateral / Security" value={investment.collateral_security || '—'} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border">
      <div className="border-b border-border bg-muted/40 px-4 py-2.5">
        <h3 className="font-display text-sm font-semibold">{title}</h3>
      </div>
      <dl className="divide-y divide-border">{children}</dl>
    </div>
  );
}

function Row({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: React.ReactNode;
  tone?: 'default' | 'emerald' | 'amber';
}) {
  const tones = {
    default: 'text-foreground',
    emerald: 'text-emerald-700 font-semibold',
    amber: 'text-amber-700 font-semibold',
  };
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className={`text-right ${tones[tone]}`}>{value}</dd>
    </div>
  );
}