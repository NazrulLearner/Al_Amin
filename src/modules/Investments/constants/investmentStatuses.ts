export const INVESTMENT_STATUS = {
  ACTIVE: 'active',
  MATURED: 'matured',
  WITHDRAWN: 'withdrawn',
  DEFAULTED: 'defaulted'
} as const;

export type InvestmentStatusType = typeof INVESTMENT_STATUS[keyof typeof INVESTMENT_STATUS];

export const INVESTMENT_STATUS_LABELS: Record<InvestmentStatusType, string> = {
  [INVESTMENT_STATUS.ACTIVE]: 'সক্রিয়',
  [INVESTMENT_STATUS.MATURED]: 'পরিপক্ক',
  [INVESTMENT_STATUS.WITHDRAWN]: 'উত্তোলিত',
  [INVESTMENT_STATUS.DEFAULTED]: 'খেলাপি'
};

export const INVESTMENT_STATUS_COLORS: Record<InvestmentStatusType, string> = {
  [INVESTMENT_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [INVESTMENT_STATUS.MATURED]: 'bg-blue-100 text-blue-800',
  [INVESTMENT_STATUS.WITHDRAWN]: 'bg-gray-100 text-gray-800',
  [INVESTMENT_STATUS.DEFAULTED]: 'bg-red-100 text-red-800'
};

export const INVESTMENT_STATUS_BADGES: Record<InvestmentStatusType, string> = {
  [INVESTMENT_STATUS.ACTIVE]: '🟢 সক্রিয়',
  [INVESTMENT_STATUS.MATURED]: '🔵 পরিপক্ক',
  [INVESTMENT_STATUS.WITHDRAWN]: '⚪ উত্তোলিত',
  [INVESTMENT_STATUS.DEFAULTED]: '🔴 খেলাপি'
};