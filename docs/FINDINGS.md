# Phase 0 Audit Findings — Al Amin Somity Project

**Date:** 2025-11-20  
**Branch:** `cleanup` (from `main` @ 94604b3)  
**Build Status:** ✅ Passed (no TypeScript errors)  
**Git Status:** Clean working tree

---

## 1. Overall Project Condition

| Aspect | Status | Notes |
|--------|--------|-------|
| **Architecture** | Modular, well-structured | `src/modules/` with 20+ feature modules, shared components, services, and types |
| **Framework** | React 19 + TypeScript + Vite | Modern tooling, ES modules, path aliases |
| **Styling** | Tailwind CSS + Radix UI | 35+ Radix primitives, `class-variance-authority`, `tailwind-merge` |
| **State/Routing** | React Router v7 + Context | AuthProvider, SomitySettingsProvider, protected routes |
| **Backend** | Firebase (Spark plan) | Auth, Firestore, Storage (but **NO** Cloud Functions, NO FCM, NO Storage per constraints) |
| **Build** | ✅ Passes | Large chunks (>500KB) — needs code-splitting |
| **Lint** | Not run | `eslint.config.js` present |

### Critical Constraints (Owner-Enforced)
- **Firebase Spark plan only** — no paid services
- **NO Cloud Functions** — `functions/` folder exists but is dormant, do not deploy/modify
- **NO Firebase Cloud Storage** — not used currently
- **NO FCM push sending**
- **NO scheduled jobs**
- **NO paid APIs**
- **Never read/expose `.env` or secrets**
- **Do not modify live Firebase data**
- **Preserve existing working modules**

---

## 2. Module Implementation Status Summary

| Module | Status | Pages | Services | Hooks | Firebase Connected | Notes |
|--------|--------|-------|----------|-------|-------------------|-------|
| **Authentication** | COMPLETE | Login, ForgotPassword, CreateAdmin | `authService.ts` | `useAuth` | ✅ | Firebase Auth + `users` collection |
| **Members** | COMPLETE | AddMember, MemberProfile, MembersPage, MyProfile | `memberService.ts`, `memberQueryService.ts`, `memberValidation.ts` | — | ✅ | Full CRUD, soft-delete, image compression |
| **Contributions** | PARTIALLY IMPLEMENTED | ContributionEntry, ContributionHistory, ContributionReports, PendingContribution, CollectionStatusReport, Receipt | `contributionService.ts`, `memberDueService.ts`, `summaryService.ts` | — | ✅ | Complex fee logic, bank transaction linking, duplicate detection |
| **Financing/Loans** | PARTIALLY IMPLEMENTED | 10 pages (list, create, detail, dashboard, reports, applications) | `FinancingService.ts`, `loanCollectionService.ts` | `useFinancingApplication.ts` | ✅ | 9 Islamic loan types, installment schedules, disbursement/repayment flows |
| **Investments** | PARTIALLY IMPLEMENTED | InvestmentList, InvestmentDetail, InvestmentCreate | `investmentService.ts`, `investmentOps.ts`, `participantService.ts`, `fundingService.ts`, `returnService.ts`, `documentService.ts`, `transactionService.ts`, `historyService.ts` | `useInvestmentData.ts` | ✅ | Atomic operations via transactions/batches, soft-delete, multi-participant |
| **Cashier** | NEEDS VERIFICATION | CashIn, CashOut, CashierOverview, Ledger, Report, Transfer | — | — | ⚠️ | Pages exist but services appear minimal/empty |
| **Bank Transactions** | COMPLETE | — | `bankTransactionService.ts` | `useBankTransactions.ts` | ✅ | Central ledger, `holdingType` logic, reconciliation |
| **Treasury** | PARTIALLY IMPLEMENTED | FundTransfer, TransactionHistory, BankAccounts, BankLedger, CashManagement | `bank.service.ts`, `cash.service.ts`, `financeService.ts` | — | ✅ | Dual service layers (treasury + finance), batch transfers |
| **Assets** | NOT IMPLEMENTED | 9 pages (AssetsRegister, BankAccounts, CapitalFlow, etc.) | — | — | ❌ | **Mock data only**, no Firebase integration |
| **Business** | NOT IMPLEMENTED | BusinessList, BusinessDetail, BusinessCreate, BusinessUpdate | `businessService.ts` (in-memory array) | — | ❌ | **Placeholder only** — in-memory mock |
| **Teams** | NOT IMPLEMENTED | Create, Index, Performance, TeamHistory | — | — | ❌ | **Mock data only**, no Firebase integration |
| **Reports** | NOT IMPLEMENTED | ExportData, FinanceReport, LoanReports, MemberReport | — | — | ❌ | **Placeholder pages only** |
| **Communication** | NOT IMPLEMENTED | Chat, CommitteeMessages, Notices | — | — | ❌ | **Placeholder only** |
| **Settings** | PARTIALLY IMPLEMENTED | Account, Index, Notifications, Roles, System | — | `useBankAccounts.ts`, `useBankAccountsForSettings.ts`, `useSettingsValidation.ts` | ⚠️ | UI complete, backend wiring unclear |
| **Dashboards** | PARTIALLY IMPLEMENTED | Admin, Cashier, Collector, Member | — | — | ⚠️ | **Static mock data** in AdminDashboard |
| **Support** | NOT IMPLEMENTED | About, FAQ, Index | — | — | ❌ | **Placeholder only** |
| **Super Admin** | PARTIALLY IMPLEMENTED | Dashboard, FirestoreInspector, Logs, UsageTracking, Users, Settings | — | — | ⚠️ | Inspector tools, no real backend ops |
| **Users** | PARTIALLY IMPLEMENTED | AddUser, CreateMemberAccount, UserProfile, Index | — | — | ⚠️ | Cloud Function dependency for account creation |

---

## 3. Financial System — Money Flow Trace

### Core Collections (from `firebaseCollections.ts`)
```
contributions          → Member fee payments
collector_balances     → Cash held by collectors
deposits               → Bank deposits (legacy?)
bank_transactions      → UNIFIED financial ledger (ALL money moves)
fund_transactions      → Transfers between cashier/bank
loans                  → Active loans
loanApplications       → Pending approvals
loan_repayments        → Installment payments
loanDisbursements      → Disbursement records
cash_balances          → Cashier cash-in-hand
daily_closing          → End-of-day reconciliation
somity_settings/config → Single-doc configuration
```

### Actual Money Flow (Verified from Code)

```
Member Pays Contribution
        │
        ▼
┌─────────────────────────────────────────────┐
│ contributionService.addFeePayment()         │
│ 1. Creates doc in `contributions`           │
│ 2. Creates BankTransaction (holdingType:    │
│    'collector' OR 'somity_bank')            │
│ 3. Updates member.financials (increment)    │
└─────────────────────────────────────────────┘
        │
        ▼
Collector Holds Cash (holdingType: 'collector')
        │
        ▼
Cashier Deposits to Bank (markAsDeposited / depositToBank)
        │
        ▼
┌─────────────────────────────────────────────┐
│ bankTransactionService.markAsDeposited()    │
│ - holdingType → 'somity_bank'               │
│ - status → 'completed'                      │
│ - affectsBalance → true                     │
│ financeService.transferFunds() (batch)      │
│ - Decrements cashier currentBalance         │
│ - Increments bank currentBalance            │
│ - Creates fund_transactions record          │
└─────────────────────────────────────────────┘
        │
        ▼
Bank Balance Updated (atomic via `increment()`)
```

### Loan Disbursement Flow
```
Loan Approved → recordDisbursement()
        │
        ▼
Creates loanDisbursements doc
Updates loan status + installment schedule
Creates BankTransaction (direction: 'out', holdingType: 'somity_bank')
```

### Loan Repayment Flow
```
addRepayment()
        │
        ▼
Creates loan_repayments doc
Updates loan paidAmount/dueAmount
Creates BankTransaction (direction: 'in')
```

### Investment Flow
```
createInvestment() (batch)
  → investments + investmentParticipants + investmentHistory
recordFunding() (transaction)
  → fundingRecords + participant.funded_amount + investmentTransactions + investmentHistory
recordReturn() (transaction)
  → returnRecords + investment.actual_return_amount + investmentTransactions + investmentHistory
softDeleteInvestment() (transaction + pre-check)
  → Only flags is_deleted, blocks if money moved
```

---

## 4. Financial Writes — Atomicity Table

| File | Collection(s) | Operation | Atomic? | Risk |
|------|---------------|-----------|---------|------|
| `contributionService.ts:33` | `contributions`, `bank_transactions`, `members` | addFeePayment | ❌ **SEPARATE** writes (setDoc → createBankTransaction → updateDoc) | **HIGH** — If bank tx fails after contribution created, orphan contribution; no rollback |
| `bankTransactionService.ts:41` | `bank_transactions` | createBankTransaction | ✅ Single doc | Low |
| `bankTransactionService.ts:121` | `bank_transactions` | markAsDeposited | ✅ Single doc update | Low |
| `financeService.ts:242` | `fund_transactions`, `bank_accounts`, `cash_balances` | transferFunds | ✅ **writeBatch** | Low — batch ensures all-or-nothing |
| `cashService.ts:65` | `cash_balances`, `bank_accounts`, `fund_transactions` | depositToBank | ❌ **SEPARATE** (updateDoc → updateBalance → transferFunds) | **MEDIUM** — transferFunds is atomic but called after cash update |
| `FinancingService.ts:204` | `loanApplications`, `loans` | approveLoanApplication | ❌ **SEPARATE** (updateDoc → setDoc) | **MEDIUM** — Loan created after app approved; if loan fails, app stays approved |
| `FinancingService.ts:405` | `loanDisbursements`, `loans` | recordDisbursement | ❌ **SEPARATE** (setDoc → updateDoc) | **MEDIUM** — Same risk |
| `FinancingService.ts:599` | `loan_repayments`, `loans` | addRepayment | ❌ **SEPARATE** (setDoc → updateDoc) | **MEDIUM** — Repayment recorded, then loan updated |
| `investmentOps.ts:111` | `investments`, `investmentParticipants`, `investmentHistory` | createInvestment | ✅ **writeBatch** | Low |
| `investmentOps.ts:194` | `investments`, `investmentHistory` | changeStatus | ✅ **runTransaction** | Low |
| `investmentOps.ts:255` | `fundingRecords`, `investmentParticipants`, `investments`, `investmentTransactions`, `investmentHistory` | recordFunding | ✅ **runTransaction** | Low — 5 docs in one transaction |
| `investmentOps.ts:340` | `returnRecords`, `investments`, `investmentTransactions`, `investmentHistory` | recordReturn | ✅ **runTransaction** | Low — 4 docs in one transaction |
| `investmentOps.ts:425` | `investments`, `investmentHistory` | softDeleteInvestment | ✅ **runTransaction** (with pre-query) | Low |

### Key Finding
**Only Investments module uses atomic multi-document writes (transactions/batches).**  
Contributions, Loans, Treasury use separate sequential writes — **data inconsistency risk under failure**.

---

## 5. User Roles & Permissions

### UserRole Type (`src/types/common.ts:6`)
```typescript
type UserRole = 'super_admin' | 'admin' | 'cashier' | 'manager' | 'accountant' | 'collector' | 'member';
```

### Role Definitions & Access (from various `permissions.ts` files)

| Role | Can View Members | Can Add/Edit/Delete Members | Can Access Financial Settings | Can Access System Settings | Notes |
|------|------------------|----------------------------|------------------------------|---------------------------|-------|
| super_admin | ✅ | ✅ | ✅ | ✅ | Full access, bypasses all checks |
| admin | ✅ | ✅ | ✅ | ❌ | Operational admin |
| cashier | ✅ | ❌ | ❌ | ❌ | Cash handling, collections |
| collector | ✅ | ❌ | ❌ | ❌ | Field collection only |
| manager | ❓ | ❓ | ❓ | ❓ | Defined in type but **not in any permissions file** |
| accountant | ❓ | ❓ | ❓ | ❓ | Defined in type but **not in any permissions file** |
| member | ✅ (own profile) | ❌ | ❌ | ❌ | Self-service only |

### Permission Implementation
- **AuthProvider.tsx:316** — `hasPermission(requiredRoles[])` checks `userData.role` against array
- **Investments/permissions.ts** — Uses `hasInvestmentPermission(role, permission)` with granular permissions
- **Other modules** — Simple role-array checks in component-level guards
- **Gap:** No centralized permission service; each module implements its own pattern

---

## 6. Firestore Collections Inventory (from `firebaseCollections.ts`)

| Collection | Document ID Pattern | Purpose | Used By |
|------------|---------------------|---------|---------|
| `users` | uid (Firebase Auth) | App user accounts + roles | AuthProvider, authService |
| `members` | memberId (MBR-XXX) | Member profiles, financials | memberService, contributions, loans |
| `contributions` | auto | Fee payment transactions | contributionService |
| `collector_balances` | collectorId | Cash held by collectors | (referenced, not actively used?) |
| `deposits` | auto | Legacy bank deposits | (legacy?) |
| `loanApplications` | auto | Pending loan requests | FinancingService |
| `loans` | loanId (generated) | Active loans | FinancingService |
| `loan_repayments` | auto | Installment payments | FinancingService |
| `loanDisbursements` | DISB-timestamp | Disbursement records | FinancingService |
| `bank_accounts` | BANK-timestamp | Somity/collector bank accounts | bankService, financeService |
| `bank_transactions` | TXN-timestamp | **Unified financial ledger** | bankTransactionService, all money flows |
| `cash_balances` | cashierId | Cashier cash-in-hand | cashService, financeService |
| `fund_transactions` | TRX-timestamp | Transfers between accounts | financeService |
| `daily_closing` | {cashierId}_YYYY-MM-DD | End-of-day reconciliation | financeService |
| `somity_settings` | `config` (single doc) | All configuration | AuthProvider, settings pages |
| `audit_logs` | auto | Audit trail | (referenced, not actively used?) |
| `roles` | auto | Role definitions | (referenced, not actively used?) |
| `investments` | auto | Investment records | investmentService, investmentOps |
| `investmentParticipants` | auto | Investors per investment | investmentOps |
| `fundingRecords` | auto | Funding transactions | investmentOps |
| `returnRecords` | auto | Return transactions | investmentOps |
| `investmentTransactions` | auto | Ledger for investments | investmentOps |
| `investmentHistory` | auto | Audit trail for investments | investmentOps |
| `investmentDocuments` | auto | Document metadata | investmentService |

---

## 7. Balance Calculation Logic

| Balance Type | Calculation Method | Location | Real-time? |
|--------------|-------------------|----------|------------|
| **Member totalFeesPaid** | `increment()` on each contribution | `contributionService.ts:236` | ✅ Firestore increment |
| **Member dueAmount** | Settings-based (monthlyFee × months) - paid | `memberDueService.ts` (not read) | ❌ Computed on read |
| **Loan paidAmount/dueAmount** | Running totals updated on each repayment | `FinancingService.ts:646` | ✅ Updated per repayment |
| **Loan installment schedule** | Pre-calculated on approval/disbursement | `FinancingService.ts:314` | ✅ Stored in loan doc |
| **Bank account currentBalance** | `increment()` on each transaction | `bank.service.ts:144`, `financeService.ts:112` | ✅ Firestore increment |
| **Cashier currentBalance** | `increment()` on collection/deposit | `financeService.ts:198,227` | ✅ Firestore increment |
| **Collector cash (pending)** | Sum of `bank_transactions` where `holdingType='collector'` | `bankTransactionService.ts:331` | ❌ Query on demand |
| **Somity bank balance** | Sum of `bank_transactions` where `holdingType='somity_bank' AND status='completed' AND affectsBalance=true` | `bankTransactionService.ts:293` | ❌ Query on demand |
| **Investment somity_committed** | Set at creation from participants | `investmentOps.ts:135` | ✅ Stored |
| **Investment actual_return_amount** | Incremented on each return | `investmentOps.ts:385` | ✅ Transaction |

### Critical Gaps
1. **No single source of truth for "total society funds"** — must aggregate from bank_transactions
2. **Collector balances** — `collector_balances` collection exists but code uses `bank_transactions` query instead
3. **Member dues** — Computed client-side from settings + payment history; no server-side authority
4. **No automated reconciliation** — `isReconciled` field exists but no process to enforce it

---

## 8. Authentication & RBAC Implementation

| Component | File | Status | Issues |
|-----------|------|--------|--------|
| **Firebase Auth** | `firebase.ts`, `AuthProvider.tsx` | ✅ Working | Email/password only |
| **User Document** | `users` collection | ✅ Created on signup | `createMemberAuthAccount` Cloud Function (dormant) |
| **Role Storage** | `user.role` in `users` doc | ✅ | Custom claims set by Cloud Function (not deployed) |
| **Auth State** | `onAuthStateChanged` | ✅ | Loads user + member data |
| **Permission Check** | `AuthProvider.hasPermission()` | ✅ | Simple array inclusion |
| **Route Protection** | `ProtectedRoute.tsx` | ✅ | Uses `hasPermission` |
| **Module Permissions** | Each module's `permissions.ts` | ✅ | Inconsistent patterns |
| **Super Admin Bypass** | `AuthProvider.isSuperAdmin` | ✅ | Hardcoded role check |

### Security Gaps
- **No Firestore Rules deployed** — `firebase.json` references `database.rules` (not found), only Realtime DB rules shown
- **Investment rules template** — `src/modules/Investments/firestore.rules.template` exists but not deployed
- **Custom claims not active** — Cloud Function not deployed, roles only in Firestore
- **Client-side permission checks only** — No server-side enforcement

---

## 9. Firestore Rules & Security

### Current State
- **`firebase.json`** — References `database.rules` (Realtime DB), not Firestore
- **`database.rules` file** — **NOT FOUND** in project
- **Investments template** — `src/modules/Investments/firestore.rules.template` (template only, admin-only access)
- **No production Firestore rules deployed**

### Template Rules (Investment Module)
```javascript
// Only admin/super_admin can read/write investment collections
// Delete: false for all
```
**Risk:** Without deployed rules, **any authenticated user can read/write all collections**.

---

## 10. Real Modules vs Placeholders

### ✅ Real (Firebase-connected, functional)
- Authentication, Members, Contributions, Financing/Loans, Investments, Bank Transactions, Treasury (partial)

### ⚠️ Partially Wired (UI exists, backend incomplete)
- Cashier, Settings, Dashboards, Super Admin, Users

### ❌ Placeholders (Mock data, no Firebase)
- **Assets** — 9 pages, static mock data
- **Business** — In-memory array service
- **Teams** — Static mock data
- **Reports** — Empty pages
- **Communication** — Empty pages
- **Support** — Static content

---

## 11. Duplicate / Overlapping Modules

| Area | Modules | Overlap |
|------|---------|---------|
| **Bank/Cash Management** | `treasury` + `bank-transactions` + `cashier` + `financeService` (in treasury) | Multiple services writing to `bank_accounts`, `cash_balances`, `bank_transactions`, `fund_transactions` |
| **Financial Settings** | `settings` (InvestmentSettings, FinancingSettings, etc.) + `somity_settings/config` | Settings UI vs single config doc |
| **Collector Logic** | `contributions` (collectorId), `treasury` (cashier), `bank-transactions` (handlerType=collector) | Collector vs Cashier roles blurred |
| **Loan/Financing** | `financing` module + `contributions` (feeType='loan') | Loan payments could appear in both |
| **Investment vs Financing** | Both handle "money out/in" with different models | Different collection structures, no unified ledger |

---

## 12. Unbounded Queries & Expensive Listeners

| File | Query | Risk |
|------|-------|------|
| `bankTransactionService.ts:280` | `getAllBankTransactions(10000)` — no pagination, loads all | **HIGH** — O(n) memory, slow on large datasets |
| `bankTransactionService.ts:331` | `getAllBankTransactions(10000, {holdingType: 'collector', paymentMethod: 'cash'})` | **HIGH** — Same |
| `FinancingService.ts:696` | `getAllLoans()` → loads all loans for stats | **MEDIUM** — Grows unbounded |
| `financeService.ts:446` | `getAllBankAccounts()` + `getDocs(cashBalances())` — no limits | **MEDIUM** |
| `memberQueryService.ts` (not read) | Likely similar patterns | **UNKNOWN** |
| `contributionService.ts:258` | `limit(100)` — capped | ✅ Safe |
| `investmentService.ts:70` | `limit(100)` — capped | ✅ Safe |

### Realtime Listeners
- **AuthProvider** — `onAuthStateChanged` (single, OK)
- **No other `onSnapshot` listeners found** — good (avoids Spark connection limits)

---

## 13. Build / Lint Problems

| Issue | Severity | Location |
|-------|----------|----------|
| **Large chunks** (>500KB) | Warning | `index-BnLqRX6Z.js` (271KB), `firebase-vendor` (557KB), `ui-vendor` (154KB) |
| **No code-splitting** | Warning | All routes bundled together |
| **`src/utils/helpers/permissions.ts`** | Empty file | Exists but empty — imports may fail |
| **Unused `functions/` folder** | Info | 363KB node_modules, dormant Cloud Functions |
| **`some_module.zip`** | Cleanup | Removed per owner |
| **ESLint not run** | Unknown | Config exists but not executed in audit |

---

## 14. Cleanup Candidates (Verified References)

### Potentially Unused Files
| File | Reason | Verification |
|------|--------|--------------|
| `src/utils/helpers/permissions.ts` | **Empty file** — no exports, imported nowhere (grep shows 0 refs) | ✅ Safe to remove |
| `src/modules/some_module.zip` | Already removed by owner | ✅ Done |
| `functions/` entire folder | Cloud Functions disabled per constraints, not deployed | ⚠️ Keep for reference, don't deploy |
| `src/modules/assets/` | All pages use mock data, no Firebase imports | ✅ Unused in production |
| `src/modules/business/` | In-memory service, no Firebase | ✅ Unused in production |
| `src/modules/teams/` | Mock data only | ✅ Unused in production |
| `src/modules/reports/` | Placeholder pages only | ✅ Unused in production |
| `src/modules/communication/` | Placeholder pages only | ✅ Unused in production |
| `src/modules/support/` | Static content only | ✅ Unused in production |

### Potentially Unused NPM Dependencies
| Package | Likely Used By | Verdict |
|---------|----------------|---------|
| `embla-carousel-react` | Not found in code search | ❓ Verify |
| `input-otp` | Not found | ❓ Verify |
| `html2canvas` | `PDFExport.tsx`, `PrintLayout.tsx` | ✅ Used |
| `jspdf` | `PDFExport.tsx` | ✅ Used |
| `vaul` | Not found | ❓ Verify |
| `sonner` | Toast notifications — used in components | ✅ Used |
| `framer-motion` | Dashboards, animations | ✅ Used |
| `recharts` + `chart.js` + `react-chartjs-2` | Both chart libs present | ⚠️ **Duplicate** — pick one |

### Duplicate/Overlapping Modules (for consolidation)
1. **Treasury vs Bank-Transactions vs FinanceService** — Consolidate into single `treasury` module
2. **Assets + Business + Teams + Reports + Communication + Support** — Remove or archive (placeholders)
3. **Cashier** — Merge into `treasury` (cashier is a role, not a separate domain)

---

## 15. Risk Summary

| Risk | Severity | Impact | Mitigation |
|------|----------|--------|------------|
| **Non-atomic financial writes** (contributions, loans, treasury) | 🔴 **CRITICAL** | Data inconsistency, lost/mismatched money | Convert to transactions/batches (like Investments) |
| **No Firestore security rules deployed** | 🔴 **CRITICAL** | Any auth user can read/write all data | Deploy rules before production |
| **Collector/Cashier balance dual-tracking** | 🟠 **HIGH** | Double-counting, reconciliation errors | Single source of truth via `bank_transactions` |
| **Unbounded queries** (10k docs) | 🟠 **HIGH** | OOM, slow reads, Spark quota exceeded | Add pagination, indexes, limit(100) |
| **Mock modules in production routes** | 🟠 **HIGH** | User confusion, dead ends | Remove or hide behind feature flags |
| **Custom claims not active** | 🟡 **MEDIUM** | Role spoofing possible client-side | Deploy Cloud Function or move roles to Firestore-only |
| **Duplicate chart libraries** | 🟡 **MEDIUM** | Bundle size + maintenance | Standardize on `recharts` |
| **No automated reconciliation** | 🟡 **MEDIUM** | Drift between ledger and actuals | Build daily closing + reconciliation flow |
| **Settings in `somity_settings/config` vs Settings UI** | 🟡 **MEDIUM** | Config drift | Single write path |

---

## 16. What Should Be Preserved

✅ **Core Financial Modules** — Contributions, Financing, Investments, Bank Transactions (battle-tested logic)  
✅ **Members Module** — Complete CRUD, validation, image handling  
✅ **AuthProvider + Auth Flow** — Solid Firebase Auth integration  
✅ **Shared UI Components** — `src/shared/components/ui/` (Radix-based, well-designed)  
✅ **Type System** — `src/types/` comprehensive, well-organized  
✅ **Investment Atomic Operations** — `investmentOps.ts` is the gold standard  
✅ **Formatters/Calculators** — `src/utils/formatters/`, `src/utils/calculations/`  
✅ **Generators** — `FinancingID`, `systemCounter`  
✅ **Navigation/Menu System** — `src/navigation/` dynamic role-based menus  
✅ **Export Utilities** — `src/shared/export/` (PDF, Excel, Print)  

---

## 17. What Needs Improvement (Priority Order)

1. **🔴 Deploy Firestore Security Rules** — Block unauthorized access
2. **🔴 Make Financial Writes Atomic** — Convert contributions, loans, treasury to transactions/batches
3. **🔴 Add Pagination to All Large Queries** — Replace `limit(10000)` with cursor pagination
4. **🟠 Consolidate Treasury/Bank/Cashier** — Single service layer for money movement
5. **🟠 Remove Placeholder Modules** — Assets, Business, Teams, Reports, Communication, Support
6. **🟠 Implement Reconciliation** — Daily closing + bank statement matching
7. **🟡 Standardize Permission System** — Central `PermissionService` with module registration
8. **🟡 Code-Split Routes** — Dynamic imports for all module entry points
9. **🟡 Single Chart Library** — Remove `chart.js`/`react-chartjs-2`, keep `recharts`
10. **🟡 Fix Member Dues Calculation** — Server-side authoritative computation

---

## 18. Questions Requiring Owner Decision

1. **Cloud Functions:** The `createMemberAuthAccount` function creates Auth users + custom claims. Since Cloud Functions are prohibited, should member account creation move to client-side (Admin SDK not available) or use a different approach?
2. **Firestore Rules:** Deploy the Investment template as-is, or write comprehensive rules for all 20+ collections first?
3. **Placeholder Modules:** Delete `assets`, `business`, `teams`, `reports`, `communication`, `support` entirely, or archive in a `deprecated/` folder?
4. **Treasury Consolidation:** Merge `bank-transactions`, `cashier`, `treasury/services/financeService` into one `treasury` module?
5. **Member Dues:** Compute on-read (current) vs scheduled Cloud Function (prohibited) vs client-side with cached settings?
6. **Chart Library:** Keep `recharts` only? Remove `chart.js` + `react-chartjs-2`?
7. **Collector vs Cashier:** Are these distinct roles with separate cash buckets, or should they unify under one "cash handler" model?
8. **Realtime Listeners:** Any feature needing live updates (dashboards, notifications)? If so, how to stay within Spark limits (100 concurrent connections)?

---

*End of FINDINGS.md — Ready for owner review before cleanup phase.*