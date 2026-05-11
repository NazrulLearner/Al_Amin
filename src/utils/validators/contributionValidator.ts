// src/utils/validators/contributionValidator.ts

/**
 * 🛡️ Contribution Validator
 * All validation logic for contribution/fee entry
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ContributionValidationParams {
  memberId: string;
  memberName: string;
  calculatedMonths: { month: string; year: number; amount: number }[];
  totalAmount: number;
  payType: 'cash' | 'bank' | 'bikash' | 'nogod' | 'rocket' | 'other';
  collectionStatus: 'collected' | 'deposited' | 'transferred';
  bankName?: string;
  bankReference?: string;
  depositDate?: string;
  depositorId?: string;
  referenceNo?: string;
  existingPaidMonths?: { month: string; year: number }[];
  collectorEnabled?: boolean;
  hasCollectors?: boolean;
  selectedCollectorId?: string;
}

/**
 * Main validation function for contribution entry
 */
export const validateContributionEntry = (
  params: ContributionValidationParams
): ValidationResult => {
  const errors: string[] = [];

  // 1. Member validation
  if (!params.memberId) {
    errors.push('দয়া করে একজন সদস্য নির্বাচন করুন');
  }

  // 2. Month validation
  const monthErrors = validateMonths(params.calculatedMonths);
  errors.push(...monthErrors);

  // 3. Amount validation
  if (params.totalAmount <= 0) {
    errors.push('মোট পরিমাণ ০ এর বেশি হতে হবে');
  }

  // 4. Payment method validation
  const paymentErrors = validatePaymentMethod(params.payType, params.referenceNo);
  errors.push(...paymentErrors);

  // 5. Collection status validation
  const collectionErrors = validateCollectionStatus(
    params.collectionStatus,
    params.bankName,
    params.bankReference
  );
  errors.push(...collectionErrors);

  if (params.collectionStatus === 'deposited' && params.payType === 'bank') {
    if (!params.depositDate) {
      errors.push('ব্যাংকে জমার তারিখ প্রদান করা আবশ্যক');
    }
    if (!params.depositorId) {
      errors.push('ব্যাংকে জমাদানকারী সদস্য নির্বাচন করা আবশ্যক');
    }
  }

  // 6. Duplicate month validation
  if (params.existingPaidMonths && params.existingPaidMonths.length > 0) {
    const duplicateErrors = validateDuplicateMonths(
      params.calculatedMonths,
      params.existingPaidMonths
    );
    errors.push(...duplicateErrors);
  }

  // 🆕 7. Collector validation
  if (params.collectorEnabled && params.hasCollectors && !params.selectedCollectorId) {
    errors.push('দয়া করে একজন কালেক্টর নির্বাচন করুন');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate month selection
 */
export const validateMonths = (
  months: { month: string; year: number; amount: number }[]
): string[] => {
  const errors: string[] = [];

  if (!months || months.length === 0) {
    errors.push('দয়া করে জমা দেওয়ার মাস নির্বাচন করুন');
    return errors;
  }

  const validMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  for (const m of months) {
    if (!validMonths.includes(m.month)) {
      errors.push(`অবৈধ মাস: ${m.month}`);
      break;
    }
  }

  // Check if months are in sequence
  if (months.length > 1) {
    for (let i = 1; i < months.length; i++) {
      const prevTotal = months[i - 1].year * 12 + validMonths.indexOf(months[i - 1].month);
      const currTotal = months[i].year * 12 + validMonths.indexOf(months[i].month);
      if (currTotal !== prevTotal + 1) {
        errors.push('নির্বাচিত মাসগুলো ধারাবাহিক হতে হবে');
        break;
      }
    }
  }

  // Check for future months (allow up to 2 months in advance)
  const now = new Date();
  const currentMonthTotal = now.getFullYear() * 12 + now.getMonth();
  const lastMonth = months[months.length - 1];
  const lastMonthTotal = lastMonth.year * 12 + validMonths.indexOf(lastMonth.month);

  if (lastMonthTotal > currentMonthTotal + 2) {
    errors.push('ভবিষ্যতের মাসের জন্য এত অগ্রিম জমা দেওয়া যাবে না');
  }

  return errors;
};

/**
 * Validate payment method
 */
export const validatePaymentMethod = (
  payType: string,
  referenceNo?: string
): string[] => {
  const errors: string[] = [];
  const validPayTypes = ['cash', 'bank', 'bikash', 'nogod', 'rocket', 'other'];

  if (!validPayTypes.includes(payType)) {
    errors.push('অবৈধ পেমেন্ট পদ্ধতি');
  }

  if (['bank', 'bikash', 'nogod', 'rocket'].includes(payType) && !referenceNo) {
    const labels: Record<string, string> = {
      bank: 'ব্যাংক',
      bikash: 'বিকাশ',
      nogod: 'নগদ',
      rocket: 'রকেট',
    };
    errors.push(`${labels[payType] || payType} এর ট্রানজেকশন আইডি / রেফারেন্স নম্বর প্রয়োজন`);
  }

  return errors;
};

/**
 * Validate collection status
 */
export const validateCollectionStatus = (
  status: string,
  bankName?: string,
  bankReference?: string
): string[] => {
  const errors: string[] = [];
  const validStatuses = ['collected', 'deposited', 'transferred'];

  if (!validStatuses.includes(status)) {
    errors.push('অবৈধ সংগ্রহ অবস্থা');
  }

  if (status === 'deposited') {
    if (!bankName) {
      errors.push('ব্যাংকে জমা হলে ব্যাংকের নাম প্রদান করা আবশ্যক');
    }
    if (!bankReference) {
      errors.push('ব্যাংকে জমা হলে রেফারেন্স প্রদান করা আবশ্যক');
    }
  }

  return errors;
};

/**
 * Check for duplicate month payments
 */
export const validateDuplicateMonths = (
  newMonths: { month: string; year: number }[],
  existingPaidMonths: { month: string; year: number }[]
): string[] => {
  const errors: string[] = [];
  const existingSet = new Set(
    existingPaidMonths.map(m => `${m.month}-${m.year}`)
  );

  const duplicates = newMonths.filter(m =>
    existingSet.has(`${m.month}-${m.year}`)
  );

  if (duplicates.length > 0) {
    const monthsList = duplicates
      .map(m => `${m.month} ${m.year}`)
      .join(', ');
    errors.push(`এই মাসগুলো ইতিমধ্যে জমা আছে: ${monthsList}`);
  }

  return errors;
};

/**
 * Validate contribution amount against member's required fee
 */
export const validateContributionAmount = (
  months: { month: string; year: number; amount: number }[],
  expectedMonthlyFee: number
): string[] => {
  const errors: string[] = [];

  for (const m of months) {
    if (m.amount !== expectedMonthlyFee) {
      errors.push(
        `${m.month} ${m.year} এর জন্য সঠিক পরিমাণ (৳${expectedMonthlyFee}) প্রয়োজন`
      );
      break;
    }
  }

  return errors;
};

/**
 * 🆕 Quick validation: Collector only
 */
export const validateCollector = (
  collectorEnabled: boolean,
  hasCollectors: boolean,
  selectedCollectorId: string
): string[] => {
  const errors: string[] = [];

  if (collectorEnabled && hasCollectors && !selectedCollectorId) {
    errors.push('দয়া করে একজন কালেক্টর নির্বাচন করুন');
  }

  return errors;
};

/**
 * Quick validation: Check if form is submittable
 */
export const isFormSubmittable = (
  params: ContributionValidationParams
): boolean => {
  const result = validateContributionEntry(params);
  return result.isValid;
};
