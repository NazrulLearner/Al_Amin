# Module Audit — Al Amin Somity Project

**Generated:** 2025-11-20  
**Branch:** `cleanup`  
**Scope:** All 20+ modules under `src/modules/`

---

## Module Status Legend
- **COMPLETE** — Fully implemented, Firebase-connected, tested in production flows
- **PARTIALLY IMPLEMENTED** — Core features work, some pages/services missing or incomplete
- **NOT IMPLEMENTED** — UI placeholders only, no Firebase integration, mock data
- **NEEDS VERIFICATION** — Code exists but untested, unclear if wired correctly
- **BROKEN** — Known issues, missing imports, runtime errors

---

## 1. Authentication & Users

### `src/modules/auth/`
| Aspect | Detail |
|--------|--------|
| **Pages** | `Login.tsx`, `ForgotPassword.tsx`, `CreateAdmin.tsx` |
| **Services** | `authService.ts` — createUserAccount, signInUser, resetUserPassword, signOutUser, getUserData, checkMemberLoginStatus, updateUserProfile, checkEmailExists |
| **Hooks** | `useAuth.ts` (re-exports `AuthProvider.useAuth`) |
| **Permissions** | `permissions.ts` — login, logout, reset_password |
| **Firebase** | ✅ Firebase Auth (email/password), `users` collection |
| **Status** | **COMPLETE** |

### Key Flows
- **Login** → `AuthProvider.signIn()` → `authService.signInUser()` → loads user doc from `users` → loads member doc from `members`
- **Create Admin** → `authService.createUserAccount()` → creates Firebase Auth user + `users` doc + links to `members` doc
- **Password Reset** → Firebase `sendPasswordResetEmail`

### Gaps
- `createMemberAuthAccount` Cloud Function (dormant in `functions/`) sets custom claims — **not deployed**
- Role stored only in Firestore `users.role`, not in Auth custom claims
- No MFA, no social login

---

## 2. Members

### `src/modules/members/`
| Aspect | Detail |
|--------|--------|
| **Pages** | `AddMember.tsx`, `MemberProfilePage.tsx`, `MembersPage.tsx`, `my-profile.tsx` |
| **Components** | `addMember/AddressSelect.tsx`, `memberList/EditMember.tsx`, `MemberTable.tsx`, `SearchFilter.tsx`, `StatisticsCards.tsx`, `profile/ProfileHeader.tsx`, `ProfileLayout.tsx`, `ProfileTabs.tsx`, `TabNavigation.tsx`, `tabs/DocumentsTab.tsx`, `FeesTab.tsx`, `FinanceTab.tsx`, `FinancingTab.tsx`, `InvestmentTab.tsx`, `OverviewTab.tsx`, `PersonalInfoTab.tsx` |
| **Services** | `memberService.ts` (createMember, addMember, getMemberByMemberId, updateMember, updateMemberPhoto, updateMemberSignature, deleteMember, hardDeleteMember, linkUserToMember), `memberQueryService.ts` (getAllMembers, searchMembers, getMembersByStatus, getMembersByRole, generateNextMemberId, getMemberStats), `memberValidation.ts` |
| **Utils** | `imageCompression.ts` (compressProfilePhoto, compressSignature) |
| **Types** | `member.ts` — `Member`, `SimpleMember`, `MEMBER_INITIAL_STATE` |
| **Permissions** | `permissions.ts` — view/add/edit/delete members, view/edit own profile |
| **Firebase** | ✅ `members` collection (doc ID = memberId) |
| **Status** | **COMPLETE** |

### Member Document Structure (from `memberService.ts`)
```typescript
{
  id: string,           // uid or empty
  memberId: string,     // MBR-XXX (doc ID)
  uid: string | null,   // Firebase Auth uid
  role: UserRole,       // from membership.role
  firstName, middleName, lastName, fullName, phone, alternatePhone, email, nidNumber, dateOfBirth,
  photoUrl, signatureUrl,
  fatherName, motherName, spouseName,
  nominee: { name, relation, nid, phone, share },
  referenceMemberId,
  address: { country, division, district, upazila, union, village, presentAddress, permanentAddress, sameAsPresent },
  membership: { dateOfJoin, membershipType, position, role, status, shareCount, perShareFee, monthlyFee, totalShareValue },
  financials: { totalSavings, activeLoanBalance, dueAmount, totalFeesPaid, lastFeePaidMonth, lastFeePaidYear, lastFeeReceiptId, totalPendingMonths, totalPendingAmount, monthlyDueAmount, currentLoanBalance, isLoanActive, lastLoanAmount, lastLoanDate, totalLoanPaid },
  verification: { status, verifiedBy, verifiedAt },
  metadata: { createdBy, createdAt, updatedAt, isDeleted, deletedAt, deletedBy },
  personal: { ...duplicate of top-level personal fields... }
}
```

### Key Features
- Soft delete (`metadata.isDeleted`)
- Image compression to base64 (stored in Firestore)
- Comprehensive validation (`memberValidation.ts`)
- Member ID auto-generation (`MBR-` prefix + 3 digits)
- Dual personal data storage (top-level + `personal` nested) — **redundancy**

---

## 3. Contributions

### `src/modules/contributions/`
| Aspect | Detail |
|--------|--------|
| **Pages** | `ContributionEntry.tsx`, `ContributionHistory.tsx`, `ContributionReports.tsx`, `PendingContribution.tsx`, `CollectionStatusReport.tsx`, `Receipt.tsx` |
| **Components** | `BankAccountSelector.tsx`, `CollectionStatusSection.tsx`, `CollectorSelect.tsx`, `ContributionStatusCard.tsx`, `ContributionSummary.tsx`, `MemberSearchCard.tsx`, `MonthSelector.tsx`, `PaymentMethodSelector.tsx` |
| **Services** | `contributionService.ts` (feesService, memberDueService, summaryService), `memberDueService.ts`, `summaryService.ts` |
| **Types** | `contributions.ts` — `FeeTransaction`, `FeePaymentRequest`, `MemberDueInfo`, `DueMonth`, `FeeSummary`, `FeeEntryFormData`, `ReceiptData` |
| **Permissions** | (uses auth roles, no dedicated file) |
| **Firebase** | ✅ `contributions`, `bank_transactions`, `members` |
| **Status** | **PARTIALLY IMPLEMENTED** |

### Core Flow: `feesService.addFeePayment()`
1. **Duplicate check** — queries `contributions` for paid months
2. **Create contribution doc** — `setDoc(contributions, transactionData)`
3. **Create bank transaction** — `bankTransactionService.createBankTransaction()` with `holdingType` logic:
   - `collectionStatus === 'deposited' && bankAccountId` → `holdingType: 'somity_bank'`
   - Otherwise → `holdingType: 'collector'`
4. **Link bank transaction** — `updateDoc(contributionRef, { linkedBankTransactionId })`
5. **Update member financials** — `increment(totalFeesPaid)`, update last paid month/year/receipt

### `memberDueService` (not fully read)
- Computes due months from settings + payment history
- Client-side calculation — no server authority

### `summaryService` (not fully read)
- Aggregates collection stats

### Gaps
- **Non-atomic writes** — 3 separate Firestore operations (contribution + bank tx + member update)
- No transaction/batch — failure between steps = orphan data
- Due calculation entirely client-side
- Collector balance tracking via `bank_transactions` query, not `collector_balances` collection

---

## 4. Financing / Loans

### `src/modules/financing/`
| Aspect | Detail |
|--------|--------|
| **Pages** | `ActiveFinancingPage.tsx`, `CompletedFinancingPage.tsx`, `CreateFinancingPage.tsx`, `FinancingApplicationDetailsPage.tsx`, `FinancingDashboardPage.tsx`, `FinancingDetailsPage.tsx`, `FinancingHistoryPage.tsx`, `FinancingListPage.tsx`, `FinancingReportPage.tsx`, `PendingFinancingApplicationsPage.tsx`, `PendingFinancingPage.tsx` |
| **Components** | `Application/ApplicantForm.tsx`, `ApplicationSuccess.tsx`, `DocumentUpload.tsx`, `FinancingDetailsForm.tsx`, `FinancingTypeSelection.tsx`, `FinancingTypeSelector.tsx`, `CreateFinance/step1-3.tsx`, `FinancingDetails/*Form.tsx` (9 Islamic types), `DisbursementModal.tsx`, `InstallmentScheduleModal.tsx`, `RepaymentModal.tsx`, `TermsModal.tsx` |
| **Hooks** | `useFinancingApplication.ts` |
| **Services** | `FinancingService.ts` (loanService), `loanCollectionService.ts` |
| **Schemas** | `base.json`, `ijarah.json`, `istisna.json`, `kafalah.json`, `mudaraba.json`, `murabaha.json`, `musharaka.json`, `qardHasanah.json`, `salam.json`, `tawarruq.json` |
| **Utils** | `installmentCalculator.ts`, `schemaValidator.ts` |
| **Types** | `financing.ts` (in `src/types/`) — 9 loan types, full interfaces |
| **Permissions** | `permissions.ts` (not read) |
| **Firebase** | ✅ `loanApplications`, `loans`, `loan_repayments`, `loanDisbursements`, `bank_transactions` |
| **Status** | **PARTIALLY IMPLEMENTED** |

### 9 Islamic Loan Types
| Type | Key Fields | Profit Model |
|------|------------|--------------|
| **murabaha** | assetCost, profitRate, durationMonths | Cost-plus sale |
| **musharaka** | totalCapital, profitSharingRatio, lossSharingRatio | Joint venture |
| **salam** | totalPrice, advancePayment, deliveryDate | Advance purchase |
| **qardHasanah** | loanAmount, serviceChargePercent | Benevolent loan |
| **istisna** | totalCost, progressPayments, completionDate | Manufacturing |
| **mudaraba** | totalCapital, rabulMalShare, mudaribShare | Investment management |
| **tawarruq** | commodityType, totalCost, profitMargin | Commodity monetization |
| **ijarah** | assetValue, leasePeriod, rentalAmount, securityDeposit | Lease |
| **kafalah** | guaranteeAmount, guaranteeFee, maxGuarantors | Guarantee |

### Key Flows
1. **Application** → `createLoanApplication()` → `loanApplications` (status: pending)
2. **Approval** → `approveLoanApplication()` → updates application + creates `loans` doc with installment schedule
3. **Disbursement** → `recordDisbursement()` → `loanDisbursements` + updates loan status + creates `bank_transactions`
4. **Repayment** → `addRepayment()` → `loan_repayments` + updates loan paid/due amounts + creates `bank_transactions`

### Installment Calculation
- `installmentCalculator.ts` — supports monthly, quarterly, half-yearly, yearly, lumpSum
- Schedule stored in loan doc (`installmentSchedule` array)
- `getPaidInstallmentCount()` computes paid count from paidAmount

### Gaps
- **Non-atomic writes** — approve (update app + create loan), disburse (create disbursement + update loan), repay (create repayment + update loan)
- No batch/transaction for multi-doc operations
- `loanCollectionService.ts` not read — may have collection logic
- JSON schemas for each type — validation approach unclear

---

## 5. Investments

### `src/modules/Investments/`
| Aspect | Detail |
|--------|--------|
| **Pages** | `InvestmentListPage.tsx`, `InvestmentDetailPage.tsx`, `InvestmentCreatePage.tsx` |
| **Components** | `Badges.tsx`, `Card.tsx`, `Charts.tsx`, `DeleteInvestmentDialog.tsx`, `ExportButton.tsx`, `InfoTip.tsx`, `InvestmentTable.tsx`, `ListFilters.tsx`, `NumberInput.tsx`, `ParticipantManager.tsx`, `tabs/*Tab.tsx` (8 tabs) |
| **Hooks** | `useInvestmentData.ts` |
| **Services** | `investmentService.ts` (CRUD), `investmentOps.ts` (atomic multi-doc ops), `participantService.ts`, `fundingService.ts`, `returnService.ts`, `documentService.ts`, `transactionService.ts`, `historyService.ts` |
| **Types** | `investment.types.ts` — `Investment`, `InvestmentParticipant`, `FundingRecord`, `ReturnRecord`, `InvestmentTransaction`, `InvestmentDocument`, `InvestmentHistory`, `InvestmentTotals` |
| **Constants** | `investmentConstants.ts`, `investmentFieldHelp.ts` |
| **Utils** | `actor.ts`, `cn.ts`, `investmentExport.ts`, `investmentListFilters.ts`, `investmentUtils.ts`, `investmentValidation.ts` |
| **Permissions** | `permissions.ts` — granular permissions (CREATE_INVESTMENT, EDIT_INVESTMENT, DELETE_INVESTMENT, etc.) with role mapping |
| **Firebase** | ✅ `investments`, `investmentParticipants`, `fundingRecords`, `returnRecords`, `investmentTransactions`, `investmentHistory`, `investmentDocuments` |
| **Status** | **PARTIALLY IMPLEMENTED** |

### Atomic Operations (Gold Standard)
All money operations use `runTransaction` or `writeBatch`:

| Operation | Collections Modified | Atomic? |
|-----------|---------------------|---------|
| `createInvestment` | investments, investmentParticipants, investmentHistory | ✅ writeBatch |
| `changeStatus` | investments, investmentHistory | ✅ runTransaction |
| `recordFunding` | fundingRecords, investmentParticipants, investments, investmentTransactions, investmentHistory | ✅ runTransaction (5 docs) |
| `recordReturn` | returnRecords, investments, investmentTransactions, investmentHistory | ✅ runTransaction (4 docs) |
| `softDeleteInvestment` | investments, investmentHistory | ✅ runTransaction (+ pre-query) |

### Investment Participant Model
- Multiple participants per investment (Somity + external investors)
- Each has `committed_amount`, `funded_amount`, `participation_pct`, `return_share_pct`
- Somity's money = Outflow; External = Neutral (ledger only)
- Returns → Inflow to Somity

### Gaps
- UI pages incomplete (many tabs not fully wired)
- Document upload references `file_uri` but no Storage integration (per constraints)
- Charts component uses chart.js (duplicate with recharts)

---

## 6. Cashier

### `src/modules/cashier/`
| Aspect | Detail |
|--------|--------|
| **Pages** | `cashIn.tsx`, `cashOut.tsx`, `cashierOverview.tsx`, `ledger.tsx`, `report.tsx`, `transfer.tsx` |
| **Services** | (empty folder) |
| **Permissions** | `permissions.ts` (not read) |
| **Firebase** | ❌ No service imports found in pages |
| **Status** | **NEEDS VERIFICATION** |

### Analysis
- Pages exist but **no service layer** — likely incomplete
- Treasury module (`financeService`, `cashService`) handles cashier operations instead
- **Duplicate/overlap** with Treasury module

---

## 7. Bank Transactions

### `src/modules/bank-transactions/`
| Aspect | Detail |
|--------|--------|
| **Hooks** | `useBankTransactions.ts` |
| **Services** | `bankTransactionService.ts` |
| **Types** | `src/types/bankTransactions.ts` |
| **Firebase** | ✅ `bank_transactions` collection |
| **Status** | **COMPLETE** |

### Core Service: `bankTransactionService`
- **Unified ledger** for ALL money movements
- `holdingType` logic:
  - `somity_bank` → money in bank, `affectsBalance: true`, `status: completed`
  - `collector` → money with collector, `affectsBalance: false`, `status: pending`
- `destinationType`: `somity_bank`, `collector_cash`, `collector_bank`, `mobile_wallet`, `member_account`, `expense_payment`, `investment`
- `markAsDeposited()` — transitions collector → somity_bank
- `getTransactionSummary()` — aggregates income/expense/pending/reconciled
- `getCashInHand()`, `getMobileWalletBalance()` — filtered queries

### Gaps
- **Unbounded queries** — `getAllBankTransactions(10000)` loads all docs
- No pagination/cursors
- Reconciliation fields exist (`isReconciled`, `reconciledAt`) but no process

---

## 8. Treasury

### `src/modules/treasury/`
| Aspect | Detail |
|--------|--------|
| **Pages** | `FundTransfer.tsx`, `TransactionHistory.tsx`, `bankAccounts.tsx`, `bankLedger.tsx`, `cashManagement.tsx`, `index.tsx` |
| **Components** | `bank/BankAccountCard.tsx`, `BankAccountForm.tsx`, `common/AccountSelector.tsx`, `AmountInput.tsx`, `FinanceStatsCard.tsx` |
| **Services** | `bank.service.ts`, `cash.service.ts`, `financeService.ts` |
| **Types** | `bank.types.ts`, `cash.types.ts`, `transaction.types.ts`, `transfer.types.ts`, `index.ts` |
| **Constants** | `finance.constants.ts` |
| **Firebase** | ✅ `bank_accounts`, `cash_balances`, `fund_transactions`, `bank_transactions` |
| **Status** | **PARTIALLY IMPLEMENTED** |

### Service Layer Duplication
| Service | Collections | Overlaps With |
|---------|-------------|---------------|
| `bank.service.ts` | `bank_accounts` | `financeService.createBankAccount()` |
| `cash.service.ts` | `cash_balances` | `financeService` cashier methods |
| `financeService.ts` | `bank_accounts`, `cash_balances`, `fund_transactions` | Both above + `bankTransactionService` |

### `financeService.transferFunds()` — **Atomic** (writeBatch)
- Updates source balance (bank or cashier)
- Updates destination balance (bank or cashier)
- Creates `fund_transactions` record
- All in one batch

### Gaps
- Three services writing to same collections — **conflict risk**
- `bank.service.updateBalance()` uses `increment()` directly
- `financeService.updateBankBalance()` also uses `increment()`
- No single source of truth for "total treasury balance"

---

## 9. Assets

### `src/modules/assets/`
| Aspect | Detail |
|--------|--------|
| **Pages** | `AssetsRegister.tsx`, `BankAccounts.tsx`, `CapitalFlowPage.tsx`, `CashManagement.tsx`, `ExpensePage.tsx`, `FinancialReports.tsx`, `IncomePage.tsx`, `ProfitLossPage.tsx`, `WealthSummary.tsx` |
| **Constants** | `accountTypes.ts`, `assetCategories.ts` |
| **Types** | `assets.types.ts` |
| **Services** | None |
| **Firebase** | ❌ **No Firebase imports in any page** |
| **Status** | **NOT IMPLEMENTED** |

### Evidence
- `AssetsRegister.tsx` — hardcoded mock data array
- `IncomePage.tsx`, `ExpensePage.tsx` — use `INCOME_CATEGORIES`/`EXPENSE_CATEGORIES` constants only
- All pages are **static UI with mock data**
- Overlaps with Treasury (bank accounts, cash management, reports)

---

## 10. Business

### `src/modules/business/`
| Aspect | Detail |
|--------|--------|
| **Pages** | `BusinessListPage.tsx`, `BusinessDetailPage.tsx`, `BusinessCreatePage.tsx`, `BusinessUpdatePage.tsx` |
| **Components** | `AddTransactionModal.tsx`, `BusinessCard.tsx`, `BusinessForm.tsx`, `BusinessOwnerList.tsx`, `BusinessTransactionList.tsx` |
| **Services** | `businessService.ts` — **in-memory array only** |
| **Types** | `business.types.ts` |
| **Firebase** | ❌ **No Firebase** |
| **Status** | **NOT IMPLEMENTED** |

### `businessService.ts`
```typescript
const businesses: Business[] = [];  // In-memory only!
export const businessService = {
  async getAll(): Promise<Business[]> { return [...businesses]; },
  async create(business: Business): Promise<Business> { businesses.unshift(business); return business; },
};
```
- Data lost on refresh
- No persistence

---

## 11. Teams

### `src/modules/teams/`
| Aspect | Detail |
|--------|--------|
| **Pages** | `create.tsx`, `index.tsx`, `performance.tsx`, `teamHistory.tsx` |
| **Types** | `team.ts` |
| **Services** | None |
| **Firebase** | ❌ **Mock data only** |
| **Status** | **NOT IMPLEMENTED** |

### `index.tsx` — Full mock implementation
```typescript
const mockTeams: Team[] = [
  { id: 'T001', name: 'Core Management Team', type: 'core', ... },
  { id: 'T002', name: 'Finance Team', type: 'finance', ... },
  { id: 'T003', name: 'Loan Management Team', type: 'loan', ... },
];
```
- All CRUD operates on local state
- No Firebase integration

---

## 12. Reports

### `src/modules/reports/`
| Aspect | Detail |
|--------|--------|
| **Pages** | `exportData.tsx`, `financeReport.tsx`, `index.tsx`, `loanReports.tsx`, `memberReport.tsx` |
| **Services** | None (empty folder) |
| **Firebase** | ❌ **Placeholder pages only** |
| **Status** | **NOT IMPLEMENTED** |

### Page Content
- All pages return minimal JSX: `<div>Report page content</div>`
- Export functionality in `src/shared/export/` but not wired here

---

## 13. Communication

### `src/modules/communication/`
| Aspect | Detail |
|--------|--------|
| **Pages** | `chat.tsx`, `committee-messages.tsx`, `index.tsx`, `notices.tsx` |
| **Services** | None (empty folder) |
| **Firebase** | ❌ **Placeholder only** |
| **Status** | **NOT IMPLEMENTED** |

### `chat.tsx`
```tsx
const MemberList: React.FC = () => (
  <div><h1>👥 Chat List</h1><p>All chat-related activities will appear here.</p></div>
);
```

---

## 14. Settings

### `src/modules/settings/`
| Aspect | Detail |
|--------|--------|
| **Pages** | `account.tsx`, `index.tsx`, `notifications.tsx`, `roles.tsx`, `system.tsx` |
| **Components** | `CollectionSettings.tsx`, `CollectorSettings.tsx`, `FeeSettings.tsx`, `FinancialSettings.tsx`, `FinancingSettings.tsx`, `GeneralSettings.tsx`, `InvestmentSettings.tsx`, `IslamicFinanceSettings.tsx`, `MemberSettings.tsx`, `ReportSettings.tsx`, `SecuritySettings.tsx`, `ShareSettings.tsx`, `bank/BankAccountCard.tsx`, `CollectorBankSettings.tsx`, `SomityBankSettings.tsx` |
| **Hooks** | `useBankAccounts.ts`, `useBankAccountsForSettings.ts`, `useSettingsValidation.ts` |
| **Constants** | `bank.constants.ts` |
| **Permissions** | `permissions.ts` — granular per-setting permissions |
| **Services** | None |
| **Firebase** | ⚠️ Reads `somity_settings/config`, writes unclear |
| **Status** | **PARTIALLY IMPLEMENTED** |

### Settings Storage
- Single document: `somity_settings/config` (loaded in `AuthProvider.loadSomityInfo()`)
- Massive `SomitySettings` interface in `src/types/settings.ts` with:
  - General, Share, Fee, Member, Loan, IslamicLoanConfig, Collection, Financial, Report, Security, Investment configs
- UI components exist for each section
- **No service layer** — unclear how saves happen (likely direct `updateDoc` in components)

---

## 15. Dashboards

### `src/modules/dashboards/`
| Aspect | Detail |
|--------|--------|
| **Pages** | `AdminDashboard.tsx`, `CashierDashboard.tsx`, `CollectorDashboard.tsx`, `MemberDashboard.tsx` |
| **Services** | None (empty folder) |
| **Firebase** | ❌ **Static mock data** |
| **Status** | **PARTIALLY IMPLEMENTED** |

### `AdminDashboard.tsx` — Hardcoded Stats
```typescript
const stats = [
  { title: 'সদস্য সংখ্যা', value: '২৪৫ জন', ... },
  { title: 'সক্রিয় লোন', value: '৮৯ টি', ... },
  { title: 'মোট জমা', value: '৳ ১,২৫,০০০', ... },
  { title: 'ট্রেজারি ব্যালেন্স', value: '৳ ৫,৫০,০০০', ... },
];
```
- No Firebase queries
- Recent activities hardcoded
- Quick actions are just navigation links

---

## 16. Support

### `src/modules/support/`
| Aspect | Detail |
|--------|--------|
| **Pages** | `about.tsx`, `faq.tsx`, `index.tsx` |
| **Services** | None |
| **Firebase** | ❌ **Static content only** |
| **Status** | **NOT IMPLEMENTED** |

---

## 17. Super Admin

### `src/modules/super-admin/`
| Aspect | Detail |
|--------|--------|
| **Pages** | `Dashboard.tsx`, `FirestoreInspector.tsx`, `Logs.tsx`, `UsageTracking.tsx`, `Users.tsx`, `settings.tsx` |
| **Services** | None (empty folder) |
| **Firebase** | ⚠️ Inspector tools (read-only?) |
| **Status** | **PARTIALLY IMPLEMENTED** |

### Purpose
- Firestore data inspector
- Usage tracking
- User management
- System settings
- **No write operations visible**

---

## 18. Users

### `src/modules/users/`
| Aspect | Detail |
|--------|--------|
| **Pages** | `AddUser.tsx`, `CreateMemberAccount.tsx`, `UserProfile.tsx`, `index.tsx` |
| **Services** | None |
| **Firebase** | ⚠️ Depends on `createMemberAuthAccount` Cloud Function |
| **Status** | **PARTIALLY IMPLEMENTED** |

### Gap
- `CreateMemberAccount` page likely calls the dormant Cloud Function
- No client-side alternative for creating Auth users (requires Admin SDK)

---

## Cross-Module Dependencies

```
┌─────────────────┐
│   AuthProvider  │ ← Central auth, loads somity_settings, user, member
└────────┬────────┘
         │
    ┌────┴────┬──────────────┬──────────────┐
    ▼         ▼              ▼              ▼
 Members  Contributions   Financing    Investments
    │         │              │              │
    │         └──────┬───────┘              │
    │                ▼                      │
    │         Bank Transactions ◄──────────┘
    │                │
    ▼                ▼
 Treasury ◄──── fund_transactions
    │
    ▼
  (Cashier - duplicate)
```

### Shared Services
- `bankTransactionService` — used by Contributions, Financing, Investments (via investmentOps)
- `financeService` — used by Treasury, Cashier
- `memberService` — used by Auth, Contributions, Financing

---

## Module Health Scorecard

| Module | Firebase | Atomic Writes | Pagination | Permissions | Tests | Overall |
|--------|----------|---------------|------------|-------------|-------|---------|
| Auth | ✅ | N/A | N/A | ✅ | ❌ | 🟢 Good |
| Members | ✅ | N/A (single doc) | ✅ (limited) | ✅ | ❌ | 🟢 Good |
| Contributions | ✅ | ❌ | ✅ (limit 100) | ⚠️ | ❌ | 🟡 Fair |
| Financing | ✅ | ❌ | ❌ | ⚠️ | ❌ | 🟡 Fair |
| Investments | ✅ | ✅ | ✅ (limit 100) | ✅ | ❌ | 🟢 Good |
| Bank Transactions | ✅ | ✅ (single) | ❌ (10k) | ❌ | ❌ | 🟡 Fair |
| Treasury | ✅ | ✅ (transferFunds) | ❌ | ❌ | ❌ | 🟡 Fair |
| Assets | ❌ | N/A | N/A | ❌ | ❌ | 🔴 Dead |
| Business | ❌ | N/A | N/A | ❌ | ❌ | 🔴 Dead |
| Teams | ❌ | N/A | N/A | ❌ | ❌ | 🔴 Dead |
| Reports | ❌ | N/A | N/A | ❌ | ❌ | 🔴 Dead |
| Communication | ❌ | N/A | N/A | ❌ | ❌ | 🔴 Dead |
| Settings | ⚠️ | ❌ | N/A | ✅ | ❌ | 🟡 Fair |
| Dashboards | ❌ | N/A | N/A | ❌ | ❌ | 🔴 Dead |
| Support | ❌ | N/A | N/A | ❌ | ❌ | 🔴 Dead |
| Super Admin | ⚠️ | N/A | N/A | ❌ | ❌ | 🟡 Fair |
| Users | ⚠️ | N/A | N/A | ❌ | ❌ | 🟡 Fair |

---

## Recommendations by Module

### Keep & Enhance (Core Financial)
1. **Investments** — Model for atomic operations; complete UI tabs
2. **Contributions** — Convert to transactions/batches; add server-side due calc
3. **Financing** — Convert to transactions/batches; wire JSON schema validation
4. **Bank Transactions** — Add pagination; build reconciliation flow
5. **Members** — Remove duplicate `personal` field; add indexes

### Consolidate (Treasury)
6. **Merge** `treasury` + `bank-transactions` + `cashier` → single `treasury` module
7. **Single service** for all balance updates using `writeBatch`

### Remove (Placeholders)
8. **Delete** `assets`, `business`, `teams`, `reports`, `communication`, `support`
9. **Archive** in `deprecated/` if history needed

### Fix (Infrastructure)
10. **Deploy Firestore Rules** — Critical
11. **Centralize Permissions** — Single `PermissionService`
12. **Code-split Routes** — Dynamic imports per module
13. **Remove Duplicate Charts** — Keep `recharts` only

---

*End of MODULE_AUDIT.md*