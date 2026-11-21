# Security Rules Plan — Al Amin Somity Project

**Version:** 1.0
**Last Updated:** 2026-11-20
**Governed by:** `docs/MASTER_PLAN.md` v1.1
**Status:** Phase 1.6 Deliverable — Owner Review Required

---

## 1. Security Philosophy
Current rules are permissive (`allow read, write: if true`) to facilitate initial development (C-007). Phase 2 requires strict Firestore Security Rules.

**Guiding Principles:**
1. **Role-Based Access (RBAC):** Permission based on `UserRole[]` array in `users` doc.
2. **Settings-Driven:** Deny access if module `enabled` flag is false in `somity_settings`.
3. **No Cross-Somity Access:** Firestore queries must filter by `somityId` (future-proofing).
4. **Least Privilege:** Default `deny`, allow only explicit actions defined in `ROLE_PERMISSION_MATRIX.md`.

---

## 2. Rule Enforcement Strategy (O-001)
- **Phase 2.1 (Week 1):** Auth + Admin/Owner CRUD.
- **Phase 2.2 (Week 2):** Role-based operational access (Cashier/Collector/Member).
- **Phase 2.3 (Week 3):** Strict validation (transaction atomicity, computed balance checks).

---

## 3. Implementation Blueprint

### 3.1 Role Verification Function
```javascript
function hasRole(role) {
  return request.auth.token.roles.hasAny([role]);
}
```

### 3.2 Module Gate Function
```javascript
function isModuleEnabled(module) {
  return get(/databases/$(database)/documents/somity_settings/config).data[module].enabled == true;
}
```

### 3.3 Rule Examples
- **Contributions (Collector/Cashier):**
  ```
  match /contributions/{docId} {
    allow create: if isModuleEnabled('contributions') && (hasRole('collector') || hasRole('cashier'));
  }
  ```

---

## 4. Technical Investigations (T-009)
- Cross-doc validation efficiency (Spark plan quotas).
- Computed field security (e.g., balance totals in `loans`).

---

*End of SECURITY_RULES_PLAN.md*
