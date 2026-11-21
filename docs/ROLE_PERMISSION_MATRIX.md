# Role Permission Matrix — Al Amin Somity Project

**Version:** 1.0  
**Last Updated:** 2025-11-20  
**Governed by:** `docs/MASTER_PLAN.md` v1.1 §6, §9, §20 #2  
**Status:** Phase 1.2 Deliverable — Owner Review Required

---

## 1. Role Definitions (9 Roles)

| Role ID | Display Name (BN) | Display Name (EN) | Description | Auth System |
|---------|-------------------|-------------------|-------------|-------------|
| `super_admin` | সুপার অ্যাডমিন | Super Admin | Full system access, all somities, user management | ✅ Yes |
| `admin` | অ্যাডমিন | Admin | Somity-level admin, all modules, member management | ✅ Yes |
| `president` | সভাপতি | President | **NOT IN AUTH SYSTEM** — UI/Teams mock only | ❌ No |
| `manager` | ম্যানেজার | Manager | Operational oversight, reports, approvals | ✅ Yes |
| `accountant` | হিসাবরক্ষক | Accountant | Financial records, ledger, reports, reconciliation | ✅ Yes |
| `cashier` | ক্যাশিয়ার | Cashier | Bank operations, deposits, withdrawals, daily closing | ✅ Yes |
| `collector` | সংগ্রহক | Collector | Field collection from members (cash/mobile) | ✅ Yes |
| `member` | সদস্য | Member | Self-service: view contributions, loans, investments | ✅ Yes |
| `guest` | অতিথি | Guest | Read-only public info (notices, announcements) | ✅ Planned |

> **Critical Finding:** `president` role exists in:
> - `src/modules/members/pages/AddMember.tsx:594` (dropdown option)
> - `src/modules/teams/` mock data (President, Vice President)
> 
> But **NOT** in:
> - `src/types/common.ts:6` UserRole type (only 7 roles)
> - `src/app/providers/AuthProvider.tsx` (permission checks)
> - `src/app/layouts/ProtectedRoute.tsx`, `Sidebar.tsx` (route guards)
> - Firestore user documents

**Decision Required:** Add `president` to UserRole type + auth system, OR remove from UI/Teams mock.

---

## 2. Multi-Responsibility Model (C-001, T-002)

**Master Plan §6.4, §9:** One person can hold **multiple roles simultaneously**.

### Current Implementation Gap
| Current | Required |
|---------|----------|
| User document has single `role` field | User document needs `roles: UserRole[]` array |
| `AuthProvider` checks single role | `PermissionService` checks role array |
| Sidebar filters by single role | Sidebar shows union of all role permissions |

### Migration Path (T-002)
```typescript
// Current (single)
interface AppUser {
  role: UserRole;
}

// Target (multi)
interface AppUser {
  roles: UserRole[];        // Primary + additional
  primaryRole: UserRole;    // For UI defaults
}
```

---

## 3. Permission Catalog (50+ Permissions)

### 3.1 Permission Naming Convention
```
{module}.{action}.{scope?}
```
Examples: `contributions.create.own`, `loans.approve.any`, `investments.view.all`

### 3.2 Complete Permission List

#### Contributions Module
| Permission | Description | Scope |
|------------|-------------|-------|
| `contributions.create.own` | Record collection for assigned members | Collector |
| `contributions.create.any` | Record collection for any member | Cashier, Admin |
| `contributions.view.own` | View own contribution history | Member |
| `contributions.view.assigned` | View assigned members' contributions | Collector |
| `contributions.view.all` | View all contributions | Manager, Accountant, Admin |
| `contributions.edit.own` | Edit own recent entries (config window) | Collector, Cashier |
| `contributions.edit.any` | Edit any contribution | Admin |
| `contributions.delete.own` | Delete own recent entries | Collector, Cashier |
| `contributions.delete.any` | Delete any contribution | Admin |
| `contributions.reconcile` | Daily closing reconciliation | Cashier, Accountant |
| `contributions.settings` | Manage contribution settings | Admin |
| `contributions.export` | Export contribution reports | Accountant, Admin |

#### Financing/Loans Module
| Permission | Description | Scope |
|------------|-------------|-------|
| `loans.apply` | Submit loan application | Member |
| `loans.view.own` | View own loans | Member |
| `loans.view.all` | View all loans | Manager, Accountant, Admin |
| `loans.approve.low` | Approve loans ≤ threshold | Manager |
| `loans.approve.medium` | Approve loans ≤ higher threshold | Accountant, Admin |
| `loans.approve.high` | Approve any amount | Admin |
| `loans.disburse` | Record disbursement | Cashier, Admin |
| `loans.repayment.record` | Record repayment | Collector, Cashier, Admin |
| `loans.repayment.view` | View repayment schedule | Member, Collector, Accountant |
| `loans.restructure` | Restructure defaulted loans | Admin |
| `loans.writeoff` | Write off bad loans | Super Admin |
| `loans.settings` | Manage financing settings | Admin |
| `loans.export` | Export loan portfolio | Accountant, Admin |

#### Investments Module
| Permission | Description | Scope |
|------------|-------------|-------|
| `investments.create` | Create investment proposal | Manager, Accountant, Admin |
| `investments.view.all` | View all investments | Manager, Accountant, Admin |
| `investments.approve` | Approve investment | Admin |
| `investments.fund` | Record funding | Cashier, Admin |
| `investments.return.record` | Record return | Accountant, Admin |
| `investments.manage.participants` | Add/remove participants | Admin |
| `investments.soft_delete` | Soft delete (no money moved) | Admin |
| `investments.settings` | Manage investment settings | Admin |
| `investments.export` | Export investment reports | Accountant, Admin |

#### Treasury & Banking Module
| Permission | Description | Scope |
|------------|-------------|-------|
| `treasury.view.balances` | View bank/cash balances | Accountant, Manager, Admin |
| `treasury.transfer` | Transfer between accounts | Cashier, Admin |
| `treasury.deposit` | Record bank deposit | Cashier, Admin |
| `treasury.withdraw` | Record bank withdrawal | Cashier, Admin |
| `treasury.daily_closing` | Execute daily closing | Cashier, Accountant |
| `treasury.reconcile` | Bank reconciliation | Accountant, Admin |
| `treasury.settings` | Manage treasury settings | Admin |
| `treasury.export` | Export financial statements | Accountant, Admin |

#### Members Module
| Permission | Description | Scope |
|------------|-------------|-------|
| `members.create` | Add new member | Admin |
| `members.view.own` | View own profile | Member |
| `members.view.all` | View all members | Manager, Accountant, Collector, Admin |
| `members.edit.own` | Edit own profile | Member |
| `members.edit.any` | Edit any member | Admin |
| `members.assign_role` | Assign/change member roles | Admin |
| `members.approve` | Approve pending members | Admin |
| `members.terminate` | Terminate membership | Admin |
| `members.settings` | Manage member settings | Admin |

#### Users & Auth Module
| Permission | Description | Scope |
|------------|-------------|-------|
| `users.create` | Create user account | Super Admin |
| `users.view.all` | View all users | Super Admin, Admin |
| `users.edit.any` | Edit any user | Super Admin |
| `users.assign_role` | Assign user roles | Super Admin |
| `users.deactivate` | Deactivate user | Super Admin |
| `users.custom_claims` | Manage custom claims | Super Admin |

#### Settings Module
| Permission | Description | Scope |
|------------|-------------|-------|
| `settings.view` | View settings | Manager, Accountant, Admin |
| `settings.edit` | Edit settings | Admin |
| `settings.modules.toggle` | Enable/disable modules | Admin |
| `settings.islamic_config` | Configure Islamic products | Admin |

#### Reports Module
| Permission | Description | Scope |
|------------|-------------|-------|
| `reports.view.financial` | Financial summary reports | Accountant, Manager, Admin |
| `reports.view.member_ledger` | Member ledger reports | Accountant, Collector, Admin |
| `reports.view.loan_portfolio` | Loan portfolio reports | Accountant, Manager, Admin |
| `reports.view.investment_returns` | Investment returns | Accountant, Admin |
| `reports.view.audit_trail` | Audit trail | Admin, Super Admin |
| `reports.export` | Export any report | Accountant, Admin |

#### Teams & Communication (Future)
| Permission | Description | Scope |
|------------|-------------|-------|
| `teams.create` | Create team/committee | Admin |
| `teams.manage` | Manage team members | Admin |
| `communication.send_notice` | Send notices | Admin, Manager |
| `communication.send_message` | Send in-app messages | All authenticated |
| `support.create_ticket` | Create support ticket | All authenticated |
| `support.manage_tickets` | Manage support tickets | Admin |

---

## 4. Role × Permission Matrix

### 4.1 Core Roles (7 Auth Roles)

| Permission | super_admin | admin | manager | accountant | cashier | collector | member |
|------------|:-----------:|:-----:|:-------:|:----------:|:-------:|:---------:|:------:|
| **Contributions** |
| contributions.create.own | ✅ | ✅ | | | ✅ | ✅ | |
| contributions.create.any | ✅ | ✅ | | | ✅ | | |
| contributions.view.own | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| contributions.view.assigned | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | |
| contributions.view.all | ✅ | ✅ | ✅ | ✅ | | | |
| contributions.edit.own | ✅ | ✅ | | | ✅ | ✅ | |
| contributions.edit.any | ✅ | ✅ | | | | | |
| contributions.delete.own | ✅ | ✅ | | | ✅ | ✅ | |
| contributions.delete.any | ✅ | ✅ | | | | | |
| contributions.reconcile | ✅ | ✅ | ✅ | ✅ | ✅ | | |
| contributions.settings | ✅ | ✅ | | | | | |
| contributions.export | ✅ | ✅ | | ✅ | | | |
| **Financing/Loans** |
| loans.apply | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| loans.view.own | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| loans.view.all | ✅ | ✅ | ✅ | ✅ | | | |
| loans.approve.low | ✅ | ✅ | ✅ | | | | |
| loans.approve.medium | ✅ | ✅ | | ✅ | | | |
| loans.approve.high | ✅ | ✅ | | | | | |
| loans.disburse | ✅ | ✅ | | | ✅ | | |
| loans.repayment.record | ✅ | ✅ | | | ✅ | ✅ | |
| loans.repayment.view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| loans.restructure | ✅ | ✅ | | | | | |
| loans.writeoff | ✅ | | | | | | |
| loans.settings | ✅ | ✅ | | | | | |
| loans.export | ✅ | ✅ | | ✅ | | | |
| **Investments** |
| investments.create | ✅ | ✅ | ✅ | ✅ | | | |
| investments.view.all | ✅ | ✅ | ✅ | ✅ | | | |
| investments.approve | ✅ | ✅ | | | | | |
| investments.fund | ✅ | ✅ | | | ✅ | | |
| investments.return.record | ✅ | ✅ | | ✅ | | | |
| investments.manage.participants | ✅ | ✅ | | | | | |
| investments.soft_delete | ✅ | ✅ | | | | | |
| investments.settings | ✅ | ✅ | | | | | |
| investments.export | ✅ | ✅ | | ✅ | | | |
| **Treasury & Banking** |
| treasury.view.balances | ✅ | ✅ | ✅ | ✅ | ✅ | | |
| treasury.transfer | ✅ | ✅ | | | ✅ | | |
| treasury.deposit | ✅ | ✅ | | | ✅ | | |
| treasury.withdraw | ✅ | ✅ | | | ✅ | | |
| treasury.daily_closing | ✅ | ✅ | | ✅ | ✅ | | |
| treasury.reconcile | ✅ | ✅ | | ✅ | | | |
| treasury.settings | ✅ | ✅ | | | | | |
| treasury.export | ✅ | ✅ | | ✅ | | | |
| **Members** |
| members.create | ✅ | ✅ | | | | | |
| members.view.own | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| members.view.all | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | |
| members.edit.own | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| members.edit.any | ✅ | ✅ | | | | | |
| members.assign_role | ✅ | ✅ | | | | | |
| members.approve | ✅ | ✅ | | | | | |
| members.terminate | ✅ | ✅ | | | | | |
| members.settings | ✅ | ✅ | | | | | |
| **Users & Auth** |
| users.create | ✅ | | | | | | |
| users.view.all | ✅ | ✅ | | | | | |
| users.edit.any | ✅ | | | | | | |
| users.assign_role | ✅ | | | | | | |
| users.deactivate | ✅ | | | | | | |
| users.custom_claims | ✅ | | | | | | |
| **Settings** |
| settings.view | ✅ | ✅ | ✅ | ✅ | | | |
| settings.edit | ✅ | ✅ | | | | | |
| settings.modules.toggle | ✅ | ✅ | | | | | |
| settings.islamic_config | ✅ | ✅ | | | | | |
| **Reports** |
| reports.view.financial | ✅ | ✅ | ✅ | ✅ | | | |
| reports.view.member_ledger | ✅ | ✅ | | ✅ | ✅ | | |
| reports.view.loan_portfolio | ✅ | ✅ | ✅ | ✅ | | | |
| reports.view.investment_returns | ✅ | ✅ | | ✅ | | | |
| reports.view.audit_trail | ✅ | ✅ | | | | | |
| reports.export | ✅ | ✅ | | ✅ | | | |

### 4.2 President Role (If Added to Auth)

| Permission | president |
|------------|:---------:|
| All `admin` permissions | ✅ |
| `loans.approve.high` | ✅ |
| `investments.approve` | ✅ |
| `treasury.daily_closing` | ✅ (oversight) |
| `reports.view.audit_trail` | ✅ |

> **Note:** President = Admin + strategic approvals. Not operational (no cashier/collector duties).

---

## 5. Implementation Requirements

### 5.1 PermissionService (Single Source of Truth)
```typescript
// src/services/permissions/PermissionService.ts
class PermissionService {
  private rolePermissions: Map<UserRole, Set<string>>;
  
  hasPermission(userRoles: UserRole[], permission: string): boolean {
    return userRoles.some(role => this.rolePermissions.get(role)?.has(permission));
  }
  
  getPermissionsForRoles(roles: UserRole[]): Set<string> {
    const perms = new Set<string>();
    roles.forEach(role => this.rolePermissions.get(role)?.forEach(p => perms.add(p)));
    return perms;
  }
}
```

### 5.2 Migration Steps (T-002)
1. **Firestore:** Add `roles: UserRole[]` + `primaryRole: UserRole` to user documents
2. **AuthProvider:** Migrate from single `role` to `roles[]` array
3. **PermissionService:** Centralize all permission checks (replace inline checks)
4. **Sidebar/ProtectedRoute:** Use `PermissionService` for route/menu visibility
5. **UI:** Update AddMember, Users pages to support multi-role assignment

### 5.3 Settings Gate (C-008)
Every permission check MUST also verify module is enabled:
```typescript
async function hasPermission(userRoles: UserRole[], permission: string): Promise<boolean> {
  const module = permission.split('.')[0]; // e.g., 'contributions'
  const settings = await getSettings();
  if (!settings[module]?.enabled) return false;
  return PermissionService.hasPermission(userRoles, permission);
}
```

---

## 6. Open Decisions

| ID | Decision | Impact |
|----|----------|--------|
| T-002 | Role storage design (array vs subcollection) | Firestore schema, migration |
| O-001 | Firestore Rules enforcement of permissions | Server-side vs client-side |
| O-002 | Default module flags (ON vs OFF) | Initial permissions for new somities |

---

## 7. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-20 | Assistant | Initial draft from Master Plan §6, §9 + audit findings |

---

**Next Step:** Owner review → approve → proceed to **SETTINGS_MATRIX.md** verification (1.3) → **FINANCIAL_LEDGER_DESIGN.md** (1.4)