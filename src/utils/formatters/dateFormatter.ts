// src/utils/formatters/dateFormatter.ts

export type DateFormatType = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD-MMM-YYYY';

/**
 * Parse any date input to Date object
 */
export const parseToDate = (date: any): Date | null => {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (typeof date?.toDate === 'function') {
    const d = date.toDate();
    return d instanceof Date ? d : null;
  }
  if (typeof date === 'number') return new Date(date);
  if (typeof date === 'string') return new Date(date);
  try {
    return new Date(date);
  } catch {
    return null;
  }
};

/**
 * Format date according to specified format
 * @param date - Date to format
 * @param format - Format string (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD-MMM-YYYY, etc.)
 * @returns Formatted date string
 */
export const formatDateWithFormat = (date: any, format: DateFormatType | string = 'DD/MM/YYYY'): string => {
  if (!date) return 'N/A';
  
  try {
    const d = parseToDate(date);
    if (!d || isNaN(d.getTime())) return 'N/A';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
    const monthLong = d.toLocaleDateString('en-US', { month: 'long' });
    
    // Replace longer patterns first to avoid conflicts
    let result = format
      .replace('MMMM', monthLong)
      .replace('MMM', monthShort)
      .replace('DD', day)
      .replace('YYYY', String(year))
      .replace('YY', String(year).slice(-2));
    
    // Handle MM (month number)
    if (format.includes('MM') && !format.includes('MMM') && !format.includes('MMMM')) {
      result = result.replace('MM', month);
    }
    
    return result;
  } catch (error) {
    return 'N/A';
  }
};

/**
 * Format date with settings
 * @param date - Date to format
 * @param dateFormat - Date format from settings
 * @returns Formatted date string
 */
export const formatDateWithSettings = (
  date: any,
  dateFormat: DateFormatType = 'DD/MM/YYYY'
): string => {
  return formatDateWithFormat(date, dateFormat);
};

// Default format: DD/MM/YYYY
export const formatDate = (date: any, format: DateFormatType | string = 'DD/MM/YYYY'): string => {
  return formatDateWithFormat(date, format);
};

/**
 * Format date with time
 * @param date - Date to format
 * @param format - Format string
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: any, format: string = 'DD/MM/YYYY HH:mm'): string => {
  if (!date) return 'N/A';
  
  try {
    const d = parseToDate(date);
    if (!d || isNaN(d.getTime())) return 'N/A';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
    const monthLong = d.toLocaleDateString('en-US', { month: 'long' });
    
    let result = format
      .replace('DD', day)
      .replace('YYYY', String(year))
      .replace('YY', String(year).slice(-2))
      .replace('MMM', monthShort)
      .replace('MMMM', monthLong)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
    
    // Handle MM (month number)
    if (format.includes('MM') && !format.includes('MMM') && !format.includes('MMMM')) {
      result = result.replace('MM', month);
    }
    
    return result;
  } catch (error) {
    return 'N/A';
  }
};

/**
 * Format date for HTML input element (YYYY-MM-DD)
 * @param date - Date to format
 * @returns ISO format date string
 */
export const formatDateForInput = (date: any): string => {
  if (!date) return '';
  
  try {
    const d = parseToDate(date);
    if (!d || isNaN(d.getTime())) return '';
    
    return d.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};

/**
 * Parse date from string based on format
 * @param dateStr - Date string
 * @param format - Format of the string (DD/MM/YYYY, MM/DD/YYYY, etc.)
 * @returns Date object
 */
export const parseDate = (dateStr: string, format: DateFormatType = 'DD/MM/YYYY'): Date | null => {
  if (!dateStr) return null;
  
  try {
    let day: number, month: number, year: number;
    
    if (format === 'DD/MM/YYYY') {
      [day, month, year] = dateStr.split('/').map(Number);
    } else if (format === 'MM/DD/YYYY') {
      [month, day, year] = dateStr.split('/').map(Number);
    } else if (format === 'YYYY-MM-DD') {
      [year, month, day] = dateStr.split('-').map(Number);
    } else if (format === 'DD-MMM-YYYY') {
      const parts = dateStr.split('-');
      day = parseInt(parts[0]);
      month = getMonthNumberFromShortName(parts[1]);
      year = parseInt(parts[2]);
    } else {
      return null;
    }
    
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    return null;
  }
};

/**
 * Get month number from short name
 */
const getMonthNumberFromShortName = (monthShort: string): number => {
  const months: Record<string, number> = {
    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
  };
  return months[monthShort] || 1;
};

/**
 * Get formatted date for Bengali locale
 * @param date - Date to format
 * @returns Formatted date in Bengali (e.g., "১০ মে, ২০২৪")
 */
export const formatDateBengali = (date: any): string => {
  const d = parseToDate(date);
  if (!d) return 'N/A';
  
  return d.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};