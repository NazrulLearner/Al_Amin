// src/modules/finance/types/transaction.types.ts

export interface FundTransaction {
  id: string;
  transactionId: string;
  type: 'collection' | 'deposit' | 'withdrawal' | 'transfer' | 'disbursement';
  amount: number;
  from: {
    type: 'cashier' | 'bank';
    id: string;
    name: string;
  };
  to: {
    type: 'cashier' | 'bank';
    id: string;
    name: string;
  };
  paymentMethod?: 'cash' | 'bank' | 'bikash' | 'nogod' | 'rocket';
  referenceNo?: string;
  bankReference?: string;
  note?: string;
  status: 'pending' | 'completed' | 'cancelled';
  completedBy?: string;
  completedByName?: string;
  completedAt?: Date;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
}

export interface TransactionFilter {
  type?: string;
  fromDate?: Date;
  toDate?: Date;
  searchTerm?: string;
  limit?: number;
}