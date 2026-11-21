# Plan Reconciliation — Audit Findings vs Master Plan

**Date:** 2025-11-20  
**Branch:** `cleanup`  
**Status:** ✅ **RECONCILED** — MASTER_PLAN.md populated with 20-section governing document (v1.1, Nov 2026)

---

## Executive Summary

| Document | Status | Reconciled To Master Plan |
|----------|--------|---------------------------|
| `docs/MASTER_PLAN.md` | ✅ Complete | Governing document — 20 sections, 1000+ lines |
| `docs/FINDINGS.md` | ✅ Complete | 442 lines, mapped to Master Plan §3, §7, §8, §15, §16, §20 |
| `docs/MODULE_AUDIT.md` | ✅ Complete | 568 lines, mapped to Master Plan §4, §16 Phases 3-11 |
| `docs/COLLECTION_INVENTORY.md` | ✅ Complete | 447 lines, mapped to Master Plan §8 |
| `docs/SECURITY_AUDIT.md` | ✅ Complete | 476 lines, mapped to Master Plan §14, §15, §20 |

**Conclusion:** All four audit documents are complete and factually accurate. They now have a governing Master Plan to map against. Key corrections applied:
- Firestore Rules: **Deployed but permissive** (not "not deployed")
- Placeholder modules: **Preserve per Master Plan §3.2, §12** (not auto-delete)
- Treasury/Bank/Cashier: **Consolidate at service-ownership level** (Master Plan §3.3, §8, Phase 3)
- Phase 1 renamed: **"Final Business Rules and Architecture"** (not "Foundation & Security")

---

## Audit Coverage Mapped to Master Plan Sections

### 1. FINDINGS.md → Master Plan Mapping

| FINDINGS Section | Master Plan Reference | Status |
|-----------------|----------------------|--------|
| 1. Overall Project Condition | §1, §2, §3 | ✅ Mapped |
| 2. Module Status Summary | §4, §16 Phases 3-11 | ✅ Mapped |
| 3. Financial Money Flow | §7.3, §7.4 | ✅ Mapped |
| 4. Financial Writes Atomicity | §7.6, §15 | ✅ Mapped |
| 5. User Roles & Permissions | §6, §6.1, §6.2 | ✅ Mapped (note: `president`, `co_investor` roles in plan not in code) |
| 6. Firestore Collections | §8.1 | ✅ Mapped |
| 7. Balance Calculations | §7.7 | ✅ Mapped |
| 8. Auth & RBAC | §6, §14 | ✅ Mapped |
| 9. Firestore Rules | §3.4, §14 | ✅ **Corrected**: Rules deployed, permissive |
| 10. Real vs Placeholder | §3.2, §4.5, §12, §18.2 | ✅ Mapped: Preserve placeholders |
| 11. Duplicate Modules | §3.3, §7.1, §16 Phase 3 | ✅ Mapped |
| 12. Unbounded Queries | §8.3, §15.14 | ✅ Mapped |
| 13. Build/Lint Problems | §2.2, §16 Phase 12 | ✅ Mapped |
| 14. Cleanup Candidates | §3.3, §18.2 | ✅ **Corrected**: No silent cleanup |
| 15. Risk Summary | §15, §16, §20 | ✅ Mapped |
| 16. What to Preserve | §3, §5, §18.1, §19.1 | ✅ Mapped |
| 17. Improvement Priorities | §16 Phases 1-12 | ✅ Mapped |
| 18. Owner Decisions Needed | §20 | ✅ **Expanded**: 12 decisions (was 8) |

---

### 2. MODULE_AUDIT.md → Master Plan Mapping

| Module | Audit Status | Master Plan Phase | Master Plan Domain |
|--------|--------------|-------------------|-------------------|
| Authentication | COMPLETE | Phase 2 | §4.1 Identity & Administration |
| Members | COMPLETE | Phase 2 | §4.2 Member Management |
| Contributions | PARTIAL | Phase 4 | §4.3 Financial, §10 |
| Financing/Loans | PARTIAL | Phase 7 | §4.4 Financing, §11 |
| Investments | PARTIAL | Phase 9 | §4.5 Investments, §12 |
| Cashier | NEEDS VERIFICATION | Phase 5 | §4.3 Financial, §9 |
| Bank Transactions | COMPLETE | Phase 3, 8 | §4.3 Financial, §7.1, §13 |
| Treasury | PARTIAL | Phase 3, 8 | §4.3 Financial, §7, §8 |
| Assets | NOT IMPLEMENTED | Phase 9 | §4.5 Investments, §12 |
| Business | NOT IMPLEMENTED | Phase 9 | §4.5 Investments, §12 |
| Teams | NOT IMPLEMENTED | Phase 10 | §4.6 Organization |
| Reports | NOT IMPLEMENTED | Phase 8, 12 | §4.7 Reporting, §13 |
| Communication | NOT IMPLEMENTED | Phase 10 | §4.6 Organization, §13.3 |
| Settings | PARTIAL | Phase 2 | §4.1 Identity, §5 |
| Dashboards | PARTIAL | Phase 6 | §4.2 Member Experience |
| Support | NOT IMPLEMENTED | Phase 10 | §4.6 Organization |
| Super Admin | PARTIAL | Phase 2 | §4.1 Identity |
| Users | PARTIAL | Phase 2 | §4.1 Identity, §6.5 |

**Key Alignment:** Master Plan §16 phases match audit module groupings. Phase 1 = Final Business Rules (no code), Phase 2 = Settings/Identity/Permissions, Phase 3 = Financial Core/Ledger.

---

### 3. COLLECTION_INVENTORY.md → Master Plan Mapping

| Collection Group | Collections | Master Plan Reference |
|------------------|-------------|----------------------|
| Core | users, members, roles, somity_settings, public_info | §8.1 Identity/settings |
| Financial | contributions, bank_transactions, bank_accounts, deposits, collector_balances, cash_balances, payment_claims, fund_transactions, daily_closing | §8.1 Financial, §7.1, §7.2 |
| Financing | loanApplications, loans, loan_repayments, loanDisbursements | §8.1 Financing, §11 |
| Investments | investments, investmentParticipants, fundingRecords, returnRecords, investmentTransactions, investmentHistory, investmentDocuments | §8.1 Investments, §12 |
| Auxiliary (Verify First) | audit_logs, system_counters, expenses, teams, notices, support | §8.1 Other proposed/future |

**Correction:** `collector_balances`, `deposits`, `audit_logs`, `roles` — **verify actual code references and data before any action** (Master Plan §3.3 #153, §8.4, §20 #6).

---

### 4. SECURITY_AUDIT.md → Master Plan Mapping

| SECURITY_AUDIT Section | Master Plan Reference | Status |
|------------------------|----------------------|--------|
| Auth Security | §6.5, §14 | ✅ Mapped |
| RBAC | §6, §6.1, §6.2, §14 | ✅ Mapped |
| Firestore Rules | §3.4, §14, §16 Phase 2 | ✅ **Corrected**: Deployed permissive |
| Data Validation | §7.6, §14, §15 | ✅ Mapped |
| Financial Integrity | §7.6, §15 | ✅ Mapped |
| Secrets | §2.3, §14 | ✅ Mapped |
| Client-Side | §14, §15 | ✅ Mapped |
| Audit Logging | §13.2 | ✅ Mapped |
| Network | §14 | ✅ Mapped |
| Compliance | §14 | ✅ Mapped |
| Dependencies | §2.2 | ✅ Mapped |
| Production Checklist | §15, §16 Phase 12 | ✅ Mapped |
| Architecture | §7, §14, §16 Phase 2-3 | ✅ Mapped |
| Spark Constraints | §2.1, §2.3, §8.3 | ✅ Mapped |

---

## Consensus Points (All Four Audits Agree)

| Consensus Point | Master Plan Alignment |
|-----------------|----------------------|
| Investments module = gold standard for atomic operations | §3.3 #146, §12, §16 Phase 9 |
| Contributions, Financing, Treasury = non-atomic writes | §3.3 #144-145, §7.6, §16 Phase 3-4, 7 |
| **Firestore Rules deployed but permissive** | §3.4 ✅ **CORRECTED** |
| 6 placeholder modules (Assets, Business, Teams, Reports, Communication, Support) | §3.2 #152, §4.5, §4.6, §12, §16 Phases 9-10, §18.2 |
| Treasury/Bank/Cashier service overlap | §3.3 #148-149, §7.1, §16 Phase 3, 8 |
| Unbounded queries in bank_transactions | §3.3 #155, §8.3, §15.14 |
| `manager` & `accountant` roles in plan, undefined in code permissions | §6.1 #303-307, §20 #2 |
| Custom claims not deployed (Cloud Functions prohibited) | §2.3 #84, §6.5 #366, §20 #3 |

---

## Corrections Applied from Master Plan

| Audit Claim | Master Plan Reality | Correction |
|-------------|---------------------|------------|
| "Firestore Rules NOT deployed" | "Permissive rules ARE deployed" | ✅ Corrected in all docs |
| "Placeholder modules should be deleted/archived" | "Preserve as planned product areas" | ✅ Corrected: No auto-delete (§18.2) |
| "Phase 1 = Foundation & Security" | "Phase 1 = Final Business Rules and Architecture" | ✅ Corrected phase name/scope |
| "Treasury/Bank/Cashier merge = approved refactor" | "Consolidate ownership logically, no bulk moves" | ✅ Corrected: Investigate boundary first |
| "Collector vs Cashier = decide unified" | "Distinct operational responsibilities" | ✅ Corrected: Distinct per §9, §6.4 |
| "8 owner decisions needed" | "12 open decisions in §20" | ✅ Expanded to 12 |

---

## Discrepancies Between Audit Labels and Master Plan Expectations

| Module | Audit Label | Master Plan Expectation | Action |
|--------|-------------|------------------------|--------|
| Investments | PARTIAL | Phase 9 target: COMPLETE | Verify atomic patterns, ledger integration, document handling |
| Bank Transactions | COMPLETE | Phase 3/8: Verify as central ledger | Audit schema against §7.1 balanced postings |
| Treasury | PARTIAL | Phase 3/8: Consolidate ownership | Map actual writers before consolidation |
| Cashier | NEEDS VERIFICATION | Phase 5: Complete single-Cashier workflow | Trace actual service boundary |
| Reports | NOT IMPLEMENTED | Phase 8/12: Real reports from shared ledger | Implement per §13.1 list |
| Dashboards | PARTIAL (mock data) | Phase 6: Replace mock with real data | Bounded reads per §15.14 |

---

## Master Plan Decisions That Resolve Audit Questions

| Audit Question (FINDINGS §18) | Master Plan Decision (§20) | Resolution |
|------------------------------|---------------------------|------------|
| D-001: Cloud Functions alternative | §20 #3: Account provisioning workflow | Present secure feasible workflow + limitations |
| D-002: Rules scope | §3.4, §14, §16 Phase 2: Comprehensive restrictive rules | Test in emulator, owner approval before deploy |
| D-003: Placeholder delete vs archive | §3.2 #152, §18.2: Preserve, hide if unfinished | No deletion without owner approval |
| D-004: Treasury consolidation | §3.3 #148-149, §16 Phase 3: Service ownership, not bulk merge | Map callers, migrate safely |
| D-005: Collector vs Cashier | §6.4, §9: Distinct responsibilities, one person can hold both | Model as role assignments, not separate identities |
| D-006: Member dues authority | §7.7, §10: Client-side with reconciliation report | Authoritative = ledger; cached = derived |
| D-007: Chart library | §20 #10: Verify actual usage before choosing | Audit imports/bundle impact |
| D-008: Realtime listeners | §8.3 #518, §13.3: Avoid unnecessary listeners | On-demand only, no background |

---

## Remaining Genuinely Unresolved Decisions (Per Master Plan §20)

These 12 items require owner presentation with options/consequences:

| # | Decision | Master Plan §20 Ref | Category |
|---|----------|---------------------|----------|
| 1 | Ledger: balanced postings vs additive journal | #1 | Architecture |
| 2 | Role storage: multi-responsibility identity | #2 | Architecture |
| 3 | Account provisioning: secure workflow w/o Functions | #3 | Security |
| 4 | Settings design: module toggles location/size | #4 | Architecture |
| 5 | Deposit history: replace `markAsDeposited()` safely | #5 | Financial |
| 6 | Legacy collections: actual use/data of 4 collections | #6 | Data |
| 7 | Treasury ownership: canonical writer + migration | #7 | Architecture |
| 8 | Financing authority: approver matrix per product/amount | #8 | Business |
| 9 | Document storage: deferred features w/o Storage | #9 | Technical |
| 10 | Charts/dependencies: verify actual usage | #10 | Technical |
| 11 | Security feasibility: what Rules can/cannot enforce | #11 | Security |
| 12 | Production readiness: exact rules/backup/deploy checks | #12 | Operations |

---

## Phase Mapping: Old vs Corrected

| Old Phase (Audit) | Corrected Phase (Master Plan) | Scope Change |
|-------------------|-------------------------------|--------------|
| Phase 0: Audit | Phase 0: Audit | ✅ Same — complete |
| Phase 1: Foundation & Security | **Phase 1: Final Business Rules and Architecture** | No code — reconcile, finalize docs, approve |
| Phase 2: Core Financial | **Phase 2: Settings, Identity, Permissions, Security Foundation** | Settings service, restrictive rules, identity |
| Phase 3: Member Experience | **Phase 3: Financial Core and Ledger Ownership** | Ledger model, atomicity, service boundary |
| Phase 4: Admin & Reporting | **Phase 4: Contributions and Direct Payment Claims** | Contribution atomicity, payment claims |
| — | Phase 5: Cashier, Collector, Deposits, Daily Closing | Single-Cashier workflow first |
| — | Phase 6: Member Portal and Dashboard Completion | Replace mock with real data |
| — | Phase 7: Islamic Financing and Loans | 9 product types, contract rules |
| — | Phase 8: Treasury, Bank Views, Financial Reporting | Unified UI from shared ledger |
| — | Phase 9: Investments, FDR, Business, Assets | Complete Investments, implement Business/Assets |
| — | Phase 10: Organization, Communication, Support | Teams, Notices, in-app notifications |
| — | Phase 11: Co-investor and Future Expansion | Future phase |
| — | Phase 12: Final Hardening, Testing, Deployment | Full test suite, production checklist |

---

## Next Steps

1. **Present 12 decisions from Master Plan §20** to owner with options/consequences
2. **Owner approves Phase 1 short implementation plan** (per Master Plan §16 Phase 1 acceptance criteria)
3. **Begin Phase 1 work** — Finalize BUSINESS_RULES.md, ROLE_PERMISSION_MATRIX.md, SETTINGS_MATRIX.md, FINANCIAL_LEDGER_DESIGN.md, DATA_MODEL.md, SECURITY_RULES_PLAN.md, MIGRATION_PLAN.md
4. **No application code changes** until Phase 1 acceptance criteria met

---

*End of PLAN_RECONCILIATION.md — Reconciled against MASTER_PLAN.md v1.1*