// src/modules/Investments/types/investment.types.ts

export type InvestmentCategory =
  | 'fixed_deposit'
  | 'business'
  | 'real_estate'
  | 'agriculture'
  | 'stock_market'
  | 'project'
  | 'savings'
  | 'other';

export type InvestmentStatus = 'pending' | 'active' | 'matured' | 'rejected' | 'withdrawn';
export type ProfitCalculationType = 'percentage' | 'fixed_amount' | 'revenue_share';
export type ProfitFrequency = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'on_maturity';
export type MoneySourceType = 'cash' | 'bank' | 'both';
export type ManagementType = 'somity_direct' | 'member_committee';
export type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';

// 🆕 Payment status types - এই টাইপ দুই জায়গায় একই রাখো
export type CoInvestorPaymentStatus = 'submitted' | 'under_review' | 'verified';

export interface CoInvestor {
  paymentBankName: null;
  paymentMobileNo: null;
  id?: string;
  investorType: 'member' | 'external';
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  memberId?: string;
  contributedAmount: number;
  profitSharePercentage: number;
  linkedTransactionId?: string;  // 🆕 কোন ব্যাংক ট্রানজেকশনের সাথে লিঙ্ক করা আছে কিনা
  
  // Payment tracking fields
  paymentMethod?: 'cash' | 'bank';  // শুধু cash আর bank
  paymentReference?: string;
  paymentDocUrl?: string;
  paymentBankAccountId?: string;    // সমিতির ব্যাংক অ্যাকাউন্ট ID
  paymentSenderBank?: string;        // প্রদানকারীর ব্যাংকের নাম
  paidAmount?: number;               // কত টাকা পরিশোধ করেছে
  remainingAmount?: number;          // বাকি পরিশোধের পরিমাণ
  lastPaymentDate?: string;
  paymentStatus?: CoInvestorPaymentStatus;  // ✅ 'submitted' | 'under_review' | 'verified'
  notes?: string;
}

export interface InvestmentDocument {
  id: string;
  investmentId: string;
  documentType: 'proposal' | 'agreement' | 'collateral_proof' | 'payment_receipt' | 'other';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  description?: string;
}

export interface Investment {
  id: string;
  investmentId: string;
  investmentName: string;
  referenceNo?: string;
  category: InvestmentCategory;
  investmentPlace?: string;  // 🆕 বিনিয়োগের স্থান
  purpose?: string;
  totalAmount: number;
  startDate: string;
  durationMonths?: number;
  maturityDate?: string;
  description?: string;

  // Somity (Primary)
  somityContribution: number;
  somityProfitShare: number;

  // Co-investors
  hasCoInvestors: boolean;
  coInvestors: CoInvestor[];
  coInvestorsCount: number;
  coInvestorsTotalContribution: number;
  coInvestorsTotalProfitShare: number;

  // Document management
  hasDocuments?: boolean;
  documentsCount?: number;
  documents?: InvestmentDocument[];

  // Profit
  profitType: ProfitCalculationType;
  profitRate: number;
  profitPaymentFrequency: ProfitFrequency;
  expectedProfit: number;
  expectedTotalReturn: number;
  actualProfitReceived: number;
  actualTotalReturn: number;

  // Money Source
  moneySource: MoneySourceType;
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  accountType?: string;
  accountHolderName?: string;
  chequeNo?: string;
  cashAmount?: number;
  bankAmount?: number;
  cashVault?: string;
  cashReceivedBy?: string;
  cashReceiptNo?: string;
  bankAccountId?: string;

  // Management (Updated - removed collateral and guarantor)
  managementType: ManagementType;
  committeeHead?: string;
  committeeMembers?: string;
  riskLevel: RiskLevel;
  riskAssessmentNotes?: string;  // 🆕 ঝুঁকি মূল্যায়ন নোট
  remarks?: string;

  // Status & Approval
  status: InvestmentStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  maturedBy?: string;
  maturedAt?: string;

 // 🆕 Bank transaction links
  outTransactions?: string[];     // সমিতির বের হওয়া টাকা (direction: 'out')
  inTransactions?: string[];      // ইনকামিং টাকা (direction: 'in') - co-investor + লাভ + ম্যাচিউরিটি
  inTransactionId?: string;       // শেষ ইনকামিং ট্রানজেকশন (লাভ বা ম্যাচিউরিটি)
  totalCoInvestorsPaid?: number;
  coInvestorsPaymentStatus?: 'pending' | 'partial' | 'completed';

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
}

export interface CreateInvestmentRequest
  extends Omit<
    Investment,
    | 'id'
    | 'investmentId'
    | 'createdAt'
    | 'updatedAt'
    | 'createdBy'
    | 'createdByName'
    | 'expectedProfit'
    | 'expectedTotalReturn'
    | 'actualProfitReceived'
    | 'actualTotalReturn'
    | 'status'
    | 'outTransactions'
    | 'inTransactionId'
    | 'approvedBy'
    | 'approvedAt'
    | 'rejectedReason'
    | 'maturedBy'
    | 'maturedAt'
    | 'hasDocuments'
    | 'documentsCount'
    | 'totalCoInvestorsPaid'
    | 'coInvestorsPaymentStatus'
  > {
  expectedProfit?: number;
  expectedTotalReturn?: number;
}

export interface InvestmentSummary {
  totalInvested: number;
  totalActive: number;
  totalMatured: number;
  totalPending: number;
  totalProfitReceived: number;
  activeCount: number;
  maturedCount: number;
  pendingCount: number;
}
export interface ProfitRecord {
  id: string;
  investmentId: string;
  period: string;           // e.g., "January 2024", "Q1 2024"
  expectedAmount: number;
  receivedAmount: number;
  status: 'pending' | 'received' | 'partial';
  receivedDate?: string;
  linkedBankTransactionId?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}