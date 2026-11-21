# Firestore Collection Inventory — Al Amin Somity Project

**Generated:** 2025-11-20  
**Branch:** `cleanup`  
**Source:** `src/services/firebase/firebaseCollections.ts` + code usage audit

---

## Collection Registry

All collections defined in `firebaseCollections.ts` with actual usage verified from service files.

---

## 1. Core Collections (Actively Used)

### `users` — Application User Accounts
| Property | Detail |
|----------|--------|
| **Doc ID** | Firebase Auth `uid` |
| **Created By** | `authService.createUserAccount()`, Cloud Function `createMemberAuthAccount` |
| **Read By** | `AuthProvider.loadUserData()`, `authService.getUserData()`, `checkMemberLoginStatus()` |
| **Updated By** | `authService.updateUserProfile()`, `AuthProvider.signIn()` (lastLoginAt) |
| **Fields** | `uid`, `email`, `fullName`, `firstName`, `lastName`, `phone`, `photoURL`, `role` (UserRole), `memberId`, `createdAt`, `lastLoginAt`, `updatedAt` |
| **Indexes** | None defined (query by `memberId` in `checkMemberLoginStatus`) |
| **Security** | **No rules deployed** — currently open to all authenticated users |

### `members` — Member Profiles
| Property | Detail |
|----------|--------|
| **Doc ID** | `memberId` (format: `MBR-XXX`) |
| **Created By** | `memberService.createMember()` |
| **Read By** | `memberService.getMemberByMemberId()`, `memberQueryService.*`, `AuthProvider.loadMemberData()`, `contributionService`, `FinancingService` |
| **Updated By** | `memberService.updateMember()`, `updateMemberPhoto()`, `updateMemberSignature()`, `deleteMember()`, `linkUserToMember()`, `contributionService.addFeePayment()` (financials increment), `FinancingService` (loan financials) |
| **Fields** | See [MODULE_AUDIT.md](#2-members) for full structure |
| **Key Sub-fields** | `financials.totalFeesPaid` (increment), `financials.currentLoanBalance`, `financials.isLoanActive`, `membership.shareCount`, `membership.monthlyFee` |
| **Indexes** | Needed: `role`, `membership.status`, `membership.role` |
| **Security** | **No rules deployed** |

### `somity_settings` — Single Configuration Document
| Property | Detail |
|----------|--------|
| **Doc ID** | `config` (fixed) |
| **Created By** | Manual/initial setup |
| **Read By** | `AuthProvider.loadSomityInfo()`, Settings pages, `FinancingService.approveLoanApplication()` |
| **Updated By** | Settings UI components (direct `updateDoc` likely) |
| **Structure** | Massive nested object — see `src/types/settings.ts` `SomitySettings` interface |
| **Key Sections** | `general`, `share`, `fee`, `member`, `loan`, `islamicLoanConfig`, `collection`, `financial`, `report`, `security`, `investment` |
| **Security** | **No rules deployed** — critical config, should be admin-only write |

---

## 2. Financial Transaction Collections

### `contributions` — Member Fee Payments
| Property | Detail |
|----------|--------|
| **Doc ID** | Auto-generated |
| **Created By** | `contributionService.feesService.addFeePayment()` |
| **Read By** | `contributionService.getAllTransactions()`, `getTransactionByReceiptId()`, `memberDueService`, `summaryService` |
| **Updated By** | `contributionService.updateTransaction()`, `deleteTransaction()` |
| **Deleted By** | `contributionService.deleteTransaction()` (soft? no, hard delete + batch) |
| **Key Fields** | `memberId`, `memberName`, `amount`, `feeAmount`, `paymentType`, `collectionStatus` ('collected'\|'deposited'), `receiptId`, `paymentDate`, `monthsPaid`, `paidMonthsDetails[]`, `collectorId`, `collectorName`, `enteredById`, `linkedBankTransactionId`, `depositBankAccountId`, `depositStatus` |
| **Derived Fields** | `feeMonthFrom/To`, `feeYearFrom/To`, `month`, `paidMonths`, `paidYears`, `advanceMonths` |
| **Indexes** | `memberId` + `status` (duplicate check), `receiptId` (lookup), `createdAt` (list) |
| **Atomicity** | ❌ **Non-atomic** — 3 separate writes (contribution + bank_transaction + member increment) |

### `bank_transactions` — Unified Financial Ledger (CRITICAL)
| Property | Detail |
|----------|--------|
| **Doc ID** | `TXN-{timestamp}` or auto (via `generateId('transactions')`) |
| **Created By** | `bankTransactionService.createBankTransaction()` — called by Contributions, Financing, Investments, Treasury |
| **Read By** | `bankTransactionService.getAllBankTransactions()`, `getTransactionSummary()`, `getCashInHand()`, `getMobileWalletBalance()`, `getTransactionsByCollector()`, `getTransactionsByMember()`, `getPendingTransactions()`, `getCompletedTransactions()`, `getUnreconciledTransactions()`, `getBalance()` |
| **Updated By** | `markAsDeposited()`, `updateBankTransaction()`, `markAsReconciled()`, `reverseBankTransaction()` |
| **Key Fields** | `transactionType` (contribution\|loan_disbursement\|loan_repayment\|investment\|investment_return\|profit\|expense\|transfer\|adjustment), `direction` (in\|out), `sourceCollection`, `sourceId`, `sourceReceiptId`, `amount`, `netAmount`, `paymentMethod`, `paymentDate`, `handlerType` (collector\|cashier\|member\|external\|somity\|admin), `handlerId`, `handlerName`, **`holdingType`** (collector\|somity_bank), `destinationType`, `destinationBankAccountId`, `status` (pending\|completed\|cancelled\|reversed), **`affectsBalance`** (boolean), `depositReference`, `depositBankAccountId`, `depositDate`, `depositedBy`, `isReconciled`, `reconciledAt`, `reconciledBy`, `bankStatementRef`, `memberId`, `memberName`, `investmentId`, `coInvestorId`, `profitRecordId`, `createdBy`, `createdAt`, `updatedAt` |
| **Critical Logic** | `holdingType === 'somity_bank'` → money in bank, affects balance<br>`holdingType === 'collector'` → money with collector, pending |
| **Indexes** | Needed: `holdingType` + `status`, `handlerId`, `memberId`, `sourceCollection` + `sourceId`, `createdAt`, `paymentMethod`, `destinationBankAccountId` |
| **Atomicity** | ✅ Single doc writes; `transferFunds` uses batch for multi-account updates |
| **Query Risk** | 🔴 **Unbounded** — `getAllBankTransactions(10000)` no pagination |

### `fund_transactions` — Inter-Account Transfers
| Property | Detail |
|----------|--------|
| **Doc ID** | `TRX-{timestamp}` |
| **Created By** | `financeService.transferFunds()` (batch), `cashService.depositToBank()` |
| **Read By** | `financeService.getAllTransactions()`, `getTransactionsByCashier()`, `getTransactionsByBank()`, `getTodayTransactions()` |
| **Key Fields** | `transactionId`, `type` (transfer\|collection\|deposit\|disbursement), `amount`, `from` {type, id, name}, `to` {type, id, name}, `paymentMethod`, `referenceNo`, `bankReference`, `note`, `status` (completed), `completedBy`, `completedAt`, `createdBy`, `createdAt` |
| **Indexes** | `from.id`, `to.id`, `createdAt` (date range queries) |

---

## 3. Loan/Financing Collections

### `loanApplications` — Pending Loan Requests
| Property | Detail |
|----------|--------|
| **Doc ID** | Auto-generated |
| **Created By** | `FinancingService.loanService.createLoanApplication()` |
| **Read By** | `getPendingApplications()`, `getAllApplications()`, `getApplicationById()` |
| **Updated By** | `approveLoanApplication()` (status→approved), `rejectLoanApplication()` (status→rejected) |
| **Key Fields** | `applicationId`, `status` (pending\|approved\|rejected\|active\|completed\|defaulted), `applicant` (isMember, memberID, name, phone, nid, address, occupation, monthlyIncome), `grantor` (memberID, name, phone, relation), `loanType`, `loanDetails` (type-specific), `approvedBy`, `approvedAt`, `rejectedBy`, `rejectedAt`, `rejectionReason`, `createdAt`, `updatedAt`, `createdBy` |
| **Indexes** | `status` + `createdAt` (pending list), `createdAt` (all list) |

### `loans` — Active Loans
| Property | Detail |
|----------|--------|
| **Doc ID** | `loanId` (generated via `generateLoanId()` with type prefix) |
| **Created By** | `approveLoanApplication()` — creates loan doc after approval |
| **Read By** | `getAllLoans()`, `getLoansByStatus()`, `getLoansByMember()`, `getLoanById()`, `getLoanStats()`, `addRepayment()`, `recordDisbursement()` |
| **Updated By** | `recordDisbursement()` (status, schedule, amounts), `addRepayment()` (paidAmount, dueAmount, paidInstallments, nextDueDate, status), `updateLoanStatus()` |
| **Key Fields** | `loanId`, `memberId`, `memberName`, `loanType`, `amount`, `interestRate`, `durationMonths`, `totalPayable`, `monthlyInstallment`, `installmentFrequency`, `totalInstallments`, `installmentAmount`, `installmentSchedule[]`, `nextDueDate`, `loanStartDate`, `loanEndDate`, `status` (approved\|active\|completed\|defaulted\|cancelled), `guarantorId`, `guarantorName`, `approvedBy`, `approvedAt`, `paidAmount`, `dueAmount`, `paidInstallments`, `remainingInstallments`, `disbursementId`, `disbursementStatus`, `disbursedAt`, `serviceChargePercent`, `serviceChargeAmount`, `profitSharingRatio`, `downPaymentAmount`, `createdAt`, `updatedAt`, `createdBy` |
| **Indexes** | `memberId` + `createdAt`, `status` + `createdAt`, `loanId` (unique) |
| **Atomicity** | ❌ **Non-atomic** — approve (update app + create loan), disburse (create disbursement + update loan), repay (create repayment + update loan) |

### `loan_repayments` — Installment Payments
| Property | Detail |
|----------|--------|
| **Doc ID** | Auto-generated |
| **Created By** | `FinancingService.loanService.addRepayment()` |
| **Read By** | `getRepaymentsByLoanId()` |
| **Key Fields** | `loanId`, `memberId`, `installmentNo`, `dueDate`, `dueAmount`, `paidAmount`, `paidDate`, `status` (paid\|partial\|due\|overdue), `paymentType`, `referenceNo`, `bankName`, `bankReference`, `collectionStatus`, `lateFee`, `createdAt` |
| **Indexes** | `loanId` + `installmentNo` |

### `loanDisbursements` — Disbursement Records
| Property | Detail |
|----------|--------|
| **Doc ID** | `DISB-{timestamp}` |
| **Created By** | `recordDisbursement()` |
| **Read By** | `getDisbursementByLoanId()` |
| **Key Fields** | `disbursementId`, `loanId`, `memberId`, `memberName`, `amount`, `downPaymentAmount`, `netDisbursedAmount`, `disbursementMethod` (cash\|bank\|cheque\|transfer), `disbursedFrom` (cashier_fund\|somity_bank_account\|somity_cash), `sourceDetails` {bankName, accountNumber, chequeNumber, transactionId}, `receivedBy`, `receivedByName`, `receivedByMemberId`, `disbursedBy`, `disbursedByName`, `disbursedAt`, `notes`, `status` (pending\|completed\|cancelled), `installmentSchedule`, `createdAt`, `createdBy` |
| **Indexes** | `loanId` + `createdAt` |

---

## 4. Treasury/Banking Collections

### `bank_accounts` — Somity & Collector Bank Accounts
| Property | Detail |
|----------|--------|
| **Doc ID** | `BANK-{timestamp}` (or `accountId` field) |
| **Created By** | `bankService.createAccount()`, `financeService.createBankAccount()` |
| **Read By** | `bankService.getAllAccounts()`, `getAccountById()`, `financeService.getAllBankAccounts()`, `getBankAccountById()`, `cashService.depositToBank()`, `financeService.transferFunds()` |
| **Updated By** | `bankService.updateAccount()`, `updateBalance()`, `toggleStatus()`, `financeService.updateBankBalance()`, `toggleBankAccountStatus()` |
| **Key Fields** | `accountId`, `accountName`, `accountNumber`, `bankName`, `branchName`, `accountType` (savings\|current\|fixed), `openingBalance`, `currentBalance`, `isActive`, `notes`, `createdAt`, `updatedAt`, `createdBy`, `createdByName`, `ownerType` (somity\|collector), `ownerId`, `collectorId`, `collectorName`, `collectorMemberId` |
| **Indexes** | `ownerType`, `isActive`, `createdAt` |
| **Balance Updates** | Uses `increment()` — atomic per doc but **no cross-account atomicity** |

### `cash_balances` — Cashier Cash In Hand
| Property | Detail |
|----------|--------|
| **Doc ID** | `cashierId` (memberId of cashier) |
| **Created By** | `cashService.getCashBalance()` (auto-init), `financeService.initializeCashierBalance()` |
| **Read By** | `cashService.getCashBalance()`, `financeService.getCashierBalance()`, `getTotalCashInHand()` |
| **Updated By** | `cashService.depositToBank()`, `financeService.updateCashierBalance()`, `addToCashierCollection()`, `addToCashierDeposit()`, `transferFunds()` (batch) |
| **Key Fields** | `cashierId`, `cashierName`, `cashierMemberId`, `openingBalance`, `currentBalance`, `totalCollection`, `totalDeposit`, `totalDisbursement`, `lastTransactionDate`, `status` (open\|closed), `shiftStartTime`, `createdAt`, `updatedAt` |
| **Indexes** | `cashierId` (doc ID), `status` |

### `daily_closing` — End-of-Day Reconciliation
| Property | Detail |
|----------|--------|
| **Doc ID** | `{cashierId}_YYYY-MM-DD` |
| **Created By** | `financeService.createDailyClosing()` |
| **Read By** | `financeService.getDailyClosing()` |
| **Key Fields** | `closingId`, `cashierId`, `date`, `openingBalance`, `closingBalance`, `totalCollection`, `totalDeposit`, `totalDisbursement`, `cashBreakdown`, `bankDeposits[]`, `discrepancies`, `closedBy`, `closedAt`, `createdAt`, `updatedAt` |
| **Indexes** | `cashierId` + `date` (doc ID) |

---

## 5. Investment Collections

### `investments` — Investment Records
| Property | Detail |
|----------|--------|
| **Doc ID** | Auto-generated |
| **Created By** | `investmentOps.createInvestment()` (batch), `investmentService.create()` |
| **Read By** | `investmentService.listForTable()`, `list()`, `getById()`, `referenceExists()` |
| **Updated By** | `investmentOps.changeStatus()`, `recordFunding()`, `recordReturn()`, `softDeleteInvestment()`, `investmentService.update()`, `updateStatus()`, `remove()` |
| **Key Fields** | `investment_name`, `reference_number`, `category`, `opportunity`, `location`, `purpose`, `description`, `investment_structure`, `has_lead_investor`, `lead_investor_name`, `somity_role`, `total_required_investment`, `somity_committed_amount`, `other_investors_committed_amount`, `return_model`, `return_rate`, `return_duration`, `expected_return_amount`, **`actual_return_amount`**, `risk_level`, `risk_category`, `risk_description`, `mitigation_plan`, `collateral_security`, `status`, `start_date`, `maturity_date`, `submitted_date`, `submitted_by`, `reviewed_by`, `review_date`, `approval_decision`, `rejection_reason`, `createdBy`, `created_date`, `updated_date`, `is_deleted`, `deleted_at`, `deleted_by`, `delete_reason` |
| **Indexes** | `status`, `category`, `created_date` (desc), `reference_number` (unique check) |
| **Atomicity** | ✅ All multi-doc ops use transactions/batches |

### `investmentParticipants` — Investors per Investment
| Property | Detail |
|----------|--------|
| **Doc ID** | Auto-generated |
| **Created By** | `createInvestment()` (batch) |
| **Read By** | `recordFunding()`, `recordReturn()` (via participant_id) |
| **Updated By** | `recordFunding()` (funded_amount increment) |
| **Key Fields** | `investment_id`, `name`, `participant_type` (Somity\|Lead Investor\|Co-Investor\|...), `role` (SomityRole), `contact`, `committed_amount`, **`funded_amount`**, `participation_pct`, `return_share_pct`, `return_terms`, `agreement`, `status` (Active\|Settled\|Withdrawn\|Pending), `created_date` |
| **Indexes** | `investment_id`, `participant_type` |

### `fundingRecords` — Funding Transactions
| Property | Detail |
|----------|--------|
| **Doc ID** | Auto-generated |
| **Created By** | `investmentOps.recordFunding()` (transaction) |
| **Read By** | Investment detail tabs |
| **Key Fields** | `investment_id`, `participant_id`, `investor_name`, `amount`, `funding_date`, `payment_method`, `account`, `reference`, `remarks`, `status` (Confirmed), `createdBy`, `created_date` |
| **Indexes** | `investment_id`, `participant_id`, `funding_date` |

### `returnRecords` — Return Transactions
| Property | Detail |
|----------|--------|
| **Doc ID** | Auto-generated |
| **Created By** | `investmentOps.recordReturn()` (transaction) |
| **Read By** | Investment detail tabs |
| **Key Fields** | `investment_id`, `participant_id`, `investor_name`, `return_date`, `return_type` (Profit\|Principal\|Profit + Principal\|Partial Return), `expected_amount`, `received_amount`, `reference`, `remarks`, `status` (Expected\|Partially Received\|Received\|Overdue), `created_date` |
| **Indexes** | `investment_id`, `participant_id`, `return_date` |

### `investmentTransactions` — Investment Ledger
| Property | Detail |
|----------|--------|
| **Doc ID** | Auto-generated |
| **Created By** | `recordFunding()`, `recordReturn()` (transaction) |
| **Key Fields** | `investment_id`, `investor_name`, `transaction_type` (Funding\|Profit Received\|Principal Returned\|Partial Return\|Settlement\|Approval\|Submission\|Status Change), `amount`, `direction` (Inflow\|Outflow\|Neutral), `reference`, `transaction_date`, `status` (Completed), `description`, `created_date` |
| **Purpose** | Audit trail for investment money flows |

### `investmentHistory` — Investment Audit Log
| Property | Detail |
|----------|--------|
| **Doc ID** | Auto-generated |
| **Created By** | All `investmentOps` functions (batch/transaction) |
| **Key Fields** | `investment_id`, `event` (Created\|Updated\|Submitted\|Approved\|Rejected\|Funding Recorded\|Return Recorded\|Maturity\|Settlement\|Closed\|Revision Requested\|Withdrawn\|Cancelled\|Deleted\|Restored), `event_date`, `description`, `performed_by`, `details`, `created_date` |

### `investmentDocuments` — Document Metadata
| Property | Detail |
|----------|--------|
| **Doc ID** | Auto-generated |
| **Created By** | `investmentService` document methods |
| **Key Fields** | `investment_id`, `file_name`, `document_type` (Investment Proposal\|Agreement\|Contract\|FDR Certificate\|...), `related_investor`, `uploaded_by`, `upload_date`, `description`, `file_uri`, `status` (Active\|Archived\|Replaced), `created_date` |
| **Note** | `file_uri` references Firebase Storage — **not used per constraints** |

---

## 6. Auxiliary Collections

### `collector_balances` — Legacy/Unused?
| Property | Detail |
|----------|--------|
| **Doc ID** | `collectorId` |
| **Defined In** | `firebaseCollections.ts` |
| **Used In Code** | **No references found** in service files |
| **Status** | 🟡 **Orphaned** — code uses `bank_transactions` query instead |

### `deposits` — Legacy?
| Property | Detail |
|----------|--------|
| **Doc ID** | Auto-generated |
| **Defined In** | `firebaseCollections.ts` |
| **Used In Code** | **No references found** |
| **Status** | 🟡 **Orphaned** — replaced by `bank_transactions` with `holdingType='somity_bank'` |

### `audit_logs` — General Audit Trail
| Property | Detail |
|----------|--------|
| **Doc ID** | Auto-generated |
| **Defined In** | `firebaseCollections.ts` |
| **Used In Code** | **No references found** |
| **Status** | 🟡 **Orphaned** — each module has own history collection |

### `roles` — Role Definitions
| Property | Detail |
|----------|--------|
| **Doc ID** | Auto-generated |
| **Defined In** | `firebaseCollections.ts` |
| **Used In Code** | **No references found** — roles hardcoded in `UserRole` type and permissions files |
| **Status** | 🟡 **Orphaned** |

---

## Collection Usage Matrix

| Collection | Auth | Members | Contributions | Financing | Investments | Treasury | Bank-Tx | Cashier | Settings |
|------------|------|---------|---------------|-----------|-------------|----------|---------|---------|----------|
| `users` | ✅ RW | | | | | | | | |
| `members` | ✅ R | ✅ CRUD | ✅ R (financials) | ✅ R | | | | | |
| `somity_settings` | ✅ R | | | ✅ R | | | | | ✅ RW |
| `contributions` | | | ✅ CRUD | | | | | | |
| `bank_transactions` | | | ✅ W | ✅ W | ✅ W | ✅ R | ✅ CRUD | | |
| `fund_transactions` | | | | | | ✅ RW | | | |
| `loanApplications` | | | | ✅ CRUD | | | | | |
| `loans` | | | | ✅ CRUD | | | | | |
| `loan_repayments` | | | | ✅ CRUD | | | | | |
| `loanDisbursements` | | | | ✅ CRUD | | | | | |
| `bank_accounts` | | | | | | ✅ CRUD | | | |
| `cash_balances` | | | | | | ✅ CRUD | | ✅ (empty) | |
| `daily_closing` | | | | | | ✅ CRUD | | | |
| `investments` | | | | | ✅ CRUD | | | | |
| `investmentParticipants` | | | | | ✅ CRUD | | | | |
| `fundingRecords` | | | | | ✅ CRUD | | | | |
| `returnRecords` | | | | | ✅ CRUD | | | | |
| `investmentTransactions` | | | | | ✅ W | | | | |
| `investmentHistory` | | | | | ✅ W | | | | |
| `investmentDocuments` | | | | | ✅ CRUD | | | | |
| `collector_balances` | | | | | | | | | |
| `deposits` | | | | | | | | | |
| `audit_logs` | | | | | | | | | |
| `roles` | | | | | | | | | |

**R** = Read, **W** = Write, **CRUD** = Create/Read/Update/Delete

---

## Index Requirements (Firestore)

### Required Composite Indexes
Based on query patterns in code:

| Collection | Fields | Query Pattern |
|------------|--------|---------------|
| `contributions` | `memberId` ASC, `status` ASC, `createdAt` DESC | Duplicate check + list |
| `contributions` | `receiptId` ASC | Receipt lookup |
| `bank_transactions` | `holdingType` ASC, `status` ASC, `createdAt` DESC | Pending/completed summaries |
| `bank_transactions` | `handlerId` ASC, `createdAt` DESC | Collector/cashier history |
| `bank_transactions` | `memberId` ASC, `createdAt` DESC | Member transaction history |
| `bank_transactions` | `sourceCollection` ASC, `sourceId` ASC | Link lookup |
| `bank_transactions` | `destinationBankAccountId` ASC, `createdAt` DESC | Bank statement reconciliation |
| `loans` | `memberId` ASC, `createdAt` DESC | Member loans |
| `loans` | `status` ASC, `createdAt` DESC | Status-filtered lists |
| `loan_repayments` | `loanId` ASC, `installmentNo` ASC | Repayment schedule |
| `loanDisbursements` | `loanId` ASC, `createdAt` DESC | Latest disbursement |
| `investments` | `status` ASC, `created_date` DESC | Status-filtered list |
| `investments` | `category` ASC, `created_date` DESC | Category filter |
| `investments` | `reference_number` ASC | Unique check |
| `investmentParticipants` | `investment_id` ASC | Participants for investment |
| `fundingRecords` | `investment_id` ASC, `funding_date` DESC | Funding history |
| `returnRecords` | `investment_id` ASC, `return_date` DESC | Return history |
| `fund_transactions` | `from.id` ASC, `createdAt` DESC | Cashier/bank outbound |
| `fund_transactions` | `to.id` ASC, `createdAt` DESC | Cashier/bank inbound |
| `cash_balances` | `status` ASC | Active cashiers |
| `bank_accounts` | `ownerType` ASC, `isActive` ASC, `createdAt` DESC | Account lists |
| `daily_closing` | `cashierId` ASC, `date` DESC (doc ID) | Closing history |

### Single-Field Indexes (Auto-created)
All fields used in `where()` clauses get auto-indexed except array-contains and map fields.

---

## Data Volume Estimates (for Spark Plan Limits)

| Collection | Est. Docs/Year | Growth | Spark Risk |
|------------|----------------|--------|------------|
| `users` | ~500 | Low | ✅ |
| `members` | ~500 | Low | ✅ |
| `contributions` | ~12,000 (500 members × 12 months) | Medium | ⚠️ Monitor |
| `bank_transactions` | ~25,000+ (all money moves) | **High** | 🔴 **Risk** — unbounded queries |
| `fund_transactions` | ~2,000 | Low | ✅ |
| `loans` | ~500 | Low | ✅ |
| `loan_repayments` | ~6,000 (500 loans × 12) | Medium | ⚠️ |
| `loanDisbursements` | ~500 | Low | ✅ |
| `bank_accounts` | ~20 | Very Low | ✅ |
| `cash_balances` | ~10 | Very Low | ✅ |
| `daily_closing` | ~3,650 (10 cashiers × 365) | Medium | ⚠️ |
| `investments` | ~50 | Very Low | ✅ |
| `investmentParticipants` | ~200 | Very Low | ✅ |
| `fundingRecords` | ~200 | Very Low | ✅ |
| `returnRecords` | ~200 | Very Low | ✅ |

### Spark Plan Limits
- **Reads:** 50,000/day — `bank_transactions` unbounded queries (10k each) could hit this
- **Writes:** 20,000/day — OK for current volume
- **Storage:** 1 GB — OK
- **Connections:** 100 concurrent — No realtime listeners found (good)

---

## Orphaned/Unused Collections (Cleanup Candidates)

| Collection | Evidence | Recommendation |
|------------|----------|----------------|
| `collector_balances` | Defined in `firebaseCollections.ts`, **zero code references** | Delete definition; data migrated to `bank_transactions` |
| `deposits` | Defined, **zero code references** | Delete definition; legacy |
| `audit_logs` | Defined, **zero code references** | Delete definition; module-specific history used instead |
| `roles` | Defined, **zero code references** | Delete definition; roles in `UserRole` type + permissions files |

---

## Collection Relationships (ER Diagram)

```
users (uid) 1──1 members (memberId)
    │
    ├─► creates ► contributions (memberId)
    ├─► applies ► loanApplications (applicant.memberID)
    ├─► receives ► loans (memberId)
    ├─► pays ► loan_repayments (memberId)
    ├─► invests ► investments (createdBy)
    ├─► participates ► investmentParticipants (name/contact)
    ├─► handles ► bank_transactions (handlerId)
    ├─► manages ► cash_balances (cashierId = memberId)
    └─► owns ► bank_accounts (ownerId = memberId)

contributions ──► creates ► bank_transactions (sourceCollection='contributions')
loanApplications ──► approves ► loans (loanId)
loans ──► disburses ► loanDisbursements (loanId)
loans ──► repays ► loan_repayments (loanId)
loans ──► creates ► bank_transactions (sourceCollection='loans'|'loan_repayments')
investments ──► funds ► fundingRecords (investment_id)
investments ──► returns ► returnRecords (investment_id)
investments ──► creates ► investmentTransactions (investment_id)
investments ──► creates ► investmentHistory (investment_id)
investments ──► has ► investmentParticipants (investment_id)

bank_transactions (holdingType='collector') ──► deposits ► bank_transactions (holdingType='somity_bank')
    │                                           (via markAsDeposited)
    └─► transfers ► fund_transactions (via transferFunds batch)

cash_balances ──► deposits ► bank_accounts (via depositToBank/transferFunds)
bank_accounts ──► transfers ► bank_accounts (via transferFunds)
```

---

## Migration Notes for Atomicity Fix

When converting non-atomic writes to transactions/batches:

### Contributions → Investment Model
```typescript
// Current: 3 separate writes
// Target: Single transaction
await runTransaction(db, async (tx) => {
  tx.set(contributionRef, contributionData);
  tx.set(bankTxRef, bankTxData);
  tx.update(memberRef, { 'financials.totalFeesPaid': increment(amount) });
});
```

### Financing Approve → Investment Model
```typescript
// Current: update application + create loan (separate)
// Target: Single transaction
await runTransaction(db, async (tx) => {
  tx.update(appRef, { status: 'approved', ... });
  tx.set(loanRef, loanData);
});
```

### Treasury Transfer → Already Atomic
```typescript
// financeService.transferFunds() already uses writeBatch ✅
// Keep as model for others
```

---

*End of COLLECTION_INVENTORY.md*