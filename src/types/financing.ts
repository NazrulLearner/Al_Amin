// src/types/financing.ts

// ============================================
// ALL LOAN RELATED TYPES
// ============================================

// ============================================
// LOAN TYPES (Core)
// ============================================

export const LOAN_TYPES = {
  MURABAHA: 'murabaha',
  MUSHARAKA: 'musharaka', 
  SALAM: 'salam',
  QARD_HASANAH: 'qardHasanah',
  ISTISNA: 'istisna',
  MUDARABA: 'mudaraba',
  TAWARRUQ: 'tawarruq',
  IJARAH: 'ijarah',
  KAFALAH: 'kafalah'
} as const;

export type LoanType = 'murabaha' | 'musharaka' | 'salam' | 'qardHasanah' | 'istisna' | 'mudaraba' | 'tawarruq' | 'ijarah' | 'kafalah';
export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted' | 'cancelled' | 'distributed';

// ============================================
// INSTALLMENT SCHEDULE TYPES (NEW)
// ============================================

export interface InstallmentScheduleItem {
  number: number;
  dueDate: Date;
  amount: number;
  isPaid?: boolean;
  paidDate?: Date;
}

export interface InstallmentSchedule {
  installments: InstallmentScheduleItem[];
  totalInstallments: number;
  installmentAmount: number;
  totalPayable: number;
}

// ============================================
// LOAN APPLICATION INTERFACE
// ============================================

export interface LoanApplication {
  id: string;
  loanId: string;
  memberId: string;
  memberName: string;
  loanType: LoanType;
  amount: number;
  interestRate: number;
  durationMonths: number;
  totalPayable: number;
  monthlyInstallment: number;
  paidAmount?: number;
  dueAmount?: number;
  paidInstallments?: number;
  remainingInstallments?: number;
  nextDueDate?: Date;
  dueDate?: Date;
  purpose?: string;
  status: LoanStatus;
  guarantorId?: string;
  guarantorName?: string;
  disbursement?: LoanDisbursement;
  disbursementStatus?: 'pending' | 'completed' | 'cancelled';
  approvedBy?: string;
  approvedAt?: Date;
  disbursedAt?: Date;
  loanStartDate?: Date;
  loanEndDate?: Date;
  completedAt?: Date;
  remarks?: string;
  loanApplicationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // 🔥 NEW: Installment related fields
  installmentFrequency?: 'monthly' | 'quarterly' | 'halfYearly' | 'yearly' | 'lumpSum';
  totalInstallments?: number;
  installmentAmount?: number;
  installmentSchedule?: InstallmentScheduleItem[];
  downPaymentAmount?: number;
  
  // 🔥 NEW: Islamic loan specific fields
  serviceChargePercent?: number;
  serviceChargeAmount?: number;
  profitSharingRatio?: number;
}

// ============================================
// LOAN INTERFACE (Simple)
// ============================================

export interface Loan {
  id: string;
  loanId: string;
  memberId: string;
  memberName: string;
  loanAmount: number;
  interestRate: number;
  totalPayable: number;
  duration: number;
  startDate: Date;
  endDate: Date;
  installmentAmount: number;
  paidAmount: number;
  dueAmount: number;
  paidInstallments: number;
  remainingInstallments: number;
  status: LoanStatus;
  loanType: LoanType;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  guarantorId?: string | null;
  guarantorName?: string | null;
  notes?: string | null;
  collateral?: {
    type: string;
    value: number;
    description: string;
  } | null;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date | null;
}

// ============================================
// LOAN DISBURSEMENT INTERFACE
// ============================================

export interface LoanDisbursement {
  id: string;
  loanId: string;
  memberId: string;
  memberName: string;
  amount: number;
  downPaymentAmount?: number;
  netDisbursedAmount?: number;
  disbursementMethod: 'cash' | 'bank' | 'cheque' | 'transfer';
  disbursedFrom: 'cashier_fund' | 'somity_bank_account' | 'somity_cash';
  sourceDetails: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    chequeNumber?: string;
    transactionId?: string;
  };
  receivedBy: string;
  receivedByName: string;
  receivedByMemberId: string;
  approvedBy: string;
  approvedByName: string;
  disbursedBy: string;
  disbursedByName: string;
  disbursementDate?: Date;
  disbursedAt: Date;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  createdBy: string;
}

// ============================================
// LOAN REPAYMENT INTERFACE
// ============================================

export interface LoanRepayment {
  id: string;
  loanId: string;
  memberId: string;
  installmentNo: number;
  dueDate: Date;
  dueAmount: number;
  paidAmount: number;
  paidDate?: Date;
  bankName?: string;
  bankReference?: string;
  collectionStatus?: 'collected' | 'deposited' | 'transferred';
  lateFee?: number;
  status: 'paid' | 'partial' | 'due' | 'overdue';
  paymentType: PaymentType;
  referenceNo?: string;
  remarks?: string;
  createdAt: Date;
}

// Import PaymentType
import type { PaymentType } from './common';

// ============================================
// APPLICANT & GRANTOR INTERFACES
// ============================================

export interface Applicant {
  isMember: boolean;
  memberID?: string;
  name: string;
  phone: string;
  nid?: string;
  address?: string;
  occupation?: string;
  monthlyIncome?: number;
  email?: string;
}

export interface Grantor {
  memberID: string;
  name: string;
  phone: string;
  relation: string;
  email?: string;
  shareCount?: number;
}

export interface LoanDocument {
  docType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: any;
}

// ============================================
// LOAN DETAILS INTERFACES (ISLAMIC FINANCING)
// ============================================

export interface MurabahaDetails {
  assetCost: number;
  profitRate: number;
  durationMonths: number;
  purpose: string;
  assetName: string;
  sellerName?: string;
  sellerAddress?: string;
  deliveryDate?: string;
  installmentAmount?: number;
  totalPayable?: number;
  installmentFrequency?: string;
}

export interface MusharakaDetails {
  totalCapital: number;
  bankShare: number;
  clientShare: number;
  profitSharingRatio: number;
  lossSharingRatio?: number;
  businessType: string;
  businessDescription?: string;
  durationMonths: number;
  managementFee?: number;
  exitClause?: string;
  installmentFrequency?: string;
}

export interface SalamDetails {
  productName: string;
  productType: string;
  quantity: number;
  unitType: string;
  unitPrice: number;
  totalPrice: number;
  advancePayment: number;
  deliveryDate: string;
  deliveryLocation: string;
  qualitySpecifications?: string;
  penaltyClause?: string;
  inspectionRequired?: boolean;
  installmentFrequency?: string;
}

export interface QardHasanahDetails {
  loanAmount: number;
  durationMonths: number;
  purpose: string;
  serviceChargePercent?: number;
  serviceChargeAmount?: number;
  repaymentSchedule: string;
  emergencyLevel?: string;
  previousQardHistory?: boolean;
  installmentFrequency?: string;
}

export interface IstisnaDetails {
  projectType: string;
  projectDescription?: string;
  totalCost: number;
  advancePayment?: number;
  progressPayments?: Array<{
    milestone: string;
    percentage: number;
    amount: number;
    dueDate: string;
  }>;
  completionDate: string;
  specifications: string;
  warrantyPeriod?: number;
  penaltyClause?: string;
  installmentFrequency?: string;
}

export interface MudarabaDetails {
  totalCapital: number;
  rabulMalShare: number;
  mudaribShare: number;
  businessType: string;
  businessPlan?: string;
  durationMonths: number;
  expectedProfit?: number;
  managementFee?: number;
  lossAbsorption?: string;
  auditRequired?: boolean;
  installmentFrequency?: string;
}

export interface TawarruqDetails {
  commodityType: string;
  commodityName: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  purpose: string;
  profitMargin?: number;
  durationMonths: number;
  brokerageFee?: number;
  storageCost?: number;
  saleConfirmation?: boolean;
  installmentFrequency?: string;
}

export interface IjarahDetails {
  assetType: string;
  assetDescription?: string;
  assetValue: number;
  leasePeriod: number;
  rentalAmount: number;
  rentalFrequency: string;
  securityDeposit?: number;
  maintenanceResponsibility: string;
  purpose: string;
  purchaseOption?: boolean;
  purchasePrice?: number;
  insuranceRequired?: boolean;
  installmentFrequency?: string;
}

export interface KafalahDetails {
  guaranteeAmount: number;
  guaranteeType: string;
  beneficiary: string;
  durationMonths: number;
  guaranteeFee?: number;
  guaranteeFeeAmount?: number;
  purpose?: string;
  contractReference?: string;
  conditions?: string;
  collateralRequired?: boolean;
  collateralDetails?: string;
  installmentFrequency?: string;
}

// Union type for all loan details
export type LoanDetails = 
  | MurabahaDetails 
  | MusharakaDetails 
  | SalamDetails 
  | QardHasanahDetails 
  | IstisnaDetails 
  | MudarabaDetails 
  | TawarruqDetails 
  | IjarahDetails 
  | KafalahDetails;

// ============================================
// BASE LOAN INTERFACE (FOR VALIDATION)
// ============================================

export interface BaseLoan {
  id?: string;
  loanId?: string;
  applicant: Applicant;
  grantor: Grantor;
  loanType: LoanType;
  loanDetails: LoanDetails;
  status?: LoanStatus;
  remarks?: string;
  documents?: LoanDocument[];
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

// ============================================
// LOAN TYPE CONFIG
// ============================================

export const LOAN_TYPE_CONFIG: Record<LoanType, { 
  name: string; 
  description: string; 
  icon: string; 
  color: string;
}> = {
  murabaha: { name: 'মুরাবাহা', description: 'পণ্য ক্রয়-বিক্রয় ভিত্তিক লোন', icon: '🛒', color: 'blue' },
  musharaka: { name: 'মুশারাকা', description: 'যৌথ অংশিদারিত্ব ভিত্তিক লোন', icon: '🤝', color: 'green' },
  salam: { name: 'সালাম', description: 'অগ্রিম পেমেন্ট ভিত্তিক কৃষি লোন', icon: '🌾', color: 'orange' },
  qardHasanah: { name: 'কারদ হাসানা', description: 'বিনা সুদে হাসানা লোন', icon: '❤️', color: 'red' },
  istisna: { name: 'ইস্তিসনা', description: 'ম্যানুফ্যাকচারিং/কনস্ট্রাকশন লোন', icon: '🏗️', color: 'purple' },
  mudaraba: { name: 'মুদারাবা', description: 'মুদ্রা বিনিয়োগ ভিত্তিক লোন', icon: '💰', color: 'teal' },
  tawarruq: { name: 'তাওয়ারুক', description: 'পণ্য মাধ্যমে তরলতা লোন', icon: '⚖️', color: 'indigo' },
  ijarah: { name: 'ইজারা', description: 'লিজ ভিত্তিক লোন', icon: '🏠', color: 'pink' },
  kafalah: { name: 'কাফালা', description: 'গ্যারান্টি ভিত্তিক লোন', icon: '🛡️', color: 'yellow' }
};

export const LOAN_TYPE_CODES: Record<LoanType, string> = {
  murabaha: 'MR',
  musharaka: 'MS',
  salam: 'SL',
  qardHasanah: 'QH',
  istisna: 'IS',
  mudaraba: 'MD',
  tawarruq: 'TW',
  ijarah: 'IJ',
  kafalah: 'KF'
};
