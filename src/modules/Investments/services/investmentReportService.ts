/* // src/modules/Investments/services/investmentReportService.ts

import { parseToDate } from '../../../utils/formatters/dateFormatter';  // ✅ Use global
import { investmentService } from './investmentService';
import type { InvestmentReport, InvestmentReportFilters } from '../types/investmentReport.types';
import { INVESTMENT_TYPE_LABELS } from '../constants/investmentTypes';
import { calculateReturnRate } from '../utils/investmentCalculator';

export const investmentReportService = {
  async generateReport(filters: InvestmentReportFilters): Promise<InvestmentReport> {
    const investments = await investmentService.getAllInvestments(10000);
    
    const filteredInvestments = investments.filter(inv => {
      const invDate = parseToDate(inv.startDate);
      return invDate && invDate >= filters.startDate && invDate <= filters.endDate;
    });
    
    let totalAmount = 0;
    let activeCount = 0;
    let maturedCount = 0;
    let totalProfitEarned = 0;
    let totalProfitExpected = 0;
    const byType: Record<string, { count: number; amount: number; profit: number }> = {};
    const byInvestor: Record<string, { investorId: string; investorName: string; count: number; amount: number; profit: number }> = {};
    const monthlyData: Record<string, { investment: number; profit: number }> = {};
    
    filteredInvestments.forEach(inv => {
      totalAmount += inv.amount;
      totalProfitExpected += inv.expectedProfit;
      totalProfitEarned += inv.actualProfitReceived || 0;
      
      if (inv.status === 'active') activeCount++;
      if (inv.status === 'matured') maturedCount++;
      
      if (!byType[inv.type]) {
        byType[inv.type] = { count: 0, amount: 0, profit: 0 };
      }
      byType[inv.type].count++;
      byType[inv.type].amount += inv.amount;
      byType[inv.type].profit += inv.actualProfitReceived || 0;
      
      if (!byInvestor[inv.investorId]) {
        byInvestor[inv.investorId] = {
          investorId: inv.investorId,
          investorName: inv.investorName,
          count: 0,
          amount: 0,
          profit: 0
        };
      }
      byInvestor[inv.investorId].count++;
      byInvestor[inv.investorId].amount += inv.amount;
      byInvestor[inv.investorId].profit += inv.actualProfitReceived || 0;
      
      const startDate = parseToDate(inv.startDate);
      if (startDate) {
        const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { investment: 0, profit: 0 };
        }
        monthlyData[monthKey].investment += inv.amount;
      }
    });
    
    const averageReturnRate = totalAmount > 0 ? (totalProfitEarned / totalAmount) * 100 : 0;
    
    return {
      periodStart: filters.startDate,
      periodEnd: filters.endDate,
      summary: {
        totalInvestments: filteredInvestments.length,
        totalAmount,
        activeInvestments: activeCount,
        maturedInvestments: maturedCount,
        totalProfitEarned,
        totalProfitExpected,
        averageReturnRate,
      },
      byType: Object.entries(byType).map(([type, data]) => ({
        type,
        typeLabel: INVESTMENT_TYPE_LABELS[type] || type,
        count: data.count,
        amount: data.amount,
        profit: data.profit,
        returnRate: calculateReturnRate(data.amount, data.profit),
      })),
      byInvestor: Object.values(byInvestor).map(inv => ({
        ...inv,
        returnRate: calculateReturnRate(inv.amount, inv.profit),
      })),
      monthlyData: Object.entries(monthlyData).map(([month, data]) => {
        const [year, monthNum] = month.split('-');
        return {
          month: getMonthName(parseInt(monthNum)),
          year: parseInt(year),
          investment: data.investment,
          profit: data.profit,
        };
      }),
    };
  },
  
  async exportToCSV(filters: InvestmentReportFilters): Promise<string> {
    const investments = await investmentService.getAllInvestments(10000);
    
    const headers = ['Investment ID', 'Investor', 'Type', 'Amount', 'Interest Rate', 'Status', 'Profit Expected', 'Profit Received', 'Return Rate'];
    const rows = [];
    
    const filteredInvestments = investments.filter(inv => {
      const invDate = parseToDate(inv.startDate);
      return invDate && invDate >= filters.startDate && invDate <= filters.endDate;
    });
    
    for (const inv of filteredInvestments) {
      rows.push([
        inv.investmentId,
        inv.investorName,
        INVESTMENT_TYPE_LABELS[inv.type] || inv.type,
        inv.amount.toString(),
        `${inv.interestRate}%`,
        inv.status,
        inv.expectedProfit.toString(),
        (inv.actualProfitReceived || 0).toString(),
        `${calculateReturnRate(inv.amount, inv.actualProfitReceived || 0).toFixed(2)}%`
      ]);
    }
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csvContent;
  }
};

const getMonthName = (month: number): string => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
};
export default investmentReportService; */