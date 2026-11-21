# AL AMIN SOMITY --- MASTER PROJECT PLAN

**Version:** 2.0 --- Consolidated and Reorganized\
**Date:** November 2026\
**Project:** Al Amin Somity Management System\
**Document type:** Governing Product, Business, Architecture and
Delivery Plan\
**Status:** Consolidated draft for the Owner's review\
**Primary objective:** Improve the existing Al Amin Somity application
into a secure, reliable, low-cost, unified cooperative management
platform---preserving useful existing work and data structures wherever
practical.

------------------------------------------------------------------------

## 0. Executive Direction

Al Amin Somity is intended to become the central digital management
system for a Bangladeshi savings and Islamic-finance cooperative.

This is **not a rebuild project** and not merely a technical cleanup.
The work is to understand what already exists, preserve what works,
correct what is incomplete or unsafe, and connect the existing modules
through shared identity, permissions, settings and financial
architecture.

The governing direction is:

> **Turn the existing Al Amin Somity project into a reliable, secure,
> low-cost, unified financial management platform---without
> unnecessarily rebuilding the old project, losing existing work,
> weakening financial controls or exceeding the agreed budget.**

The application must not become a collection of disconnected CRUD pages.
Members, contributions, collections, deposits, accounts, financing,
investments, business, assets, reports and administration must operate
as connected parts of one system.

### 0.1 How this plan governs the project

1.  This file is the source of truth for product vision, business
    requirements, constraints, architecture direction and roadmap.
2.  `CLAUDE.md` contains concise working instructions and must point to
    this plan. It must not replace or reinterpret it.
3.  `docs/PROGRESS.md` records actual progress against this roadmap.
4.  `docs/DECISIONS.md` records confirmed owner decisions, unresolved
    questions and approved deviations.
5.  The four Phase 0 audit documents are evidence about the existing
    code---not authority to change the business requirements.
6.  When code, audit findings and this plan disagree, report the
    difference and its impact. Do not silently choose a new business
    rule.
7.  Work proceeds in bounded phases and one primary module/workstream at
    a time. An approved workstream may be completed without asking for
    permission for every routine sub-step. Ask again only when scope
    expands or a protected action is required.
8.  No live-data migration, destructive change, security-rule
    deployment, production deployment or paid-service activation is
    authorized by this document alone.

------------------------------------------------------------------------

## 1. Product Vision and Outcomes

### 1.1 Main product objectives

The platform should provide:

1.  A member profile and, where enabled, a secure member login and
    private dashboard.
2.  Member savings, contributions, fees, payment claims and payment
    history.
3.  Cashier/Collector collection entry, receipts, held balances and
    deposit tracking.
4.  Accurate society bank, mobile-money and cash-account balances.
5.  Islamic financing applications, product-specific approvals,
    agreements, disbursements, installments and repayments.
6.  Investment projects, participants, funding, returns, withdrawals and
    FDR tracking.
7.  Business activity, income, expenses, capital and returns.
8.  Asset register and related financial movements.
9.  Role-based administration, permissions and traceable important
    actions.
10. Accurate reports, statements, exports, notices, communication and
    support.
11. A design that can support additional Cashiers/Collectors and future
    co-investors without overengineering today's operation.
12. Low Firebase usage and minimal ongoing operating cost.

### 1.2 What success looks like

A manager should be able to answer, accurately and from traceable
records:

-   Who paid?
-   How much was paid, when, and for what?
-   Who received or currently holds the money?
-   Is it still held by a Cashier/Collector, or has it reached an
    official society account?
-   Which account did it move from and to?
-   Who verified the deposit or payment claim?
-   Which contribution, loan, investment, expense or other business
    event caused the movement?
-   If a correction was made, which original record was reversed or
    adjusted, by whom and why?

**Financial traceability and correctness take priority over cosmetic
polish.**

### 1.3 Current operating scale

-   Approximately 20 members at the current stage.
-   One Cashier currently.
-   The first usable workflow must remain simple for this scale.
-   The architecture should support additional Cashiers/Collectors later
    without duplicate identities, separate ledgers or unnecessary
    complexity.

------------------------------------------------------------------------

## 2. Budget, Technology and Non-Negotiable Constraints

### 2.1 Budget policy

-   Target operating cost: **\$0/month** wherever practical.
-   Normal personal spending ceiling: approximately **\$2--3/month**.
-   Up to \$4/month only for an exceptional need separately explained
    and approved.
-   Do not assume the society will fund hosting, APIs or backend
    services.
-   Before proposing any paid product, state its purpose, likely cost,
    free alternatives, limitations and operational consequences.
-   No paid plan, billing account, subscription or paid API may be
    activated without explicit owner approval.
-   Verify current quotas and terms before relying on them; a free-tier
    target is not a guarantee of unlimited usage.

### 2.2 Existing stack to preserve

  -----------------------------------------------------------------------
  Area                                Existing / preferred technology
  ----------------------------------- -----------------------------------
  Frontend                            React 19 + TypeScript

  Build                               Vite

  UI                                  Tailwind CSS + existing Radix UI
                                      components

  Routing/state                       Existing React Router and Context
                                      architecture

  Authentication                      Firebase Authentication,
                                      email/password

  Database                            Cloud Firestore

  Hosting                             Firebase Hosting

  Notifications                       Firestore-backed in-app
                                      notifications, if implemented

  Charts                              Existing chart implementation(s),
                                      after usage verification

  Export                              Existing jsPDF, html2canvas, XLSX
                                      and print/export utilities where
                                      already used
  -----------------------------------------------------------------------

Do not replace a library, framework or architecture merely for stylistic
preference. First verify actual usage, maintenance cost, compatibility
and whether the current implementation meets the approved requirements.

### 2.3 Active owner-enforced technical restrictions

These restrictions override older suggestions in any plan or audit:

-   Firebase Spark-compatible operation for the current project stage.
-   **No Cloud Functions may be deployed or modified.** The existing
    `functions/` directory is dormant/reference-only.
-   **No Firebase Cloud Storage** in the current implementation.
-   **No FCM push sending.**
-   **No scheduled jobs or background jobs.**
-   No paid APIs/services without a separate explicit decision.
-   Never read, print, expose or request `.env` files, API keys,
    passwords, service-account files or other secrets.
-   Do not modify live Firebase data or run migrations against it.
-   Do not deploy Firebase rules/configuration or Hosting without
    explicit approval.
-   Preserve existing working modules, Git history and existing
    financial records.

Some older discussions considered Cloud Functions as a possible future
solution. They are not part of the active plan. If a feature cannot be
made acceptably secure using the currently allowed architecture, mark it
as a **security/feasibility blocker** and present the limitation and
options. Do not pretend client-side code is a trusted server or silently
weaken the requirement.

Any future exception to these restrictions requires a separate owner
decision, budget review and security review.

### 2.4 File and document handling

-   Do not store large PDFs, identity scans or sensitive documents as
    Base64 in Firestore.
-   Because Cloud Storage is prohibited, do not build a large-file
    upload workflow without an approved safe storage destination.
-   Small compressed profile images may be considered only after
    validating file size, MIME type and Firestore document limits. This
    is not a workaround for storing sensitive documents.
-   Document-upload features that cannot be safely supported under the
    current constraints must remain clearly marked **DEFERRED**.

------------------------------------------------------------------------

## 3. Existing Project: Preserve, Understand and Improve

### 3.1 Preservation-first rule

The existing application already contains substantial work. The
objective is to improve and complete it---not replace it wholesale.

-   Inspect before changing.
-   Reuse working pages, components, services, hooks, formatters and
    calculations.
-   Trace imports, routes, callers, data references and permissions
    before consolidating anything.
-   Do not delete a page, service, collection, dependency or module
    because its name looks duplicated or unused.
-   Keep unfinished product areas available for later completion;
    hiding/disabling a module is not the same as deleting it.
-   Preserve existing financial history. Corrections must be traceable.
-   Do not change a database schema or collection merely to make naming
    more elegant.

### 3.2 Audit status vocabulary

Use these labels consistently:

-   `COMPLETE` --- implemented, integrated, permission-checked and
    tested against its acceptance criteria.
-   `PARTIALLY IMPLEMENTED` --- meaningful implementation exists, but
    required workflows or safeguards remain incomplete.
-   `NOT IMPLEMENTED` --- placeholder/mock/UI shell only, or no
    meaningful implementation.
-   `BROKEN` --- existing behavior fails or produces incorrect results.
-   `NEEDS VERIFICATION` --- evidence is incomplete; inspect before
    classifying.
-   `DEFERRED` --- intentionally postponed by the owner due to budget,
    dependency or scope.

A visible page does not prove a complete module. A successful build does
not prove correct financial behavior or security.

### 3.3 Phase 0 audit baseline

The four audit documents are the initial evidence set:

-   `docs/FINDINGS.md`
-   `docs/MODULE_AUDIT.md`
-   `docs/COLLECTION_INVENTORY.md`
-   `docs/SECURITY_AUDIT.md`

The audit recorded the following baseline at that time:

-   Branch: `cleanup`, created from `main` at commit `94604b3`.
-   Build passed at audit time.
-   Working tree was clean at audit time.
-   Lint had not yet been run.
-   The application contains 20+ feature modules and a substantial
    existing UI/service structure.

This is a historical checkpoint, not a guarantee of current Git state.
Re-check branch, working tree and recent commits before implementation.

### 3.4 Important findings to carry forward

These are planning inputs, not automatic authorization to change code:

-   Authentication and Members contain substantial working
    implementations. Preserve them and verify gaps rather than
    rebuilding them.
-   Contributions has an existing workflow, but its multi-document
    financial writes require consistency and atomicity review.
-   Financing has existing product types/workflows, but approval,
    disbursement and repayment writes require consistency and atomicity
    review.
-   Investments contains useful atomic-operation patterns. Reuse sound
    practices, while verifying ledger integration and historical
    immutability.
-   `bank_transactions` is the current candidate for the central
    financial transaction/ledger service; do not assume it already
    provides complete double-entry accounting.
-   Treasury contains overlapping service responsibilities
    (`bank.service.ts`, `cash.service.ts`, `financeService.ts`). Clarify
    ownership without bulk-moving or deleting files.
-   Cashier pages exist, but backend/service ownership needs
    verification.
-   Settings UI exists, but the relationship between its controls and
    `somity_settings/config` needs verification.
-   Some dashboards and modules use mock data. Never present mock values
    as live financial figures.
-   Assets, Business, Teams, Reports, Communication and Support have
    incomplete/placeholder areas. Preserve them as planned product scope
    unless the owner explicitly removes them.
-   `collector_balances`, `deposits`, `audit_logs` and `roles` have been
    described as unused/legacy/orphaned in parts of the audit. Verify
    code references, purpose and actual data before proposing any
    migration or removal.
-   `members.financials` and balance documents may be cached summaries.
    The approved ledger/posting records---not arbitrary summary
    fields---must be the source of truth.
-   Large/unbounded queries, including a reported 10,000-transaction
    fetch, need cursor pagination or another justified bounded strategy.
-   Duplicate chart libraries and apparently unused dependencies must be
    proven unused before removal.
-   Permission patterns are inconsistent and need a unified approved
    model with a compatibility plan.

### 3.5 Firestore Rules: precise current status

Firestore Rules **are deployed in Firebase Console**, but the currently
deployed rules are permissive:

``` javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Correct status: **permissive Firestore Rules are deployed; restrictive
production rules are not yet in place.**

Do not describe this as "no rules deployed." The `database.rules` file
concerns Realtime Database and does not prove Firestore Rules status. A
rules template in a module is not proof of deployment.

Before real member or financial data is entered, restrictive Firestore
Rules must be designed, tested and approved. Do not deploy them without
explicit owner approval.

------------------------------------------------------------------------

## 4. Product Scope and Module Map

The current module layout should be preserved where practical. The
logical product domains are:

### 4.1 Identity and administration

-   Authentication and account lifecycle.
-   Users and member-account linking.
-   Roles and permissions.
-   Super Admin tools.
-   Main Settings / Somity Settings.
-   Public society information where required.

### 4.2 Members and member experience

-   Member profiles and records.
-   Member self-service profile.
-   Private member dashboard.
-   Own contribution/payment history.
-   Own payment claims.
-   Own loan/investment information when those modules are ready and
    access is authorized.
-   Member documents only when a safe approved storage method exists.

### 4.3 Financial management

-   Contributions, savings and fees.
-   Direct payment claims.
-   Cashier and Collector workflows.
-   Central Bank Transactions / financial ledger.
-   Official bank and mobile-money accounts.
-   Treasury and cash management.
-   Deposits and verification.
-   Expenses and transfers.
-   Daily closing and reconciliation.
-   Financial reports and exports.

### 4.4 Financing

-   Applications and eligibility review.
-   Islamic financing products.
-   Approval/rejection.
-   Agreements and product documentation.
-   Disbursements.
-   Installment schedules.
-   Repayments.
-   Outstanding/overdue tracking and closure.

### 4.5 Investments, FDR, Business and Assets

-   Investment projects and participants.
-   Funding, returns and withdrawals.
-   FDR placement, maturity and renewal.
-   Business capital, income, expenses and returns.
-   Asset register and related transactions.
-   Future co-investor portfolio.

### 4.6 Organization and communication

-   Teams and committee structure.
-   Notices and announcements.
-   Committee communication.
-   In-app notifications.
-   Support and FAQ.

### 4.7 Reports and analytics

-   Member reports.
-   Contribution reports.
-   Cashier/Collector reports.
-   Deposit reconciliation.
-   Bank statements.
-   Treasury/cash reports.
-   Financing and repayment reports.
-   Investment, business and asset reports.
-   Profit/loss and overall financial position.
-   Audit reports.

**Shared architecture rule:** Every module may have its own UI and
service boundary, but all modules must use the same approved identity,
permissions, settings and financial architecture. No module may create a
competing financial source of truth.

------------------------------------------------------------------------

## 5. Main Settings and Module Control

Main Settings is a central business control point---not merely a page
containing editable values.

### 5.1 Required settings audit

Before completing any module, inspect:

1.  `somity_settings/config` and the current TypeScript settings schema.
2.  Settings pages, controls, hooks and services.
3.  How settings are read, cached, updated and validated.
4.  Which modules consume each setting and whether they hardcode a
    duplicate value.
5.  Whether a setting changes the actual workflow or only changes a
    visual control.

### 5.2 Settings registry

Maintain `docs/SETTINGS_MATRIX.md` with, for every relevant setting:

-   Setting name and purpose.
-   Default value and safe fallback.
-   Authorized roles that may view/change it.
-   Module/feature consumers.
-   Whether it affects navigation, route access, forms, calculations,
    posting or reporting.
-   Whether a change requires confirmation or an audit record.
-   Validation and test requirements.
-   Current status: verified consumer, partial consumer, UI-only or
    unknown.

Do not claim a setting is fully wired merely because a component imports
the settings object. Verify that the specific flag/value actually
controls the intended behavior.

### 5.3 Module and feature ON/OFF behavior

For each owner-approved module/feature toggle:

-   OFF hides or clearly disables the menu entry.
-   Direct URL access is handled intentionally and cannot bypass the
    feature state.
-   New create/update/post actions are blocked while disabled.
-   Authorized historical records remain available for audit/reporting
    where appropriate.
-   Turning a module OFF never deletes records or erases financial
    history.
-   Re-enabling restores the feature without recreating its data.
-   UI checks are for usability; Firestore Rules must enforce access
    where expressible.
-   If the no-Functions architecture cannot securely enforce a
    requirement, record the limitation before implementation.

Do not invent new toggles or silently change existing setting meanings.
Distinguish module enablement from business values such as monthly
contributions, financing terms, deposit deadlines and receipt settings.

------------------------------------------------------------------------

## 6. Identity, Roles and Permissions

### 6.1 One person, one identity

One person should have one login identity linked to the appropriate
Member Profile. That person may hold multiple responsibilities---for
example Member + Cashier or Member + Collector---without creating
duplicate Auth accounts.

The technical representation (single role, roles array or role
assignments) must be selected only after inspecting the current user
schema, authorization code and Firestore Rules. Any schema change
requires an approved compatibility/migration plan.

### 6.2 Planned roles

1.  `super_admin`
2.  `admin`
3.  `president`
4.  `manager`
5.  `accountant`
6.  `cashier`
7.  `collector`
8.  `member`
9.  `co_investor` --- future capability; not required in the first
    implementation phases.

The current code has been reported to contain seven roles and not to
include `president` or `co_investor` in its authorization type. A
President option has also been observed in a member form dropdown. Treat
this as a role/data-integrity discrepancy to resolve: do not write an
unsupported role value or silently migrate existing users.

### 6.3 Initial business capability direction

This is the required direction for the detailed
`ROLE_PERMISSION_MATRIX.md`:

  -----------------------------------------------------------------------
  Capability                          Planned access
  ----------------------------------- -----------------------------------
  View all members/general records    Super Admin, Admin, President,
                                      Manager; Accountant only within
                                      required finance scope

  Create/disable accounts             Super Admin, Admin, through an
                                      approved secure workflow

  Create/edit members                 Super Admin, Admin, President,
                                      Manager

  View own collection/held balance    Assigned Cashier/Collector

  View another handler's private      Super Admin, Admin, President,
  collection                          Manager; Accountant only for
                                      required finance scope

  Enter contributions/collections     Explicitly authorized staff roles

  Submit own direct-payment claim     Member

  Create deposit batch                Assigned Cashier/Collector;
                                      authorized admin acting on behalf
                                      where approved

  Verify/reject deposits              **Admin, President or Accountant
                                      only**

  Approve/reject direct payment       **Admin, President or Accountant
  claims                              only**

  View own profile/financial history  Member, restricted to own linked
                                      profile

  Manage system roles/sensitive       Super Admin; Admin only for
  settings                            explicitly granted settings

  Approve financing/disbursement      Authorized management roles; exact
                                      authority to be defined per
                                      product/type/amount

  View co-investor portfolio          Future approved scope only
  -----------------------------------------------------------------------

**Non-negotiable deposit rule:** Only Admin, President or Accountant may
verify/reject a deposit. Manager, Cashier, Collector and Member cannot
verify. One authorized verifier is sufficient; duplicate/concurrent
posting must be prevented.

**Non-negotiable payment-claim rule:** Only Admin, President or
Accountant may approve/reject a direct member payment claim. One
authorized approval is sufficient; duplicate/concurrent posting must be
prevented.

### 6.4 Member restrictions

-   A Member sees only their own profile and permitted financial
    information.
-   A Member may submit a direct bank/bKash payment claim.
-   A Member cannot create a confirmed contribution independently.
-   A Member cannot record their own cash payment as received by the
    society.
-   A direct-payment claim remains pending until an authorized verifier
    checks official account evidence.
-   Rejection must preserve the reason and review history.
-   Member self-edit access is limited to explicitly approved fields.

### 6.5 Cashier/Collector restrictions

-   A handler sees their own assigned collections, held balance and
    permitted deposit history.
-   A handler may enter authorized collections and prepare deposit
    batches.
-   A handler cannot see another handler's private collection unless
    separately authorized.
-   A handler cannot verify their own deposit.
-   A personal bank/bKash wallet must never be represented as an
    official society account.

### 6.6 Account lifecycle

-   No public signup UI.
-   Account creation is initiated by Super Admin/Admin through an
    approved workflow.
-   Do not expose or allow an administrator to set/view a member's
    permanent password. Use an appropriate password setup/reset flow.
-   Disabled accounts lose application access; historical records and
    financial references remain.
-   First Super Admin creation requires a controlled bootstrap process.
-   Audit existing secondary Firebase App account-creation logic for
    Auth session behavior, privilege abuse, orphan accounts and failure
    recovery.
-   Without Cloud Functions/Admin SDK, client-side provisioning has
    security limitations. Do not claim client code can securely set
    custom claims or act as a trusted server. If no acceptable secure
    workflow exists, block/defer that capability and explain the
    options.

------------------------------------------------------------------------

## 7. Financial Architecture --- The Core of the System

Financial correctness is the highest-risk engineering area. No module
may invent its own independent balance calculation or write money
movement outside the approved shared financial service boundary.

### 7.1 One financial source of truth

The existing `bank_transactions` collection is the current candidate for
the unified ledger/transaction register. Preserve and inspect it. Do not
assume its current schema already satisfies complete double-entry
accounting.

The final architecture must distinguish:

1.  **Business event:** what happened and why (contribution, repayment,
    deposit, expense, investment, etc.).
2.  **Account/holder:** who held the money or which account owned it.
3.  **Financial posting:** the balanced debit/credit or equivalent
    movement lines.
4.  **Balance summary:** cached/denormalized values used for fast
    display.
5.  **Source link:** the originating business record and related
    records.

If `bank_transactions` can safely represent the approved posting model,
retain it. If not, propose the smallest compatible additive extension or
journal/postings structure. Do not rename or migrate existing
collections without a written migration and rollback plan approved by
the owner.

### 7.2 Money-holder/account model

Every amount must be attributable to an identifiable account or holder.

  -----------------------------------------------------------------------
  Account/holder                      Meaning
  ----------------------------------- -----------------------------------
  Collector cash                      Cash physically held by a Collector

  Collector personal mobile wallet    Money received into a Collector's
                                      personal bKash/mobile wallet

  Collector personal bank             Money received into a Collector's
                                      personal bank account

  Cashier cash                        Cash physically held by the
                                      Cashier, where the approved
                                      workflow distinguishes it

  Somity bank                         Official society bank account

  Somity mobile wallet                Official society bKash/mobile-money
                                      account, if one exists

  Somity cash                         Official society cash/vault
                                      holding, if approved
  -----------------------------------------------------------------------

Explicitly store account ownership/type. A Collector's personal account
is never a society-owned account.

### 7.3 Incoming money workflows

#### Flow A --- Member pays Cashier/Collector in cash

**Member → assigned Cashier/Collector → official Somity account**

1.  Authorized staff records member, amount, fee type/months, date,
    method and handler.
2.  Create the contribution/collection record and linked financial
    posting as one consistent operation.
3.  Attribute the money to the correct handler-held account; it is not
    yet official bank balance.
4.  Increase the handler-held balance exactly once.
5.  The handler prepares a deposit/transfer batch when the money is
    transferred to the official account.
6.  The batch records source holder, destination account, amount,
    method, reference and permitted supporting details.
7.  Admin, President or Accountant verifies the official-account
    evidence.
8.  Record the transfer from handler-held funds to the official Somity
    account. Preserve the original collection record.

#### Flow B --- Member pays to Collector's personal bKash/bank

**Member → Collector's personal account → official Somity account**

1.  Record the method and explicitly identify the receiving account as
    Collector-held/personal.
2.  Keep the amount in the Collector-held balance until transfer/deposit
    verification.
3.  Prepare a deposit/transfer batch with the official destination.
4.  Admin, President or Accountant verifies the official transfer
    evidence.
5.  Only then reflect the amount as received in the official Somity
    account.

#### Flow C --- Member pays directly to official Somity bank/bKash

**Member → official Somity account**

1.  Member submits a `payment_claim` with amount, method,
    reference/transaction ID and payment date.
2.  The claim remains pending and is not a confirmed contribution.
3.  Admin, President or Accountant checks the official bank/mobile-money
    statement.
4.  Approval creates/links the confirmed contribution and
    official-account posting exactly once.
5.  Rejection stores the reason and preserves review history.
6.  This flow never increases a Cashier/Collector-held balance.

**A payment claim is not a confirmed contribution.**

### 7.4 Outgoing money workflows

Official society funds may be used for:

-   Financing/loan disbursement.
-   Investment and FDR placement.
-   Business investment.
-   Approved expenses.
-   Authorized withdrawals.
-   Transfers between official accounts.

Every outgoing movement records source account, destination/payee where
applicable, positive amount, reason/category, date, responsible actor,
required approval, reference and linked business record. Approval rules
must follow the approved role matrix and transaction type.

### 7.5 Ledger integrity and immutability

-   Amounts are positive; account/direction postings determine inflow
    and outflow.
-   Posted financial history is never silently edited or deleted.
-   Corrections use a linked reversal, adjustment or new posting with
    actor, reason, timestamp and original transaction reference.
-   A reversal never erases the original record.
-   Prevent duplicate contributions, claim approvals, deposit
    verifications, loan repayments, investment funding/returns and other
    financial postings.
-   A transfer has matching source and destination postings; the
    approved accounting model must balance.
-   Do not treat changing `holdingType`, `status` or `affectsBalance` on
    a previously posted transaction as the default way to represent a
    transfer.
-   Methods such as `markAsDeposited()`, `updateBankTransaction()` and
    `reverseBankTransaction()` require immutability review.
-   Pending/unposted records may have controlled status transitions.
    Once posted, corrections follow immutable-ledger rules.

### 7.6 Atomicity and duplicate prevention

Financial atomicity is a mandatory integrity requirement---not an
optional owner preference.

-   A financial business record, its ledger posting and affected balance
    summaries must commit consistently.
-   Use Firestore transactions when the operation reads current state,
    checks uniqueness/status or updates balances under concurrency.
-   Use batched writes when all writes are known in advance and no
    read-dependent decision is required.
-   Follow Firestore SDK transaction ordering and limits.
-   A query-before-write duplicate check alone is insufficient under
    concurrent submissions. Use deterministic uniqueness keys/document
    IDs or a transactionally protected uniqueness strategy.
-   Guard Pending → Approved transitions so concurrent approvals cannot
    both post money.
-   Rules must validate authorization, allowed fields, state transitions
    and invariants wherever expressible.
-   If the required guarantee needs trusted backend execution that is
    unavailable under current constraints, mark it as a blocker. Do not
    pretend a client transaction alone makes an operation secure against
    a malicious client.

### 7.7 Balances and reconciliation

The approved ledger/posting model is authoritative. Summaries are
derived for performance.

-   Official bank balance = opening balance + verified official inflows
    − verified official outflows, per account.
-   Handler-held balance = received collection postings − verified
    transfers/deposits − valid returns/reversals.
-   Member contribution summary = confirmed contributions plus approved
    adjustments; exclude pending/rejected claims.
-   Loan outstanding follows the approved product-specific contract and
    posted repayments/adjustments.
-   Investment position follows funding, returns, withdrawals and
    approved adjustments.
-   `collector_balances`, `cash_balances`,
    `bank_accounts.currentBalance` and `members.financials` may be
    cached summaries. They must not become competing sources of truth.
-   Provide an authorized reconciliation/recalculation process, tested
    before any live-data execution.

------------------------------------------------------------------------

## 8. Firestore Data Architecture and Cost Efficiency

### 8.1 Collection registry

Continue using the existing `firebaseCollections.ts` as the central
collection-reference registry. Do not scatter raw collection names
throughout pages and components.

### 8.2 Existing collections and candidates

The audit identifies these current collections or candidates:

-   **Identity/settings:** `users`, `members`, `roles`,
    `somity_settings`, `public_info`.
-   **Financial:** `contributions`, `bank_transactions`,
    `bank_accounts`, `deposits`, `collector_balances`, `cash_balances`,
    `payment_claims`, `fund_transactions`, `daily_closing`.
-   **Financing:** `loanApplications`, `loans`, `loan_repayments`,
    `loanDisbursements`.
-   **Investments:** `investments`, `investmentParticipants`,
    `fundingRecords`, `returnRecords`, `investmentTransactions`,
    `investmentHistory`, `investmentDocuments`.
-   **Other/future domains:** `investment_projects`, `businesses`,
    `assets`, `notifications`, `audit_logs`, `system_counters`,
    `expenses`, `teams`, `notices`, `support`.

This is an inventory/planning list---not an instruction to create all
collections. Finalize the data model by examining actual code, queries,
references and approved business rules.

### 8.3 Root collections vs subcollections

Use root collections when cross-member, cross-handler or global
reporting queries are required. Use subcollections when records are
naturally scoped under a parent and global querying is not required.

Examples to evaluate:

-   `members/{memberId}/documents`
-   `loans/{loanId}/installments`
-   `investments/{investmentId}/participants`
-   `investments/{investmentId}/history`

Choose based on query/reporting needs, security rules and cost---not
style alone. Do not migrate existing root collections to subcollections
merely for neatness.

### 8.4 Read/write efficiency

-   Paginate large lists using cursors; do not fetch 10,000 records by
    default.
-   Query only the records/fields needed.
-   Avoid loading whole collections for dashboard statistics.
-   Avoid unnecessary realtime listeners and repeated reads.
-   Reuse/cache shared settings and reference data safely.
-   Use bounded query limits and indexes based on actual queries.
-   Denormalize only when needed for practical reads, and define atomic
    update/reconciliation behavior.
-   Keep documents and arrays reasonably small.
-   Respect Firestore batch/transaction limits and current SDK
    constraints.
-   Minimize extra security-rule document lookups.
-   Verify product limits when needed; do not repeat unsupported
    connection-limit claims from old notes.

### 8.5 Data safety and migrations

Never change live Firebase records during audit/development.

Before any schema/collection migration, prepare:

1.  Current schema and sample structure (without exposing sensitive
    data).
2.  Target schema.
3.  Affected code, queries, rules and indexes.
4.  Duplicate/orphan handling.
5.  Read-only verification and dry-run approach.
6.  Backup and recovery plan.
7.  Rollback plan.
8.  Explicit owner approval requirement.

A GitHub source backup is not a Firestore data backup.

------------------------------------------------------------------------

## 9. Cashier, Collector and Deposit Operations

### 9.1 First release workflow

Complete the current single-Cashier workflow first:

1.  Collection entry and receipt.
2.  Correct handler-held balance.
3.  Deposit batch preparation.
4.  Official-account verification by Admin/President/Accountant.
5.  Daily/monthly collection and held-balance reports.

Do not introduce unnecessary multi-collector complexity into the first
usable release.

### 9.2 Future readiness

The design should support more handlers, assignments, per-handler
balances, scoped access and consolidated management reports---without
duplicate identities or separate ledgers.

### 9.3 Dashboard metrics

Where relevant and affordable:

-   Total collected.
-   Cash collection.
-   bKash/mobile-money collection.
-   Bank collection.
-   Total deposited/verified.
-   Held cash.
-   Held mobile money.
-   Held personal-bank amount.
-   Outstanding/unverified deposits.
-   Oldest pending collection/deposit.
-   Expected contribution versus actual confirmed collection.

Use bounded queries, pagination and justified cached summaries. Do not
load every transaction to render a dashboard.

### 9.4 Filters and deposit deadline

Useful filters:

-   Today.
-   This week.
-   This month.
-   3 months.
-   6 months.
-   1 year.
-   Custom date range.

A default deposit deadline of **3 days** is proposed, subject to owner
confirmation and Main Settings configuration.

Calculate overdue status when a relevant screen/report loads or through
an explicitly initiated safe workflow. Because scheduled/background jobs
are prohibited, do not promise automatic background reminders. Prevent
duplicate in-app alerts if an on-demand notification workflow is used.

------------------------------------------------------------------------

## 10. Contributions and Member Financial Management

Contribution records should capture, as applicable:

-   Member ID and linked member record.
-   Fee/contribution type.
-   Month(s) covered.
-   Positive amount and currency.
-   Payment method.
-   Cashier/Collector/handler or official account.
-   Receipt/reference ID.
-   Transaction date and recording actor.
-   Payment status and verification status.
-   Linked financial transaction/posting.

Business rules:

-   The same member, fee type and month cannot be posted twice.
-   One entry may cover multiple months when the approved fee rules
    allow it.
-   A pending payment claim is excluded from confirmed paid totals.
-   Corrections use linked reversal/adjustment and retain history.
-   Paid, pending and overdue status use approved fee settings and
    confirmed payment history.
-   Member cash payments are recorded by authorized staff, not
    self-confirmed by the Member.
-   Monthly fee, fee types, start dates, exemptions and similar
    parameters come from Main Settings or their approved configuration
    source---not duplicated hardcoded constants.

------------------------------------------------------------------------

## 11. Islamic Financing and Loan Management

The existing project includes nine named financing types:

-   Murabaha
-   Musharaka
-   Salam
-   Qard Hasanah
-   Istisna
-   Mudaraba
-   Tawarruq
-   Ijarah
-   Kafalah

Do not treat every product as a generic interest-bearing loan. Each
product may have distinct contract terms, asset/ownership steps, profit
treatment, fees, schedules and documentation. Product-specific rules
must be reviewed and approved before changing calculations.

Expected workflow:

1.  Member application.
2.  Review and eligibility checks.
3.  Approval/rejection with actor, reason and history.
4.  Product-specific agreement/contract.
5.  Disbursement or asset/financing execution, as applicable.
6.  Installment/payment schedule.
7.  Repayment posting.
8.  Outstanding/overdue calculation.
9.  Completion/closure.

Approval, loan creation, disbursement, repayment, ledger posting and
summary updates must be consistent, atomic where required and protected
against duplicate/concurrent operations. All money movements link to the
shared financial architecture.

------------------------------------------------------------------------

## 12. Investments, FDR, Business and Assets

### 12.1 Investments

-   Preserve the existing Investments implementation.
-   Reuse its sound atomic-operation patterns.
-   Verify funding, returns, withdrawals, participant balances, status
    changes and history against the approved ledger model.
-   Link all investment money movements to the shared financial
    architecture.

### 12.2 FDR

Track, as approved:

-   Principal.
-   Institution/account.
-   Placement date.
-   Maturity date.
-   Return/profit.
-   Renewal/withdrawal.
-   Supporting references and related financial postings.

### 12.3 Business

The Business module should eventually track:

-   Business projects/activities.
-   Capital and funding.
-   Ownership/participants where applicable.
-   Income and expenses.
-   Returns and distributions.
-   Related financial postings and reports.

### 12.4 Assets

The Assets module should track:

-   Asset register and description.
-   Acquisition date/cost.
-   Ownership.
-   Valuation where relevant.
-   Depreciation only if an approved accounting policy requires it.
-   Disposal and related financial postings.

Do not delete placeholder Assets/Business pages because they are
unfinished. Preserve them until the owner approves a different scope or
the replacement is complete.

### 12.5 Future co-investor capability

Co-investor access is a future phase. Reuse the same identity and
permission architecture. Do not create duplicate accounts for existing
Members. A co-investor must see only their own approved portfolio and
history.

------------------------------------------------------------------------

## 13. Reports, Audit Trail and In-App Notifications

### 13.1 Reports

Reports must derive from real authorized data and the shared financial
source---not hardcoded dashboard values or isolated module totals.

Planned reports:

-   Daily/monthly collection.
-   Member-wise contribution.
-   Cashier/Collector-wise collection and held balance.
-   Deposit verification/reconciliation.
-   Bank account statement.
-   Official cash position.
-   Loan applications, disbursement, repayment and outstanding.
-   Investment funding, returns and position.
-   Business income/expense and asset reports.
-   Overall financial position and audit reports.

Reuse existing PDF/Excel/Print utilities where appropriate.

### 13.2 Audit history

Important actions should be recorded where technically supportable:

-   User creation/disable and role/permission changes.
-   Member profile and financial changes.
-   Contribution posting/reversal.
-   Payment claim approval/rejection.
-   Deposit creation/verification/rejection/reversal.
-   Loan approval/disbursement/repayment/correction.
-   Investment funding/return/status/withdrawal.
-   Business/asset financial actions.
-   Settings and module enable/disable changes.

Useful fields include actor, action, target, timestamp, reason and
relevant before/after values. Minimize sensitive personal/payment data
in logs.

**Trust limitation:** A client-written audit log is not automatically
tamper-proof. Without trusted backend execution, do not describe it as a
secure server-side audit trail. Disclose any guarantee that cannot be
enforced under the current architecture.

### 13.3 Notifications

-   Firestore-backed in-app notifications only.
-   No FCM push sending.
-   No scheduled/background jobs.
-   Notifications must be role-scoped and deduplicated.
-   Overdue alerts may be calculated on-demand when an authorized
    dashboard/report is opened.

------------------------------------------------------------------------

## 14. Security and Production Data Readiness

Security is a prerequisite for real data---not a cosmetic final phase.

-   Replace permissive Firestore Rules with comprehensive restrictive
    rules before real member/financial data is introduced.
-   UI permission checks improve usability but are never the security
    boundary.
-   Rules must protect data by role, ownership, allowed fields, state
    transitions and immutable posted records wherever expressible.
-   Protect role assignment and settings changes so ordinary users
    cannot promote themselves or enable unauthorized modules.
-   Match member ownership checks to the actual user/member link schema;
    never assume a field such as `uid` exists without verification.
-   Test unauthorized reads/writes, cross-member access, cross-Cashier
    access, self-verification and concurrent approval cases.
-   Use Firebase Emulator/rules tests where practical before proposing
    deployment.
-   App Check, Auth domain restrictions, API-key restrictions and other
    Firebase controls may be evaluated as defense-in-depth; verify
    current availability and cost before relying on them.
-   Never expose actual secrets. Do not unnecessarily repeat public
    Firebase configuration values in reports.
-   Do not deploy rules without explicit owner approval and reviewed
    test results.
-   Do not enter real financial data until the restrictive rules and
    access tests are ready.

### 14.1 No-Functions feasibility rule

For every sensitive workflow, explicitly answer:

1.  Can Firestore Rules enforce the required authorization and data
    invariants?
2.  Can the client SDK perform the operation without allowing a
    malicious client to bypass the workflow?
3.  Does the operation require trusted server-side execution?
4.  If trusted execution is unavailable, must the feature be blocked,
    simplified with owner approval, or deferred?

Never label a workflow secure merely because it uses `runTransaction()`
or a batch. Atomicity and authorization are separate requirements.

------------------------------------------------------------------------

## 15. Testing and Definition of Done

A successful UI render or build alone is not completion.

### 15.1 Mandatory financial/security test scenarios

1.  Same member/fee/month contribution submitted twice.
2.  Two concurrent approvals of the same payment claim.
3.  Two concurrent verifications of the same deposit.
4.  Failure during a multi-document financial posting.
5.  Cashier/Collector held balance compared with ledger postings.
6.  Reversal and its effect on member, bank and handler summaries.
7.  Duplicate loan repayment.
8.  Cashier attempts to view another handler's private collection.
9.  Member attempts to view another Member's financial record.
10. Unauthorized role attempts deposit verification.
11. Disabled module direct-route and direct-write attempt.
12. Main Settings value changes: every intended consumer uses the new
    value.
13. Historical records remain available after a module is disabled.
14. Pagination and bounded dashboard reads work correctly.

### 15.2 Module completion checklist

A module is `COMPLETE` only when:

-   Its approved workflow works end-to-end.
-   It uses shared settings/configuration where appropriate.
-   It uses approved permission and data-access patterns.
-   Financial operations are consistent, atomic where required and
    duplicate-safe.
-   Existing history is preserved.
-   Loading, empty, error and success states exist.
-   Bengali labels/messages and existing formatters are used
    consistently.
-   Build, lint and relevant tests pass---or tooling gaps are explicitly
    documented.
-   Read/write usage is reasonable for the small society.
-   The owner has reviewed and accepted the result.

------------------------------------------------------------------------

## 16. Implementation Roadmap

The roadmap expresses the product direction. It is not blanket
permission to implement every phase. Dependencies may be refined during
architecture work, but any meaningful change to scope or order must be
explained and recorded.

### Phase 0 --- Existing Project Audit

**Status:** Completed as an initial baseline; findings remain subject to
verification.

-   Inventory modules, routes, pages, components, hooks and services.
-   Inventory collections and relationships.
-   Trace financial flows and calculations.
-   Review authentication, roles, permissions and Firestore Rules.
-   Identify mock/real functionality, overlaps, risky writes, unbounded
    queries and dependencies.
-   Record Git/build state.

Deliverables: - `FINDINGS.md` - `MODULE_AUDIT.md` -
`COLLECTION_INVENTORY.md` - `SECURITY_AUDIT.md`

No application code changes in this phase. Keep the audit reports as
evidence; correct factual errors through dated addenda rather than
silently rewriting audit history.

### Phase 1 --- Business Rules and Architecture

-   Reconcile this Master Plan with the four audit reports and actual
    current code.
-   Confirm scope, budget and current no-Functions/no-Storage/no-FCM
    restrictions.
-   Finalize `BUSINESS_RULES.md`.
-   Finalize `ROLE_PERMISSION_MATRIX.md`.
-   Complete `SETTINGS_MATRIX.md`.
-   Design `FINANCIAL_LEDGER_DESIGN.md` and account/holder model.
-   Draft `DATA_MODEL.md` and map existing collections without
    migration.
-   Draft `SECURITY_RULES_PLAN.md`, including feasibility gaps under
    Spark-only/client-only constraints.
-   Draft `MIGRATION_PLAN.md` only for changes that are genuinely
    necessary.
-   Resolve open decisions with options, consequences and owner
    decisions.

**Acceptance:** The owner understands and approves business rules,
setting ownership, role boundaries, ledger approach, data compatibility
and technical limitations. No implementation rewrite begins before this
acceptance.

### Phase 2 --- Settings, Identity, Permissions and Security Foundation

-   Complete the common Settings service/configuration path.
-   Make Main Settings the clear source for approved society/module
    configuration.
-   Establish setting/feature matrix and module ON/OFF behavior.
-   Verify Authentication and Members; preserve existing working flows.
-   Finalize role/permission model and compatibility plan.
-   Verify one identity ↔ linked member profile and multi-responsibility
    behavior.
-   Implement and test restrictive Firestore Rules within the allowed
    architecture.
-   Resolve or explicitly block account provisioning that cannot be
    secured under current constraints.
-   Protect role changes, settings writes and disabled-user access.

**Acceptance:** Approved settings are consistently consumed; UI/routes
respect module state; unauthorized Firestore access is denied by rules;
existing Members/Auth flows remain intact. Do not introduce real data
until rules are approved and deployed.

### Phase 3 --- Financial Core and Ledger Ownership

-   Confirm ledger/accounting model and account/holder registry.
-   Establish one approved service boundary for financial postings.
-   Review `bank_transactions`, `fund_transactions`, `bank_accounts`,
    `cash_balances`, `collector_balances` and `deposits`.
-   Distinguish business events, transfers, journal postings and cached
    balances.
-   Establish immutable posted history, linked reversal/adjustment and
    duplicate protection.
-   Make balance updates atomic and define reconciliation.
-   Resolve Treasury/Bank Transactions/Cashier service ownership.
-   Add pagination to large ledger queries within approved scope.

**Acceptance:** One traceable financial architecture exists;
source/destination are identifiable; movements balance; posted history
is not silently mutated; cached balances can be reconciled. No
collection migration/deletion without separate approval.

### Phase 4 --- Contributions and Direct Payment Claims

-   Complete the existing contribution flow; do not rebuild the UI
    unnecessarily.
-   Ensure multi-month rules and duplicate-month protection.
-   Make contribution + ledger posting + relevant summary update
    consistent/atomic.
-   Complete direct bank/bKash payment claims.
-   Enforce pending/approved/rejected workflow and approver
    restrictions.
-   Exclude unverified claims from confirmed paid balances.
-   Verify receipts, member summaries and fee calculations from Main
    Settings.

**Acceptance:** Duplicate payment cannot be posted; pending payment is
never counted as confirmed; direct official-account payment does not
inflate handler-held balance; corrections are traceable.

### Phase 5 --- Cashier, Collector, Deposits and Daily Closing

-   Complete the current single-Cashier workflow first.
-   Define collection and handler-held balance.
-   Complete deposit batch creation and official-account verification.
-   Restrict verification to Admin/President/Accountant.
-   Prevent self-verification.
-   Preserve original collections and record transfer as a linked
    movement.
-   Implement deposit deadline/overdue calculations through on-demand
    flows only.
-   Complete daily closing and reports with ledger reconciliation.

**Acceptance:** Every collected amount is traceable from member to
handler to official account; no self-verification or duplicate posting;
one Cashier works simply while the design can support more later.

### Phase 6 --- Member Portal and Dashboard

-   Reuse existing Members, MyProfile and Auth work.
-   Replace mock values with authorized real data only after the
    underlying flows are complete.
-   Provide own profile, contribution history, payment claims and, as
    later phases complete, own loan/investment information.
-   Enforce member-only ownership rules.
-   Use bounded reads/cached summaries consistent with the ledger.

**Acceptance:** A Member sees only their own authorized information; no
fake financial metrics are presented as live data.

### Phase 7 --- Islamic Financing and Loans

-   Review all nine financing types and their calculations/contracts.
-   Complete applications, review, approval/rejection and record
    creation.
-   Make approval/loan creation consistent and duplicate-safe.
-   Complete disbursement and ledger posting.
-   Complete repayment, schedule updates, outstanding and overdue
    calculations.
-   Preserve repayment/disbursement history and correction links.

**Acceptance:** Product-specific rules are respected; generic interest
logic is not incorrectly applied; every disbursement/repayment links to
the shared financial architecture; concurrent or duplicate actions
cannot post twice.

### Phase 8 --- Treasury, Bank Views and Financial Reporting

-   Complete unified Treasury/Bank UI based on the approved ledger
    service boundary.
-   Remove conflicting write paths only after callers are migrated and
    tested.
-   Complete account statements, cash position, incoming/outgoing
    reports, deposit reconciliation and daily/monthly closing.
-   Replace mock financial dashboards/reports with bounded queries and
    approved summaries.
-   Reuse existing export utilities.

**Acceptance:** Treasury, Bank Transactions and Cashier screens show
consistent numbers from the same financial source; no competing balance
logic remains.

### Phase 9 --- Investments, FDR, Business and Assets

-   Verify and complete Investments using sound existing atomic
    patterns.
-   Integrate investment funding, return and withdrawal with the shared
    financial architecture.
-   Complete FDR tracking.
-   Implement Business and Assets according to owner-approved
    requirements.
-   Preserve placeholder pages until replacement is complete or the
    owner explicitly decides otherwise.

**Acceptance:** Every investment/business/asset money movement is
traceable in the shared financial architecture; existing Investment
history remains intact.

### Phase 10 --- Organization, Communication, Support and In-App Notifications

-   Complete Teams where required.
-   Complete Notices and committee communication.
-   Implement in-app notifications only; no FCM sending or scheduled
    jobs.
-   Complete Support/FAQ/request workflows if still in scope.
-   Ensure role-based visibility and deduplication.

**Acceptance:** Only authorized users can view/act on notices, messages
and support records; no prohibited push/scheduled infrastructure is
introduced.

### Phase 11 --- Co-investor and Future Expansion

-   Design co-investor access using the existing
    identity/member/permission architecture.
-   Provide own investment portfolio and permitted history only.
-   Add future modules only after owner approval and cost/security
    review.

**Acceptance:** No duplicate identity is required; co-investor access is
limited to its own approved scope.

### Phase 12 --- Final Hardening and Deployment Readiness

-   Full security/Rules test suite.
-   Financial calculation and concurrency tests.
-   Duplicate/reversal/reconciliation tests.
-   Role and ownership access-matrix tests.
-   Module ON/OFF behavior tests.
-   Bengali UI, responsive and accessibility checks.
-   Pagination, performance and Firebase usage review.
-   Dependency, lint and build review.
-   Backup/recovery and rollback procedure.
-   Production deployment checklist.

**Acceptance:** All success criteria in Section 17 pass. Production
deployment occurs only after explicit owner approval.

------------------------------------------------------------------------

## 17. Final Project Success Criteria

The project is successful when:

1.  Every user can perform only actions permitted by their assigned
    responsibilities.
2.  A Member sees only their own authorized profile and financial
    history.
3.  Cashier/Collector collections and held balances are individually
    traceable.
4.  Society bank and cash balances reconcile with the financial ledger.
5.  Every movement has traceable source, destination, amount, actor and
    business reason.
6.  Duplicate contribution, payment approval, deposit verification,
    repayment and investment posting are prevented.
7.  Only Admin, President or Accountant can verify deposits and
    approve/reject direct payment claims.
8.  Loan, investment, business, asset and expense movements use the same
    approved financial architecture.
9.  Reports use real authorized data, not placeholder figures.
10. Restrictive Firestore Rules and permission tests pass before real
    data is introduced.
11. Main Settings consistently controls approved module/business
    configurations.
12. Turning a module OFF does not delete records or erase financial
    history.
13. Firebase usage remains proportionate to a small society and within
    the chosen budget.
14. New modules can be added without breaking identity, permissions or
    the financial core.
15. The existing project has been improved rather than unnecessarily
    rebuilt.

------------------------------------------------------------------------

## 18. Claude Code Working Protocol

Claude Code must follow these rules for every task:

1.  Read `CLAUDE.md`, this Master Plan, current `PROGRESS.md`,
    `DECISIONS.md` and relevant audit/reference sections.
2.  Verify the current Git branch, working tree and recent commits.
    Never assume an old checkpoint is still current.
3.  Inspect the target module's actual pages, components, hooks,
    services, routes, collection references, permissions and settings
    consumers.
4.  Trace callers and dependencies before proposing consolidation,
    removal or rewrite.
5.  State which roadmap phase and acceptance criteria the task serves.
6.  Check Main Settings and module ON/OFF behavior before implementing a
    feature.
7.  Present a short bounded plan, affected-file list, risks and
    verification approach for the workstream.
8.  Wait for owner approval before changing application code for that
    workstream.
9.  Once a bounded workstream is approved, complete its routine
    sub-steps without repeatedly asking for approval. Stop and ask only
    if scope expands or a protected decision/action is required.
10. Work on one primary module/workstream at a time. Do not quietly
    expand into adjacent modules.
11. Never delete modules/pages/services/collections/dependencies without
    proof of references, impact analysis and explicit owner approval.
12. Never perform schema migration, financial-rule change, role-model
    migration, Firestore Rules deployment, live-data modification or
    production deployment without explicit owner approval.
13. Never read/expose secrets or `.env` files. Never deploy Functions,
    Storage, FCM or scheduled jobs.
14. Run relevant build, lint and tests after approved changes. Never
    claim a test passed unless it was actually run.
15. Report changed files, behavior changes, tests, limitations, risks
    and remaining work in plain language.
16. Update `docs/PROGRESS.md` and `docs/DECISIONS.md` only with facts
    and decisions actually confirmed.
17. Do not mark a task complete merely because code was written.
18. Stop after the approved workstream, summarize the result and
    identify the next logical workstream.

### 18.1 No silent cleanup

-   Duplicate-looking pages may serve different routes or roles.
-   Placeholder modules may be future product scope.
-   Collections marked unused may contain data or future contractual
    meaning.
-   Package search results alone do not prove safe deletion.
-   Keep cleanup candidates in a proposal; do not delete them without
    owner approval.

### 18.2 Reporting format

Every workstream report should state:

-   **Goal:** What user/business outcome this work supports.
-   **What was inspected:** Actual files and workflows.
-   **What changed:** Exact files and behavior.
-   **What was preserved:** Existing functionality/data paths
    intentionally retained.
-   **Verification:** Commands/tests actually run and results.
-   **Limitations/risks:** Including any no-Functions security
    limitation.
-   **Progress:** What is complete, partial, blocked or deferred.
-   **Next step:** One logical next workstream, not a new broad audit.

Use Bangla/Banglish for owner-facing explanations where practical; keep
technical names and code identifiers exact.

------------------------------------------------------------------------

## 19. Open Decisions --- Resolve Only When Their Phase Requires Them

These questions must be presented with options, consequences and
evidence. Claude Code must not decide them silently. They do not all
need to be solved before unrelated work can proceed.

1.  **Ledger representation:** Can current `bank_transactions` support
    balanced source/destination postings, or is a small additive
    journal/postings model required?
2.  **Role storage:** How can one identity hold multiple
    responsibilities while remaining compatible with the current
    `users.role` schema and restrictive Rules?
3.  **Account provisioning:** What secure account-creation workflow is
    feasible while Cloud Functions are prohibited?
4.  **Settings design:** Which module toggles/business settings belong
    in `somity_settings/config`, and which need separate documents for
    size/concurrency/query reasons?
5.  **Deposit history:** Which existing fields/methods represent pending
    collection versus posted transfer, and how can `markAsDeposited()`
    be replaced without losing history?
6.  **Legacy collections:** What are the actual uses/data contents of
    `collector_balances`, `deposits`, `audit_logs` and `roles`? No
    deletion until proven and approved.
7.  **Treasury ownership:** Which service is the canonical writer for
    bank/cash/fund movements, and how will callers transition safely?
8.  **Financing authority:** Which roles approve each Islamic financing
    type, and which approval requirements apply by amount/type?
9.  **Document storage:** Which document features must remain deferred
    while Cloud Storage is prohibited?
10. **Charts/dependencies:** Which chart library is genuinely used and
    should be retained after verifying imports, bundle impact and
    current UI?
11. **Security feasibility:** Which operations can be adequately
    protected with Firebase Auth + Firestore Rules + client SDK only,
    and which must be blocked/deferred because trusted backend execution
    is unavailable?
12. **Production data readiness:** What exact rules, tests, backup,
    recovery and deployment checks must pass before real
    member/financial data is entered?

------------------------------------------------------------------------

## 20. Final Non-Negotiable Principles

1.  **Preserve before rebuild:** Reuse existing working code and UI.
2.  **Financial accuracy first:** Data integrity is more important than
    visual polish.
3.  **Least privilege:** Every person sees and does only what their
    responsibilities permit.
4.  **Cost conscious:** Avoid unnecessary reads, writes, listeners, paid
    services and operational complexity.
5.  **Modular but unified:** Modules have clear boundaries but share
    identity, settings, permissions and financial core.
6.  **Evidence before change:** Understand actual code and data
    relationships before modifying them.
7.  **Small, completed steps:** Finish one bounded workstream, verify
    it, then move forward.
8.  **No silent financial changes:** Historical postings remain
    traceable; corrections reference originals.
9.  **Future-ready, not overcomplicated:** Support growth while keeping
    the current \~20-member/one-Cashier operation simple.
10. **Owner control:** The owner controls business rules, budget,
    security posture, migrations and production deployment.

------------------------------------------------------------------------

# MASTER DIRECTION

Our goal is **not to rebuild the old project**.

Our goal is to turn the existing Al Amin Somity project into a
**reliable, secure, low-cost, unified financial management platform**.

The original product vision and owner-approved business rules determine
where the project is going. The existing code and audit reports show
what is already there and what needs improvement. Claude Code's
responsibility is to connect those two carefully---preserving useful
work, completing real workflows, protecting financial integrity and
staying within the agreed budget.

**Understand what exists. Preserve what works. Fix what is unsafe or
incomplete. Complete one meaningful workstream at a time.**
