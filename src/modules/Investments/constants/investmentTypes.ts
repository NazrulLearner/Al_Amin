export const INVESTMENT_PLANS = {
  SHORT_TERM: {
    id: 'short_term',
    name: 'স্বল্পমেয়াদী',
    nameBn: 'স্বল্পমেয়াদী বিনিয়োগ',
    minAmount: 5000,
    maxAmount: 50000,
    durationMonths: 6,
    expectedProfitPercent: 8,
    riskLevel: 'low'
  },
  MID_TERM: {
    id: 'mid_term',
    name: 'মধ্যমেয়াদী',
    nameBn: 'মধ্যমেয়াদী বিনিয়োগ',
    minAmount: 10000,
    maxAmount: 100000,
    durationMonths: 12,
    expectedProfitPercent: 12,
    riskLevel: 'medium'
  },
  LONG_TERM: {
    id: 'long_term',
    name: 'দীর্ঘমেয়াদী',
    nameBn: 'দীর্ঘমেয়াদী বিনিয়োগ',
    minAmount: 25000,
    maxAmount: 500000,
    durationMonths: 24,
    expectedProfitPercent: 15,
    riskLevel: 'high'
  }
} as const;

export const PROFIT_CALCULATION_TYPES = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  AT_MATURITY: 'at_maturity'
} as const;

export const RISK_LEVELS = {
  LOW: { value: 'low', label: 'নিম্ন', color: 'text-green-600' },
  MEDIUM: { value: 'medium', label: 'মধ্যম', color: 'text-yellow-600' },
  HIGH: { value: 'high', label: 'উচ্চ', color: 'text-red-600' }
} as const;