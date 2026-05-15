// src/modules/finance/types/bank.types.ts

export interface BankAccount {
  id: string;
  accountId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchName?: string;
  accountType: 'savings' | 'current' | 'fixed';
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  createdByName: string;
}

export interface CreateBankAccountDto {
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchName?: string;
  accountType: 'savings' | 'current' | 'fixed';
  openingBalance: number;
  notes?: string;
  createdBy: string;
  createdByName: string;
}

export interface UpdateBankAccountDto {
  accountName?: string;
  branchName?: string;
  accountType?: 'savings' | 'current' | 'fixed';
  isActive?: boolean;
  notes?: string;
}