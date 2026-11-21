# Business Rules — Al Amin Somity Project

**Version:** 1.0  
**Last Updated:** 2025-11-20  
**Governed by:** `docs/MASTER_PLAN.md` v1.1 §5, §7, §10, §11, §12, §13  
**Status:** Phase 1.1 Deliverable — Owner Review Required

---

## 1. Contribution Rules (Monthly Dues) — §7

### 1.1 Fee Structure
| Parameter | Rule | Config Source |
|-----------|------|---------------|
| **Monthly fee amount** | Fixed per member, set in Settings → Contributions | `somity_settings.contributions.monthlyFee` |
| **Fee types** | `monthly` \| `advance` \| `yearly` \| `arrear` \| `multiple` \| `loan` | `FeeType` enum |
| **Payment methods** | `cash` \| `bank` \| `bikash` \| `nogod` \| `rocket` \| `other` | `PaymentType` enum |
| **Collection status** | `collected` (cash in hand) → `deposited` (bank) → `transferred` (somity bank) | `CollectionStatus` enum |

### 1.2 Due Calculation
- **Monthly due** = `monthlyFee` × months not paid
- **Advance payment** allowed for future months (max 12 months ahead per Settings)
- **Arrear tracking** per member per month — no interest on late fees (Islamic compliance)
- **Partial payment** allowed; remainder stays as arrear

### 1.3 Receipt & Reconciliation
- **Receipt ID format:** `RCPT-{YYYYMMDD}-{SEQ}` (auto-generated)
- **Collector** records collection → **Cashier** verifies deposit → **Daily Closing** reconciles
- **Duplicate prevention:** Same member + same month + same year = blocked (client + server check)

### 1.4 Settings Controls (ON/OFF)
| Flag | Default | Effect When OFF |
|------|---------|-----------------|
| `contributions.enabled` | true | Module hidden, no collections |
| `contributions.advancePaymentAllowed` | true | No advance payments accepted |
| `contributions.partialPaymentAllowed` | true | Only full month payments |
| `contributions.maxAdvanceMonths` | 12 | Cap advance months |

---

## 2. Islamic Financing Rules — §11 (9 Products)

### 2.1 Product Parameters (Per Product)

| Product | Arabic | Key Parameters | Profit/Return Basis |
|---------|--------|----------------|---------------------|
| **Murabaha** | مرابحة | Asset cost, profit rate/margin, duration, installment freq | Cost-plus markup (fixed profit) |
| **Musharaka** | مشاركة | Total capital, partner shares, profit sharing ratio, duration | Profit sharing per agreed ratio |
| **Mudaraba** | مضاربة | Capital (Rab-ul-mal), manager (Mudarib), profit sharing ratio | Profit sharing (capital provider bears loss) |
| **Ijarah** | إجارة | Asset value, rental amount, lease period, maintenance responsibility | Fixed rental payments |
| **Istisna** | استصناع | Total cost, profit rate, delivery schedule, specifications | Cost-plus on manufactured goods |
| **Salam** | سلام | Total price, delivery period, commodity specs, advance payment | Advance payment for future delivery |
| **Tawarruq** | تورق | Total cost, profit rate, duration, commodity type | Cost-plus via commodity purchase/sale |
| **Qard Hasanah** | قرض حسنة | Loan amount, service fee %, duration, no profit | Service fee only (no profit) |
| **Kafalah** | كفالة | Guarantee amount, duration, fee % | Guarantee fee (no profit on principal) |

### 2.2 Common Financing Rules
| Rule | Detail |
|------|--------|
| **Approval authority** | Per product × amount tier (T-008 investigation pending) |
| **Disbursement** | Only after approval; down payment optional per product |
| **Repayment** | Installment schedule calculated at disbursement (not approval) |
| **Early settlement** | Allowed; profit recalculation per product rules |
| **Default handling** | Configurable grace period → restructuring → recovery |

### 2.3 Atomicity Requirement (C-009, O-004)
| Operation | Documents | Must Use |
|-----------|-----------|----------|
| Approve application | `loanApplications` (update) + `loans` (create) | `runTransaction` |
| Record disbursement | `loanDisbursements` (create) + `loans` (update) | `runTransaction` |
| Add repayment | `loan_repayments` (create) + `loans` (update) | `runTransaction` |

> **Gold Standard:** `investmentOps.ts` uses `runTransaction` for 4+ docs per operation.

---

## 3. Investment Rules — §12

### 3.1 Investment Categories
| Category | Description | Typical Assets |
|----------|-------------|----------------|
| `fdr` | Fixed Deposit Receipt | Bank FDR, Govt bonds |
| `business` | Business venture | Shops, factories, trade |
| `asset` | Physical asset | Land, building, vehicle |
| `project` | Development project | Construction, infrastructure |
| `other` | Miscellaneous | Gold, equity, crypto (if allowed) |

### 3.2 Participant Types
- **Somity** (mandatory, one per investment)
- **Member** (individual members)
- **External** (non-member investors)

### 3.3 Status Workflow
```
Draft → Pending Review → Approved → Funding → Active → Return Received → Matured → Settlement → Closed
                    ↓ Rejected
                    ↓ Cancelled
                    ↓ Withdrawn
```

### 3.4 Funding & Return Rules
- **Funding allowed:** Only in `Approved`, `Funding`, `Active` status
- **Return allowed:** Only in `Active`, `Return Received`, `Matured`, `Settlement` status
- **Somity outflow:** Only Somity's own committed amount counts as outflow
- **Return inflow:** Received by Somity or investment as whole = Inflow

### 3.5 Soft Delete Rule
- **Blocked if:** Any participant `funded_amount > 0` OR `actual_return_amount > 0`
- **Action:** Set `is_deleted=true` + history entry only

### 3.6 Atomicity (Gold Standard C-009)
| Operation | Documents (single transaction/batch) |
|-----------|--------------------------------------|
| Create investment | `investments` + `participants` + `history` (batch) |
| Change status | `investments` + `history` (transaction) |
| Record funding | `fundingRecords` + `participants` + `investmentTransactions` + `history` (transaction) |
| Record return | `returnRecords` + `investments` + `investmentTransactions` + `history` (transaction) |
| Soft delete | `investments` + `history` (transaction) |

---

## 4. Treasury & Banking Rules — §8, §9

### 4.1 Unified Ledger Model (`bank_transactions`)
| Field | Rule |
|-------|------|
| **holdingType** | `collector` (cash/mobile/collector bank) \| `somity_bank` (deposited to official account) |
| **direction** | `in` (contribution, loan repayment, investment return) \| `out` (disbursement, expense, investment funding) |
| **sourceCollection** | Origin collection: `contributions`, `loans`, `loan_repayments`, `investments`, `expenses` |
| **destinationType** | `somity_bank` \| `collector_cash` \| `collector_bank` \| `mobile_wallet` \| `member_account` \| `expense_payment` |

### 4.2 Cashier vs Collector (C-001)
| Role | Responsibility | holdingType |
|------|----------------|-------------|
| **Collector** | Field collection from members (cash/mobile) | `collector` |
| **Cashier** | Bank deposits, withdrawals, daily closing | `somity_bank` / `collector_cash` |
| **One person** | Can hold both roles simultaneously | Context-dependent |

### 4.3 Daily Closing (O-007)
- **Mandatory workflow** (pending owner decision)
- **Reconciliation:** Collector cash + Cashier bank = Total expected per contributions
- **Variance handling:** Investigation → adjustment entry with reason

### 4.4 Fund Transfers
- **Collector → Cashier:** Cash handover (creates `bank_transactions` with `holdingType: collector` → `somity_bank`)
- **Cashier → Bank:** Deposit to somity bank account
- **Atomic:** `writeBatch` (Treasury `financeService.ts` model)

---

## 5. Profit Sharing & Distribution — §10, §12

### 5.1 Investment Profit Distribution
| Participant | Share Calculation |
|-------------|-------------------|
| **Somity** | `participation_pct` × `actual_return_amount` |
| **Member** | `participation_pct` × `actual_return_amount` |
| **External** | `participation_pct` × `actual_return_amount` |

### 5.2 Financing Profit (per product)
| Product | Profit to Somity | Profit to Member |
|---------|------------------|------------------|
| Murabaha | Markup amount | N/A (member pays markup) |
| Musharaka | `profitSharingRatio` % | `100 - profitSharingRatio` % |
| Mudaraba | `rabulMalShare` % (capital provider) | Manager share |
| Ijarah | Rental income | N/A |
| Istisna/Tawarruq | Markup | N/A |
| Salam | Price differential | N/A |
| Qard Hasanah | Service fee only | N/A |
| Kafalah | Guarantee fee | N/A |

---

## 6. Member Rules — §6

### 6.1 Membership Types
| Type | Description | Fee Liability |
|------|-------------|---------------|
| `regular` | Standard member | Full monthly fee |
| `special` | Special category (e.g., honorary) | Per Settings config |

### 6.2 Status Lifecycle
```
pending → verified → active → inactive → terminated
                ↓ rejected
```

### 6.3 Role Assignments (Multi-Responsibility)
- One member can hold **multiple roles** simultaneously
- Roles: `super_admin`, `admin`, `cashier`, `manager`, `accountant`, `collector`, `member`
- **President** — NOT in auth system (UI only, see DECISIONS.md)

---

## 7. Settings-Driven Gates (C-008) — §5

**Every module MUST respect these ON/OFF flags:**

| Module | Settings Section | Flag |
|--------|------------------|------|
| Contributions | `contributions` | `enabled` |
| Financing/Loans | `financing` | `enabled` |
| Investments | `investments` | `enabled` |
| Treasury | `treasury` | `enabled` |
| Cashier | `cashier` | `enabled` |
| Collector | `collector` | `enabled` |
| Teams | `teams` | `enabled` |
| Communication | `communication` | `enabled` |
| Support | `support` | `enabled` |
| Assets | `assets` | `enabled` |
| Business | `business` | `enabled` |
| Reports | `reports` | `enabled` |

> **Implementation Rule:** Before marking any module COMPLETE, verify its Settings flag is wired and respected.

---

## 8. Limits & Constraints (Spark Plan) — C-005

| Resource | Limit | Monitoring |
|----------|-------|------------|
| Daily reads | 50,000 | Pagination + query limits |
| Daily writes | 20,000 | Batch writes, avoid redundant updates |
| Storage | 1 GiB | Base64 images → metadata only (C-004) |
| Document size | 1 MB | `somity_settings` config < 500 KB target |

---

## 9. Audit & Compliance

| Requirement | Implementation |
|-------------|----------------|
| **Transaction audit trail** | Every financial write → `history` subcollection + `bank_transactions` |
| **Role change audit** | `member` role changes → history in member doc |
| **Settings change audit** | `somity_settings` updates → admin log (planned) |
| **Soft delete only** | No hard deletes on financial data (investments, loans, contributions) |

---

## 10. Open Decisions Requiring Owner Input

| ID | Decision | Options |
|----|----------|---------|
| O-001 | Firestore Rules deployment scope | Phased vs All-at-once |
| O-002 | Module flags structure | Flat vs nested; default ON vs OFF |
| O-003 | Contribution atomicity boundary | Full transaction (3 docs) vs batch + compensating |
| O-004 | Financing atomicity boundary | Each op atomic vs batch related |
| O-005 | Investment document storage | Metadata only / Base64 / External CDN |
| O-006 | Member dues authority | Client-side + reconciliation vs Rules validation |
| O-007 | Daily closing mandatory? | Enforced by Rules / UI-only / Optional |
| O-008 | Report priority (Phase 8/12) | Top 5 from Master Plan §13.1 |

---

## 11. Technical Investigations Needed (Block Rules Finalization)

| ID | Investigation | Impact on Rules |
|----|---------------|-----------------|
| T-001 | Ledger: Balanced vs additive postings | FINANCIAL_LEDGER_DESIGN.md |
| T-002 | Role storage: Multi-responsibility design | ROLE_PERMISSION_MATRIX.md |
| T-003 | Account provisioning without Cloud Functions | Auth workflow |
| T-004 | Settings document size vs 1MB limit | SETTINGS_MATRIX.md |
| T-005 | Deposit history migration (`markAsDeposited` → ledger) | MIGRATION_PLAN.md |
| T-006 | Legacy collections actual use/volume | MIGRATION_PLAN.md |
| T-007 | Treasury canonical writer mapping | Service consolidation |
| T-008 | Financing approver matrix per product/tier | Approval workflow |
| T-009 | Firestore Rules feasibility (cross-doc, computed) | SECURITY_RULES_PLAN.md |
| T-010 | Chart library actual usage | Bundle optimization |
| T-011 | Realtime listeners vs connection quota | Real-time architecture |
| T-012 | Production readiness checklist | Deployment plan |
| T-013 | Contribution atomicity exact boundary | BUSINESS_RULES.md §1.4 |
| T-014 | Financing atomicity exact boundary | BUSINESS_RULES.md §2.3 |

---

## 12. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-20 | Assistant | Initial draft from Master Plan §5,7,8,9,10,11,12,13 + audit findings |

---

**Next Step:** Owner review → approve → proceed to **ROLE_PERMISSION_MATRIX.md** (1.2)