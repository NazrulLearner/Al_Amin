import type { Investment } from '../types/investment.types';

export interface MaturityAlert {
  investmentId: string;
  memberName: string;
  amount: number;
  maturityDate: Date;
  daysRemaining: number;
  expectedProfit: number;
}

export const maturityCalculator = {
  getUpcomingMaturities(investments: Investment[], daysThreshold: number = 30): MaturityAlert[] {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    return investments
      .filter(inv => inv.status === 'active')
      .filter(inv => inv.maturityDate <= thresholdDate && inv.maturityDate >= today)
      .map(inv => ({
        investmentId: inv.id!,
        memberName: inv.memberName,
        amount: inv.amount,
        maturityDate: inv.maturityDate,
        daysRemaining: Math.ceil((inv.maturityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        expectedProfit: inv.expectedProfitAmount
      }))
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  },

  getOverdueMaturities(investments: Investment[]): MaturityAlert[] {
    const today = new Date();
    return investments
      .filter(inv => inv.status === 'active')
      .filter(inv => inv.maturityDate < today)
      .map(inv => ({
        investmentId: inv.id!,
        memberName: inv.memberName,
        amount: inv.amount,
        maturityDate: inv.maturityDate,
        daysRemaining: Math.ceil((inv.maturityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        expectedProfit: inv.expectedProfitAmount
      }));
  },

  getMaturitySummary(investments: Investment[]): {
    total: number;
    upcoming: number;
    overdue: number;
    thisMonth: number;
    nextMonth: number;
  } {
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

    const activeInvestments = investments.filter(inv => inv.status === 'active');
    
    return {
      total: activeInvestments.length,
      upcoming: activeInvestments.filter(inv => inv.maturityDate >= today).length,
      overdue: activeInvestments.filter(inv => inv.maturityDate < today).length,
      thisMonth: activeInvestments.filter(inv => inv.maturityDate <= endOfMonth).length,
      nextMonth: activeInvestments.filter(inv => inv.maturityDate > endOfMonth && inv.maturityDate <= endOfNextMonth).length
    };
  }
};