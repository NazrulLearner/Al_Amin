// src/types/contributions.ts

import type { PaymentType, FeeType, PaymentStatus, CollectionStatus } from '../../../types/common';

// ============================================
// 📄 FEE TRANSACTION - FLAT STRUCTURE
// ============================================

export interface FeeTransaction {
  id: string;
  
  // ========== BASIC INFO ==========
  amount: number;
  feeAmount: number;
  balanceDue: number;
  
  // ========== STATUS ==========
  collectionStatus: CollectionStatus;
  status: PaymentStatus;
  payType: PaymentType;
  feeType: FeeType;
  isAdvancePayment: boolean;
  isPartialPayment: boolean;
  
  // ========== REMARKS & DATES ==========
  remarks?: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  paymentDate: Date;
  paymentPeriod: string;
  
  // ========== RECEIPT ==========
  receiptId: string;
  receiptFooter?: string;
  referenceNo?: string | null;
  transferReference?: string | null;
  
  // ========== MEMBER INFO (Flat) ==========
  memberId: string;
  memberName: string;
  memberShare: number;
  
  // ========== COLLECTOR INFO (Flat) ==========
  collectorId?: string | null;
  collectorMemberId?: string | null;
  collectorName?: string | null;
  
  // ========== ENTERED BY (Flat) ==========
  enteredById: string;
  enteredByMemberId: string;
  enteredByName: string;
  
  // ========== PAYMENT METHOD (Flat) ==========
  paymentMethod: string;
  paymentReferenceNo?: string | null;
  
  // ========== DEPOSIT INFO (Flat) ==========
  depositBankName?: string | null;
  depositDate?: Date | string | null;
  depositorName?: string | null;
  depositorId?: string | null;
  depositReference?: string | null;
  depositStatus?: 'pending' | 'deposited';
  
  // ========== MONTH RANGE ==========
  feeMonthFrom: string;
  feeMonthTo: string;
  feeYearFrom: number;
  feeYearTo: number;
  
  // ========== MONTH DETAILS ==========
  month: string;
  monthsPaid: number;
  
  // ========== PAID MONTHS ARRAYS ==========
  paidMonths: string[];
  paidYears: number[];
  paidMonthsDetails: { month: string; year: number; amount: number }[];
  advanceMonths: string[];
}

// ============================================
// 📝 FEE PAYMENT REQUEST
// ============================================

export interface FeePaymentRequest {
  memberId: string;
  memberName: string;
  memberShare?: number;
  months: { month: string; year: number; amount: number }[];
  totalAmount: number;
  paymentType: PaymentType;
  paymentDate?: string;
  referenceNo?: string;
  remarks?: string;
  depositDate?: string;
  depositorName?: string;
  depositorId?: string;
}

// ============================================
// 👤 MEMBER DUE INFO
// ============================================

export interface MemberDueInfo {
  memberId: string;
  memberName: string;
  shareCount: number;
  monthlyFee: number;
  totalDue: number;
  dueMonths: DueMonth[];
  lastPaymentDate?: Date;
  nextDueMonth?: string;
  nextDueYear?: number;
  paidMonths?: { month: string; year: number }[];
  paidCount?: number;
  totalMonths?: number;
}

export interface DueMonth {
  month: string;
  year: number;
  amount: number;
  isOverdue: boolean;
}

// ============================================
// 📊 FEE SUMMARY
// ============================================

export interface FeeSummary {
  totalCollected: number;
  totalDue: number;
  collectionRate: number;
  thisMonthCollection: number;
  lastMonthCollection: number;
  pendingMembers: number;
  activeMembers: number;
}

// ============================================
// 📝 FEE ENTRY FORM DATA
// ============================================

export interface FeeEntryFormData {
  memberId: string;
  memberName: string;
  feeAmount: number;
  paymentDate: Date;
  payType: PaymentType;
  referenceNo?: string;
  feeMonthFrom: string;
  feeYearFrom: number;
  feeMonthTo: string;
  feeYearTo: number;
  monthsPaid: number;
  remarks?: string;
}

// ============================================
// 🧾 RECEIPT DATA
// ============================================

export interface ReceiptData {
  receiptId: string;
  memberId: string;
  memberName: string;
  amount: number;
  paymentDate: Date;
  paymentType: string;
  months: string;
  somityName: string;
  somityAddress: string;
}

// ============================================
// 🔄 INITIAL STATE
// ============================================

export const FEE_TRANSACTION_INITIAL_STATE: Partial<FeeTransaction> = {
  memberId: '',
  memberName: '',
  memberShare: 0,
  feeAmount: 0,
  amount: 0,
  balanceDue: 0,
  isPartialPayment: false,
  paymentDate: new Date(),
  payType: 'cash',
  feeType: 'monthly',
  feeMonthFrom: '',
  feeYearFrom: new Date().getFullYear(),
  monthsPaid: 1,
  feeMonthTo: '',
  feeYearTo: new Date().getFullYear(),
  paidMonths: [],
  paidYears: [],
  advanceMonths: [],
  isAdvancePayment: false,
  collectionStatus: 'collected',
  status: 'paid',
  enteredById: '',
  enteredByName: '',
  enteredByMemberId: '',
  receiptFooter: '',
  collectorId: '',
  collectorMemberId: '',
  collectorName: '',
  depositBankName: '',
  depositReference: '',
  paymentMethod: 'cash',
  paymentReferenceNo: '',
  remarks: '',
};