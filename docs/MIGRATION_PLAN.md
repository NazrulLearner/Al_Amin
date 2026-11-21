# Migration Plan — Al Amin Somity Project

**Version:** 1.0
**Last Updated:** 2026-11-20
**Governed by:** `docs/MASTER_PLAN.md` v1.1
**Status:** Phase 1.7 Deliverable — Owner Review Required

---

## 1. Migration Strategy
Legacy collections (Phase 0 findings) will be normalized into the new `DATA_MODEL.md` structure.

| Legacy Collection | Target | Migration Method |
|-------------------|--------|------------------|
| `collector_balances` | `bank_transactions` | Ledger entry per balance |
| `deposits` | `bank_transactions` | Ledger entry (type: bank_deposit) |
| `audit_logs` | Preserve (Read-only) | Keep in root |
| `roles` | `users.roles` | Batch write to `users` collection |

---

## 2. Steps to Production
1. **Audit:** Measure legacy volume (T-006).
2. **Back-up:** Export full Firebase snapshot before migration.
3. **Execution:**
   - **Step A:** Run user role migration (update `users` docs).
   - **Step B:** Run financial migration (generate `bank_transactions` from `deposits` and `collector_balances`).
   - **Step C:** Verify consistency (total sum comparison).
4. **Finalization:** Delete legacy collections ONLY after verified full successful deployment of new modules.

---

## 3. Risk Mitigation
- **Data Loss:** Use `writeBatch` for all migration operations.
- **Downtime:** Perform migration during off-peak hours (Somity operational hours).
- **Rollback:** Keep full export file until Phase 2 is declared "COMPLETE" by owner.

---

*End of MIGRATION_PLAN.md*
