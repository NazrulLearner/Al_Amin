// src/modules/Investments/utils/investmentValidation.ts

import { CoInvestor } from '../types/investment.types';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateInvestmentForm = (
  form: any,
  coInvestors: CoInvestor[]
): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!form.investmentName?.trim()) errors.investmentName = 'বিনিয়োগের নাম আবশ্যক';
  if (!form.totalAmount || form.totalAmount <= 0) errors.totalAmount = 'মোট পরিমাণ আবশ্যক';
  if (!form.somityContribution || form.somityContribution <= 0)
    errors.somityContribution = 'সমিতির অবদান আবশ্যক';
  if (form.somityContribution > form.totalAmount)
    errors.somityContribution = 'সমিতির অবদান মোট পরিমাণের বেশি হতে পারে না';
  if (!form.startDate) errors.startDate = 'শুরুর তারিখ আবশ্যক';

  // Co-investors validation
  const totalCoProfitShare = coInvestors.reduce((sum, c) => sum + (c.profitSharePercentage || 0), 0);
  const maxCoProfitShare = 100 - (form.somityProfitShare || 0);
  if (coInvestors.length > 0 && totalCoProfitShare > maxCoProfitShare) {
    errors.coInvestorsProfit = `সহ-বিনিয়োগকারীদের মুনাফার অংশ (${totalCoProfitShare}%) সমিতির পরে বরাদ্দকৃত ${maxCoProfitShare}% এর বেশি হতে পারে না`;
  }

  const totalCoContribution = coInvestors.reduce((sum, c) => sum + (c.contributedAmount || 0), 0);
  const maxCoContribution = form.totalAmount - (form.somityContribution || 0);
  if (coInvestors.length > 0 && totalCoContribution > maxCoContribution) {
    errors.coInvestorsAmount = `সহ-বিনিয়োগকারীদের মোট অবদান (${totalCoContribution}) বাকি জায়গা (${maxCoContribution}) এর বেশি হতে পারে না`;
  }

  // Money source validation
  if (form.moneySource !== 'cash' && !form.bankName) errors.bankName = 'ব্যাংকের নাম আবশ্যক';
  if (form.moneySource !== 'cash' && !form.accountNumber)
    errors.accountNumber = 'অ্যাকাউন্ট নম্বর আবশ্যক';
  if (form.moneySource === 'both') {
    const totalSource = (form.cashAmount || 0) + (form.bankAmount || 0);
    if (totalSource !== form.somityContribution) {
      errors.moneySourceMismatch = `নগদ + ব্যাংকের মোট ${totalSource} সমিতির অবদান ${form.somityContribution} এর সমান হতে হবে`;
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};