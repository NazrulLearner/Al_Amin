// src/utils/formatters/amountFormatter.ts

import { formatCurrency, type CurrencyFormatOptions } from './currencyFormatter';

export interface AmountFormatOptions extends CurrencyFormatOptions {
  // Extended from currencyFormatter
}

/**
 * Format amount with custom currency symbol and separators
 * @param amount - Number to format
 * @param options - Formatting options
 * @returns Formatted amount string
 * 
 * @deprecated - Use formatCurrency from currencyFormatter.ts instead
 */
export const formatAmount = (
  amount: any,
  options: AmountFormatOptions | string = {}
): string => {
  // For backward compatibility
  if (typeof options === 'string') {
    return formatCurrency(amount, { currencySymbol: options });
  }
  
  return formatCurrency(amount, options);
};

/**
 * Parse amount string to number (removes currency and separators)
 * @param value - Amount string (e.g., "1,234.56 ৳")
 * @returns Number value
 */
export const parseAmount = (value: string): number => {
  if (!value) return 0;
  // Remove all non-numeric characters except decimal point and minus sign
  const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
};

/**
 * Format amount for display in a specific locale
 * @param amount - Amount to format
 * @param locale - Locale string (e.g., 'bn-BD', 'en-US')
 * @param currencyCode - Currency code (e.g., 'BDT', 'USD')
 * @returns Formatted amount string
 */
export const formatAmountByLocale = (
  amount: any,
  locale: string = 'bn-BD',
  currencyCode: string = 'BDT'
): string => {
  const num = Number(amount);
  if (isNaN(num)) return '0';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  } catch (error) {
    return formatCurrency(num, { currencySymbol: currencyCode });
  }
};

/**
 * Check if amount string is valid
 * @param value - Amount string to validate
 * @returns Boolean indicating if valid
 */
export const isValidAmount = (value: string): boolean => {
  if (!value) return false;
  const num = parseAmount(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Format amount for input field (removes currency symbol)
 * @param amount - Amount to format
 * @returns Number string without currency
 */
export const formatAmountForInput = (amount: any): string => {
  const num = Number(amount);
  if (isNaN(num)) return '0';
  return num.toString();
};