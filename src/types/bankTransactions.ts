// src/types/bankTransactions.ts

import { Timestamp } from 'firebase/firestore';

// ============================================
// 🎯 TRANSACTION TYPES
// ============================================
export type TransactionType = 
  | 'contribution'      
  | 'loan_disbursement' 
  | 'loan_repayment'    
  | 'investment'        
  | 'investment_return' 
  | 'profit'            // 🆕 লাভ প্রাপ্তি
  | 'expense'           
  | 'transfer'          
  | 'adjustment';

// ============================================
// 📍 SOURCE COLLECTIONS
// ============================================
export type SourceCollection = 
  | 'contributions'
  | 'loans'
  | 'loan_repayments'
  | 'investments'
  | 'profit_records'    // 🆕
  | 'expenses';

// ============================================
// 💳 PAYMENT METHODS
// ============================================
export type PaymentMethod = 
  | 'cash'      
  | 'bank'      
  | 'bikash'    
  | 'nogod'     
  | 'rocket'    
  | 'other';

// ============================================
// 👤 HANDLER TYPES
// ============================================
export type HandlerType = 
  | 'collector'   
  | 'cashier'     
  | 'member'      
  | 'external'    // 🆕 বাহ্যিক ব্যক্তি
  | 'somity'      // 🆕 সমিতি
  | 'admin';

// ============================================
// 🏦 HOLDING TYPE
// ============================================
export type HoldingType = 
  | 'collector'      
  | 'somity_bank';

// ============================================
// 📊 TRANSACTION STATUS
// ============================================
export type TransactionStatus = 
  | 'pending'     
  | 'completed'   
  | 'cancelled'   
  | 'reversed';

// ============================================
// 🎯 DESTINATION TYPES
// ============================================
export type DestinationType = 
  | 'somity_bank'         
  | 'collector_cash'      
  | 'collector_bank'      
  | 'mobile_wallet'       
  | 'member_account'      
  | 'expense_payment'
  | 'investment';         // 🆕 বিনিয়োগের জন্য

// ============================================
// 📈 TRANSACTION DIRECTION
// ============================================
export type TransactionDirection = 
  | 'in'   
  | 'out';

// ============================================
// 🏦 SIMPLIFIED BANK TRANSACTION INTERFACE
// ============================================
export interface BankTransaction {
  id?: string;
  
  // 🔗 LINKING
  transactionType: TransactionType;
  sourceCollection: SourceCollection;
  sourceId: string;
  sourceReceiptId?: string;
  
  // 📈 DIRECTION
  direction: TransactionDirection;
  
  // 👤 MEMBER INFO
  memberId?: string;
  memberName?: string;
  
  // 🆕 Investment specific
  investmentId?: string;
  coInvestorId?: string;
  profitRecordId?: string;
  
  // 💰 AMOUNT
  amount: number;
  fee?: number;
  netAmount: number;
  
  // 💳 PAYMENT METHOD
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentDate: Date | Timestamp;
  
  // 🤝 HANDLER
  handlerType: HandlerType;
  handlerId: string;
  handlerName: string;
  handlerMemberId?: string;
  
  // 🆕 WHERE IS THE MONEY?
  holdingType: HoldingType;
  
  // 🎯 DESTINATION
  destinationType: DestinationType;
  destinationBankAccountId?: string;
  destinationCollectorId?: string;
  
  // 📊 STATUS
  status: TransactionStatus;
  affectsBalance: boolean;
  
  // 🏦 DEPOSIT INFO
  depositReference?: string;
  depositBankAccountId?: string;
  depositDate?: Date | Timestamp;
  depositedBy?: string;
  
  // 📝 METADATA
  remarks?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  
  // 👤 AUDIT
  createdBy: string;
  createdByName: string;
  createdAt: Date | Timestamp;
  updatedBy?: string;
  updatedAt?: Date | Timestamp;
  
  // 🔄 RECONCILIATION
  isReconciled: boolean;
  reconciledAt?: Date | Timestamp;
  reconciledBy?: string;
  bankStatementRef?: string;
}

// ============================================
// 📝 CREATE TRANSACTION REQUEST
// ============================================
export interface CreateBankTransactionRequest {
  transactionType: TransactionType;
  sourceCollection: SourceCollection;
  sourceId: string;
  sourceReceiptId?: string;
  amount: number;
  direction: TransactionDirection;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentDate?: Date;
  handlerId: string;
  handlerName: string;
  handlerType: HandlerType;
  holdingType: HoldingType;
  destinationType: DestinationType;
  destinationBankAccountId?: string;
  memberId?: string;
  memberName?: string;
  // 🆕 Investment specific
  investmentId?: string;
  coInvestorId?: string;
  profitRecordId?: string;
  remarks?: string;
  depositReference?: string;
}

// ============================================
// 🔍 TRANSACTION FILTERS
// ============================================
export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  transactionType?: TransactionType;
  direction?: TransactionDirection;
  paymentMethod?: PaymentMethod;
  handlerId?: string;
  memberId?: string;
  holdingType?: HoldingType;
  status?: TransactionStatus;
  isReconciled?: boolean;
  affectsBalance?: boolean;
}