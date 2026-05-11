// src/types/fees.ts
import type { PaymentType, FeeType, PaymentStatus, CollectionStatus } from './common';

export interface FeeTransaction {
  collector: any;
  collectorName?: any;
  receiver?: string;
  receiverName?: string;
  id: string;
  receiptId: string;
  memberId: string;
  memberName: string;
  feeAmount: number;
  isPartialPayment: boolean;
  balanceDue: number;
  paymentDate: Date;
  payType: PaymentType;
  referenceNo?: string | null;
  feeType: FeeType;
  feeMonthFrom: string;
  feeYearFrom: number;
  monthsPaid: number;
  feeMonthTo: string;
  feeYearTo: number;
  paymentPeriod: string;
  paidMonths: string[];
  paidYears: number[];
  paidMonthsDetails?: { month: string; year: number; amount: number }[];
  advanceMonths: string[];
  isAdvancePayment: boolean;
  collectionStatus: CollectionStatus;
  collectedBy?: string;
  collectedById?: string;
  collectedAt?: Date;
  depositedBy?: string;
  depositedAt?: Date;
  depositedTo?: string;
  transferReference?: string;
  bankName?: string;
  bankReference?: string;
  member?: {
    id: string;
    name: string;
    share: number;
  };
  enteredBy?: {
    id: string;
    memberId: string;
    name: string;
  } | string;
  payment?: {
    method: PaymentType;
    referenceNo?: string | null;
  };
  deposit?: {
    bankName?: string | null;
    depositDate?: Date | string | null;
    depositorName?: string | null;
    depositorId?: string | null;
    reference?: string | null;
    status?: string;
  };
  enteredById: string;
  enteredByName: string;
  enteredByMemberId: string;
  receiptFooter?: string;
  status: PaymentStatus;
  remarks?: string | null;
  approvedBy?: string | null;  // ✅ ADD THIS
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date | null;
}

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

export interface FeeSummary {
  totalCollected: number;
  totalDue: number;
  collectionRate: number;
  thisMonthCollection: number;
  lastMonthCollection: number;
  pendingMembers: number;
  activeMembers: number;
}

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

export const FEE_TRANSACTION_INITIAL_STATE = {
  memberId: '', memberName: '',
  feeAmount: 0, isPartialPayment: false, balanceDue: 0,
  paymentDate: new Date(), payType: 'cash' as PaymentType, feeType: 'monthly' as FeeType,
  feeMonthFrom: '', feeYearFrom: new Date().getFullYear(), monthsPaid: 1,
  feeMonthTo: '', feeYearTo: new Date().getFullYear(),
  paidMonths: [] as string[], paidYears: [] as number[], advanceMonths: [] as string[], isAdvancePayment: false,
  collectionStatus: 'collected' as CollectionStatus, collectedBy: '', collectedById: '', collectedAt: new Date(),
  collector: '', enteredBy: '', status: 'paid' as PaymentStatus,
  enteredById: '', enteredByName: '', enteredByMemberId: '',
  receiptFooter: '', collectorMemberId: '', collectorName: '',
  bankName: '', bankReference: ''
};
