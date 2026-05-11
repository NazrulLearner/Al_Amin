// src/utils/formatters/currencyFormatter.ts

export interface CurrencyFormatOptions {
  currencySymbol?: string;
  currencyCode?: string;
  position?: 'before' | 'after';
  decimalPlaces?: number;
  thousandSeparator?: string;
  showSymbol?: boolean;
}

/**
 * Format number to currency string based on settings
 * @param amount - Amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 * 
 * @example
 * formatCurrency(1000) // "1,000 ৳"
 * formatCurrency(1000, { position: 'before' }) // "৳ 1,000"
 * formatCurrency(1000, { currencySymbol: '$', position: 'before' }) // "$ 1,000"
 */
export const formatCurrency = (
  amount: number | string,
  options: CurrencyFormatOptions = {}
): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return '0';
  
  const {
    currencySymbol = '৳',
    position = 'after',
    decimalPlaces = 0,
    thousandSeparator = ',',
    showSymbol = true
  } = options;
  
  // Format the number with thousand separators
  let formattedNumber: string;
  
  if (decimalPlaces > 0) {
    formattedNumber = num.toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
  } else {
    formattedNumber = Math.floor(num).toLocaleString('en-US');
  }
  
  // Replace thousand separator if needed (for Bengali commas etc.)
  if (thousandSeparator !== ',') {
    formattedNumber = formattedNumber.replace(/,/g, thousandSeparator);
  }
  
  // Add currency symbol
  if (!showSymbol) {
    return formattedNumber;
  }
  
  if (position === 'before') {
    return `${currencySymbol}${formattedNumber}`;
  } else {
    return `${formattedNumber} ${currencySymbol}`;
  }
};

/**
 * Format currency using settings from SomitySettings
 * @param amount - Amount to format
 * @param financialSettings - Financial settings object
 * @returns Formatted currency string
 * 
 * @example
 * formatCurrencyWithSettings(1000, { currencySymbol: '৳', currencyPosition: 'before' })
 * // "৳ 1,000"
 */
export const formatCurrencyWithSettings = (
  amount: number | string,
  financialSettings?: {
    currencySymbol?: string;
    currencyPosition?: 'before' | 'after';
    decimalPlaces?: number;
  }
): string => {
  if (!financialSettings) {
    return formatCurrency(amount);
  }
  
  return formatCurrency(amount, {
    currencySymbol: financialSettings.currencySymbol || '৳',
    position: financialSettings.currencyPosition || 'after',
    decimalPlaces: financialSettings.decimalPlaces || 0
  });
};

/**
 * Parse currency string back to number
 * @param currencyString - Currency string (e.g., "৳ 1,000" or "1,000 ৳")
 * @returns Number value
 */
export const parseCurrency = (currencyString: string): number => {
  if (!currencyString) return 0;
  
  // Remove currency symbols and spaces, keep numbers and decimal
  const numberString = currencyString.replace(/[^\d.-]/g, '');
  const num = parseFloat(numberString);
  
  return isNaN(num) ? 0 : num;
};

/**
 * Format amount for input field (no currency symbol)
 * @param amount - Amount to format
 * @returns Number string without any formatting
 */
export const formatAmountForInput = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return num.toString();
};

/**
 * Get currency symbol from currency code
 * @param currencyCode - Currency code (BDT, USD, EUR, GBP, INR)
 * @returns Currency symbol
 */
export const getCurrencySymbolFromCode = (currencyCode: string): string => {
  const symbols: Record<string, string> = {
    BDT: '৳',
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥',
    CNY: '¥',
    PKR: '₨',
    NPR: '₨',
    LKR: '₨',
    SGD: 'S$',
    MYR: 'RM'
  };
  
  return symbols[currencyCode] || currencyCode;
};