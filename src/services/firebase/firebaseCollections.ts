// src/services/firebase/firebaseCollections.ts

import { collection, doc } from 'firebase/firestore';
import { db } from './firebase';

// Single Somity - Single somity data anywhere!
// Collections are at ROOT level

export const collections = {
  // ============================================
  // USERS
  // ============================================
  users: () => collection(db, 'users'),
  user: (userId: string) => doc(db, 'users', userId),

  // ============================================
  // MEMBERS
  // ============================================
  members: () => collection(db, 'members'),
  member: (memberId: string) => doc(db, 'members', memberId),

  // ============================================
  // CONTRIBUTIONS / FEES
  // ============================================
  contributions: () => collection(db, 'contributions'),
  contribution: (contributionId: string) => doc(db, 'contributions', contributionId),

  // ============================================
  // COLLECTOR BALANCES (Money held by collectors)
  // ============================================
  collectorBalances: () => collection(db, 'collector_balances'),
  collectorBalance: (collectorId: string) => doc(db, 'collector_balances', collectorId),

  // ============================================
  // DEPOSITS (Contributions deposited to bank)
  // ============================================
  deposits: () => collection(db, 'deposits'),
  deposit: (depositId: string) => doc(db, 'deposits', depositId),

  // ============================================
  // LOAN APPLICATIONS
  // ============================================
  loanApplications: () => collection(db, 'loanApplications'),
  loanApplication: (applicationId: string) => doc(db, 'loanApplications', applicationId),

  // ============================================
  // LOANS
  // ============================================
  loans: () => collection(db, 'loans'),
  loan: (loanId: string) => doc(db, 'loans', loanId),

  // ============================================
  // LOAN REPAYMENTS
  // ============================================
  loanRepayments: () => collection(db, 'loan_repayments'),
  loanRepayment: (repaymentId: string) => doc(db, 'loan_repayments', repaymentId),

  // ============================================
  // LOAN DISBURSEMENTS
  // ============================================
  loanDisbursements: () => collection(db, 'loanDisbursements'),
  loanDisbursement: (disbursementId: string) => doc(db, 'loanDisbursements', disbursementId),

  // ============================================
  // BANK ACCOUNTS (New)
  // ============================================
  bankAccounts: () => collection(db, 'bank_accounts'),
  bankAccount: (bankId: string) => doc(db, 'bank_accounts', bankId),

  // ============================================
  // CASH BALANCES (Cashier/Collector cash in hand)
  // ============================================
  cashBalances: () => collection(db, 'cash_balances'),
  cashBalance: (cashierId: string) => doc(db, 'cash_balances', cashierId),

  // ============================================
  // FUND TRANSACTIONS (Money movement tracking)
  // ============================================
  fundTransactions: () => collection(db, 'fund_transactions'),
  fundTransaction: (transactionId: string) => doc(db, 'fund_transactions', transactionId),

  // ============================================
  // DAILY CLOSING
  // ============================================
  dailyClosing: () => collection(db, 'daily_closing'),
  dailyClosingDoc: (closingId: string) => doc(db, 'daily_closing', closingId),

  // ============================================
  // SOMITY SETTINGS (single document - config)
  // ============================================
  somitySettings: () => doc(db, 'somity_settings', 'config'),

  // ============================================
  // AUDIT LOGS
  // ============================================
  auditLogs: () => collection(db, 'audit_logs'),
  auditLog: (logId: string) => doc(db, 'audit_logs', logId),

  // ============================================
  // ROLES
  // ============================================
  roles: () => collection(db, 'roles'),
  role: (roleId: string) => doc(db, 'roles', roleId),

  // ============================================
  // INVESTMENT (Future)
  // ============================================
  investments: () => collection(db, 'investments'),
  investment: (investmentId: string) => doc(db, 'investments', investmentId),
  
  investmentProjects: () => collection(db, 'investment_projects'),
  investmentProject: (projectId: string) => doc(db, 'investment_projects', projectId),
};

export default collections;