# Settings Matrix — Al Amin Somity Project

**Generated:** 2025-11-20  
**Branch:** `cleanup`  
**Source:** `src/types/settings.ts` `SomitySettings` interface, Settings UI components, Module service consumption  
**Verification Status:** ✅ Code-inspected — items marked UNKNOWN where consumption not traced  
**Aligned with:** `docs/MASTER_PLAN.md` v1.1 §5 (Main Settings Architecture), §5.1 (Module Control), §5.2 (Configuration Hierarchy)

---

## Overview

The application uses a **single Firestore document** for all configuration:
- **Collection:** `somity_settings`
- **Document ID:** `config` (fixed)
- **Loaded by:** `AuthProvider.loadSomityInfo()` on app startup
- **Edited by:** `src/modules/settings/pages/index.tsx` → `setDoc(collections.somitySettings(), ..., { merge: true })`
- **Consumed by:** Multiple modules via direct import of `DEFAULT_SOMITY_SETTINGS` or runtime fetch

**Master Plan §5 Requirement:** "Settings is the single source of truth. Every module respects ON/OFF flags and config values. Settings service layer replaces direct `updateDoc` calls."

---

## Settings Structure (from `src/types/settings.ts`)

```typescript
SomitySettings {
  general: GeneralSettings,           // Branding, contact, watermark
  share: ShareConfig,                 // Share value, limits
  fee: FeeConfig,                     // Fee type, amount, due dates, penalties
  member: MemberConfig,               // Member limits, ID format, roles
  loan: LoanConfig,                   // Loan limits, rates, approval, eligibility
  islamicLoanConfig: IslamicLoanConfig, // 9 Islamic product configs
  collection: CollectionConfig,       // Payment methods, receipts, schedule, reminders
  financial: FinancialConfig,         // Fiscal year, currency, formatting
  report: ReportConfig,               // Report generation, retention
  security: SecurityConfig,           // 2FA, session, passwords
  investment: InvestmentConfig        // Investment enable, limits, profit sharing
}
```

---

## Settings Matrix by Section

### 1. General Settings (`general`)

| Setting | Type | Default | Consumed By | Verification |
|---------|------|---------|-------------|--------------|
| `somityName` | string | `''` | **AuthProvider** (somityInfo.name), Receipts, Reports, PDF headers | ✅ Verified |
| `somityEmail` | string | `''` | AuthProvider (somityInfo.email), Reports, Notifications | ✅ Verified |
| `somityPhone` | string | `''` | AuthProvider (somityInfo.phone), Reports, SMS | ✅ Verified |
| `somityAddress` | string | `''` | AuthProvider (somityInfo.address), Receipts, Reports | ✅ Verified |
| `slogan` | string | `''` | GeneralSettings UI, Receipt footer, Reports | ✅ Verified |
| `logo` | string (base64) | `''` | GeneralSettings UI, Receipts, Watermark, Reports | ✅ Verified |
| `favicon` | string | `''` | **UNKNOWN** — not traced in consumption | ❓ UNKNOWN |
| `website` | string | `''` | GeneralSettings UI, Reports | ❓ UNKNOWN |
| `establishedYear` | number | current year | GeneralSettings UI, Reports | ❓ UNKNOWN |
| `registrationNumber` | string | `''` | GeneralSettings UI, Reports | ❓ UNKNOWN |
| `taxId` | string | `''` | GeneralSettings UI, Reports | ❓ UNKNOWN |
| `alternativePhone` | string | `''` | GeneralSettings UI | ❓ UNKNOWN |
| `fax` | string | `''` | GeneralSettings UI | ❓ UNKNOWN |
| `watermarkText` | string | `'স্মৃতি চিরন্তন'` | **GeneralSettings** (watermark preview), Receipts, PDFExport | ✅ Verified |
| `watermarkOpacity` | number | `0.1` | GeneralSettings, Receipts, PDFExport | ✅ Verified |
| `watermarkEnabled` | boolean | `true` | GeneralSettings, Receipts, PDFExport | ✅ Verified |
| `watermarkRotation` | number | `-12` | GeneralSettings, Receipts, PDFExport | ✅ Verified |

---

### 2. Share Settings (`share`)

| Setting | Type | Default | Consumed By | Verification |
|---------|------|---------|-------------|--------------|
| `perShareValue` | number | `1000` | **MemberService** (member creation), **ContributionService** (fee calc), ShareSettings UI | ✅ Verified |
| `minShare` | number | `1` | Member creation validation, ShareSettings | ✅ Verified |
| `maxShare` | number | `100` | Member creation validation, ShareSettings | ✅ Verified |
| `defaultShare` | number | `1` | Member creation, AddMember page | ✅ Verified |

**Validation Warning:** Changing `perShareValue` with existing members triggers warning (useSettingsValidation.ts:95-104)

---

### 3. Fee Settings (`fee`)

| Setting | Type | Default | Consumed By | Verification |
|---------|------|---------|-------------|--------------|
| `type` | `'weekly' \| 'biweekly' \| 'monthly'` | `'monthly'` | **memberDueService** (due calc), FeeSettings UI, ContributionEntry | ✅ Verified |
| `amountPerShare` | number | `1000` | **memberDueService** (due calc), **ContributionService** (fee calc), FeeSettings | ✅ Verified |
| `dueDay` | number | `1` | **memberDueService** (due date calc), FeeSettings | ✅ Verified |
| `lateFee` | number | `50` | **memberDueService** (late calc), FeeSettings | ✅ Verified |
| `lateFeeAfterDays` | number | `7` | **memberDueService** (late trigger), FeeSettings | ✅ Verified |
| `gracePeriod` | number | `3` | **memberDueService** (grace calc), FeeSettings | ✅ Verified |

**Validation Warning:** Changing `amountPerShare` with existing transactions triggers warning (useSettingsValidation.ts:82-91)

---

### 4. Member Settings (`member`)

| Setting | Type | Default | Consumed By | Verification |
|---------|------|---------|-------------|--------------|
| `maxMembers` | number | `100` | Member creation validation, MemberSettings UI | ✅ Verified |
| `planMaxMembers` | number | `100` | MemberSettings UI (plan limit display) | ❓ UNKNOWN |
| `requireApproval` | boolean | `false` | Member creation flow, AddMember page | ✅ Verified |
| `autoGenerateMemberId` | boolean | `true` | **memberService.generateNextMemberId()**, AddMember | ✅ Verified |
| `memberIdPrefix` | string | `'MBR-'` | **memberService.generateNextMemberId()**, MemberSettings | ✅ Verified |
| `memberIdDigitLength` | number | `3` | **memberService.generateNextMemberId()**, MemberSettings | ✅ Verified |
| `autoActivateAfterApproval` | boolean | `true` | Member approval flow, MemberSettings | ❓ UNKNOWN |
| `defaultRole` | `'member' \| 'manager' \| 'cashier' \| 'accountant'` | `'member'` | Member creation, MemberSettings | ✅ Verified |
| `defaultStatus` | `'active' \| 'pending' \| 'inactive'` | `'active'` | Member creation, MemberSettings | ✅ Verified |
| `minAge` | number | `18` | Member creation validation, MemberSettings | ✅ Verified |
| `inactiveAfterDays` | number | `90` | **UNKNOWN** — not traced in memberQueryService | ❓ UNKNOWN |
| `deleteAfterDays` | number | `365` | **UNKNOWN** — not traced | ❓ UNKNOWN |

**Validation Warning:** Changing `memberIdPrefix` with existing members triggers warning (useSettingsValidation.ts:121-130)

---

### 5. Loan Settings (`loan`)

| Setting | Type | Default | Consumed By | Verification |
|---------|------|---------|-------------|--------------|
| `maxLoans` | number | `2` | **FinancingService** (approval validation), LoanSettings UI | ✅ Verified |
| `maxLoanAmount` | number | `100000` | FinancingService, LoanSettings | ✅ Verified |
| `minLoanAmount` | number | `1000` | FinancingService, LoanSettings | ✅ Verified |
| `defaultInterestRate` | number | `10` | **FinancingService.approveLoanApplication()** (fallback), LoanSettings | ✅ Verified |
| `maxDuration` | number | `36` | FinancingService, LoanSettings | ✅ Verified |
| `minDuration` | number | `1` | FinancingService, LoanSettings | ✅ Verified |
| `requireGuarantor` | boolean | `true` | FinancingService (application validation), LoanSettings | ✅ Verified |
| `requireCollateral` | boolean | `false` | FinancingService, LoanSettings | ✅ Verified |
| `approvalRequired` | boolean | `true` | FinancingService (approval flow), LoanSettings | ✅ Verified |
| `processingFee` | number | `1` | FinancingService (disbursement calc), LoanSettings | ✅ Verified |
| `latePaymentPenalty` | number | `2` | FinancingService (repayment calc), LoanSettings | ✅ Verified |
| `minDuration` | number | `1` | FinancingService, LoanSettings | ✅ Verified |
| `latePaymentGraceDays` | number | `7` | FinancingService (repayment), LoanSettings | ✅ Verified |
| `autoApproveForGoodStanding` | boolean | `false` | FinancingService, LoanSettings | ❓ UNKNOWN |
| `minMembershipDuration` | number | `3` | FinancingService (eligibility), LoanSettings | ✅ Verified |
| `minSavingsPercentage` | number | `20` | FinancingService (eligibility), LoanSettings | ✅ Verified |
| `maxLoanToSavingsRatio` | number | `5` | FinancingService (eligibility), LoanSettings | ✅ Verified |
| `requireIncomeProof` | boolean | `false` | FinancingService, LoanSettings | ❓ UNKNOWN |
| `requireBusinessProof` | boolean | `false` | FinancingService, LoanSettings | ❓ UNKNOWN |
| `maxOutstandingLoanRatio` | number | `50` | FinancingService, LoanSettings | ❓ UNKNOWN |
| `autoDisburseAfterApproval` | boolean | `true` | FinancingService (disbursement flow), LoanSettings | ❓ UNKNOWN |

**Validation Warning:** Changing `defaultInterestRate` with active loans triggers warning (useSettingsValidation.ts:108-117)

---

### 6. Islamic Loan Config (`islamicLoanConfig`)

| Product | Settings | Consumed By | Verification |
|---------|----------|-------------|--------------|
| `murabaha` | `enabled`, `profitRate`, `maxDuration`, `minDownPayment`, `latePenalty` | **FinancingService.approveLoanApplication()** (case 'murabaha'), IslamicFinanceSettings UI | ✅ Verified |
| `musharaka` | `enabled`, `profitSharingRatio`, `maxDuration`, `lossSharingRatio`, `managementFee` | FinancingService (case 'musharaka'), IslamicFinanceSettings | ✅ Verified |
| `salam` | `enabled`, `deliveryPeriod`, `maxAdvance`, `commodityType`, `deliveryPenalty` | FinancingService (case 'salam'), IslamicFinanceSettings | ✅ Verified |
| `qardHasanah` | `enabled`, `serviceFee`, `maxAmount`, `maxDuration`, `specialConsideration` | FinancingService (case 'qardHasanah'), IslamicFinanceSettings | ✅ Verified |
| `istisna` | `enabled`, `progressPayment`, `maxDuration` | FinancingService (case 'istisna'), IslamicFinanceSettings | ✅ Verified |
| `mudaraba` | `enabled`, `profitSharingRatio`, `maxInvestment` | FinancingService (case 'mudaraba'), IslamicFinanceSettings | ✅ Verified |
| `tawarruq` | `enabled`, `commodityType`, `maxAmount` | FinancingService (case 'tawarruq'), IslamicFinanceSettings | ✅ Verified |
| `ijarah` | `enabled`, `rentalRate`, `securityDeposit`, `maxDuration`, `maintenanceResponsibility` | FinancingService (case 'ijarah'), IslamicFinanceSettings | ✅ Verified |
| `kafalah` | `enabled`, `guaranteeFee`, `maxGuaranteeAmount`, `minGuarantorSavings`, `maxGuarantors` | FinancingService (case 'kafalah'), IslamicFinanceSettings | ✅ Verified |

---

### 7. Collection Settings (`collection`)

| Setting | Type | Default | Consumed By | Verification |
|---------|------|---------|-------------|--------------|
| `allowedPaymentMethods` | array | `['cash','bank','bikash','nogod','rocket']` | **ContributionService.addFeePayment()** (validation), CollectionSettings UI, ContributionEntry | ✅ Verified |
| `autoGenerateReceipt` | boolean | `true` | ContributionService (receiptId gen), CollectionSettings | ✅ Verified |
| `receiptPrefix` | string | `'RCPT-'` | **ContributionService** (generateReceiptId), CollectionSettings, Receipts | ✅ Verified |
| `receiptFooter` | string | `'Thank you...'` | ContributionService (receipt), CollectionSettings, Receipts | ✅ Verified |
| `minPaymentAmount` | number | `100` | ContributionService (validation), CollectionSettings | ✅ Verified |
| `maxPaymentAmount` | number | `1000000` | ContributionService (validation), CollectionSettings | ✅ Verified |
| `allowPartialPayments` | boolean | `true` | ContributionService, CollectionSettings | ✅ Verified |
| `allowAdvancePayment` | boolean | `true` | ContributionService, CollectionSettings | ✅ Verified |
| `requirePaymentNote` | boolean | `false` | ContributionService, CollectionSettings | ❓ UNKNOWN |
| `sendSmsConfirmation` | boolean | `true` | **UNKNOWN** — SMS not implemented | ❓ UNKNOWN |
| `collectionStartTime` | string | `'09:00'` | CollectionSettings UI | ❓ UNKNOWN |
| `collectionEndTime` | string | `'17:00'` | CollectionSettings UI | ❓ UNKNOWN |
| `collectionDays` | string[] | `['sunday'...'thursday']` | CollectionSettings UI | ❓ UNKNOWN |
| `reminderBeforeDays` | number | `3` | **UNKNOWN** — reminders not implemented | ❓ UNKNOWN |
| `reminderAfterDays` | number | `7` | **UNKNOWN** — reminders not implemented | ❓ UNKNOWN |
| `smsReminder` | boolean | `true` | **UNKNOWN** — SMS not implemented | ❓ UNKNOWN |
| `emailReminder` | boolean | `true` | **UNKNOWN** — email not implemented | ❓ UNKNOWN |
| `collectorSettings` | `{enabled, collectors[]}` | `{enabled:true, collectors:[]}` | **CollectorSettings** UI, CollectorSelect component | ✅ Verified |
| `allowCollectorPersonalAccount` | boolean | `false` | **CollectorBankSettings** UI (toggle), SomitySettingsPage (bank tab) | ✅ Verified |

---

### 8. Financial Settings (`financial`)

| Setting | Type | Default | Consumed By | Verification |
|---------|------|---------|-------------|--------------|
| `fiscalYearStart` | string | `'July-2021'` | **UNKNOWN** — reports not implemented | ❓ UNKNOWN |
| `currencySymbol` | string | `'৳'` | **Formatters** (amountFormatter), Receipts, Reports, UI | ✅ Verified |
| `currencyCode` | string | `'BDT'` | Formatters, Reports | ❓ UNKNOWN |
| `decimalPlaces` | number | `2` | Formatters, UI inputs | ✅ Verified |
| `dateFormat` | enum | `'DD/MM/YYYY'` | **dateFormatter**, UI, Receipts | ✅ Verified |
| `currencyPosition` | `'before' \| 'after'` | `'after'` | amountFormatter, UI | ✅ Verified |
| `thousandSeparator` | string | `','` | amountFormatter, UI | ✅ Verified |
| `decimalSeparator` | string | `'.'` | amountFormatter, UI | ✅ Verified |
| `enableNotifications` | boolean | `true` | **UNKNOWN** — notifications not implemented | ❓ UNKNOWN |
| `enableSmsNotifications` | boolean | `true` | **UNKNOWN** — SMS not implemented | ❓ UNKNOWN |
| `notificationEmail` | string | `''` | **UNKNOWN** | ❓ UNKNOWN |
| `notificationPhone` | string | `''` | **UNKNOWN** | ❓ UNKNOWN |
| `autoGenerateReports` | boolean | `false` | **UNKNOWN** — reports not implemented | ❓ UNKNOWN |
| `autoGenerateAnnualReports` | boolean | `true` | **UNKNOWN** — reports not implemented | ❓ UNKNOWN |

**Validation Warning:** Changing `fiscalYearStart` with existing transactions triggers warning (useSettingsValidation.ts:134-143)

---

### 9. Report Settings (`report`)

| Setting | Type | Default | Consumed By | Verification |
|---------|------|---------|-------------|--------------|
| `autoGenerateReports` | boolean | `false` | **UNKNOWN** — reports not implemented | ❓ UNKNOWN |
| `reportRetentionDays` | number | `365` | **UNKNOWN** — retention not enforced | ❓ UNKNOWN |
| `defaultReportFormat` | `'pdf' \| 'excel' \| 'both'` | `'pdf'` | **UNKNOWN** — reports not implemented | ❓ UNKNOWN |
| `generateFrequency` | enum | `'monthly'` | **UNKNOWN** — scheduled jobs prohibited | ❓ UNKNOWN |
| `generateTime` | string | `'23:59'` | **UNKNOWN** | ❓ UNKNOWN |
| `enabledReports` | string[] | `['member','fee','loan','financial','cashier','bank','business','investment']` | ReportSettings UI | ❓ UNKNOWN |
| `autoArchiveAfterDays` | number | `30` | **UNKNOWN** | ❓ UNKNOWN |
| `emailReports` | boolean | `false` | **UNKNOWN** | ❓ UNKNOWN |
| `smsReports` | boolean | `false` | **UNKNOWN** | ❓ UNKNOWN |
| `recipientEmails` | string | `''` | **UNKNOWN** | ❓ UNKNOWN |

---

### 10. Security Settings (`security`)

| Setting | Type | Default | Consumed By | Verification |
|---------|------|---------|-------------|--------------|
| `require2FA` | boolean | `false` | **UNKNOWN** — 2FA not implemented | ❓ UNKNOWN |
| `sessionTimeout` | number | `30` (minutes) | **UNKNOWN** — not enforced client-side | ❓ UNKNOWN |
| `maxLoginAttempts` | number | `5` | **UNKNOWN** — Firebase handles | ❓ UNKNOWN |
| `passwordExpiryDays` | number | `90` | **UNKNOWN** — not enforced | ❓ UNKNOWN |

---

### 11. Investment Settings (`investment`)

| Setting | Type | Default | Consumed By | Verification |
|---------|------|---------|-------------|--------------|
| `enabled` | boolean | `true` | **InvestmentSettings** UI, InvestmentListPage (gate) | ✅ Verified |
| `allowExternalInvestors` | boolean | `false` | InvestmentSettings, InvestmentCreatePage | ❓ UNKNOWN |
| `minInvestmentAmount` | number | `1000` | InvestmentSettings, InvestmentCreatePage validation | ❓ UNKNOWN |
| `maxInvestmentAmount` | number | `500000` | InvestmentSettings, InvestmentCreatePage validation | ❓ UNKNOWN |
| `profitDistributionType` | `'percentage' \| 'fixed'` | `'percentage'` | InvestmentSettings, InvestmentOps (return calc) | ❓ UNKNOWN |
| `defaultProfitShareRatio` | number | `50` | InvestmentSettings, InvestmentOps | ❓ UNKNOWN |
| `requireApproval` | boolean | `true` | InvestmentSettings, InvestmentOps.changeStatus() | ❓ UNKNOWN |

---

## Module → Settings Consumption Map

| Module | Settings Sections Consumed | Key Settings Used | Verification |
|--------|---------------------------|-------------------|--------------|
| **AuthProvider** | `general` | somityName, somityEmail, somityPhone, somityAddress | ✅ Verified |
| **MemberService** | `share`, `member`, `fee` | perShareValue, memberIdPrefix, defaultShare, monthlyFee | ✅ Verified |
| **ContributionService** | `fee`, `collection`, `share` | amountPerShare, dueDay, allowedPaymentMethods, receiptPrefix | ✅ Verified |
| **FinancingService** | `loan`, `islamicLoanConfig`, `member`, `share` | defaultInterestRate, maxLoanAmount, requireGuarantor, islamicLoanConfig.* | ✅ Verified |
| **InvestmentOps** | `investment` | enabled, requireApproval, defaultProfitShareRatio | ✅ Verified |
| **BankTransactionService** | `financial` | currencySymbol, currencyCode (indirect) | ❓ UNKNOWN |
| **FinanceService (Treasury)** | `financial`, `collection` | currencySymbol, collection settings (indirect) | ❓ UNKNOWN |
| **Settings UI** | **ALL** | All sections (edit) | ✅ Verified |
| **useSettingsValidation** | `fee`, `share`, `loan`, `member`, `financial` | amountPerShare, perShareValue, defaultInterestRate, memberIdPrefix, fiscalYearStart | ✅ Verified |

---

## Settings Gating (Module ON/OFF Controls) — Master Plan §5.1

| Module | Gate Setting | Location | Current Behavior | Master Plan Requirement |
|--------|--------------|----------|------------------|-------------------------|
| **Investments** | `investment.enabled` | `InvestmentSettings.tsx`, `InvestmentListPage.tsx` | ✅ Checked — module hidden if false | ✅ Compliant |
| **Collector Personal Accounts** | `collection.allowCollectorPersonalAccount` | `CollectorBankSettings.tsx`, `SomitySettingsPage` (bank tab) | ✅ Checked — UI toggled | ✅ Compliant |
| **Islamic Finance Products** | `islamicLoanConfig.<product>.enabled` | `IslamicFinanceSettings.tsx`, `FinancingService.approveLoanApplication()` | ✅ Checked — product hidden if false | ✅ Compliant |
| **Payment Methods** | `collection.allowedPaymentMethods` | `CollectionSettings.tsx`, `ContributionService.addFeePayment()` | ✅ Checked — validation | ✅ Compliant |
| **Reports** | `report.enabledReports[]` | `ReportSettings.tsx` | ❓ UNKNOWN — reports not implemented | ❌ Needs implementation |
| **Communication** | No gate found | — | ❓ UNKNOWN | ❌ Add per §5.1 |
| **Assets/Business/Teams** | No gates found | — | ❓ UNKNOWN | ❌ Add per §5.1 |
| **Contributions** | No explicit gate | — | Always on | ❌ Add per §5.1 |
| **Financing** | No explicit gate | — | Always on | ❌ Add per §5.1 |
| **Cashier** | No explicit gate | — | Always on | ❌ Add per §5.1 |

**Master Plan §5.1 Requirement:** "Every module declares its `enabled` flag in `somity_settings`. Settings UI exposes all flags. Module entry points check flag before rendering."

---

## Unverified / UNKNOWN Items (Require Code Trace)

| Setting | Section | Why Unknown | Investigation Priority |
|---------|---------|-------------|------------------------|
| `favicon` | general | Not found in any component consumption | Low |
| `website` | general | Not traced | Low |
| `planMaxMembers` | member | Not traced | Medium |
| `autoActivateAfterApproval` | member | Not traced | Medium |
| `inactiveAfterDays` | member | Not in memberQueryService | Medium |
| `deleteAfterDays` | member | Not traced | Low |
| `autoApproveForGoodStanding` | loan | Not in FinancingService | High (affects loan flow) |
| `requireIncomeProof` | loan | Not traced | Medium |
| `requireBusinessProof` | loan | Not traced | Medium |
| `maxOutstandingLoanRatio` | loan | Not traced | Medium |
| `autoDisburseAfterApproval` | loan | Not traced | High (affects disbursement) |
| `sendSmsConfirmation` | collection | SMS not implemented | Low |
| `collectionStartTime/EndTime` | collection | Only in UI | Low |
| `collectionDays` | collection | Only in UI | Low |
| `reminderBeforeDays/AfterDays` | collection | Reminders not implemented | Low |
| `smsReminder/emailReminder` | collection | Not implemented | Low |
| `fiscalYearStart` | financial | Reports not implemented | High (affects reports) |
| `currencyCode` | financial | Not directly used | Low |
| `enableNotifications/SmsNotifications` | financial | Not implemented | Low |
| `notificationEmail/Phone` | financial | Not traced | Low |
| `autoGenerateReports/AnnualReports` | financial | Not implemented | Medium |
| All `report.*` | report | Reports not implemented | High (Phase 8) |
| All `security.*` | security | Not enforced | Medium |
| `allowExternalInvestors` | investment | Not traced in InvestmentOps | Medium |
| `minInvestmentAmount/maxInvestmentAmount` | investment | Not traced in validation | High |
| `profitDistributionType` | investment | Not traced | Medium |
| `defaultProfitShareRatio` | investment | Not traced | Medium |

---

## Settings Validation Warnings (Implemented)

| Trigger | Warning Type | Message Summary |
|---------|--------------|-----------------|
| `fee.amountPerShare` changed + transactions exist | `fee` | Future fees affected; existing records unchanged |
| `share.perShareValue` changed + members exist | `share` | Current members keep old value; new members get new |
| `loan.defaultInterestRate` changed + active loans exist | `loan` | Active loans keep old rate; new loans use new rate |
| `member.memberIdPrefix` changed + members exist | `member` | Existing IDs unchanged; new members get new format |
| `financial.fiscalYearStart` changed + transactions exist | `financial` | Future reports affected; historical data unchanged |

**Location:** `src/modules/settings/hooks/useSettingsValidation.ts`  
**Integration:** `SomitySettingsPage.handleSave()` calls before save

---

## Settings Persistence Flow

```
User edits in Settings UI
        │
        ▼
updateSettings() → local React state (settings)
        │
        ▼
User clicks "Save Changes"
        │
        ▼
validateSettingsChange(new, old) → warnings[]
        │
        ├─► If warnings: Show modal, user confirms
        │
        └─► If no warnings (or confirmed): performSave()
                │
                ▼
         setDoc(collections.somitySettings(), newSettings, { merge: true })
                │
                ▼
         AuthProvider.loadSomityInfo() (on next auth state change or manual refresh)
                │
                ▼
         All modules re-read from somity_settings/config (or use cached DEFAULT_SOMITY_SETTINGS)
```

**Gap:** Modules using `DEFAULT_SOMITY_SETTINGS` import (compile-time) won't see runtime changes until refresh. Modules reading from `somity_settings` document at runtime will see changes.

---

## Recommendations for Master Plan Alignment (§5, §5.1, §5.2)

1. **Define Module Gates Explicitly** — Each module in Master Plan §4 should declare its `enabled` setting in `somity_settings` (currently missing for Contributions, Financing, Cashier, Reports, Communication, Assets, Business, Teams)

2. **Add `moduleFlags` Section** — Per Master Plan §5.2: Create a top-level `moduleFlags` section with `{contributions: true, financing: true, investments: true, cashier: true, reports: false, communication: false, assets: false, business: false, teams: false}` for explicit control

3. **Audit UNKNOWN Consumptions** — Trace each UNKNOWN item; remove unused settings to reduce document size (Firestore 1MB limit)

4. **Runtime vs Compile-time** — Migrate modules from `DEFAULT_SOMITY_SETTINGS` import to runtime `somity_settings` fetch for live updates (Master Plan §5.2: "Settings service layer provides reactive access")

5. **Validation Coverage** — Add warnings for Islamic loan config changes, investment settings changes, collection settings changes

6. **Settings Service Layer** — Extract direct `setDoc` from `SomitySettingsPage` into `settingsService.ts` with:
   - `getSettings()` — reactive singleton
   - `updateSettings(partial)` — atomic merge with validation
   - `subscribe(callback)` — for real-time updates (if enabled)
   - `resetToDefaults()` — for admin recovery

7. **Module Flag Defaults** — New modules default to `false` (off) per Master Plan §5.1 "Default OFF for safety"

8. **Settings Versioning** — Add `version` field to `SomitySettings` for migration tracking

---

*End of SETTINGS_MATRIX.md — Aligned with MASTER_PLAN.md v1.1 §5, §5.1, §5.2*