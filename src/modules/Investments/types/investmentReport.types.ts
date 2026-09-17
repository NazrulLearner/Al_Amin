// src/modules/Investments/types/investmentReport.types.ts

export interface InvestmentReport {
  periodStart: Date;
  periodEnd: Date;
  summary: {
    totalInvestments: number;
    totalAmount: number;
    activeInvestments: number;
    maturedInvestments: number;
    totalProfitEarned: number;
    totalProfitExpected: number;
    averageReturnRate: number;
  };
  byType: Array<{
    type: string;
    typeLabel: string;
    count: number;
    amount: number;
    profit: number;
    returnRate: number;
  }>;
  byInvestor: Array<{
    investorId: string;
    investorName: string;
    count: number;
    amount: number;
    profit: number;
    returnRate: number;
  }>;
  monthlyData: Array<{
    month: string;
    year: number;
    investment: number;
    profit: number;
  }>;
}

export interface InvestmentReportFilters {
  startDate: Date;
  endDate: Date;
  type?: string;
  investorId?: string;
  status?: string;
}