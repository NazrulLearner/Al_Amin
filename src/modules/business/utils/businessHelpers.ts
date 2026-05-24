import type { Business } from "../types/business.types";

export const calculateProfit = (b: Business) => {
  return b.totalIncome - b.totalExpense;
};

export const calculateROI = (b: Business) => {
  if (b.initialInvestment === 0) return 0;
  return ((b.totalIncome - b.initialInvestment) / b.initialInvestment) * 100;
};