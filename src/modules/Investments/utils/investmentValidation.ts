// ==========================================
// Investment validation — ONE place for the rules.
// Used by the Create page (to show messages) and by investmentOps (final safety net),
// so the two can never disagree. Pure functions: no Firebase, easy to test.
// ==========================================

export type FieldErrors = Record<string, string>;

export interface InvestmentFormValues {
  investment_name: string;
  reference_number: string;
  category: string;
  total_required_investment: number;
  expected_return_amount: number;
  return_rate: number;
  start_date: string; // 'YYYY-MM-DD' or ''
  maturity_date: string; // 'YYYY-MM-DD' or ''
}

const bad = (n: number) => !Number.isFinite(n) || n < 0;

export function validateInvestmentForm(v: InvestmentFormValues): FieldErrors {
  const e: FieldErrors = {};
  if (!v.investment_name?.trim()) e.investment_name = 'Investment name is required';
  if (!v.reference_number?.trim()) e.reference_number = 'Reference number is required';
  if (!v.category) e.category = 'Please select a category';

  if (bad(v.total_required_investment)) e.total_required_investment = 'Amount cannot be negative';
  else if (!(v.total_required_investment > 0))
    e.total_required_investment = 'Total required investment must be greater than 0';

  if (bad(v.expected_return_amount)) e.expected_return_amount = 'Amount cannot be negative';
  if (bad(v.return_rate) || v.return_rate > 100) e.return_rate = 'Return rate must be between 0 and 100';

  // Both dates given -> maturity must not be before start (same day is fine).
  if (v.start_date && v.maturity_date && v.maturity_date < v.start_date)
    e.maturity_date = 'Maturity date cannot be before the start date';
  return e;
}

export function validateParticipantForm(p: {
  name?: string;
  committed_amount?: number;
  return_share_pct?: number;
}): FieldErrors {
  const e: FieldErrors = {};
  if (!p.name?.trim()) e.name = 'Name is required';
  if (bad(p.committed_amount ?? 0)) e.committed_amount = 'Amount cannot be negative';
  const rs = p.return_share_pct ?? 0;
  if (bad(rs) || rs > 100) e.return_share_pct = 'Must be between 0 and 100';
  return e;
}

export const firstError = (e: FieldErrors): string | undefined => Object.values(e)[0];
