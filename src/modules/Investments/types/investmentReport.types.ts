export interface InvestmentSummary {
  totalInvestments: number;
  totalAmount: number;
  totalExpectedProfit: number;
  totalActualProfit: number;
  activeCount: number;
  activeAmount: number;
  maturedCount: number;
  maturedAmount: number;
  withdrawnCount: number;
  defaultedCount: number;
}

export interface MemberInvestmentSummary {
  memberId: string;
  memberName: string;
  totalInvested: number;
  activeInvestments: number;
  totalExpectedProfit: number;
  totalReceivedProfit: number;
  upcomingMaturityDate?: Date;
}

export interface InvestmentReportData {
  periodStart: Date;
  periodEnd: Date;
  summary: InvestmentSummary;
  memberWise: MemberInvestmentSummary[];
  planWise: PlanWiseSummary[];
  monthlyTrend: MonthlyTrend[];
}

export interface PlanWiseSummary {
  planId: string;
  planName: string;
  investorCount: number;
  totalAmount: number;
  expectedProfit: number;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  amount: number;
  profit: number;
}