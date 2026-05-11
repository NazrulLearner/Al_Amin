// src/types/index.ts
// ============================================
// MAIN TYPES INDEX - Re-exports everything
// ============================================

// ============================================
// COMMON TYPES
// ============================================
export type {
  UserRole,
  MemberStatus,
  VerificationStatus,
  PaymentType,
  FeeType,
  PaymentStatus,
  MembershipType,
  CollectionStatus
} from './common';

// ============================================
// USER TYPES
// ============================================
export type { AppUser } from './user';

// ============================================
// ADDRESS TYPES
// ============================================
export type { Address } from './address';
export { ADDRESS_INITIAL_STATE } from './address';

// ============================================
// MEMBER TYPES
// ============================================
export type { Member, SimpleMember } from './member';
export { MEMBER_INITIAL_STATE } from './member';

// ============================================
// FEE TYPES
// ============================================
export type {
  FeeTransaction,
  FeePaymentRequest,
  MemberDueInfo,
  DueMonth,
  FeeSummary,
  FeeEntryFormData,
  ReceiptData
} from './contributions';
export { FEE_TRANSACTION_INITIAL_STATE } from './contributions';

// ============================================
// LOAN TYPES
// ============================================
export type {
  LoanType,
  LoanStatus,
  Loan,
  LoanApplication,
  LoanRepayment,
  LoanDisbursement,
  Applicant,
  Grantor,
  LoanDocument as Document,
  LoanDetails,
  BaseLoan,
  MurabahaDetails,
  MusharakaDetails,
  SalamDetails,
  QardHasanahDetails,
  IstisnaDetails,
  MudarabaDetails,
  TawarruqDetails,
  IjarahDetails,
  KafalahDetails
} from './financing';
export {
  LOAN_TYPES,
  LOAN_TYPE_CONFIG,
  LOAN_TYPE_CODES
} from './financing';

// ============================================
// SETTINGS TYPES
// ============================================
export type {
  GeneralSettings,
  SomitySettings
} from './settings';
export { DEFAULT_SOMITY_SETTINGS } from './settings';

// ============================================
// COLLECTOR TYPES 🆕
// ============================================
export type { CollectorAssignment, CollectorConfig } from './collector';

// ============================================
// SUPER ADMIN TYPES (only for super_admin)
// ============================================
export type { SuperAdminDashboard, FirebaseUsageLog } from './superAdmin';
