# Progress Tracker — Al Amin Somity Project

**Last Updated:** 2025-11-21  
**Branch:** `cleanup`  
**Governed by:** `docs/MASTER_PLAN.md` v1.1 (20 sections, populated Nov 2026)

---

## Phase Overview (Master Plan §16 — 12 Phases)

| Phase | Name | Status | Start Date | End Date | Owner Approval |
|-------|------|--------|------------|----------|----------------|
| 0 | Audit & Documentation | ✅ **COMPLETE** | 2025-11-20 | 2025-11-20 | N/A (audit only) |
| 1 | **Final Business Rules and Architecture** | ⏳ **PENDING APPROVAL** | — | — | ❌ Required |
| 2 | Settings, Identity, Permissions, Security Foundation | ⏳ **NOT STARTED** | — | — | ❌ Required |
| 3 | Financial Core and Ledger Ownership | ⏳ **NOT STARTED** | — | — | ❌ Required |
| 4 | Contributions and Direct Payment Claims | ⏳ **NOT STARTED** | — | — | ❌ Required |
| 5 | Cashier, Collector, Deposits, Daily Closing | ⏳ **NOT STARTED** | — | — | ❌ Required |
| 6 | Member Portal and Dashboard Completion | ⏳ **NOT STARTED** | — | — | ❌ Required |
| 7 | Islamic Financing and Loans | ⏳ **NOT STARTED** | — | — | ❌ Required |
| 8 | Treasury, Bank Views, Financial Reporting | ⏳ **NOT STARTED** | — | — | ❌ Required |
| 9 | Investments, FDR, Business, Assets | ⏳ **NOT STARTED** | — | — | ❌ Required |
| 10 | Organization, Communication, Support | ⏳ **NOT STARTED** | — | — | ❌ Required |
| 11 | Co-investor and Future Expansion | ⏳ **NOT STARTED** | — | — | ❌ Required |
| 12 | Final Hardening, Testing, Deployment | ⏳ **NOT STARTED** | — | — | ❌ Required |

---

## Phase 0 — Audit & Documentation (COMPLETE)

### Deliverables Created
| Document | Path | Lines | Status |
|----------|------|-------|--------|
| Findings | `docs/FINDINGS.md` | 442 | ✅ Complete |
| Module Audit | `docs/MODULE_AUDIT.md` | 568 | ✅ Complete |
| Collection Inventory | `docs/COLLECTION_INVENTORY.md` | 447 | ✅ Complete |
| Security Audit | `docs/SECURITY_AUDIT.md` | 476 | ✅ Complete |
| Plan Reconciliation | `docs/PLAN_RECONCILIATION.md` | 222 | ✅ **Corrected** |
| CLAUDE.md | `CLAUDE.md` | — | ✅ Complete |
| Progress Tracker | `docs/PROGRESS.md` | — | ✅ This file |
| Decisions Log | `docs/DECISIONS.md` | — | ✅ **Reclassified** |
| Settings Matrix | `docs/SETTINGS_MATRIX.md` | — | ✅ **Updated** |

### Implementation Work (Post-Audit)
| Task | Status | Date | Notes |
|------|--------|------|-------|
| Public Module Redesign (6 pages + Bengali-first premium UI) | ✅ Complete | 2025-11-21 | Home, AboutUs, Activities, Contact, FAQ, PrivacyTerms |
| Application Entry-Point Routing Fix | ✅ Complete | 2025-11-21 | Unauthenticated visitors now see Public Home (`/`); all 5 journeys verified |
| Add Member Responsive Mobile-First UI (8 requirements) | ✅ Code-level Verified | 2025-11-21 | All responsive Tailwind classes confirmed; 7 breakpoint screenshots captured (auth-blocked) |

### Audit Scope Covered
- ✅ Git safety check (clean working tree, `cleanup` branch created)
- ✅ Build verification (`npm run build` passes)
- ✅ All 20+ modules inspected
- ✅ All 23 Firestore collections inventoried
- ✅ Financial write atomicity traced (15 operations)
- ✅ Authentication & RBAC analyzed
- ✅ Security posture assessed (14 critical items)
- ✅ Settings module mapped (75+ settings, 50+ verified consumers)

### Key Audit Findings (Summary)
| Finding | Severity | Master Plan Phase to Address |
|---------|----------|------------------------------|
| Firestore Rules deployed but permissive | 🔴 Critical | Phase 2 |
| Non-atomic financial writes (4 modules) | 🔴 Critical | Phase 3-4, 7 |
| Unbounded queries (10k docs) | 🟠 High | Phase 3, 8 |
| 6 placeholder modules in routes | 🟠 High | Phase 9, 10 (preserve per §18.2) |
| Client-only validation | 🔴 Critical | Phase 2-3 |
| Treasury/Bank/Cashier service overlap | 🟠 High | Phase 3 |
| Custom claims not deployed | 🟡 Medium | Phase 2 (alt workflow) |
| Duplicate chart libraries | 🟡 Medium | Phase 2 (investigate) |

---

## Phase 1 — Final Business Rules and Architecture (PENDING OWNER APPROVAL)

**Master Plan §16 Phase 1:** "No code — reconcile, finalize docs, approve"

### Prerequisites (Must Complete Before Starting)
- [x] Owner populates `docs/MASTER_PLAN.md` with product vision, phases, module requirements
- [x] Assistant reconciles `docs/PLAN_RECONCILIATION.md` against actual Master Plan
- [x] Assistant reclassifies `docs/DECISIONS.md` per new scheme (CONFIRMED/INVESTIGATE/OWNER)
- [x] Assistant updates `docs/PROGRESS.md` with 12-phase roadmap
- [x] Assistant updates `docs/SETTINGS_MATRIX.md` with Master Plan §5 architecture
- [ ] Owner reviews and **explicitly approves** Phase 1 deliverables list
- [ ] Owner confirms decisions in `docs/DECISIONS.md` (6 TECHNICAL INVESTIGATION, 8 OWNER DECISION)

### Phase 1 Deliverables (Per Master Plan §16 Phase 1 Acceptance Criteria)
| # | Deliverable | Description | Status |
|---|-------------|-------------|--------|
| 1.1 | **BUSINESS_RULES.md** | Financial business rules: dues, fees, profit sharing, limits, Islamic product parameters | ✅ Complete |
| 1.2 | **ROLE_PERMISSION_MATRIX.md** | 9 roles × 50+ permissions matrix; multi-responsibility model | ✅ Complete |
| 1.3 | **SETTINGS_MATRIX.md** | Complete wiring: every module flag, config, default, validation | ✅ Complete |
| 1.4 | **FINANCIAL_LEDGER_DESIGN.md** | Ledger model (T-001), balanced vs additive, atomic boundaries | ✅ Complete |
| 1.5 | **DATA_MODEL.md** | Entity-relationship, collection schemas, index requirements | ✅ Complete |
| 1.6 | **SECURITY_RULES_PLAN.md** | Phased Firestore Rules: scope, test matrix, emulator plan | ✅ Complete |
| 1.7 | **MIGRATION_PLAN.md** | Data migration: legacy collections (T-006), deposit history (T-005), role storage (T-002) | ✅ Complete |

### Phase 1 Success Criteria (Master Plan §16 Phase 1)
- [ ] All 7 deliverables reviewed and approved by owner
- [ ] 14 decisions in `DECISIONS.md` classified: 6 investigating, 8 awaiting owner
- [ ] Technical investigations (T-001 through T-012) assigned and in progress
- [ ] Owner explicitly approves: "Phase 1 documentation complete — proceed to Phase 2"

---

## Phase 2 — Settings, Identity, Permissions, Security Foundation (NOT STARTED)

**Master Plan §16 Phase 2**

### Target Workstreams (One at a Time)
| Workstream | Module(s) | Dependency | Est. Effort |
|------------|-----------|------------|-------------|
| 2.1 | Settings Service Layer | Settings module | Phase 1.3 complete | 1 week |
| 2.2 | Restrictive Firestore Rules (phased) | All collections | Phase 1.6 complete | 2 weeks |
| 2.3 | Identity & Auth Hardening | Auth, Users, Super Admin | Phase 1.2 complete | 1 week |
| 2.4 | Permission Centralization | All modules | Phase 1.2 complete | 1 week |
| 2.5 | Role Matrix Implementation | Roles, Users, Members | Phase 1.2 complete | 1 week |

### Success Criteria
- [ ] Settings service layer replaces direct `updateDoc` calls
- [ ] Firestore Rules Phase 1 deployed (auth + admin checks) tested in emulator
- [ ] Single `PermissionService` used by all modules
- [ ] 9 roles implemented with multi-responsibility support
- [ ] Account provisioning workflow operational (no Cloud Functions)

---

## Phase 3 — Financial Core and Ledger Ownership (NOT STARTED)

**Master Plan §16 Phase 3**

### Target Workstreams (One at a Time)
| Workstream | Module(s) | Dependency | Est. Effort |
|------------|-----------|------------|-------------|
| 3.1 | Ledger Model Implementation | Bank Transactions, Treasury | Phase 1.4, 2.2 complete | 2 weeks |
| 3.2 | Service Ownership Consolidation | Treasury, Bank-Transactions, Cashier | Phase 1.7, T-007 complete | 2 weeks |
| 3.3 | Atomic Write Patterns | All financial services | Investments gold standard | 2 weeks |
| 3.4 | Query Pagination & Indexes | Bank Transactions, Loans, Members | Phase 1.5 complete | 1 week |

### Success Criteria
- [ ] `bank_transactions` = single source of truth (balanced postings per design)
- [ ] One canonical service owns `bank_accounts`, `cash_balances`, `bank_transactions`, `fund_transactions`
- [ ] All financial writes use `runTransaction`/`writeBatch`
- [ ] All queries have `limit()` and pagination cursors
- [ ] Legacy collections (`collector_balances`, `deposits`, `audit_logs`, `roles`) migrated or deprecated

---

## Phase 4 — Contributions and Direct Payment Claims (NOT STARTED)

**Master Plan §16 Phase 4**

### Target Modules
| Module | Current Status | Phase 4 Goal |
|--------|----------------|--------------|
| Contributions | PARTIALLY IMPLEMENTED | Atomic writes (3 docs), server-side dues calc, reconciliation |
| Payment Claims | NOT IMPLEMENTED | Direct payment flow (member pays direct to official account) |

### Prerequisites
- Phase 2 complete (Settings, Rules, Permissions)
- Phase 3 complete (Ledger, Atomic patterns)
- Owner approves contribution atomicity boundary (O-003)

---

## Phase 5 — Cashier, Collector, Deposits, Daily Closing (NOT STARTED)

**Master Plan §16 Phase 5**

### Target Modules
| Module | Current Status | Phase 5 Goal |
|--------|----------------|--------------|
| Cashier | NEEDS VERIFICATION | Single-Cashier workflow complete |
| Collector | PARTIAL (in Contributions) | Distinct from Cashier per §9 |
| Deposits | NOT IMPLEMENTED | Replace `markAsDeposited()` with ledger |
| Daily Closing | NOT IMPLEMENTED | Mandatory workflow with reconciliation |

### Prerequisites
- Phase 3 complete (Service ownership clear)
- T-005, T-007 investigations complete
- O-007 decision (mandatory vs optional closing)

---

## Phase 6 — Member Portal and Dashboard Completion (NOT STARTED)

**Master Plan §16 Phase 6**

### Target Areas
| Area | Current Status | Phase 6 Goal |
|------|----------------|--------------|
| Member Portal | COMPLETE (profile only) | Self-service: contributions, loans, investments |
| Dashboards | PARTIAL (mock data) | Real data from Firestore, bounded reads |

### Prerequisites
- Phase 2 complete (Permissions)
- Phase 3 complete (Ledger data available)
- T-011 realtime investigation complete

---

## Phase 7 — Islamic Financing and Loans (NOT STARTED)

**Master Plan §16 Phase 7**

### Target Modules
| Module | Current Status | Phase 7 Goal |
|--------|----------------|--------------|
| Financing/Loans | PARTIALLY IMPLEMENTED | 9 product types, atomic writes, contract rules |

### Prerequisites
- Phase 3 complete (Atomic patterns)
- O-004 decision (financing atomicity boundary)
- T-008 approver matrix complete

---

## Phase 8 — Treasury, Bank Views, Financial Reporting (NOT STARTED)

**Master Plan §16 Phase 8**

### Target Areas
| Area | Current Status | Phase 8 Goal |
|------|----------------|--------------|
| Treasury | PARTIAL | Consolidated service, daily closing |
| Bank Transactions | COMPLETE | Pagination, reconciliation, indexes |
| Reports | NOT IMPLEMENTED | Financial reports from shared ledger |

### Prerequisites
- Phase 3 complete (Ledger ownership)
- O-008 decision (report priority)

---

## Phase 9 — Investments, FDR, Business, Assets (NOT STARTED)

**Master Plan §16 Phase 9**

### Target Modules
| Module | Current Status | Phase 9 Goal |
|--------|----------------|--------------|
| Investments | PARTIAL | Complete UI tabs, document handling, ledger integration |
| Assets | NOT IMPLEMENTED | Implement per §12 |
| Business | NOT IMPLEMENTED | Implement per §12 |
| FDR | NOT IMPLEMENTED | Fixed deposit tracking |

### Prerequisites
- Phase 3 complete (Atomic patterns)
- O-005 decision (document storage)
- T-010 chart library investigation complete

---

## Phase 10 — Organization, Communication, Support (NOT STARTED)

**Master Plan §16 Phase 10**

### Target Modules
| Module | Current Status | Phase 10 Goal |
|--------|----------------|---------------|
| Teams | NOT IMPLEMENTED | Committee/team management |
| Communication | NOT IMPLEMENTED | Notices, in-app messages |
| Support | NOT IMPLEMENTED | Ticket/help system |

---

## Phase 11 — Co-investor and Future Expansion (NOT STARTED)

**Master Plan §16 Phase 11** — Future phase, details TBD

---

## Phase 12 — Final Hardening, Testing, Deployment (NOT STARTED)

**Master Plan §16 Phase 12**

### Target
| Area | Goal |
|------|------|
| Testing | Full test suite (unit, integration, e2e) |
| Security | Production Rules, backup, monitoring |
| Performance | Bundle size, query optimization |
| Deployment | Hosting, CI/CD, rollback procedure |

---

## Blocker & Dependency Summary

| Blocker | Impact | Resolution Target |
|---------|--------|-------------------|
| **14 decisions unresolved** | Cannot finalize architecture | Phase 1 deliverables + owner review |
| **6 technical investigations needed** | Block O-001 through O-008 | Assign immediately, 2-week target |
| **Firestore Rules permissive** | Data integrity risk | Phase 2.2 |
| **Non-atomic writes** | Financial data corruption risk | Phase 3.3 |
| **Placeholder modules in routes** | UX confusion | Phase 9, 10 (preserve, hide) |

---

## Metrics & KPIs (From Master Plan §17, §15)

| Metric | Current | Target | Phase |
|--------|---------|--------|-------|
| Build pass | ✅ Yes | ✅ Yes | All |
| TypeScript errors | 0 | 0 | All |
| Bundle size (main chunk) | 271 KB | < 200 KB | 2, 9 |
| Firebase vendor chunk | 557 KB | < 400 KB | 2, 9 |
| Unbounded queries | 5 | 0 | 3 |
| Non-atomic financial ops | 9 | 0 | 3, 4, 7 |
| Placeholder modules in routes | 6 | 0 (hidden) | 9, 10 |
| Test coverage | 0% | >80% financial | 12 |
| Firestore Rules deployed | ✅ Permissive | ✅ Restrictive | 2 |
| Spark daily reads | Unknown | < 50k | All |
| Spark daily writes | Unknown | < 20k | All |
| Concurrent connections | Unknown | < 100 | All |

---

## Notes

- **Do not mark Phase 1-12 complete without owner verification**
- **All implementation follows `docs/MASTER_PLAN.md` §16 priority order**
- **One module/workstream at a time** — no parallel implementation (Master Plan §3.1 #136, §18.1)
- **Settings ON/OFF controls gate module completion** — verify before marking done (Master Plan §5)
- **Phase 1 = Documentation only** — No application code changes until Phase 1 acceptance criteria met

---

*End of PROGRESS.md — Aligned with MASTER_PLAN.md v1.1 §16 (12 Phases)*