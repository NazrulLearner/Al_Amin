// src/modules/finance/types/cash.types.ts

export interface CashBalance {
  cashierId: string;
  cashierName: string;
  cashierMemberId: string;
  openingBalance: number;
  currentBalance: number;
  totalCollection: number;
  totalDeposit: number;
  totalDisbursement: number;
  lastTransactionDate: Date;
  status: 'open' | 'closed';
  shiftStartTime: Date;
  shiftEndTime?: Date;
}

export interface CashInData {
  amount: number;
  source: 'collection' | 'loan_repayment' | 'investment' | 'other';
  referenceNo?: string;
  note?: string;
  collectedBy: string;
  collectedByName: string;
}

export interface CashOutData {
  amount: number;
  purpose: 'disbursement' | 'expense' | 'transfer' | 'other';
  referenceNo?: string;
  note?: string;
  approvedBy: string;
  approvedByName: string;
}

export interface DailyClosingData {
  cashierId: string;
  cashierName: string;
  openingBalance: number;
  totalCollection: number;
  totalDeposit: number;
  totalDisbursement: number;
  closingBalance: number;
  cashInHand: number;
  bankDeposits: {
    bankId: string;
    bankName: string;
    amount: number;
    referenceNo: string;
  }[];
  notes?: string;
}