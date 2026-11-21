# CLAUDE.md — Permanent Instructions for Al Amin Somity Project

## Governing Document Hierarchy

**ALWAYS READ IN THIS ORDER before any task:**

1. **`docs/MASTER_PLAN.md`** — Product & business direction (governing)
2. **`docs/PROGRESS.md`** — Current phase tracker
3. **`docs/DECISIONS.md`** — Confirmed owner decisions
4. **`docs/FINDINGS.md`** — Phase 0 audit findings
5. **`docs/MODULE_AUDIT.md`** — Module implementation status
6. **`docs/COLLECTION_INVENTORY.md`** — Firestore collections & fields
7. **`docs/SECURITY_AUDIT.md`** — Security posture & risks
8. **`docs/SETTINGS_MATRIX.md`** — Settings → module wiring
9. **`docs/PLAN_RECONCILIATION.md`** — Audit-to-plan mapping

**NEVER start work without reading `docs/MASTER_PLAN.md` first.**

---

## Core Constraints (Non-Negotiable)

| Constraint | Source | Enforcement |
|------------|--------|-------------|
| **Firebase Spark plan only** | Owner | No paid services |
| **NO Cloud Functions** | Owner | `functions/` folder is dormant — do not deploy/modify |
| **NO Firebase Cloud Storage** | Owner | Base64 images in Firestore only |
| **NO FCM push sending** | Owner | Not implemented |
| **NO scheduled jobs** | Owner | Not implemented |
| **NO paid APIs/services** | Owner | Free tier only |
| **Never read/expose `.env` or secrets** | Owner | Config in source is acceptable for Firebase |
| **Do not modify live Firebase data** | Owner | Read-only audits only |
| **Preserve existing working modules** | Owner | No bulk deletions |
| **One module/workstream at a time** | Master Plan | Sequential implementation |
| **Main Settings ON/OFF controls gate modules** | Master Plan | Check before completing module |
| **Firestore Rules intentionally permissive** | Owner | Currently `allow read, write: if true` — do not report as absent |

---

## Phase Discipline

| Phase | Status | Trigger |
|-------|--------|---------|
| **Phase 0 — Audit** | ✅ Complete | — |
| **Phase 1 — Foundation** | ⏳ Awaiting approval | Owner signs off on Master Plan + decisions |
| **Phase 2 — Core Financial** | ⏳ Not started | Phase 1 complete |
| **Phase 3 — Member Experience** | ⏳ Not started | Phase 2 complete |
| **Phase 4 — Admin & Reporting** | ⏳ Not started | Phase 3 complete |

**NEVER mark implementation phases complete without owner verification.**

---

## Read-Only Verification Protocol

For any task requiring code inspection:

1. **Use `Read`, `Grep`, `Glob`, `Bash` (read-only)** — never `Edit`, `Write`, `Delete`
2. **Verify references before classifying as unused** — grep imports first
3. **Preserve permissions files, navigation/menu builders, helpers, `functions/`, future-phase components**
4. **Document findings with exact file paths and line numbers**
5. **Report in Bangla/Banglish with technical terms in English**

---

## Financial Write Safety

**Before touching any financial code path:**

| Module | Current Atomicity | Required Pattern |
|--------|------------------|------------------|
| Contributions | ❌ Separate writes | `runTransaction` (3 docs) |
| Financing (approve/disburse/repay) | ❌ Separate writes | `runTransaction` (2 docs each) |
| Treasury (transferFunds) | ✅ writeBatch | Keep as model |
| Investments | ✅ transaction/batch | Gold standard |

**Never implement financial writes without atomicity.**

---

## Settings-Driven Development

**Before completing ANY module:**

1. Check `src/types/settings.ts` `SomitySettings` interface
2. Identify which settings sections control the module
3. Verify Settings UI components exist for those sections
4. Confirm module respects ON/OFF flags and config values
5. Document in `docs/SETTINGS_MATRIX.md`

---

## Module Status Definitions

| Status | Meaning |
|--------|---------|
| **COMPLETE** | Fully implemented, Firebase-connected, tested in production flows |
| **PARTIALLY IMPLEMENTED** | Core features work, some pages/services missing or incomplete |
| **NOT IMPLEMENTED** | UI placeholders only, no Firebase integration, mock data |
| **NEEDS VERIFICATION** | Code exists but untested, unclear if wired correctly |
| **BROKEN** | Known issues, missing imports, runtime errors |

---

## Documentation Update Rules

| Document | When to Update | Who |
|----------|----------------|-----|
| `docs/PROGRESS.md` | Phase transitions, task completion | Assistant |
| `docs/DECISIONS.md` | Owner confirms a decision | Assistant |
| `docs/SETTINGS_MATRIX.md` | New settings-module wiring discovered | Assistant |
| `docs/MASTER_PLAN.md` | Owner changes product direction | Owner only |
| Audit docs (FINDINGS, MODULE_AUDIT, COLLECTION_INVENTORY, SECURITY_AUDIT) | **NEVER** — Phase 0 artifacts | — |

---

## Communication Protocol

- **Report findings in Bangla/Banglish** with technical terms in English
- **Use status labels:** COMPLETE, PARTIALLY IMPLEMENTED, NOT IMPLEMENTED, BROKEN, NEEDS VERIFICATION
- **Include file paths** for every important finding
- **Mark unverified items as UNKNOWN** — never guess
- **Wait for owner approval** before cleanup, implementation, or architectural decisions

---

## Emergency Stop Conditions

**Immediately stop and report if:**
- Asked to modify live Firebase data
- Asked to deploy Firestore Rules without owner approval
- Asked to use Cloud Functions, Storage, FCM, or paid services
- Asked to bulk-delete modules or pages
- Asked to skip `docs/MASTER_PLAN.md` reading
- Asked to mark Phase 1+ complete without owner verification

---

## Quick Reference: Key File Paths

| Purpose | Path |
|---------|------|
| Firebase Config | `src/services/firebase/firebase.ts` |
| Collections Registry | `src/services/firebase/firebaseCollections.ts` |
| Auth Provider | `src/app/providers/AuthProvider.tsx` |
| Member Service | `src/modules/members/services/memberService.ts` |
| Contribution Service | `src/modules/contributions/services/contributionService.ts` |
| Financing Service | `src/modules/financing/services/FinancingService.ts` |
| Investment Ops (Atomic) | `src/modules/Investments/services/investmentOps.ts` |
| Bank Transaction Service | `src/modules/bank-transactions/services/bankTransactionService.ts` |
| Finance Service (Treasury) | `src/modules/treasury/services/financeService.ts` |
| Settings Types | `src/types/settings.ts` |
| User Roles | `src/types/common.ts` |
| Navigation/Menu | `src/navigation/menuBuilder.ts`, `menuConfig.ts` |

---

*This CLAUDE.md is a permanent instruction file. It must be read before every task on this project.*