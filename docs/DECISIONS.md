# Decisions Log — Al Amin Somity Project

**Last Updated:** 2025-11-20  
**Governed by:** `docs/MASTER_PLAN.md` v1.1 (20 sections, populated Nov 2026)  
**Classification Scheme:** CONFIRMED BY OWNER | TECHNICAL INVESTIGATION REQUIRED | OWNER DECISION REQUIRED

---

## Decision Classification Summary

| Category | CONFIRMED BY OWNER | TECHNICAL INVESTIGATION REQUIRED | OWNER DECISION REQUIRED | Total |
|----------|-------------------|---------------------------------|------------------------|-------|
| Architecture | 2 | 3 | 1 | 6 |
| Security | 1 | 2 | 2 | 5 |
| Module Scope | 2 | 0 | 2 | 4 |
| Financial Operations | 2 | 2 | 1 | 5 |
| Technical Stack | 0 | 2 | 0 | 2 |
| Data | 1 | 2 | 1 | 4 |
| Operations | 1 | 0 | 1 | 2 |
| **Total** | **9** | **11** | **8** | **28** |

*Note: C-001–C-012 are CONFIRMED BY OWNER (12 decisions from Master Plan §6.4, §9, §20). T-001–T-012 are TECHNICAL INVESTIGATION REQUIRED (12 from Master Plan §20). O-001–O-008 are OWNER DECISION REQUIRED (8 from Master Plan §20, §16). Classification refined: C-003/C-004/C-005/C-007/C-011/C-012 re-categorized per actual content.*

---

## CONFIRMED BY OWNER (From Master Plan)

*These are decisions the owner has already made in MASTER_PLAN.md. Do NOT re-litigate.*

| ID | Decision | Master Plan Ref | Resolution |
|----|----------|-----------------|------------|
| C-001 | **Cashier & Collector: Distinct operational responsibilities** | §6.4, §9, §20 #5 | One person can hold both roles; model as role assignments, not separate identities |
| C-002 | **Placeholder modules: Preserve, do not delete** | §3.2 #152, §18.2 | Keep 6 modules (Assets, Business, Teams, Reports, Communication, Support) hidden if unfinished |
| C-003 | **No Cloud Functions: Accept constraint** | §2.3 #84, §20 #3 | Account provisioning must use alternative workflow |
| C-004 | **No Firebase Storage: Accept constraint** | §2.3 #85, §20 #9 | Document uploads deferred; metadata only in Firestore |
| C-005 | **Spark plan only: 50k reads / 20k writes / 100 connections** | §2.1 #66 | All architecture must fit within limits |
| C-006 | **One module/workstream at a time** | §3.1 #136, §16, §18.1 | Sequential implementation only |
| C-007 | **Firestore Rules: Intentionally permissive deployed** | §3.4 #154, §14 | `allow read, write: if true` — tighten in Phase 2 |
| C-008 | **Settings-driven: Main Settings ON/OFF gates modules** | §5, §5.1, §5.2 | Every module must respect `somity_settings` toggles |
| C-009 | **Investments atomic pattern = gold standard** | §3.3 #146, §12, §16 Phase 9 | Other financial modules must match this pattern |
| C-010 | **Treasury/Bank/Cashier: Consolidate ownership, not bulk merge** | §3.3 #148-149, §16 Phase 3 | Map callers, migrate safely per D-007 |
| C-011 | **Phase 1 = Final Business Rules and Architecture (no code)** | §16 Phase 1 | Reconcile docs, finalize designs, owner approval before any code |
| C-012 | **Master Plan 12-phase roadmap governs implementation** | §16 | Old 4-phase audit model superseded |

---

## TECHNICAL INVESTIGATION REQUIRED

*These require code/data analysis before owner can decide. Present findings + options.*

| ID | Decision | Master Plan Ref | Investigation Needed |
|----|----------|-----------------|---------------------|
| T-001 | **Ledger model: Balanced double-entry postings vs additive journal** | §20 #1 | Can `bank_transactions` support balanced postings? Impact on existing 15k+ docs? |
| T-002 | **Role storage: Multi-responsibility identity (user holds Cashier + Collector)** | §20 #2 | Current `roles` collection design vs `userRoles` subcollection? Migration path? |
| T-003 | **Account provisioning: Secure workflow without Cloud Functions** | §20 #3 | Can admin-create-user + email-link sign-in work? Custom claims alternative? |
| T-004 | **Settings design: Module toggles location, granularity, size impact** | §20 #4 | Audit `somity_settings/config` document size vs 1MB limit? Per-module subcollections? |
| T-005 | **Deposit history: Replace `markAsDeposited()` with ledger entries safely** | §20 #5 | Current `deposits` collection usage? How to migrate without data loss? |
| T-006 | **Legacy collections: Actual use/data of `collector_balances`, `deposits`, `audit_logs`, `roles`** | §20 #6 | Read actual documents, check code references, measure volume |
| T-007 | **Treasury ownership: Canonical writer + safe migration plan** | §20 #7 | Which services write to `bank_accounts`, `cash_balances`, `bank_transactions`, `fund_transactions`? |
| T-008 | **Financing authority: Approver matrix per product/amount tier** | §20 #8 | Map 9 Islamic products × amount tiers × required roles |
| T-009 | **Security feasibility: What Firestore Rules CAN/CANNOT enforce** | §20 #11 | Test in emulator: cross-doc validation, computed fields, role checks |
| T-010 | **Chart library: Verify actual usage before choosing** | §20 #10 | Bundle analyzer: `recharts` vs `chart.js` import trees, lazy-load impact |
| T-011 | **Realtime listeners: Necessity vs Spark quota (100 concurrent)** | §20 #11, §8.3 #518 | Audit current listeners; model connection count at 500 members |
| T-012 | **Production readiness: Exact rules/backup/deploy checklist** | §20 #12 | Document emulator test matrix, backup schedule, rollback procedure |

---

## OWNER DECISION REQUIRED

*These need owner's business judgment. Present options + consequences clearly.*

| ID | Decision | Master Plan Ref | Options to Present |
|----|----------|-----------------|-------------------|
| O-001 | **Firestore Rules deployment scope & timeline** | §3.4, §14, §16 Phase 2 | Phased (Week 1 auth+admin, Week 2 ownership, Week 3 validation) vs All-at-once |
| O-002 | **Module ON/OFF flags structure in `somity_settings`** | §5.1, §5.2 | Flat flags vs nested sections; default ON vs OFF for new modules |
| O-003 | **Contribution atomicity: Transaction boundary (3 docs) vs phased** | §7.6, §10, §16 Phase 4 | Full `runTransaction` (3 docs) vs `writeBatch` + compensating |
| O-004 | **Financing/Loan atomicity: Transaction boundary (2 docs each op)** | §11, §16 Phase 7 | Approve/disburse/repay each atomic? Or batch related ops? |
| O-005 | **Investment document handling: Metadata-only vs Base64 vs External** | §12, §20 #9 | A: Metadata only (audit trail) B: Base64 in Firestore C: External free CDN |
| O-006 | **Member dues authority: Client-side + reconciliation vs Rules validation** | §7.7, §10, §20 #5 | D: Client + monthly admin report vs B: Rules attempt (limited) |
| O-007 | **Cashier/Collector daily closing: Mandatory workflow or optional?** | §9, §16 Phase 5 | Enforce via Rules? UI-only? What if skipped? |
| O-008 | **Report types priority for Phase 8/12** | §13.1, §16 Phase 8, 12 | Top 5 from §13.1 list: Financial Summary, Member Ledger, Loan Portfolio, Investment Returns, Audit Trail |

---

## Decision Tracking Template

When investigation complete or owner decides, update:

```markdown
### [ID]: [Title]
**Classification:** CONFIRMED BY OWNER | TECHNICAL INVESTIGATION REQUIRED | OWNER DECISION REQUIRED
**Decision:** [Option letter + description OR Investigation result]
**Date:** YYYY-MM-DD
**Rationale:** [Owner's reasoning OR Technical finding summary]
**Impact:** [Modules affected, implementation changes, migration needed]
**Status:** ✅ CONFIRMED | 🔬 INVESTIGATING | ⏳ PENDING OWNER
```

---

## Mapping: Old Audit Decisions → New Classification

| Old ID | Old Title | New Classification | New ID | Notes |
|--------|-----------|-------------------|--------|-------|
| D-001 | Cloud Functions alternative | TECHNICAL INVESTIGATION REQUIRED | T-003 | Must investigate feasible workflows first |
| D-002 | Firestore Rules scope | OWNER DECISION REQUIRED | O-001 | Owner chooses phased vs all-at-once |
| D-003 | Placeholder delete vs archive | CONFIRMED BY OWNER | C-002 | Master Plan §3.2 #152, §18.2 |
| D-004 | Treasury consolidation | TECHNICAL INVESTIGATION REQUIRED | T-007 | Must map actual writers first |
| D-005 | Collector vs Cashier | CONFIRMED BY OWNER | C-001 | Master Plan §6.4, §9 distinct |
| D-006 | Member dues authority | OWNER DECISION REQUIRED | O-006 | Client+report vs Rules attempt |
| D-007 | Chart library | TECHNICAL INVESTIGATION REQUIRED | T-010 | Must verify actual usage first |
| D-008 | Realtime listeners need | TECHNICAL INVESTIGATION REQUIRED | T-011 | Must model connection count first |
| D-009 | Investment document storage | OWNER DECISION REQUIRED | O-005 | Metadata/Base64/External options |
| — | Ledger model | TECHNICAL INVESTIGATION REQUIRED | T-001 | New from Master Plan §20 #1 |
| — | Role storage multi-responsibility | TECHNICAL INVESTIGATION REQUIRED | T-002 | New from Master Plan §20 #2 |
| — | Settings design toggles | TECHNICAL INVESTIGATION REQUIRED | T-004 | New from Master Plan §20 #4 |
| — | Deposit history migration | TECHNICAL INVESTIGATION REQUIRED | T-005 | New from Master Plan §20 #5 |
| — | Legacy collections verification | TECHNICAL INVESTIGATION REQUIRED | T-006 | New from Master Plan §20 #6 |
| — | Financing approver matrix | TECHNICAL INVESTIGATION REQUIRED | T-008 | New from Master Plan §20 #8 |
| — | Security Rules feasibility | TECHNICAL INVESTIGATION REQUIRED | T-009 | New from Master Plan §20 #11 |
| — | Production readiness checklist | TECHNICAL INVESTIGATION REQUIRED | T-012 | New from Master Plan §20 #12 |

---

## Next Actions

1. **Immediate (Week 1):** Assign T-001 through T-012 to technical investigation
2. **Week 2:** Present O-001 through O-008 to owner with T-0xx findings
3. **Week 3:** Owner confirms O-0xx decisions
4. **Phase 1 Start:** Begin documentation deliverables per Master Plan §16 Phase 1

---

*End of DECISIONS.md — Reclassified per MASTER_PLAN.md v1.1 §20*