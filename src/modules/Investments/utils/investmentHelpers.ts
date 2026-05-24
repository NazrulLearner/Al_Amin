import type { Investment, InvestmentFilter } from '../types/investment.types';

export const investmentHelpers = {
  generateReferenceNo(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  },

  filterInvestments(investments: Investment[], filter: InvestmentFilter): Investment[] {
    let filtered = [...investments];

    if (filter.memberId) {
      filtered = filtered.filter(inv => inv.memberId === filter.memberId);
    }
    if (filter.status) {
      filtered = filtered.filter(inv => inv.status === filter.status);
    }
    if (filter.planId) {
      filtered = filtered.filter(inv => inv.planId === filter.planId);
    }
    if (filter.startDateFrom) {
      filtered = filtered.filter(inv => inv.startDate >= filter.startDateFrom!);
    }
    if (filter.startDateTo) {
      filtered = filtered.filter(inv => inv.startDate <= filter.startDateTo!);
    }
    if (filter.minAmount) {
      filtered = filtered.filter(inv => inv.amount >= filter.minAmount!);
    }
    if (filter.maxAmount) {
      filtered = filtered.filter(inv => inv.amount <= filter.maxAmount!);
    }

    return filtered;
  },

  groupByPlan(investments: Investment[]): Map<string, Investment[]> {
    const grouped = new Map<string, Investment[]>();
    investments.forEach(inv => {
      if (!grouped.has(inv.planId)) {
        grouped.set(inv.planId, []);
      }
      grouped.get(inv.planId)!.push(inv);
    });
    return grouped;
  },

  groupByMember(investments: Investment[]): Map<string, Investment[]> {
    const grouped = new Map<string, Investment[]>();
    investments.forEach(inv => {
      if (!grouped.has(inv.memberId)) {
        grouped.set(inv.memberId, []);
      }
      grouped.get(inv.memberId)!.push(inv);
    });
    return grouped;
  },

  calculateTotalAmount(investments: Investment[]): number {
    return investments.reduce((sum, inv) => sum + inv.amount, 0);
  },

  calculateTotalProfit(investments: Investment[]): number {
    return investments.reduce((sum, inv) => sum + (inv.actualProfitAmount || inv.expectedProfitAmount), 0);
  }
};