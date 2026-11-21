# Data Model — Al Amin Somity Project

**Version:** 1.0
**Last Updated:** 2026-11-20
**Governed by:** `docs/MASTER_PLAN.md` v1.1
**Status:** Phase 1.5 Deliverable — Owner Review Required

---

## 1. Overview
This document defines the Firestore collection structure, field definitions, and cross-collection relationships for the Al Amin Somity Project. 

**Core Design Principles:**
- **Atomicity:** Financial ops require `runTransaction` or `writeBatch`.
- **Normalization:** Minimize redundancy; use subcollections for high-volume logs (history, transactions).
- **Spark Plan Constraints:** Optimize reads/writes via targeted queries and minimized document size.
- **Settings-Driven:** Modules respect `somity_settings`.

---

## 2. Collection Registry

| Collection | Type | Relationship | Primary Key |
|------------|------|--------------|-------------|
| `users` | Root | 1:N (Member) | `uid` (Auth) |
| `members` | Root | 1:1 (User) | `memberID` |
| `loanApplications` | Root | 1:1 (Loan) | `applicationId` |
| `loans` | Root | 1:N (Repayment) | `loanId` |
| `loan_repayments` | Root | — | `id` |
| `investments` | Root | 1:N (Participant/History) | `investmentId` |
| `bank_transactions` | Root | — | `id` |
| `somity_settings` | Singleton | — | `config` |

---

## 3. Schema Definitions

### 3.1 Members & Users
- **`users` (root)**: Extends standard Auth, stores role array.
  - `roles: UserRole[]`
  - `primaryRole: UserRole`
  - `memberID: string` (optional, for linked member)
- **`members` (root)**:
  - `memberID: string` (custom ID)
  - `name: string`
  - `phone: string`
  - `status: 'pending' | 'verified' | 'active' | ...`
  - `joinDate: Date`

### 3.2 Financing (Loans)
- **`loanApplications` (root)**:
  - `applicationId: string`
  - `applicant: { memberID: string, name: string, ... }`
  - `status: 'pending' | 'approved' | 'rejected' | ...`
- **`loans` (root)**:
  - `loanId: string`
  - `memberId: string`
  - `totalPayable: number`
  - `paidAmount: number`
  - `dueAmount: number`
  - `status: 'active' | 'completed' | ...`
- **`loan_repayments` (root)**:
  - `loanId: string`
  - `memberId: string`
  - `installmentNo: number`
  - `paidAmount: number`

### 3.3 Treasury (Unified Ledger)
- **`bank_transactions` (root)**:
  - `transactionId: string`
  - `holdingType: 'collector' | 'somity_bank'`
  - `direction: 'in' | 'out'`
  - `sourceCollection: string` (e.g., 'loan_repayments')
  - `amount: number`

---

## 4. Relationship Cardinalities
- `Member` (1) ← (1) `User`
- `LoanApplication` (1) → (1) `Loan`
- `Loan` (1) → (N) `Repayments`
- `Loan` (1) → (N) `BankTransactions` (via loan repayment)

---

## 5. Migration Strategy
- **Legacy Migration (T-005, T-006):**
  1. Audit `collector_balances` & `deposits` volume.
  2. Map existing data to `bank_transactions` structure.
  3. Run script to batch-write normalized ledger entries.
  4. Archive legacy collections (read-only mode).

---

## 6. Open Decisions
- [T-002] Multi-responsibility: `User` document `roles` array migration.
- [T-004] `somity_settings` scalability (document size limit).

---

*End of DATA_MODEL.md*
