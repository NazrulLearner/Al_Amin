export interface Income {
  id: string;
  source: string;
  amount: number;
  date: Date;
  category: string;
  description?: string;
  receivedBy: string;
  createdAt: Date;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: Date;
  description?: string;
  paidBy: string;
  createdAt: Date;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  balance: number;
  lastUpdated: Date;
}

export interface FixedAsset {
  id: string;
  name: string;
  type: 'land' | 'building' | 'vehicle' | 'equipment';
  value: number;
  purchaseDate: Date;
  depreciation?: number;
  description?: string;
}

export interface CashTransaction {
  id: string;
  type: 'in' | 'out';
  amount: number;
  date: Date;
  purpose: string;
  handledBy: string;
}

export interface CapitalFlow {
  id: string;
  source: string;
  destination: string;
  amount: number;
  date: Date;
  type: 'transfer' | 'investment' | 'withdrawal';
}

export interface WealthSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  cashInHand: number;
  bankBalance: number;
  fixedAssetsValue: number;
}