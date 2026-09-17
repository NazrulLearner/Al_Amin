// src/modules/Investments/utils/maturityCalculator.ts

import { parseToDate } from '../../../utils/formatters/dateFormatter';  // ✅ Use global
import { Investment } from '../types/investment.types';
import { INVESTMENT_STATUS_LABELS } from '../constants/investmentConstants';
import { getMonthsDifference } from './investmentCalculator';

export const checkMaturityStatus = (investment: Investment): boolean => {
  if (!investment.maturityDate) return false;
  const maturityDate = parseToDate(investment.maturityDate);
  if (!maturityDate) return false;
  const today = new Date();
  return maturityDate <= today;
};

export const getDaysToMaturity = (investment: Investment): number | null => {
  if (!investment.maturityDate) return null;
  const maturityDate = parseToDate(investment.maturityDate);
  if (!maturityDate) return null;
  const today = new Date();
  const diffTime = maturityDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getMonthsToMaturity = (investment: Investment): number | null => {
  if (!investment.maturityDate) return null;
  const maturityDate = parseToDate(investment.maturityDate);
  if (!maturityDate) return null;
  const today = new Date();
  const months = getMonthsDifference(today, maturityDate);
  return months > 0 ? months : 0;
};

export const getMaturityStatusText = (investment: Investment): string => {
  if (investment.status !== 'active') return INVESTMENT_STATUS_LABELS[investment.status];
  
  const daysToMaturity = getDaysToMaturity(investment);
  if (daysToMaturity === null) return 'অনির্দিষ্ট মেয়াদ';
  if (daysToMaturity < 0) return 'মেয়াদ উত্তীর্ণ';
  if (daysToMaturity === 0) return 'আজ মেয়াদ শেষ';
  if (daysToMaturity <= 30) return `${daysToMaturity} দিন বাকি`;
  if (daysToMaturity <= 365) return `${Math.floor(daysToMaturity / 30)} মাস বাকি`;
  return `${Math.floor(daysToMaturity / 365)} বছর বাকি`;
};

export const getMaturityStatusColor = (investment: Investment): string => {
  if (investment.status !== 'active') return 'text-red-600';
  
  const daysToMaturity = getDaysToMaturity(investment);
  if (daysToMaturity === null) return 'text-gray-600';
  if (daysToMaturity < 0) return 'text-red-600';
  if (daysToMaturity <= 30) return 'text-orange-600';
  if (daysToMaturity <= 90) return 'text-yellow-600';
  return 'text-green-600';
};