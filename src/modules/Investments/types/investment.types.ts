export interface Investment {
  id?: string;
  memberId: string;
  memberName: string;
  memberPhone?: string;
  memberEmail?: string;
  planId: string;
  planName: string;
  amount: number;
  startDate: Date;
  maturityDate: Date;
  expectedReturnPercent: number;
  expectedProfitAmount: number;
  actualReturnPercent?: number;
  actualProfitAmount?: number;
  status: 'active' | 'matured' | 'withdrawn' | 'defaulted';
  paymentMethod: 'cash' | 'bank';
  bankAccountId?: string;
  transactionId?: string;
  reference_no?: string;
  notes?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface InvestmentPlan {
  id?: string;
  name: string;
  nameBn: string;
  minAmount: number;
  maxAmount: number;
  durationMonths: number;
  expectedProfitPercent: number;
  profitCalculationType: 'monthly' | 'yearly' | 'at_maturity';
  riskLevel: 'low' | 'medium' | 'high';
  isActive: boolean;
  description?: string;
  features?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface InvestmentFilter {
  memberId?: string;
  status?: string;
  planId?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}