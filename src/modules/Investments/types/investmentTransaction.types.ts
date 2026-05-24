export interface InvestmentTransaction {
  id?: string;
  investmentId: string;
  memberId: string;
  type: 'deposit' | 'profit' | 'withdrawal' | 'penalty';
  amount: number;
  date: Date;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  referenceId?: string;
  createdBy: string;
  createdAt: Date;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface InvestmentProfitDistribution {
  id?: string;
  investmentId: string;
  memberId: string;
  profitAmount: number;
  distributionDate: Date;
  periodStart: Date;
  periodEnd: Date;
  status: 'pending' | 'distributed' | 'failed';
  transactionId?: string;
}
