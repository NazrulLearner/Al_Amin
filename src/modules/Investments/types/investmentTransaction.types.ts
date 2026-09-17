// src/modules/Investments/types/investmentTransaction.types.ts

import { Timestamp } from 'firebase/firestore';

export type InvestmentTransactionType = 
  | 'investment'      // Initial investment
  | 'profit'          // Profit received
  | 'withdrawal'      // Partial withdrawal
  | 'maturity';       // Full maturity withdrawal

export interface InvestmentTransaction {
  id: string;
  investmentId: string;
  transactionType: InvestmentTransactionType;
  amount: number;
  date: Date | Timestamp;
  notes?: string;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  type: string;  // For display purposes, e.g., "deposit", "profit", "withdrawal", "penalty"
  linkedBankTransactionId?: string;  // Link to bank_transactions
  createdAt: Date | Timestamp;
  createdBy: string;
  createdByName: string;

}
export interface InvestmentProfitDistribution {
  id: string;
  investmentId: string;
  period: string;
  expectedAmount: number;
  receivedAmount: number;
  status: 'pending' | 'received' | 'partial';
  receivedDate?: Date | Timestamp;
  linkedBankTransactionId?: string;
  notes?: string;
}

export interface ProfitRecord {
  id: string;
  investmentId: string;
  period: string;           // e.g., "January 2024"
  expectedAmount: number;
  receivedAmount: number;
  status: 'pending' | 'received' | 'partial';
  receivedDate?: Date | Timestamp;
  linkedBankTransactionId?: string;
  notes?: string;
}

export interface CreateProfitRecordRequest {
  investmentId: string;
  period: string;
  expectedAmount: number;
  notes?: string;
}

export interface RecordProfitPaymentRequest {
  profitRecordId: string;
  receivedAmount: number;
  receivedDate: Date | Timestamp;
  linkedBankTransactionId?: string;
  notes?: string;
}
