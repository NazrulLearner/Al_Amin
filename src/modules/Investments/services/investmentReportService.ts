import { investmentService } from './investmentService';
import type {
    InvestmentSummary,
    MemberInvestmentSummary,
    PlanWiseSummary,
    MonthlyTrend,
    InvestmentReportData
} from '../types/investmentReport.types';
import { investmentHelpers } from '../utils/investmentHelpers';

export const investmentReportService = {
  async getSummary(): Promise<InvestmentSummary> {
    const investments = await investmentService.getAll();
    const active = investments.filter(i => i.status === 'active');
    const matured = investments.filter(i => i.status === 'matured');
    const withdrawn = investments.filter(i => i.status === 'withdrawn');
    const defaulted = investments.filter(i => i.status === 'defaulted');

    return {
      totalInvestments: investments.length,
      totalAmount: investmentHelpers.calculateTotalAmount(investments),
      totalExpectedProfit: investments.reduce((sum, i) => sum + i.expectedProfitAmount, 0),
      totalActualProfit: investments.reduce((sum, i) => sum + (i.actualProfitAmount || 0), 0),
      activeCount: active.length,
      activeAmount: investmentHelpers.calculateTotalAmount(active),
      maturedCount: matured.length,
      maturedAmount: investmentHelpers.calculateTotalAmount(matured),
      withdrawnCount: withdrawn.length,
      defaultedCount: defaulted.length
    };
  },

  async getMemberWiseSummary(): Promise<MemberInvestmentSummary[]> {
    const investments = await investmentService.getAll();
    const grouped = investmentHelpers.groupByMember(investments);
    const summaries: MemberInvestmentSummary[] = [];

    for (const [memberId, memberInvestments] of grouped) {
      const activeInvestments = memberInvestments.filter(i => i.status === 'active');
      summaries.push({
        memberId,
        memberName: memberInvestments[0]?.memberName || '',
        totalInvested: investmentHelpers.calculateTotalAmount(memberInvestments),
        activeInvestments: activeInvestments.length,
        totalExpectedProfit: memberInvestments.reduce((sum, i) => sum + i.expectedProfitAmount, 0),
        totalReceivedProfit: memberInvestments.reduce((sum, i) => sum + (i.actualProfitAmount || 0), 0),
        upcomingMaturityDate: activeInvestments.length > 0 
          ? new Date(Math.min(...activeInvestments.map(i => i.maturityDate.getTime())))
          : undefined
      });
    }

    return summaries.sort((a, b) => b.totalInvested - a.totalInvested);
  },

  async getPlanWiseSummary(): Promise<PlanWiseSummary[]> {
    const investments = await investmentService.getAll();
    const grouped = investmentHelpers.groupByPlan(investments);
    const summaries: PlanWiseSummary[] = [];

    for (const [planId, planInvestments] of grouped) {
      summaries.push({
        planId,
        planName: planInvestments[0]?.planName || '',
        investorCount: planInvestments.length,
        totalAmount: investmentHelpers.calculateTotalAmount(planInvestments),
        expectedProfit: planInvestments.reduce((sum, i) => sum + i.expectedProfitAmount, 0)
      });
    }

    return summaries.sort((a, b) => b.totalAmount - a.totalAmount);
  },

  async getMonthlyTrend(year?: number): Promise<MonthlyTrend[]> {
    const investments = await investmentService.getAll();
    const targetYear = year || new Date().getFullYear();
    const monthlyData = new Map<string, { amount: number; profit: number }>();

    investments.forEach(inv => {
      const month = inv.startDate.getMonth();
      const year = inv.startDate.getFullYear();
      if (year === targetYear) {
        const key = `${month}-${year}`;
        const existing = monthlyData.get(key) || { amount: 0, profit: 0 };
        monthlyData.set(key, {
          amount: existing.amount + inv.amount,
          profit: existing.profit + inv.expectedProfitAmount
        });
      }
    });

    const trends: MonthlyTrend[] = [];
    for (let i = 0; i < 12; i++) {
      const key = `${i}-${targetYear}`;
      const data = monthlyData.get(key) || { amount: 0, profit: 0 };
      trends.push({
        month: new Date(targetYear, i, 1).toLocaleString('default', { month: 'long' }),
        year: targetYear,
        amount: data.amount,
        profit: data.profit
      });
    }

    return trends;
  },

  async getFullReport(startDate: Date, endDate: Date): Promise<InvestmentReportData> {
    const [summary, memberWise, planWise, monthlyTrend] = await Promise.all([
      this.getSummary(),
      this.getMemberWiseSummary(),
      this.getPlanWiseSummary(),
      this.getMonthlyTrend()
    ]);

    return {
      periodStart: startDate,
      periodEnd: endDate,
      summary,
      memberWise,
      planWise,
      monthlyTrend
    };
  },

  async exportToCSV(data: any[], filename: string): Promise<void> {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};