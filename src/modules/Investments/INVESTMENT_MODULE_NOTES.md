# Investments module — what changed and what needs your decision

## Why it kept breaking (root causes found in investment.zip)
1. **Two incompatible generations of code lived together.** June files (old pages/hooks) used `CreateInvestmentRequest`, `CoInvestor`, `maturityCalculator`, `InvestmentForm/*` — none of which exist in the zip. October files (types, 7 services, tabs) use a different data model. Nothing connected them.
2. **Missing types.** Services imported `InvestmentCreateInput`, `FundingCreateInput`, … which were never defined → TypeScript errors.
3. **Hook called methods that don't exist** (`investmentService.getInvestments()`, `getParticipants()`…).
4. **Funding / Return / Document / Approval tabs saved nothing.** They only did `console.log` and showed a green "Funding recorded" toast. Money was never stored.
5. **`where()` + `orderBy()` queries** need composite indexes; without them Firestore throws and the screen stays empty.
6. **Optional form fields = `undefined`**, which Firestore rejects.
7. **CSS classes `.inp`, `.label-eyebrow`, `.scrollbar-thin`** were used everywhere but defined nowhere in the module → unstyled forms.
8. Dependencies on unverified files: `@/lib/utils`, `SomitySettingsProvider`.

## What is in this drop (same folder layout: src/modules/Investments/)
- **New:** `services/investmentOps.ts` (create / change status / record funding / record return — each in ONE transaction), `utils/actor.ts`, `utils/cn.ts`, `investments.css`.
- **New pages:** `InvestmentListPage`, `InvestmentCreatePage`, `InvestmentDetailPage` (reuses your existing tab components).
- **Edited:** `types` (added Input types), 5 services (no more where+orderBy), `useInvestmentData` hook, 4 tabs (now really save), `Card.tsx`/`Charts.tsx` (local `cn`), `routes.tsx`, `menu.ts`.
- **Moved, not deleted:** old pages/hooks/helpers → `_legacy/`. Add `"exclude": ["src/modules/Investments/_legacy"]` to `tsconfig.app.json`.

## Steps to install
1. Replace `src/modules/Investments` with this folder (keep your own `_legacy` copy if you want).
2. Add the exclude above.
3. Confirm `routes.tsx` is still spread into your app router and `menu.ts` into your sidebar.
4. Deploy Firestore rules (see `firestore.rules.template`) — **before real data**.

## Verified here
Strict TypeScript check passes (against stubs for react/firebase/router, since your node_modules aren't in the zip) and the money logic was run against an in-memory Firestore mock (status guards, funding/return atomic updates, rounding, undefined-stripping, no-actor block). **Not tested against your real Firebase / UI in a browser.**

## NOT built (kept minimal on purpose)
Edit-investment page, reports/dashboard charts, file upload to Storage (documents store metadata only), reversal of a wrong funding/return, profit distribution to members, link to Treasury/Cashier/Bank.

## Questions I need you to answer (I did not guess these)
1. **Cash/bank link.** When the Somity funds an investment, which account does the money leave (cash / bank), and should it post to Treasury/Cashier automatically? Today: recorded inside the module only, nothing is posted elsewhere.
2. **Does `expected_return_amount` / `actual_return_amount` include principal or profit only?** Today every amount received is added to `actual_return_amount`, and your ReturnsTab splits that total by `return_share_pct`.
3. **Over-funding.** Should funding be blocked when total funded would exceed total required (or a participant's committed amount)? Today: allowed; UI only shows the numbers.
4. **Who may approve?** Any admin, or someone other than the creator (maker-checker)? Today: any admin.
5. **Return share of the Somity.** Default `return_share_pct` is 0 until you type it. What is the real rule (same as ownership %, or agreed per deal)?
6. **Direction in the ledger.** I mark only the Somity's own funding as `Outflow` and external investors' as `Neutral`; returns to Somity (or to the investment as a whole) as `Inflow`. Correct?
7. **Status order.** Allowed moves are in `NEXT_STATUS` (top of `investmentOps.ts`). Please confirm or edit.
8. **Reference number.** Typed by hand today. Do you want an auto format (e.g. INV-2026-001)? Give me the format.
9. **Wrong entries.** Funding/return rows can't be deleted from the UI. How should corrections work (reversal row)?
