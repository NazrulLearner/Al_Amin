// src/modules/Investments/utils/investmentCalculator.ts

import type { ProfitCalculationType } from '../types/investment.types';

export const calculateExpectedProfit = (
  amount: number,
  profitRate: number,
  durationMonths: number,
  calculationType?: ProfitCalculationType,
  fixedAmount?: number
): number => {
  if (calculationType === 'fixed_amount' && fixedAmount) {
    return fixedAmount;
  }
  if (calculationType === 'revenue_share' && profitRate) {
    return (amount * profitRate) / 100;
  }
  // percentage based (default)
  return (amount * profitRate * durationMonths) / (12 * 100);
};

export const calculateMonthlyProfit = (amount: number, profitRate: number): number => {
  return (amount * profitRate) / (12 * 100);
};

export const calculateTotalReturn = (principal: number, profit: number): number => {
  return principal + profit;
};

export const calculateMaturityDate = (startDate: Date, durationMonths: number): Date => {
  const maturityDate = new Date(startDate);
  maturityDate.setMonth(maturityDate.getMonth() + durationMonths);
  return maturityDate;
};

export const getMonthsDifference = (startDate: Date, endDate: Date): number => {
  const years = endDate.getFullYear() - startDate.getFullYear();
  const months = endDate.getMonth() - startDate.getMonth();
  return years * 12 + months;
};

export const getDaysToMaturity = (maturityDate: Date): number => {
  const today = new Date();
  const diffTime = maturityDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatInvestmentId = (count: number): string => {
  return `INV_${String(count).padStart(4, '0')}`;
};

export const calculateReturnRate = (amount: number, profit: number): number => {
  if (amount === 0) return 0;
  return (profit / amount) * 100;
};