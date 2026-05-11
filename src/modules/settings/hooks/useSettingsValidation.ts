// src/hooks/useSettingsValidation.ts
import { useState } from 'react';
import { memberService } from '../../members/services/memberService';
import { feesService } from '../../contributions/services/contributionService';
import { loanService } from '../../financing/services/FinancingService';

export interface ValidationWarning {
  type: 'fee' | 'loan' | 'share' | 'member' | 'financial';
  message: string;
  impact: string;
  suggestion: string;
}

export const useSettingsValidation = () => {
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any>(null);

  const checkHasFeeTransactions = async (): Promise<boolean> => {
    try {
      const transactions = await feesService.getAllTransactions(1); // Just check 1
      return transactions.length > 0;
    } catch {
      return false;
    }
  };

  const checkHasMembers = async (): Promise<boolean> => {
    try {
      const members = await memberService.getAllMembers();
      return members.length > 0;
    } catch {
      return false;
    }
  };

  const checkHasActiveLoans = async (): Promise<boolean> => {
    try {
      const loans = await loanService.getLoansByStatus('active');
      return loans.length > 0;
    } catch {
      return false;
    }
  };

  const checkHasTransactions = async (): Promise<boolean> => {
    try {
      const transactions = await feesService.getAllTransactions(1);
      return transactions.length > 0;
    } catch {
      return false;
    }
  };

  const validateSettingsChange = async (newSettings: any, oldSettings: any) => {
    const warningsList: ValidationWarning[] = [];

    // 1. Fee Settings Change Warning
    if (newSettings?.fee?.amountPerShare !== oldSettings?.fee?.amountPerShare) {
      const hasTransactions = await checkHasFeeTransactions();
      if (hasTransactions) {
        warningsList.push({
          type: 'fee',
          message: '⚠️ Fee amount has been changed!',
          impact: 'This will affect all future fee calculations. Existing fee records will NOT be updated.',
          suggestion: 'Consider creating a new fee cycle starting from next month.'
        });
      }
    }

    // 2. Share Settings Change Warning
    if (newSettings?.share?.perShareValue !== oldSettings?.share?.perShareValue) {
      const hasMembers = await checkHasMembers();
      if (hasMembers) {
        warningsList.push({
          type: 'share',
          message: '⚠️ Share value has been changed!',
          impact: `Current members' share values will remain unchanged. New members will get the new value.`,
          suggestion: 'You can manually update existing members or keep the old value for existing members.'
        });
      }
    }

    // 3. Loan Settings Change Warning
    if (newSettings?.loan?.defaultInterestRate !== oldSettings?.loan?.defaultInterestRate) {
      const hasActiveLoans = await checkHasActiveLoans();
      if (hasActiveLoans) {
        warningsList.push({
          type: 'loan',
          message: '⚠️ Loan interest rate has been changed!',
          impact: `Active loans will continue with their existing interest rates. New loans will use the new rate.`,
          suggestion: 'Consider applying new rate only to future loan applications.'
        });
      }
    }

    // 4. Member Settings Change Warning
    if (newSettings?.member?.memberIdPrefix !== oldSettings?.member?.memberIdPrefix) {
      const hasExistingMembers = await checkHasMembers();
      if (hasExistingMembers) {
        warningsList.push({
          type: 'member',
          message: '⚠️ Member ID format has been changed!',
          impact: `Existing member IDs will NOT be updated. New members will get the new format.`,
          suggestion: 'It is recommended to keep consistent ID format for better tracking.'
        });
      }
    }

    // 5. Fiscal Year Change Warning
    if (newSettings?.financial?.fiscalYearStart !== oldSettings?.financial?.fiscalYearStart) {
      const hasTransactions = await checkHasTransactions();
      if (hasTransactions) {
        warningsList.push({
          type: 'financial',
          message: '⚠️ Fiscal year start date has been changed!',
          impact: `This will affect all future financial reports. Historical data will remain unchanged.`,
          suggestion: 'Fiscal year should only be changed at the beginning of a new fiscal year.'
        });
      }
    }

    setWarnings(warningsList);
    return warningsList;
  };

  return {
    validateSettingsChange,
    warnings,
    showWarningModal,
    setShowWarningModal,
    pendingChanges,
    setPendingChanges
  };
};