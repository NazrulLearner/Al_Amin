// src/utils/calculations/contributionCalculator.ts

/**
 * 🧮 Contribution Calculator Utilities
 * All fee/contribution calculation logic in one place
 * Reusable across services, reports, and components
 */

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export const MONTHS_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
] as const;

export type MonthName = typeof MONTHS[number];

// ============================================
// 📅 Month Utilities
// ============================================

/** Get month index (0-11) from month name */
export const getMonthIndex = (monthName: string): number => {
  const index = MONTHS.indexOf(monthName as MonthName);
  if (index === -1) throw new Error(`Invalid month name: ${monthName}`);
  return index;
};

/** Get next month and year */
export const getNextMonth = (month: string, year: number): { month: string; year: number } => {
  const monthIndex = getMonthIndex(month);
  const nextMonthIndex = (monthIndex + 1) % 12;
  const nextYear = monthIndex === 11 ? year + 1 : year;
  return { month: MONTHS[nextMonthIndex], year: nextYear };
};

/** Get previous month and year */
export const getPreviousMonth = (month: string, year: number): { month: string; year: number } => {
  const monthIndex = getMonthIndex(month);
  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevYear = monthIndex === 0 ? year - 1 : year;
  return { month: MONTHS[prevMonthIndex], year: prevYear };
};

/** Get array of months between two dates (inclusive) */
export const getMonthsBetween = (
  startMonth: string,
  startYear: number,
  endMonth: string,
  endYear: number,
  maxMonths: number = 500
): { month: string; year: number }[] => {
  const months: { month: string; year: number }[] = [];
  let currentMonth = startMonth;
  let currentYear = startYear;

  while (months.length < maxMonths) {
    months.push({ month: currentMonth, year: currentYear });
    if (currentMonth === endMonth && currentYear === endYear) break;
    const next = getNextMonth(currentMonth, currentYear);
    currentMonth = next.month;
    currentYear = next.year;
  }

  return months;
};

/** Get all months from start to current date */
export const getMonthsFromStart = (
  startMonth: string,
  startYear: number,
  endMonth?: string,
  endYear?: number
): { month: string; year: number }[] => {
  const now = new Date();
  const currentMonth = endMonth || MONTHS[now.getMonth()];
  const currentYear = endYear ?? now.getFullYear();

  return getMonthsBetween(startMonth, startYear, currentMonth, currentYear);
};

/** Get current month and year */
export const getCurrentMonthYear = (): { month: string; year: number } => {
  const now = new Date();
  return { month: MONTHS[now.getMonth()], year: now.getFullYear() };
};

/** Get month short name */
export const getMonthShort = (month: string, format: 'en' | 'bn' = 'en'): string => {
  const index = MONTHS.indexOf(month as MonthName);
  if (index === -1) return month.slice(0, 3);
  return format === 'bn' ? MONTHS_BN[index] : MONTHS_SHORT[index];
};

// ============================================
// 🧾 Receipt ID Generation
// ============================================

/** Generate receipt ID with prefix */
export const generateReceiptId = (prefix: string = 'RCPT-'): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${year}${month}${day}-${random}`;
};

// ============================================
// 💰 Fee/Payment Calculations
// ============================================

/** Calculate monthly fee for a member based on share count and fee per share */
export const calculateMonthlyFee = (shareCount: number, feePerShare: number): number => {
  return shareCount * feePerShare;
};

/** Calculate total amount for multiple months */
export const calculateTotalAmount = (
  months: { month: string; year: number; amount: number }[]
): number => {
  return months.reduce((sum, m) => sum + m.amount, 0);
};

/** Sort paid months chronologically */
export const sortMonths = (
  months: { month: string; year: number }[]
): { month: string; year: number }[] => {
  return [...months].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return getMonthIndex(a.month) - getMonthIndex(b.month);
  });
};

/** Remove duplicate months */
export const getUniqueMonths = (
  months: { month: string; year: number }[]
): { month: string; year: number }[] => {
  const seen = new Set<string>();
  const unique: { month: string; year: number }[] = [];

  for (const m of months) {
    const key = `${m.month}-${m.year}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(m);
    }
  }

  return unique;
};

/** Get unique paid months sorted */
export const getUniquePaidMonths = (
  paidMonths: { month: string; year: number }[]
): { month: string; year: number }[] => {
  const sorted = sortMonths(paidMonths);
  return getUniqueMonths(sorted);
};

/** Calculate due months by comparing all months vs paid months */
export const calculateDueMonths = (
  startMonth: string,
  startYear: number,
  paidMonths: { month: string; year: number }[],
  endMonth?: string,
  endYear?: number
): { month: string; year: number }[] => {
  const allMonths = getMonthsFromStart(startMonth, startYear, endMonth, endYear);
  const paidSet = new Set(paidMonths.map(m => `${m.month}-${m.year}`));

  return allMonths.filter(m => !paidSet.has(`${m.month}-${m.year}`));
};

/** Calculate next due month after last paid */
export const calculateNextDueMonth = (
  startMonth: string,
  startYear: number,
  lastPaidMonth: string | undefined,
  lastPaidYear: number
): { month: string; year: number } => {
  if (!lastPaidMonth || !lastPaidYear) {
    return { month: startMonth, year: startYear };
  }
  return getNextMonth(lastPaidMonth, lastPaidYear);
};

/** Calculate total due amount */
export const calculateTotalDue = (
  dueMonths: { month: string; year: number }[],
  monthlyFee: number
): number => {
  return dueMonths.length * monthlyFee;
};

/** Calculate collection rate percentage */
export const calculateCollectionRate = (
  totalCollected: number,
  totalDue: number
): number => {
  const total = totalCollected + totalDue;
  if (total === 0) return 0;
  return Math.round((totalCollected / total) * 100);
};

// ============================================
// 📊 Summary/Report Calculations
// ============================================

/** Get transaction amount (handles both amount and feeAmount fields) */
export const getTransactionAmount = (transaction: Record<string, any>): number => {
  return transaction.amount || transaction.feeAmount || 0;
};

/** Calculate total from transactions */
export const calculateTotalTransactions = (
  transactions: Record<string, any>[]
): number => {
  return transactions.reduce((sum, t) => sum + getTransactionAmount(t), 0);
};

/** Calculate average transaction amount */
export const calculateAverageTransaction = (
  transactions: Record<string, any>[]
): number => {
  if (transactions.length === 0) return 0;
  const total = calculateTotalTransactions(transactions);
  return Math.round(total / transactions.length);
};

/** Count unique members in transactions */
export const countUniqueMembers = (
  transactions: Record<string, any>[]
): number => {
  return new Set(transactions.map(t => t.memberId)).size;
};

/** Build payment method statistics */
export const buildPaymentMethodStats = (
  transactions: Record<string, any>[]
): Record<string, { count: number; amount: number }> => {
  const stats: Record<string, { count: number; amount: number }> = {};

  for (const t of transactions) {
    const method = t.payType || 'unknown';
    if (!stats[method]) {
      stats[method] = { count: 0, amount: 0 };
    }
    stats[method].count++;
    stats[method].amount += getTransactionAmount(t);
  }

  return stats;
};

/** Build monthly data for charts */
export const buildMonthlyData = (
  transactions: Record<string, any>[]
): Record<string, number> => {
  const monthlyData: Record<string, number> = {};

  for (const t of transactions) {
    const date = t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt);
    const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
    monthlyData[key] = (monthlyData[key] || 0) + getTransactionAmount(t);
  }

  return monthlyData;
};

/** Calculate trend percentage between current and previous period */
export const calculateTrend = (
  currentAmount: number,
  previousAmount: number
): number => {
  if (previousAmount === 0) return currentAmount > 0 ? 100 : 0;
  return Math.round(((currentAmount - previousAmount) / previousAmount) * 100);
};

/** Filter transactions by month */
export const filterTransactionsByMonth = (
  transactions: Record<string, any>[],
  month: number,
  year: number
): Record<string, any>[] => {
  return transactions.filter(t => {
    const date = t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt);
    return date.getMonth() === month && date.getFullYear() === year;
  });
};

/** Filter transactions by year */
export const filterTransactionsByYear = (
  transactions: Record<string, any>[],
  year: number
): Record<string, any>[] => {
  return transactions.filter(t => {
    const date = t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt);
    return date.getFullYear() === year;
  });
};

/** Filter transactions by exact date */
export const filterTransactionsByDate = (
  transactions: Record<string, any>[],
  targetDate: Date
): Record<string, any>[] => {
  return transactions.filter(t => {
    const date = t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt);
    return date.toDateString() === targetDate.toDateString();
  });
};

// ============================================
// 🎯 Due Level Classification
// ============================================

export type DueLevel = 'low' | 'medium' | 'high';

export interface DueLevelInfo {
  level: DueLevel;
  text: string;
  color: string;
  bg: string;
  border: string;
}

/** Get due level classification based on number of due months */
export const getDueLevel = (dueMonthsCount: number, thresholds?: {
  low: number;
  high: number;
}): DueLevelInfo => {
  const lowThreshold = thresholds?.low ?? 2;
  const highThreshold = thresholds?.high ?? 5;

  if (dueMonthsCount <= lowThreshold) {
    return {
      level: 'low',
      text: 'কম',
      color: 'text-green-600',
      bg: 'bg-green-100',
      border: 'border-green-200'
    };
  }

  if (dueMonthsCount <= highThreshold) {
    return {
      level: 'medium',
      text: 'মাঝারি',
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      border: 'border-yellow-200'
    };
  }

  return {
    level: 'high',
    text: 'বেশি',
    color: 'text-red-600',
    bg: 'bg-red-100',
    border: 'border-red-200'
  };
};

// ============================================
// 📅 Fiscal Year Parsing
// ============================================

/** Parse fiscal year start from settings format like "July-2021" */
export const parseFiscalYearStart = (fiscalYearString: string): {
  startMonth: string;
  startYear: number;
} => {
  const parts = fiscalYearString.split('-');
  const month = parts[0] || 'July';
  const year = parseInt(parts[1]) || 2021;
  return { startMonth: month, startYear: year };
};

// ============================================
// 📝 Calculate months for payment entry
// ============================================

/** Calculate months array for payment entry form */
export const calculatePaymentMonths = (
  startMonth: string,
  startYear: number,
  numberOfMonths: number,
  monthlyFee: number
): { month: string; year: number; amount: number }[] => {
  const months: { month: string; year: number; amount: number }[] = [];
  let currentMonthIdx = getMonthIndex(startMonth);
  let currentYearVal = startYear;

  for (let i = 0; i < numberOfMonths; i++) {
    months.push({
      month: MONTHS[currentMonthIdx],
      year: currentYearVal,
      amount: monthlyFee
    });

    currentMonthIdx++;
    if (currentMonthIdx >= 12) {
      currentMonthIdx = 0;
      currentYearVal++;
    }
  }

  return months;
};

// ============================================
// 🎨 UI Helper Functions (for component styling)
// ============================================

/** Get CSS classes for due status card based on fee status */
export const getDueStatusStyle = (params: {
  totalDue: number;
  dueMonthsCount: number;
}): {
  containerClass: string;
  statusText: string;
  statusColor: string;
} => {
  const { totalDue, dueMonthsCount } = params;

  if (totalDue === 0) {
    return {
      containerClass: 'bg-green-100 border-green-200',
      statusText: 'সব পরিশোধিত',
      statusColor: 'text-green-600',
    };
  }

  const dueLevel = getDueLevel(dueMonthsCount);

  switch (dueLevel.level) {
    case 'low':
      return {
        containerClass: 'bg-yellow-50 border-yellow-200',
        statusText: 'কম বকেয়া',
        statusColor: 'text-yellow-600',
      };
    case 'medium':
      return {
        containerClass: 'bg-orange-50 border-orange-200',
        statusText: 'মাঝারি বকেয়া',
        statusColor: 'text-orange-600',
      };
    case 'high':
      return {
        containerClass: 'bg-red-100 border-red-200',
        statusText: 'বেশি বকেয়া',
        statusColor: 'text-red-600',
      };
  }
};

/** Get CSS classes for due level badge */
export const getDueLevelBadgeStyle = (dueMonthsCount: number): string => {
  const dueLevel = getDueLevel(dueMonthsCount);
  return `px-2.5 py-1 rounded-full text-xs font-medium ${dueLevel.bg} ${dueLevel.color} ${dueLevel.border}`;
};

/** Get collection status display info */
export const getCollectionStatusInfo = (
  status: 'collected' | 'deposited' | 'transferred',
  payType: string
): {
  label: string;
  description: string;
  color: string;
  bgClass: string;
} => {
  const infoMap: Record<string, {
    label: string;
    description: string;
    color: string;
    bgClass: string;
  }> = {
    collected: {
      label: 'সংগৃহীত',
      description: payType === 'bank'
        ? 'ক্যাশিয়ারের ব্যক্তিগত ব্যাংক অ্যাকাউন্টে সংগৃহীত'
        : 'ক্যাশিয়ারের কাছে নগদ সংগৃহীত',
      color: 'text-blue-600',
      bgClass: 'bg-blue-100',
    },
    deposited: {
      label: 'ব্যাংকে জমা',
      description: 'সোমিটি ব্যাংক অ্যাকাউন্টে জমা হয়েছে',
      color: 'text-green-600',
      bgClass: 'bg-green-100',
    },
    transferred: {
      label: 'ট্রান্সফার',
      description: 'অন্য অ্যাকাউন্টে ট্রান্সফার হয়েছে',
      color: 'text-purple-600',
      bgClass: 'bg-purple-100',
    },
  };
  return infoMap[status] || infoMap.collected;
};

/** Get payment method display config */
export const getPaymentMethodConfig = (method: string): {
  label: string;
  color: string;
  iconType: 'cash' | 'bank' | 'mobile' | 'other';
} => {
  const configs: Record<string, {
    label: string;
    color: string;
    iconType: 'cash' | 'bank' | 'mobile' | 'other';
  }> = {
    cash: { label: 'নগদ', color: 'bg-green-600', iconType: 'cash' },
    bank: { label: 'ব্যাংক', color: 'bg-blue-600', iconType: 'bank' },
    bikash: { label: 'বিকাশ', color: 'bg-pink-600', iconType: 'mobile' },
    nogod: { label: 'নগদ', color: 'bg-orange-600', iconType: 'mobile' },
    rocket: { label: 'রকেট', color: 'bg-purple-600', iconType: 'mobile' },
    other: { label: 'অন্যান্য', color: 'bg-gray-600', iconType: 'other' },
  };
  return configs[method] || configs.other;
};

/** Get array of year options for select */
export const getYearOptions = (
  startYear: number,
  currentYear: number,
  extraYears: number = 2
): number[] => {
  const years: number[] = [];
  for (let i = startYear; i <= currentYear + extraYears; i++) {
    years.push(i);
  }
  return years;
};

/** Month count options for select */
export const MONTH_COUNT_OPTIONS: number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
  13, 14, 15, 16, 17, 18, 19, 20, 24, 36
];

/** Get month count label with optional year hint */
export const getMonthCountLabel = (count: number): string => {
  if (count === 12) return '১২ মাস (১ বছর)';
  if (count === 24) return '২৪ মাস (২ বছর)';
  if (count === 36) return '৩৬ মাস (৩ বছর)';
  return `${count} মাস`;
};

// ============================================
// 🧹 Backward compatibility alias
// ============================================

/** @deprecated Use getMonthIndex instead */
export const getMonthNumber = getMonthIndex;