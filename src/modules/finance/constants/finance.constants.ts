// src/modules/finance/constants/finance.constants.ts

export const ACCOUNT_TYPES = {
  SAVINGS: 'savings',
  CURRENT: 'current',
  FIXED: 'fixed'
} as const;

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: 'সেভিংস অ্যাকাউন্ট',
  current: 'কারেন্ট অ্যাকাউন্ট',
  fixed: 'ফিক্সড ডিপোজিট'
};

export const TRANSACTION_TYPES = {
  COLLECTION: 'collection',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRANSFER: 'transfer',
  DISBURSEMENT: 'disbursement'
} as const;

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  collection: 'সংগ্রহ',
  deposit: 'জমা',
  withdrawal: 'উত্তোলন',
  transfer: 'ট্রান্সফার',
  disbursement: 'বিতরণ'
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  BANK: 'bank',
  BIKASH: 'bikash',
  NOGOD: 'nogod',
  ROCKET: 'rocket'
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'নগদ',
  bank: 'ব্যাংক',
  bikash: 'বিকাশ',
  nogod: 'নগদ',
  rocket: 'রকেট'
};

export const CASH_IN_SOURCES = {
  COLLECTION: 'collection',
  LOAN_REPAYMENT: 'loan_repayment',
  INVESTMENT: 'investment',
  OTHER: 'other'
} as const;

export const CASH_OUT_PURPOSES = {
  DISBURSEMENT: 'disbursement',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
  OTHER: 'other'
} as const;