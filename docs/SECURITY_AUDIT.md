# Security Audit — Al Amin Somity Project

**Generated:** 2025-11-20  
**Branch:** `cleanup`  
**Scope:** Authentication, Authorization, Firestore Rules, Data Protection, Client-Side Security

---

## Executive Summary

| Area | Status | Risk Level |
|------|--------|------------|
| **Authentication** | Firebase Auth (email/password) | 🟡 Medium |
| **Authorization (RBAC)** | Client-side only, inconsistent | 🔴 **Critical** |
| **Firestore Security Rules** | **NOT DEPLOYED** | 🔴 **Critical** |
| **Data Validation** | Client-side only | 🔴 **Critical** |
| **Secrets Management** | Firebase config in source | 🟡 Medium |
| **Financial Integrity** | Non-atomic writes, no server validation | 🔴 **Critical** |
| **Audit Logging** | Module-specific, no central trail | 🟡 Medium |

---

## 1. Authentication Security

### Current Implementation
- **Provider:** Firebase Authentication (email/password only)
- **Config:** Hardcoded in `src/services/firebase/firebase.ts` (API key, project ID, etc.)
- **User Creation:** `authService.createUserAccount()` (client) + Cloud Function `createMemberAuthAccount` (dormant)
- **Session Management:** `onAuthStateChanged` listener in `AuthProvider`
- **Password Reset:** Firebase `sendPasswordResetEmail`
- **MFA:** Not implemented
- **Social Login:** Not implemented

### Vulnerabilities

| Issue | Severity | Details |
|-------|----------|---------|
| **Firebase config in source** | 🟡 Medium | API key, project ID, auth domain exposed in client bundle — normal for Firebase but should be restricted via authorized domains |
| **No custom claims deployed** | 🟡 Medium | Cloud Function sets `role` claim but **not deployed** — roles only in Firestore |
| **Email enumeration** | 🟢 Low | `checkEmailExists()` uses `signInWithEmailAndPassword` with dummy password — reveals if email exists |
| **Weak password policy** | 🟡 Medium | Only Firebase default (6 chars) — no complexity requirements |
| **No rate limiting on auth** | 🟡 Medium | Firebase handles brute force but no custom logic |
| **Session timeout** | 🟡 Medium | `somity_settings.security.sessionTimeout` (30 min) defined but **not enforced** client-side |

### Recommendations
1. Restrict Firebase Auth authorized domains in Console
2. Deploy Cloud Function for custom claims OR move to Firestore-only roles with security rules
3. Add client-side session timeout enforcement
4. Implement password complexity in `createUserAccount`

---

## 2. Authorization (RBAC) Security

### Current Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    AUTH PROVIDER                              │
│  userData.role  ──► hasPermission(requiredRoles[])           │
│  isSuperAdmin = (role === 'super_admin')                     │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │  Module A   │     │  Module B   │     │  Module C   │
   │ permissions │     │ permissions │     │ permissions │
   │   (array)   │     │   (array)   │     │  (function) │
   └─────────────┘     └─────────────┘     └─────────────┘
```

### Role Definitions (`src/types/common.ts`)
```typescript
type UserRole = 'super_admin' | 'admin' | 'cashier' | 'manager' | 'accountant' | 'collector' | 'member';
```

### Permission Files by Module

| Module | Permission File | Pattern | Granularity |
|--------|----------------|---------|-------------|
| Auth | `auth/permissions.ts` | Simple object | 3 permissions |
| Members | `members/permissions.ts` | Role arrays per action | Medium |
| Settings | `settings/permissions.ts` | Role arrays per action | Medium |
| Investments | `Investments/permissions.ts` | Function `hasInvestmentPermission(role, perm)` | **High** (15+ perms) |
| Others | Various | Inconsistent | Low/None |

### Critical Gaps

| Gap | Severity | Impact |
|-----|----------|--------|
| **Client-side only enforcement** | 🔴 **Critical** | Any user can bypass UI checks by calling Firestore directly |
| **No Firestore Rules** | 🔴 **Critical** | **Zero server-side protection** — authenticated users can read/write any collection |
| **Inconsistent patterns** | 🟠 High | Bugs, maintenance burden, audit difficulty |
| **`manager` & `accountant` roles undefined** | 🟠 High | Defined in `UserRole` but **not in any permissions file** — effectively no access |
| **Super admin bypass hardcoded** | 🟡 Medium | `AuthProvider.hasPermission()` returns true for super_admin — OK but should be in rules |
| **No resource-level permissions** | 🟡 Medium | Can't restrict "member sees only own data" at database level |

### Investments Module — Best Practice Example
```typescript
// permissions.ts
export const investmentPermissions = {
  CREATE_INVESTMENT: 'investment.create',
  EDIT_INVESTMENT: 'investment.edit',
  DELETE_INVESTMENT: 'investment.delete',
  VIEW_INVESTMENT: 'investment.view',
  APPROVE_INVESTMENT: 'investment.approve',
  RECORD_FUNDING: 'investment.funding.record',
  RECORD_RETURN: 'investment.return.record',
  // ... 8 more
};

export const investmentRolePermissions: Record<UserRole, string[]> = {
  super_admin: [...all],
  admin: ['create', 'edit', 'view', 'approve', 'funding.record', 'return.record', ...],
  cashier: ['view', 'funding.record'],
  collector: ['view'],
  member: [],
  // manager, accountant: [] — MISSING!
};
```

---

## 3. Firestore Security Rules — **NOT DEPLOYED**

### Current State
- **`firebase.json`** references `database.rules` (Realtime Database) — **file not found**
- **No `firestore.rules` file** in project root
- **Investments template** at `src/modules/Investments/firestore.rules.template` — not deployed

### Template Rules (Investments Only)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function role() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role; }
    function isAdmin() { return signedIn() && role() in ['admin', 'super_admin']; }

    match /investments/{id}             { allow read: if isAdmin(); allow create, update: if isAdmin(); allow delete: if false; }
    match /investmentParticipants/{id}  { allow read: if isAdmin(); allow create, update: if isAdmin(); allow delete: if false; }
    match /fundingRecords/{id}          { allow read: if isAdmin(); allow create: if isAdmin(); allow update, delete: if false; }
    match /returnRecords/{id}           { allow read: if isAdmin(); allow create: if isAdmin(); allow update, delete: if false; }
    match /investmentTransactions/{id}  { allow read: if isAdmin(); allow create: if isAdmin(); allow update, delete: if false; }
    match /investmentHistory/{id}       { allow read: if isAdmin(); allow create: if isAdmin(); allow update, delete: if false; }
    match /investmentDocuments/{id}     { allow read: if isAdmin(); allow create, update: if isAdmin(); allow delete: if false; }
  }
}
```

### Required Rules for All Collections

| Collection | Read Access | Write Access | Delete |
|------------|-------------|--------------|--------|
| `users` | Owner + admin | Owner (profile) + admin | Admin only |
| `members` | Owner (own) + admin/cashier/collector | Admin only | Admin only |
| `somity_settings` | All authenticated | Super admin only | Never |
| `contributions` | Admin/cashier/collector (own) | Cashier/collector (create) + admin | Admin only |
| `bank_transactions` | Admin/cashier | System (via transaction) only | Never |
| `fund_transactions` | Admin/cashier | System (via batch) only | Never |
| `loans` | Admin + member (own) | Admin (approve/disburse) + system (repay) | Never |
| `loanApplications` | Admin + applicant | Member (create) + admin (approve/reject) | Admin only |
| `loan_repayments` | Admin + member (own) | System (via transaction) only | Never |
| `loanDisbursements` | Admin | System only | Never |
| `bank_accounts` | Admin | Admin only | Admin only |
| `cash_balances` | Admin + cashier (own) | System only | Never |
| `daily_closing` | Admin + cashier (own) | Cashier (create) + admin | Never |
| `investments` | Admin | Admin only | Never (soft delete) |
| `investmentParticipants` | Admin | Admin only | Never |
| `fundingRecords` | Admin | System (via transaction) only | Never |
| `returnRecords` | Admin | System (via transaction) only | Never |
| `investmentTransactions` | Admin | System (via transaction) only | Never |
| `investmentHistory` | Admin | System (via transaction) only | Never |
| `investmentDocuments` | Admin | Admin only | Admin only |

### Critical Rule Patterns Needed

```javascript
// 1. Member owns their data
match /members/{memberId} {
  allow read: if request.auth != null && 
    (resource.data.uid == request.auth.uid || isAdmin());
  allow update: if request.auth != null && 
    (resource.data.uid == request.auth.uid || isAdmin());
}

// 2. Financial collections - system writes only
match /bank_transactions/{txId} {
  allow read: if isAdmin() || isCashier();
  allow create: if false;  // Only via callable function (not allowed) or transaction
  allow update: if false;
}

// 3. Settings - super admin only write
match /somity_settings/config {
  allow read: if request.auth != null;
  allow write: if isSuperAdmin();
}

// 4. Loan applications - applicant creates, admin approves
match /loanApplications/{appId} {
  allow create: if request.auth != null && request.resource.data.applicant.memberID == getMemberId(request.auth.uid);
  allow update: if isAdmin();
  allow read: if isAdmin() || request.auth.uid == getUidForMember(resource.data.applicant.memberID);
}
```

---

## 4. Data Validation Security

### Current State
- **Client-side only** — TypeScript interfaces, `investmentValidation.ts`, `memberValidation.ts`
- **No server-side validation** — No Cloud Functions, no Firestore rules with `request.resource.data` validation
- **Direct Firestore writes** from client — bypassable

### Validation Coverage

| Module | Validation File | Coverage |
|--------|----------------|----------|
| Members | `memberValidation.ts` | ✅ Comprehensive (required fields, phone, email, NID, dates) |
| Investments | `investmentValidation.ts` | ✅ Comprehensive (amounts, dates, required participants) |
| Contributions | Inline in service | ⚠️ Basic (duplicate check, amount > 0) |
| Financing | `schemaValidator.ts` + JSON schemas | ⚠️ JSON schemas exist but **not enforced** in service |
| Treasury | None found | ❌ |

### Example: Investment Validation (Good)
```typescript
// investmentValidation.ts
export const validateInvestmentForm = (data) => {
  const errors = [];
  if (!data.investment_name?.trim()) errors.push('Investment name required');
  if (!data.reference_number?.trim()) errors.push('Reference number required');
  if (data.total_required_investment <= 0) errors.push('Investment amount must be > 0');
  if (data.expected_return_amount < 0) errors.push('Expected return cannot be negative');
  // ... date validation, participant validation
  return errors;
};
```

### Risk: Financial Data Integrity
Without server validation:
- Negative amounts can be written
- Duplicate contributions possible (race condition)
- Loan approvals bypassable
- Investment funding/returns manipulable

---

## 5. Financial Write Integrity

### Atomicity Audit (from FINDINGS.md)

| Operation | Collections | Atomic? | Risk |
|-----------|-------------|---------|------|
| Contribution payment | contributions + bank_transactions + members | ❌ **NO** | Orphan records, balance mismatch |
| Loan approval | loanApplications + loans | ❌ **NO** | Approved app without loan |
| Loan disbursement | loanDisbursements + loans | ❌ **NO** | Disbursement without loan update |
| Loan repayment | loan_repayments + loans | ❌ **NO** | Repayment without balance update |
| Treasury transfer | fund_transactions + bank_accounts + cash_balances | ✅ **YES** (batch) | Low |
| Investment create | investments + participants + history | ✅ **YES** (batch) | Low |
| Investment funding | fundingRecords + participants + investments + transactions + history | ✅ **YES** (transaction) | Low |
| Investment return | returnRecords + investments + transactions + history | ✅ **YES** (transaction) | Low |

### Impact of Non-Atomic Writes
```
Scenario: Contribution Payment Failure
1. Contribution doc created ✅
2. Bank transaction creation FAILS ❌ (network error)
3. Member financials increment FAILS ❌
Result: Contribution exists but no ledger entry, member balance wrong
```

### Mitigation Required
Convert all financial writes to use `runTransaction` or `writeBatch` (like Investments module).

---

## 6. Secrets & Configuration Security

### Firebase Config Exposure
```typescript
// src/services/firebase/firebase.ts — IN SOURCE CODE
const firebaseConfig = {
  apiKey: "AIzaSyAYagd9ZjrIxIWwMADGnd3tjWvQQeiLSzw",
  authDomain: "al-amin-somity-8dd36.firebaseapp.com",
  projectId: "al-amin-somity-8dd36",
  storageBucket: "al-amin-somity-8dd36.firebasestorage.app",
  messagingSenderId: "975543852418",
  appId: "1:975543852418:web:095f6e72b7409606dd839b",
  measurementId: "G-3BFMCSR5NF"
};
```

### Assessment
| Aspect | Status | Notes |
|--------|--------|-------|
| **API Key in source** | ✅ Acceptable | Firebase API keys are **public by design** — restricted via authorized domains |
| **No `.env` usage** | ✅ Good | No secrets in git (per owner) |
| **Authorized domains** | ❓ Unknown | Must be configured in Firebase Console |
| **App Check** | ❌ Not enabled | Should enable for production |

### Cloud Function Secrets
- `functions/` folder has `package.json` but no `.env` or secret files visible
- Cloud Functions not deployed per constraints

---

## 7. Client-Side Security Issues

### XSS Risks
| Location | Risk | Mitigation |
|----------|------|------------|
| `dangerouslySetInnerHTML` | Not found in audit | ✅ |
| User input in HTML | Member names, remarks in receipts | Escape in PDF/print |
| Base64 images | Stored in Firestore, rendered in `<img>` | Validate MIME type |

### Data Exposure in Console
| File | Logs | Risk |
|------|------|------|
| `contributionService.ts` | `console.log('✅ Fee payment recorded...')` | 🟡 Low — receipt IDs, amounts |
| `bankTransactionService.ts` | `console.log('✅ Bank transaction created...')` | 🟡 Low — transaction IDs, amounts |
| `FinancingService.ts` | `console.log('✅ Loan approved...')` | 🟡 Low — loan IDs, amounts |
| `investmentOps.ts` | `console.log('✅ Investment created...')` | 🟡 Low — investment IDs |

**Recommendation:** Remove or guard with `process.env.NODE_ENV === 'development'`

### Insecure Direct Object References (IDOR)
- Member ID in URL: `/members/profile/:memberId`
- Loan ID in URL: `/financing/:loanId`
- **No ownership check in Firestore rules** — any auth user can read any document

---

## 8. Audit Logging

### Current State
| Module | Audit Collection | Events Logged |
|--------|------------------|---------------|
| Investments | `investmentHistory` | Created, Submitted, Approved, Rejected, Funding Recorded, Return Recorded, Maturity, Settlement, Closed, Deleted, Restored |
| Members | `metadata` (embedded) | createdAt, updatedAt, createdBy, updatedBy, deletedAt, deletedBy |
| Contributions | None (embedded in docs) | createdAt, updatedAt, enteredById |
| Financing | None (embedded) | createdAt, updatedAt, createdBy, approvedBy, rejectedBy |
| Treasury | `fund_transactions` + `daily_closing` | Transfers, deposits, daily close |
| Bank Transactions | Embedded in docs | createdAt, createdBy, updatedBy, reconciledBy |

### Gaps
- **No central audit log** — `audit_logs` collection defined but unused
- **No immutable logs** — all editable via client
- **No tamper detection** — no hashing/chaining
- **No export/retention policy** — `somity_settings.report.reportRetentionDays` defined but not enforced

---

## 9. Network & Transport Security

| Aspect | Status |
|--------|--------|
| **HTTPS** | ✅ Firebase Hosting provides HTTPS |
| **Firebase Auth tokens** | ✅ Auto-managed, secure |
| **Firestore connections** | ✅ TLS encrypted |
| **CSP Headers** | ❓ Not verified (need `firebase.json` headers config) |
| **CORS** | ✅ Firebase handles |

---

## 10. Compliance & Data Protection

### Personal Data Stored
| Collection | PII Fields | Retention |
|------------|------------|-----------|
| `users` | email, name, phone, photoURL | Indefinite |
| `members` | name, phone, email, NID, DOB, address, family info, photo, signature | Indefinite |
| `contributions` | memberId, name, collector info | Indefinite |
| `loans` | memberId, name, guarantor info | Indefinite |

### GDPR/Privacy Considerations
- **No deletion API** — `hardDeleteMember` exists but not exposed in UI
- **No data export** — `reports/exportData.tsx` placeholder
- **No consent tracking** — Not implemented
- **Base64 images in Firestore** — Photos/signatures stored directly (increases doc size, not in Storage)

---

## 11. Dependency Security

### High-Risk Dependencies (from package.json)
| Package | Version | Known Issues | Action |
|---------|---------|--------------|--------|
| `firebase` | 12.4.0 | Check for CVEs | Update regularly |
| `react` | 19.1.1 | Latest | ✅ |
| `typescript` | 5.9.3 | Latest | ✅ |
| `vite` | 7.1.7 | Latest | ✅ |

**Recommendation:** Run `npm audit` regularly; use `npm audit fix` for non-breaking updates.

---

## 12. Security Checklist for Production

| Item | Status | Priority |
|------|--------|----------|
| Deploy Firestore Security Rules | ❌ **NOT DONE** | 🔴 **CRITICAL** |
| Enable Firebase App Check | ❌ Not done | 🔴 **CRITICAL** |
| Restrict Auth authorized domains | ❓ Unknown | 🔴 **CRITICAL** |
| Convert all financial writes to transactions/batches | ❌ Partial | 🔴 **CRITICAL** |
| Add server-side validation (or rules validation) | ❌ None | 🔴 **CRITICAL** |
| Implement member data ownership rules | ❌ None | 🔴 **CRITICAL** |
| Remove console.log financial data | ❌ Present | 🟠 High |
| Add CSP headers in firebase.json | ❌ Not configured | 🟠 High |
| Enable MFA for admin accounts | ❌ Not available | 🟠 High |
| Implement session timeout enforcement | ❌ Not enforced | 🟠 High |
| Add audit log immutability | ❌ Not implemented | 🟡 Medium |
| Data retention/deletion policy | ❌ Not enforced | 🟡 Medium |
| Regular dependency audits | ❌ Not automated | 🟡 Medium |
| Penetration testing | ❌ Not done | 🟡 Medium |

---

## 13. Recommended Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
                        FIRESTORE RULES (Server)
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐
  │  Auth Check │  │ Role Check  │  │ Ownership   │  │ Validate│
  │ request.auth│  │ get(/users/)│  │ resource.x  │  │ request │
  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────┬────┘
         │                │                │             │
         └────────────────┴────────────────┴─────────────┘
                              │
                              ▼
         ┌─────────────────────────────────────┐
         │      ALLOW / DENY                   │
         └─────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │ READ    │          │ WRITE   │          │ DELETE  │
   │ Rules   │          │ Rules   │          │ Rules   │
   └─────────┘          └─────────┘          └─────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │Client   │          │Client   │          │Client   │
   │Reads    │          │Writes   │          │Deletes  │
   │(Queries)│          │(Batches/│          │(Denied/ │
   │         │          │Transactions)     │  Soft)  │
   └─────────┘          └─────────┘          └─────────┘
```

### Implementation Priority
1. **Week 1:** Deploy basic Firestore rules (auth + admin check for all collections)
2. **Week 2:** Add ownership rules for `members`, `contributions`, `loans`
3. **Week 3:** Add validation in rules (`request.resource.data.amount > 0`)
4. **Week 4:** Convert all financial writes to transactions/batches
5. **Ongoing:** Audit log centralization, retention policies

---

## 14. Spark Plan Security Constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| **No Cloud Functions** | No callable functions for secure writes, no custom claims | Use client-side transactions/batches + Firestore rules |
| **No App Check (free tier)** | Limited abuse protection | Enable App Check (free for Spark) |
| **100 concurrent connections** | No realtime listeners for many users | Use `getDocs()` not `onSnapshot()` — **already compliant** |
| **50k reads/day** | Unbounded queries (10k) will hit limit | Add pagination, caching, limits |
| **20k writes/day** | Batch writes count as multiple | Optimize batch sizes |
| **1 GB storage** | Base64 images in Firestore | Move to Firebase Storage (not allowed) OR compress aggressively |

---

*End of SECURITY_AUDIT.md*