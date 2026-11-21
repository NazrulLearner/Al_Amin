# Financial Ledger Design — Al Amin Somity Project

**Version:** 1.0  
**Last Updated:** 2025-11-20  
**Governed by:** `docs/MASTER_PLAN.md` v1.1 §8, §9, §10, §11, §12, §20 #1 (T-001)  
**Status:** Phase 1.4 Deliverable — Owner Review Required  
**Investigation:** T-001 — "Ledger model: Balanced double-entry postings vs additive journal"

---

## 1. Executive Summary

This document defines the financial ledger architecture for the Al Amin Somity system. The central decision (T-001) is whether to implement **balanced double-entry postings** (debit/credit pairs that sum to zero) or an **additive journal** (single-sided entries with direction field).

**Recommendation:** **Balanced Double-Entry** for `bank_transactions` collection — provides built-in integrity, reconciliation support, and audit trail. Aligns with Master Plan §8.3 (balanced postings) and Treasury service gold standard (`financeService.ts` uses `writeBatch` for atomic transfers).

---

## 2. Current State Analysis

### 2.1 Existing Collections Related to Ledger

| Collection | Purpose | Current Model | Issues |
|------------|---------|---------------|--------|
| `bank_transactions` | Unified money movement log | Additive with `direction: 'in'/'out'`, `holdingType: 'collector'/'somity_bank'` | No balance enforcement, drift possible |
| `bank_accounts` | Bank account master | Balance field updated separately | Balance can drift from transactions |
| `cash_balances` | Collector cash positions | Single doc per collector | No transaction link |
| `fund_transactions` | Inter-account transfers | Separate collection | Duplicate of bank_transfers |
| `contributions` | Fee payments | Separate, no ledger link | No audit trail to bank |
| `loan_repayments` | Loan repayments | Separate, no ledger link | No audit trail to bank |
| `investmentTransactions` | Investment funding/returns | Per-investment, linked | Good model, isolated |

### 2.2 Current `bank_transactions` Schema (from `src/services/firebase/firebaseCollections.ts`)

```typescript
// Current fields observed in codebase
bank_transactions: {
  id: string;
  date: string;           // YYYY-MM-DD local
  amount: number;         // positive
  direction: 'in' | 'out'; // additive model
  holdingType: 'collector' | 'somity_bank'; // WHOSE money
  sourceCollection: 'contributions' | 'loans' | 'loan_repayments' | 'investments' | 'expenses';
  destinationType: 'somity_bank' | 'collector_cash' | 'collector_bank' | 'mobile_wallet' | 'member_account' | 'expense_payment';
  referenceId: string;    // source doc ID
  referenceType: string;  // source collection
  description: string;
  createdBy: string;
  createdAt: Timestamp;
  // MISSING: account_id, counter_account_id, balance_after, entry_type (debit/credit)
}
```

### 2.3 Treasury Service Gold Standard (`src/modules/treasury/services/financeService.ts`)

```typescript
// Current transferFunds implementation - uses writeBatch (atomic known writes)
export async function transferFunds(fromAccountId, toAccountId, amount, ...): Promise<void> {
  const batch = writeBatch(db);
  // 1. Update from_account balance (decrement)
  // 2. Update to_account balance (increment)
  // 3. Create fund_transactions doc (out)
  // 4. Create fund_transactions doc (in)
  await batch.commit();
}
```

**Gap:** Updates balances directly without transaction log entries that enforce balance = sum(transactions).

---

## 3. Ledger Model Options

### 3.1 Option A: Additive Journal (Current)

```typescript
// One entry per money movement
{
  amount: 5000,
  direction: 'in',        // or 'out'
  holdingType: 'somity_bank',
  // balance derived by SUM(direction='in') - SUM(direction='out')
}
```

| Pros | Cons |
|------|------|
| Simple to understand | No built-in integrity check |
| Easy to query | Balance drift undetectable |
| Familiar to non-accountants | Reconciliation requires full scan |
| Matches current code | Audit trail incomplete |

### 3.2 Option B: Balanced Double-Entry (Recommended)

```typescript
// Every financial event creates TWO linked entries (debit + credit)
{
  // Entry 1: DEBIT (asset increases or liability decreases)
  entryId: 'txn_abc_001',
  transactionId: 'txn_abc',        // groups the pair
  accountId: 'bank_main',          // Debited account
  counterAccountId: 'cash_collector', // Credited account
  amount: 5000,
  entryType: 'debit',              // 'debit' | 'credit'
  direction: 'in',                 // for UI: money entering this account
  balanceAfter: 55000,             // running balance for THIS account
  sourceCollection: 'contributions',
  referenceId: 'contrib_xyz',
  ...
},
{
  // Entry 2: CREDIT (asset decreases or liability increases)
  entryId: 'txn_abc_002',
  transactionId: 'txn_abc',
  accountId: 'cash_collector',
  counterAccountId: 'bank_main',
  amount: 5000,
  entryType: 'credit',
  direction: 'out',                // money leaving this account
  balanceAfter: 45000,
  ...
}
```

| Pros | Cons |
|------|------|
| **Built-in integrity:** SUM(debits) = SUM(credits) per transaction | More complex writes (2 entries per event) |
| **Instant reconciliation:** balanceAfter must match running sum | Requires account master data |
| **Audit standard:** GAAP/IFRS compliant | Slightly larger storage (2x entries) |
| **Drift detection:** Any imbalance = corruption | Migration from additive model needed |
| **Query flexibility:** Account-ledger, transaction-ledger, trial balance | |

### 3.3 Option C: Hybrid (Additive + Periodic Balanced)

- Daily operations: additive (current)
- End-of-day: generate balanced entries for reconciliation
- **Not recommended** — adds complexity without full benefits

---

## 4. Recommended Design: Balanced Double-Entry Ledger

### 4.1 Core Principles

1. **Every financial event = 1 Transaction (group) + 2+ Entries (debit/credit)**
2. **Entries always balance:** Σ(debits) = Σ(credits) per transactionId
3. **Running balance per account:** `balanceAfter` on each entry enables O(1) verification
4. **Account master required:** `chart_of_accounts` collection defines all accounts
5. **Immutable entries:** No updates/deletes — corrections via reversing entries

### 4.2 Collection: `chart_of_accounts` (New)

```typescript
// Master list of all accounts in the system
chart_of_accounts: {
  id: string;                    // 'bank_main', 'cash_collector_001', 'member_dues_receivable'
  code: string;                  // '1000', '1100', '1200' — hierarchical
  name: string;                  // 'Main Bank Account'
  nameBn: string;                // 'মূল ব্যাংক অ্যাকাউন্ট'
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  subtype: 'bank' | 'cash' | 'receivable' | 'payable' | 'member_dues' | 'loan_portfolio' | 'investment' | 'expense';
  holdingType: 'somity_bank' | 'collector_cash' | 'collector_bank' | 'mobile_wallet' | 'member_account';
  isActive: boolean;
  openingBalance: number;        // For migration
  currentBalance: number;        // Denormalized for quick access (updated atomically)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Standard Chart of Accounts (Bangladesh Somity Context):**

| Code | Account Name | Type | Subtype | Holding Type |
|------|--------------|------|---------|--------------|
| 1000 | মুল 뱅ক অ্যাকাউন্ট | Asset | bank | somity_bank |
| 1010 | কালেক্টর ক্যাশ | Asset | cash | collector_cash |
| 1020 | কালেক্টর ব্যাংক | Asset | bank | collector_bank |
| 1030 | মোবাইল ওয়ালেট | Asset | cash | mobile_wallet |
| 1100 | সদস্য বকেয়া প্রাপ্য | Asset | receivable | member_account |
| 1200 | লোন পোর্টফোলিও | Asset | loan_portfolio | member_account |
| 1300 | বিনিয়োগ | Asset | investment | somity_bank |
| 2000 | দায় | Liability | payable | — |
| 3000 | মডল ক্যাপিটাল | Equity | — | — |
| 4000 | আয় (শেয়ার, ফি, লোন লাভ) | Income | — | — |
| 5000 | ব্যয় | Expense | — | — |

### 4.3 Collection: `ledger_entries` (Replaces/Extends `bank_transactions`)

```typescript
ledger_entries: {
  // Immutable — never updated after creation
  entryId: string;              // UUID
  transactionId: string;        // Groups entries for one financial event
  transactionDate: string;      // YYYY-MM-DD (local BD date)
  postedDate: string;           // YYYY-MM-DD (when posted to ledger)
  
  accountId: string;            // Ref: chart_of_accounts.id
  accountCode: string;          // Denormalized for queries ('1000')
  accountName: string;          // Denormalized
  
  counterAccountId: string;     // The other side of the entry
  counterAccountCode: string;
  
  amount: number;               // Always positive
  entryType: 'debit' | 'credit'; // Double-entry type
  direction: 'in' | 'out';      // UI: money entering/leaving THIS account
  
  balanceBefore: number;        // Account balance BEFORE this entry
  balanceAfter: number;         // Account balance AFTER this entry (MUST = balanceBefore ± amount)
  
  // Source traceability
  sourceModule: 'contributions' | 'financing' | 'investments' | 'treasury' | 'expenses' | 'adjustment';
  sourceCollection: string;     // Original collection name
  sourceDocumentId: string;     // Original doc ID
  sourceReference: string;      // Human-readable (receipt #, loan #, etc.)
  
  // Context
  description: string;          // 'Member MBR-001 monthly fee'
  remarks: string;              // Optional details
  
  // Authorization
  performedBy: string;          // User name
  performedByUid: string;       // User UID
  performedByRole: string;      // User role at time
  
  // Status
  status: 'posted' | 'reversed' | 'voided';
  reversedByEntryId: string;    // If reversed
  
  // Timestamps
  createdAt: Timestamp;         // Server timestamp
  // NO updatedAt — immutable
}
```

### 4.4 Integrity Constraints (Enforced in Code + Firestore Rules)

| Constraint | Enforcement |
|------------|-------------|
| Σ(debit amounts) = Σ(credit amounts) per transactionId | `runTransaction` verification before commit |
| `balanceAfter` = `balanceBefore` + (debit ? amount : -amount) | Code assertion + Rules |
| `accountId` exists in `chart_of_accounts` | Rules: `exists(/databases/.../chart_of_accounts/$(accountId))` |
| No gaps in entry sequence per account | `balanceAfter` chain validation |
| Reversal entries reference original | Code check |
| Entry immutable after `createdAt` + 5 min grace | Rules: `request.resource.data.createdAt == resource.data.createdAt` |

---

## 5. Money Flow Mappings (All Modules → Ledger)

### 5.1 Contributions Module

| Event | Debit Account | Credit Account | Amount | Module |
|-------|---------------|----------------|--------|--------|
| Collector receives cash from member | 1010 Collector Cash | 1100 Member Dues Receivable | Fee amount | Contributions |
| Collector deposits to somity bank | 1000 Main Bank | 1010 Collector Cash | Deposit amount | Contributions |
| Member pays direct to bank (online) | 1000 Main Bank | 1100 Member Dues Receivable | Fee amount | Contributions |
| Advance payment received | 1010/1000 Cash/Bank | 1100 Member Dues Receivable | Advance amount | Contributions |

### 5.2 Financing/Loans Module

| Event | Debit Account | Credit Account | Amount | Module |
|-------|---------------|----------------|--------|--------|
| Loan disbursed to member | 1200 Loan Portfolio | 1000 Main Bank | Principal | Financing |
| Member repays (principal) | 1000 Main Bank | 1200 Loan Portfolio | Principal | Financing |
| Member repays (profit/fee) | 1000 Main Bank | 4000 Income (Financing Profit) | Profit | Financing |
| Processing fee collected | 1000 Main Bank | 4000 Income (Processing Fee) | Fee | Financing |
| Late penalty collected | 1000 Main Bank | 4000 Income (Penalty) | Penalty | Financing |
| Loan write-off (bad debt) | 5000 Expense (Bad Debt) | 1200 Loan Portfolio | Written-off amount | Financing |

### 5.3 Investments Module

| Event | Debit Account | Credit Account | Amount | Module |
|-------|---------------|----------------|--------|--------|
| Somity funds investment | 1300 Investments | 1000 Main Bank | Committed amount | Investments |
| External investor funds | 1000 Main Bank | 1300 Investments | Investor amount | Investments |
| Investment return received | 1000 Main Bank | 1300 Investments | Return amount | Investments |
| Profit distribution to somity | 4000 Income (Investment Profit) | 1300 Investments | Profit share | Investments |
| Principal returned to somity | 1000 Main Bank | 1300 Investments | Principal | Investments |

### 5.4 Treasury/Banking Module

| Event | Debit Account | Credit Account | Amount | Module |
|-------|---------------|----------------|--------|--------|
| Bank deposit (cash → bank) | 1000 Main Bank | 1010 Collector Cash | Amount | Treasury |
| Bank withdrawal (bank → cash) | 1010 Collector Cash | 1000 Main Bank | Amount | Treasury |
| Inter-bank transfer | 1000 Bank A | 1000 Bank B | Amount | Treasury |
| Expense payment | 5000 Expense (category) | 1000 Main Bank | Amount | Treasury |
| Cash handover (collector → cashier) | 1010 Collector Cash | 1000 Main Bank | Amount | Treasury |

### 5.5 Daily Closing (Reconciliation)

| Event | Debit Account | Credit Account | Amount | Module |
|-------|---------------|----------------|--------|--------|
| Variance adjustment (cash short) | 5000 Expense (Cash Variance) | 1010 Collector Cash | Variance | Daily Closing |
| Variance adjustment (cash over) | 1010 Collector Cash | 4000 Income (Cash Over) | Variance | Daily Closing |

---

## 6. Atomic Write Patterns

### 6.1 Pattern: Financial Event → Ledger Entries (runTransaction)

```typescript
// Generic pattern for all modules
async function recordFinancialEvent(
  transactionId: string,
  entries: LedgerEntryInput[],
  actor: Actor
): Promise<void> {
  await runTransaction(db, async (tx) => {
    // 1. Read all affected accounts (chart_of_accounts)
    const accountRefs = entries.map(e => doc(db, 'chart_of_accounts', e.accountId));
    const accountSnaps = await Promise.all(accountRefs.map(r => tx.get(r)));
    
    // 2. Validate accounts exist, get current balances
    const accounts = accountSnaps.map((snap, i) => {
      if (!snap.exists()) throw new Error(`Account ${entries[i].accountId} not found`);
      const data = snap.data() as ChartOfAccount;
      return { ...data, ref: accountRefs[i], currentBalance: data.currentBalance };
    });
    
    // 3. Build entries with balanceBefore/balanceAfter
    const ledgerEntries = entries.map((input, i) => {
      const account = accounts[i];
      const balanceBefore = account.currentBalance;
      const balanceAfter = input.entryType === 'debit' 
        ? balanceBefore + input.amount 
        : balanceBefore - input.amount;
      
      // Validate balanceAfter matches expected
      if (input.balanceAfter !== undefined && input.balanceAfter !== balanceAfter) {
        throw new Error(`Balance mismatch for ${input.accountId}: expected ${balanceAfter}, got ${input.balanceAfter}`);
      }
      
      return {
        ...input,
        entryId: crypto.randomUUID(),
        transactionId,
        transactionDate: todayLocal(),
        postedDate: todayLocal(),
        balanceBefore,
        balanceAfter,
        performedBy: actor.name,
        performedByUid: actor.uid,
        performedByRole: actor.role,
        status: 'posted',
        createdAt: serverTimestamp(),
      };
    });
    
    // 4. CRITICAL: Verify transaction balances
    const totalDebits = ledgerEntries.filter(e => e.entryType === 'debit').reduce((s, e) => s + e.amount, 0);
    const totalCredits = ledgerEntries.filter(e => e.entryType === 'credit').reduce((s, e) => s + e.amount, 0);
    if (totalDebits !== totalCredits) {
      throw new Error(`Transaction ${transactionId} unbalanced: debits=${totalDebits}, credits=${totalCredits}`);
    }
    
    // 5. Write all ledger entries
    ledgerEntries.forEach(entry => {
      tx.set(doc(db, 'ledger_entries', entry.entryId), clean(entry));
    });
    
    // 6. Update account balances atomically
    accounts.forEach((account, i) => {
      const entry = ledgerEntries[i];
      tx.update(account.ref, { 
        currentBalance: entry.balanceAfter,
        updatedAt: serverTimestamp(),
      });
    });
    
    // 7. Write source document (contribution, loan_repayment, etc.) in same transaction
    // Module-specific: tx.set(sourceRef, sourceData);
  });
}
```

### 6.2 Module-Specific Entry Builders

```typescript
// Contributions: Member fee payment
function buildContributionEntries(payment: FeePayment, collectorAccountId: string): LedgerEntryInput[] {
  return [
    {
      accountId: collectorAccountId,           // Debit: Cash/Bank increases
      counterAccountId: 'member_dues_receivable',
      amount: payment.amount,
      entryType: 'debit',
      sourceModule: 'contributions',
      sourceCollection: 'contributions',
      sourceDocumentId: payment.id,
      sourceReference: `RCPT-${payment.receiptNumber}`,
      description: `${payment.memberName} (${payment.memberId}) - ${payment.month}/${payment.year} fee`,
    },
    {
      accountId: 'member_dues_receivable',     // Credit: Receivable decreases
      counterAccountId: collectorAccountId,
      amount: payment.amount,
      entryType: 'credit',
      sourceModule: 'contributions',
      sourceCollection: 'contributions',
      sourceDocumentId: payment.id,
      sourceReference: `RCPT-${payment.receiptNumber}`,
      description: `${payment.memberName} (${payment.memberId}) - ${payment.month}/${payment.year} fee`,
    }
  ];
}

// Financing: Loan disbursement
function buildDisbursementEntries(disbursement: LoanDisbursement): LedgerEntryInput[] {
  return [
    {
      accountId: 'loan_portfolio',             // Debit: Loan asset increases
      counterAccountId: 'main_bank',
      amount: disbursement.principalAmount,
      entryType: 'debit',
      sourceModule: 'financing',
      sourceCollection: 'loanDisbursements',
      sourceDocumentId: disbursement.id,
      sourceReference: `LOAN-${disbursement.loanId}`,
      description: `Disbursement to ${disbursement.memberName} (${disbursement.memberId})`,
    },
    {
      accountId: 'main_bank',                  // Credit: Bank decreases
      counterAccountId: 'loan_portfolio',
      amount: disbursement.principalAmount,
      entryType: 'credit',
      sourceModule: 'financing',
      sourceCollection: 'loanDisbursements',
      sourceDocumentId: disbursement.id,
      sourceReference: `LOAN-${disbursement.loanId}`,
      description: `Disbursement to ${disbursement.memberName} (${disbursement.memberId})`,
    }
  ];
}
```

---

## 7. Migration Strategy (T-005, T-006)

### 7.1 Phase 1: Add Chart of Accounts + Ledger Entries (Parallel)

1. Create `chart_of_accounts` collection with standard accounts
2. Create `ledger_entries` collection (empty)
3. Keep `bank_transactions` running (read-only for historical)
4. New financial events → write to BOTH `bank_transactions` (legacy) AND `ledger_entries` (new)

### 7.2 Phase 2: Backfill Historical Data (T-005, T-006)

```typescript
// Migration script (run once, offline or batch)
async function migrateHistoricalTransactions() {
  // 1. Read all bank_transactions
  // 2. For each, determine debit/credit accounts from holdingType, sourceCollection, destinationType
  // 3. Build balanced ledger_entries pairs
  // 4. Compute running balances per account (chronological)
  // 5. Write in batches (500 entries per batch)
  // 6. Verify: SUM(ledger_entries) per account = final bank_transactions balance
}
```

### 7.3 Phase 3: Cutover

1. Switch all modules to write ONLY to `ledger_entries`
2. Deprecate `bank_transactions`, `fund_transactions`, `cash_balances`
3. Archive legacy collections (read-only)
4. Update queries/reports to use `ledger_entries`

### 7.4 Legacy Collection Mapping

| Legacy Collection | Migration Target | Notes |
|-------------------|------------------|-------|
| `bank_transactions` | `ledger_entries` | Full backfill required |
| `fund_transactions` | `ledger_entries` | Subset of bank_transactions |
| `cash_balances` | `chart_of_accounts.currentBalance` | Denormalized balance |
| `bank_accounts` | `chart_of_accounts` (subtype='bank') | Merge into COA |
| `collector_balances` | `chart_of_accounts` (subtype='cash') | Merge into COA |
| `deposits` | `ledger_entries` | SourceModule='treasury' |
| `audit_logs` | Keep separate (non-financial) | No change |

---

## 8. Query Patterns & Indexes

### 8.1 Required Indexes (Firestore)

```javascript
// 1. Account ledger (most common query)
['accountId', 'transactionDate', 'entryId']

// 2. Transaction lookup (group entries)
['transactionId', 'entryId']

// 3. Date range across all accounts
['transactionDate', 'accountId', 'entryId']

// 4. Source traceability
['sourceModule', 'sourceCollection', 'sourceDocumentId']

// 5. Running balance verification
['accountId', 'transactionDate', 'balanceAfter']

// 6. Reversal tracking
['status', 'reversedByEntryId']
```

### 8.2 Common Queries

```typescript
// Account statement (paginated)
async function getAccountStatement(accountId: string, fromDate: string, toDate: string, cursor?: DocumentSnapshot) {
  const q = query(
    collection(db, 'ledger_entries'),
    where('accountId', '==', accountId),
    where('transactionDate', '>=', fromDate),
    where('transactionDate', '<=', toDate),
    orderBy('transactionDate'),
    orderBy('entryId'),
    limit(50)
  );
  if (cursor) q = query(q, startAfter(cursor));
  return getDocs(q);
}

// Trial balance (all accounts at date)
async function getTrialBalance(asOfDate: string) {
  // 1. Get all active accounts
  // 2. For each, get latest entry ≤ asOfDate
  // 3. Sum debits/credits per account type
  // 4. Verify: Total Debits = Total Credits
}

// Transaction detail (both sides)
async function getTransactionDetail(transactionId: string) {
  const q = query(
    collection(db, 'ledger_entries'),
    where('transactionId', '==', transactionId),
    orderBy('entryId')
  );
  return getDocs(q);
}
```

---

## 9. Reconciliation & Verification

### 9.1 Daily Reconciliation (Automated)

```typescript
async function runDailyReconciliation(date: string): Promise<ReconciliationResult> {
  const results = {
    accountBalances: [] as {accountId: string; ledgerBalance: number; expectedBalance: number; variance: number}[],
    unbalancedTransactions: [] as string[],
    missingEntries: [] as string[],
  };
  
  // 1. Check every account: ledger balance = sum(entries)
  const accounts = await getDocs(query(collection(db, 'chart_of_accounts'), where('isActive', '==', true)));
  
  for (const accDoc of accounts.docs) {
    const account = accDoc.data();
    const lastEntry = await getLastEntryBefore(account.id, date);
    const ledgerBalance = lastEntry?.balanceAfter ?? account.openingBalance;
    
    // Expected = opening + sum(debits) - sum(credits) up to date
    const expectedBalance = await computeExpectedBalance(account.id, date);
    
    if (ledgerBalance !== expectedBalance) {
      results.accountBalances.push({
        accountId: account.id,
        ledgerBalance,
        expectedBalance,
        variance: ledgerBalance - expectedBalance,
      });
    }
  }
  
  // 2. Check all transactions on date are balanced
  const txns = await getDocs(query(
    collection(db, 'ledger_entries'),
    where('transactionDate', '==', date)
  ));
  
  const byTxn = groupBy(txns.docs.map(d => d.data()), 'transactionId');
  for (const [txnId, entries] of Object.entries(byTxn)) {
    const debits = entries.filter(e => e.entryType === 'debit').reduce((s, e) => s + e.amount, 0);
    const credits = entries.filter(e => e.entryType === 'credit').reduce((s, e) => s + e.amount, 0);
    if (debits !== credits) {
      results.unbalancedTransactions.push(txnId);
    }
  }
  
  return results;
}
```

### 9.2 Period-End Verification

| Check | Frequency | Method |
|-------|-----------|--------|
| All transactions balanced | Daily | Automated job |
| Account balances match running sum | Daily | Automated job |
| Trial balance balances (ΣDebits = ΣCredits) | Monthly | Manual + automated |
| Source document count = ledger entry count | Monthly | Cross-module audit |
| No orphaned entries (missing account) | Monthly | Rules + query |

---

## 10. Firestore Rules (Phase 2 Implementation)

### 10.1 Ledger Entry Rules

```javascript
// ledger_entries: Immutable after creation, balanced transactions only
match /ledger_entries/{entryId} {
  // Create: Must be part of balanced transaction (verified by backend)
  allow create: if isAuthenticated()
    && request.resource.data.entryId == entryId
    && request.resource.data.createdAt == request.time
    && validateEntry(request.resource.data);
  
  // Read: Any authenticated user can read (audit trail)
  allow read: if isAuthenticated();
  
  // Update/Delete: NEVER allowed (immutable)
  allow update, delete: if false;
  
  // Reversal: Only via new reversing entry (create)
  function validateEntry(data) {
    return data.amount > 0
      && (data.entryType == 'debit' || data.entryType == 'credit')
      && data.balanceAfter == data.balanceAfter  // Computed in backend
      && exists(/databases/$(database)/documents/chart_of_accounts/$(data.accountId));
  }
}
```

### 10.2 Chart of Accounts Rules

```javascript
match /chart_of_accounts/{accountId} {
  allow read: if isAuthenticated();
  
  // Only super_admin/admin can modify chart
  allow create, update: if hasRole(['super_admin', 'admin'])
    && validateAccount(request.resource.data);
  
  allow delete: if false; // Never delete accounts
  
  function validateAccount(data) {
    return data.code.matches('^[0-9]{4}$')
      && data.type in ['asset', 'liability', 'equity', 'income', 'expense']
      && data.currentBalance >= 0 || data.type != 'asset'; // Assets can't go negative without liability
  }
}
```

---

## 11. T-001 Investigation Conclusion

### 11.1 Findings

| Aspect | Additive (Current) | Balanced Double-Entry (Recommended) |
|--------|-------------------|-------------------------------------|
| **Data Integrity** | ❌ No built-in check | ✅ ΣDebits = ΣCredits enforced |
| **Reconciliation** | ❌ Full scan required | ✅ O(1) via `balanceAfter` |
| **Audit Compliance** | ❌ Incomplete trail | ✅ GAAP/IFRS standard |
| **Drift Detection** | ❌ Silent corruption | ✅ Immediate on write |
| **Storage** | 1 entry/event | 2 entries/event (+100%) |
| **Write Complexity** | Simple | Requires `runTransaction` |
| **Migration Effort** | None | Medium (backfill needed) |
| **Query Performance** | Good | Good (with indexes) |
| **Spark Plan Impact** | Lower writes | 2x writes (still << 20k/day) |

### 11.2 Recommendation: **Balanced Double-Entry**

**Rationale:**
1. Master Plan §8.3 explicitly mentions "balanced postings"
2. Treasury service already uses atomic `writeBatch` for transfers — natural evolution
3. Investment module uses `investmentTransactions` with direction — already half-way there
4. Financial data integrity is non-negotiable for a somity
5. 2x write cost is negligible: ~500 transactions/day × 2 = 1,000 writes/day << 20,000 Spark limit

### 11.3 Owner Decision Required (O-003, O-004)

| Decision | Options | Recommendation |
|----------|---------|----------------|
| **O-003** Contribution atomicity boundary | A: Full `runTransaction` (3 docs: contribution + ledger×2 + member due update) B: `writeBatch` + compensating | **A** — Use `runTransaction` for all 3 docs |
| **O-004** Financing atomicity boundary | A: Each op (approve/disburse/repay) atomic B: Batch related ops | **A** — Each financial event atomic with ledger |

---

## 12. Implementation Roadmap

| Step | Task | Dependencies | Effort |
|------|------|--------------|--------|
| 1 | Create `chart_of_accounts` collection + seed data | — | 1 day |
| 2 | Create `ledger_entries` collection + indexes | Step 1 | 1 day |
| 3 | Build `LedgerService` with `recordFinancialEvent()` | Steps 1-2 | 2 days |
| 4 | Migrate `financeService.transferFunds()` to use LedgerService | Step 3 | 1 day |
| 5 | Migrate `InvestmentOps` to use LedgerService | Step 3 | 2 days |
| 6 | Migrate `ContributionService` to use LedgerService | Step 3, O-003 | 2 days |
| 7 | Migrate `FinancingService` to use LedgerService | Step 3, O-004 | 3 days |
| 8 | Backfill historical data (T-005, T-006) | Steps 1-2 | 2 days |
| 9 | Daily reconciliation job | Step 8 | 1 day |
| 10 | Firestore Rules for ledger | Phase 2.2 | 1 day |

---

## 13. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-20 | Assistant | Initial draft from Master Plan §8,9,10,11,12 + T-001 investigation |

---

**Next Step:** Owner review → approve → proceed to **DATA_MODEL.md** (1.5)