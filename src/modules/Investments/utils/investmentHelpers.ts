// src/modules/Investments/utils/investmentHelpers.ts

import { formatCurrency } from '../../../utils/formatters/currencyFormatter';

export const formatCurrencyAmount = (amount: number): string => {
  return formatCurrency(amount, { currencySymbol: '৳', position: 'after', decimalPlaces: 0 });
};

export const formatDateString = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('bn-BD');
};

export const calculateExpectedProfit = (
  totalAmount: number,
  profitType: string,
  profitRate: number,
  durationMonths: number
): number => {
  if (profitType === 'percentage') {
    return (totalAmount * profitRate * durationMonths) / (12 * 100);
  } else if (profitType === 'fixed_amount') {
    return profitRate;
  } else if (profitType === 'revenue_share') {
    return (totalAmount * profitRate) / 100;
  }
  return 0;
};

export const calculateTotalReturn = (principal: number, profit: number): number => principal + profit;

export const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

export const getRandomId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};