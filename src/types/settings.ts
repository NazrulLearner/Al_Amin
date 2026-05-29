// src/types/settings.ts

import type { CollectorConfig } from './collector';

export interface GeneralSettings {
  somityName: string;
  somityEmail: string;
  somityPhone: string;
  somityAddress: string;
  slogan: string;
  logo?: string;
  favicon?: string;
  website?: string;
  establishedYear?: number;
  registrationNumber?: string;
  taxId?: string;
  alternativePhone?: string;
  fax?: string;
  watermarkText?: string;
  watermarkOpacity?: number;
  watermarkEnabled?: boolean;
  watermarkRotation?: number;
}

// ✅ BankAccount এখন শুধু এখানে ডিফাইন থাকবে (Settings এ না)
// কিন্তু settings.ts থেকে আমরা এই ইন্টারফেস সরিয়ে দেবো না
// কারণ অন্য জায়গায় ব্যবহার হতে পারে

// Collector Interface
export interface Collector {
  id: string;
  memberId: string;
  name: string;
  phone: string;
  email?: string;
  role: 'collector' | 'cashier' | 'field_agent';
  isActive: boolean;
  personalAccounts: PersonalAccount[];
  collectionLimit: number;
  assignedArea?: string;
  joinedAt: Date;
}

export interface PersonalAccount {
  id: string;
  type: 'bank' | 'bikash' | 'nogod' | 'rocket';
  accountName: string;
  accountNumber: string;
  bankName?: string;
  isActive: boolean;
  isVerified: boolean;
}

export interface SomitySettings {
  general: GeneralSettings;
  // ❌ bankAccounts?: BankAccount[];  // এই লাইনটি DELETE করুন
  // ❌ collectorBanking?: {...}  // এই লাইনটি DELETE করুন (যদি থাকে)
  share: {
    perShareValue: number;
    minShare: number;
    maxShare: number;
    defaultShare: number;
  };
  fee: {
    type: 'weekly' | 'biweekly' | 'monthly';
    amountPerShare: number;
    dueDay: number;
    lateFee: number;
    lateFeeAfterDays: number;
    gracePeriod: number;
  };
  member: {
    maxMembers: number;
    planMaxMembers: number;
    requireApproval: boolean;
    autoGenerateMemberId: boolean;
    memberIdPrefix: string;
    memberIdDigitLength: number;
    autoActivateAfterApproval?: boolean;
    defaultRole?: 'member' | 'manager' | 'cashier' | 'accountant';
    defaultStatus?: 'active' | 'pending' | 'inactive';
    minAge?: number;
    inactiveAfterDays?: number;
    deleteAfterDays?: number;
  };
  loan: {
    maxLoans: number;
    maxLoanAmount: number;
    minLoanAmount: number;
    defaultInterestRate: number;
    maxDuration: number;
    requireGuarantor: boolean;
    requireCollateral: boolean;
    approvalRequired: boolean;
    processingFee: number;
    latePaymentPenalty: number;
    minDuration?: number;
    latePaymentGraceDays?: number;
    autoApproveForGoodStanding?: boolean;
    minMembershipDuration?: number;
    minSavingsPercentage?: number;
    maxLoanToSavingsRatio?: number;
    requireIncomeProof?: boolean;
    requireBusinessProof?: boolean;
    maxOutstandingLoanRatio?: number;
    autoDisburseAfterApproval?: boolean;
  };
  islamicLoanConfig: {
    murabaha: { enabled: boolean; profitRate: number; maxDuration: number; minDownPayment?: number; latePenalty?: number; };
    musharaka: { enabled: boolean; profitSharingRatio: number; maxDuration: number; lossSharingRatio?: number; managementFee?: number; };
    salam: { enabled: boolean; deliveryPeriod: number; maxAdvance: number; commodityType?: string; deliveryPenalty?: number; };
    qardHasanah: { enabled: boolean; serviceFee: number; maxAmount: number; maxDuration: number; specialConsideration?: string; };
    istisna: { enabled: boolean; progressPayment: boolean; maxDuration: number; };
    mudaraba: { enabled: boolean; profitSharingRatio: number; maxInvestment: number; };
    tawarruq: { enabled: boolean; commodityType: string; maxAmount: number; };
    ijarah: { enabled: boolean; rentalRate: number; securityDeposit: number; maxDuration: number; maintenanceResponsibility?: string; };
    kafalah: { enabled: boolean; guaranteeFee: number; maxGuaranteeAmount: number; minGuarantorSavings?: number; maxGuarantors?: number; };
  };
  collection: {
    allowedPaymentMethods: ('cash' | 'bank' | 'bikash' | 'nogod' | 'rocket')[];
    autoGenerateReceipt: boolean;
    receiptPrefix: string;
    receiptFooter?: string;
    minPaymentAmount?: number;
    maxPaymentAmount?: number;
    allowPartialPayments?: boolean;
    allowAdvancePayment?: boolean;
    requirePaymentNote?: boolean;
    sendSmsConfirmation?: boolean;
    collectionStartTime?: string;
    collectionEndTime?: string;
    collectionDays?: string[];
    reminderBeforeDays?: number;
    reminderAfterDays?: number;
    smsReminder?: boolean;
    emailReminder?: boolean;
    collectorSettings?: CollectorConfig;
    // ✅ নতুন ফিচার: কালেক্টরের নিজস্ব ব্যাংক অ্যাকাউন্ট ব্যবহারের অনুমতি
    allowCollectorPersonalAccount?: boolean;  // 👈 এটা যোগ করুন
  };
  financial: {
    fiscalYearStart: string;
    currencySymbol: string;
    currencyCode: string;
    decimalPlaces: number;
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD-MMM-YYYY';
    currencyPosition: 'before' | 'after';
    thousandSeparator: string;
    decimalSeparator: string;
    enableNotifications: boolean;
    enableSmsNotifications?: boolean;
    notificationEmail?: string;
    notificationPhone?: string;
    autoGenerateReports?: boolean;
    autoGenerateAnnualReports?: boolean;
  };
  report: {
    autoGenerateReports: boolean;
    reportRetentionDays: number;
    defaultReportFormat: 'pdf' | 'excel' | 'both';
    generateFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    generateTime?: string;
    enabledReports?: string[];
    autoArchiveAfterDays?: number;
    emailReports?: boolean;
    smsReports?: boolean;
    recipientEmails?: string;
  };
  security: {
    require2FA: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordExpiryDays: number;
  };
  investment: {
    enabled: boolean;
    allowExternalInvestors: boolean;
    minInvestmentAmount: number;
    maxInvestmentAmount: number;
    profitDistributionType: 'percentage' | 'fixed';
    defaultProfitShareRatio: number;
    requireApproval: boolean;
  };
}

export const DEFAULT_SOMITY_SETTINGS: SomitySettings = {
  general: {
    somityName: '',
    somityEmail: '',
    somityPhone: '',
    somityAddress: '',
    slogan: '',
    logo: '',
    favicon: '',
    website: '',
    establishedYear: new Date().getFullYear(),
    registrationNumber: '',
    taxId: '',
    alternativePhone: '',
    fax: '',
    watermarkText: 'স্মৃতি চিরন্তন',
    watermarkOpacity: 0.1,
    watermarkEnabled: true,
    watermarkRotation: -12
  },
  // ❌ bankAccounts: [],  // DELETE this line
  // ❌ collectorBanking: { ... },  // DELETE this line
  share: {
    perShareValue: 1000,
    minShare: 1,
    maxShare: 100,
    defaultShare: 1
  },
  fee: {
    type: 'monthly',
    amountPerShare: 1000,
    dueDay: 1,
    lateFee: 50,
    lateFeeAfterDays: 7,
    gracePeriod: 3
  },
  member: {
    maxMembers: 100,
    planMaxMembers: 100,
    requireApproval: false,
    autoGenerateMemberId: true,
    memberIdPrefix: 'MBR-',
    memberIdDigitLength: 3,
    autoActivateAfterApproval: true,
    defaultRole: 'member',
    defaultStatus: 'active',
    minAge: 18,
    inactiveAfterDays: 90,
    deleteAfterDays: 365
  },
  loan: {
    maxLoans: 2,
    maxLoanAmount: 100000,
    minLoanAmount: 1000,
    defaultInterestRate: 10,
    maxDuration: 36,
    minDuration: 1,
    requireGuarantor: true,
    requireCollateral: false,
    approvalRequired: true,
    processingFee: 1,
    latePaymentPenalty: 2,
    latePaymentGraceDays: 7,
    autoApproveForGoodStanding: false,
    minMembershipDuration: 3,
    minSavingsPercentage: 20,
    maxLoanToSavingsRatio: 5,
    requireIncomeProof: false,
    requireBusinessProof: false,
    maxOutstandingLoanRatio: 50,
    autoDisburseAfterApproval: true
  },
  islamicLoanConfig: {
    murabaha: { enabled: true, profitRate: 12, maxDuration: 24, minDownPayment: 20, latePenalty: 2 },
    musharaka: { enabled: true, profitSharingRatio: 50, maxDuration: 36, lossSharingRatio: 100, managementFee: 1 },
    salam: { enabled: true, deliveryPeriod: 6, maxAdvance: 80, commodityType: 'Agricultural Products', deliveryPenalty: 1 },
    qardHasanah: { enabled: true, serviceFee: 0, maxAmount: 50000, maxDuration: 12, specialConsideration: 'all' },
    istisna: { enabled: true, progressPayment: true, maxDuration: 24 },
    mudaraba: { enabled: true, profitSharingRatio: 60, maxInvestment: 100000 },
    tawarruq: { enabled: true, commodityType: 'Commodity', maxAmount: 50000 },
    ijarah: { enabled: true, rentalRate: 2, securityDeposit: 10, maxDuration: 24, maintenanceResponsibility: 'lessee' },
    kafalah: { enabled: true, guaranteeFee: 1, maxGuaranteeAmount: 50000, minGuarantorSavings: 10000, maxGuarantors: 2 }
  },
  collection: {
    allowedPaymentMethods: ['cash', 'bank', 'bikash', 'nogod', 'rocket'],
    autoGenerateReceipt: true,
    receiptPrefix: 'RCPT-',
    receiptFooter: 'Thank you for your payment. Keep this receipt for future reference.',
    minPaymentAmount: 100,
    maxPaymentAmount: 1000000,
    allowPartialPayments: true,
    allowAdvancePayment: true,
    requirePaymentNote: false,
    sendSmsConfirmation: true,
    collectionStartTime: '09:00',
    collectionEndTime: '17:00',
    collectionDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
    reminderBeforeDays: 3,
    reminderAfterDays: 7,
    smsReminder: true,
    emailReminder: true,
    collectorSettings: { enabled: true, collectors: [] },
    allowCollectorPersonalAccount: false  // 👈 নতুন ফিল্ড যোগ করুন
  },
  financial: {
    fiscalYearStart: 'July-2021',
    currencySymbol: '৳',
    currencyCode: 'BDT',
    decimalPlaces: 2,
    dateFormat: 'DD/MM/YYYY',
    currencyPosition: 'after',
    thousandSeparator: ',',
    decimalSeparator: '.',
    enableNotifications: true,
    enableSmsNotifications: true,
    notificationEmail: '',
    notificationPhone: '',
    autoGenerateReports: false,
    autoGenerateAnnualReports: true
  },
  report: {
    autoGenerateReports: false,
    reportRetentionDays: 365,
    defaultReportFormat: 'pdf',
    generateFrequency: 'monthly',
    generateTime: '23:59',
    enabledReports: ['member', 'fee', 'loan', 'financial', 'cashier', 'bank', 'business', 'investment'],
    autoArchiveAfterDays: 30,
    emailReports: false,
    smsReports: false,
    recipientEmails: ''
  },
  security: {
    require2FA: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpiryDays: 90
  },
  investment: {
    enabled: true,
    allowExternalInvestors: false,
    minInvestmentAmount: 1000,
    maxInvestmentAmount: 500000,
    profitDistributionType: 'percentage',
    defaultProfitShareRatio: 50,
    requireApproval: true
  }
};
// Add this export at the end of the file or where BankAccount is defined
export interface BankAccount {
  id?: string;
  accountId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchName?: string;
  accountType: string;
  isActive: boolean;
  balance: number;
  openingBalance?: number;
  routingNumber?: string;
  swiftCode?: string;
  notes?: string;
  ownerType: 'somity' | 'collector';
  ownerId: string;
  collectorId?: string;
  collectorName?: string;
  collectorMemberId?: string;
  createdAt?: any;
  updatedAt?: any;
}