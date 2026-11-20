// ==========================================
// Investment Utility Functions
// ==========================================

import type { Investment, InvestmentParticipant, InvestmentTotals } from '../types/investment.types';

// ===== Currency Formatting =====
// Taka with lakh/crore grouping (15,00,000). Paisa shown only when the amount has them.
// ONE place: when the Settings-based formatter is wired in, change it here.
export const formatTaka = (n: number | null | undefined): string => {
  const v = Number(n);
  if (n === null || n === undefined || !Number.isFinite(v)) return '0';
  const hasPaisa = Math.abs(v - Math.round(v)) > 0.000001;
  return v.toLocaleString('en-IN', {
    minimumFractionDigits: hasPaisa ? 2 : 0,
    maximumFractionDigits: 2,
  });
};

export const BDT = (amount: number | null | undefined): string => '৳' + formatTaka(amount);

export const BDTCompact = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '৳0';
  const n = Number(amount);
  if (Math.abs(n) >= 10000000) return '৳' + (n / 10000000).toFixed(2) + 'Cr';
  if (Math.abs(n) >= 100000) return '৳' + (n / 100000).toFixed(2) + 'L';
  if (Math.abs(n) >= 1000) return '৳' + (n / 1000).toFixed(1) + 'K';
  return '৳' + n.toLocaleString('en-US');
};

export const PCT = (n: number | null | undefined): string => {
  if (n === null || n === undefined) return '—';
  return Number(n).toFixed(1) + '%';
};

// ===== Date Utilities =====
export const daysBetween = (d1: string | Date, d2: string | Date): number => {
  const a = new Date(d1);
  const b = new Date(d2);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
};

export const daysUntil = (date: string | Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return daysBetween(today, date);
};

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// ===== Totals Calculation =====
export const computeTotals = (
  investment: Partial<Investment>,
  participants: InvestmentParticipant[] = []
): InvestmentTotals => {
  const totalCommitted = participants.length > 0
    ? participants.reduce((s, p) => s + (p.committed_amount || 0), 0)
    : (investment.somity_committed_amount || 0);

  const totalFunded = participants.reduce((s, p) => s + (p.funded_amount || 0), 0);
  const somityP = participants.find((p) => p.participant_type === 'Somity');
  const somityFunded = somityP?.funded_amount || 0;
  const externalCommitted = totalCommitted - (somityP?.committed_amount || 0);
  const fundingGap = (investment.total_required_investment || 0) - totalCommitted;
  const outstandingReturn =
    (investment.expected_return_amount || 0) - (investment.actual_return_amount || 0);

  return {
    totalCommitted, totalFunded, somityFunded,
    externalCommitted, fundingGap, outstandingReturn,
  };
};

export const participantsOf = (
  participants: InvestmentParticipant[],
  investmentId: string
): InvestmentParticipant[] => {
  return participants.filter((p) => p.investment_id === investmentId);
};
