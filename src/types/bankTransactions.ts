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
  | 'admin';

// ============================================
// 🏦 HOLDING TYPE (Where is the money RIGHT NOW)
// ============================================
export type HoldingType = 
  | 'collector'      // Money with collector (cash or mobile wallet)
  | 'somity_bank';   // Money in somity bank account

// ============================================
// 📊 TRANSACTION STATUS (Simplified)
// ============================================
export type TransactionStatus = 
  | 'pending'     // Money with collector, not yet in bank
  | 'completed'   // Money in somity bank
  | 'cancelled'   // Transaction cancelled
  | 'reversed';   // Transaction reversed

// ============================================
// 🎯 DESTINATION TYPES
// ============================================
export type DestinationType = 
  | 'somity_bank'         
  | 'collector_cash'      
  | 'collector_bank'      
  | 'mobile_wallet'       
  | 'member_account'      
  | 'expense_payment';

// ============================================
// 📈 TRANSACTION DIRECTION
// ============================================
export type TransactionDirection = 
  | 'in'   // Money coming INTO somity
  | 'out'; // Money going OUT OF somity

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
  
  // 🆕 WHERE IS THE MONEY? (Key field)
  holdingType: HoldingType;  // 'collector' or 'somity_bank'
  
  // 🎯 DESTINATION
  destinationType: DestinationType;
  destinationBankAccountId?: string;
  destinationCollectorId?: string;
  
  // 📊 STATUS (Simplified - no settlementStatus)
  status: TransactionStatus;     // 'pending' or 'completed'
  affectsBalance: boolean;       // true = in bank, false = with collector
  
  // 🏦 DEPOSIT INFO (When collector deposits to bank)
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
  holdingType: HoldingType;           // REQUIRED
  destinationType: DestinationType;
  destinationBankAccountId?: string;
  memberId?: string;
  memberName?: string;
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