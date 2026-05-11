// src/hooks/useLoanApplication.ts
import { useState } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/providers/SomitySettingsProvider';
import { loanService } from '../services/FinancingService';
import type { LoanType } from '../../../types';

interface Applicant {
  isMember: boolean;
  memberID?: string;
  name: string;
  phone: string;
  nid?: string;
  address?: string;
  occupation?: string;
  monthlyIncome?: number;
}

interface Grantor {
  memberID: string;
  name: string;
  phone: string;
  relation: string;
}

export const useLoanApplication = () => {
  const { user, somityInfo } = useAuth();
  const { settings } = useSomitySettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const submitApplication = async (
    applicant: Applicant,
    grantor: Grantor,
    loanType: LoanType,
    loanDetails: any,
    remarks?: string,
    _documents: any[] = []
  ) => {
    if (!somityInfo?.id) {
      throw new Error('Somity info not found');
    }

    try {
      setLoading(true);
      setError('');

      // Get loan settings
      const loanSettings = settings?.loan;
      const interestRate = loanSettings?.defaultInterestRate || 10;
      
      // Calculate loan values
      const amount = Number(loanDetails.assetCost || loanDetails.totalCapital || loanDetails.loanAmount || 0);
      const durationMonths = Number(loanDetails.durationMonths || 12);
      const totalPayable = amount * (1 + interestRate / 100);
      const monthlyInstallment = Math.round(totalPayable / durationMonths);

      const applicationData = {
        applicant,
        grantor,
        loanType,
        loanDetails: {
          ...loanDetails,
          amount,
          interestRate,
          durationMonths,
          totalPayable,
          monthlyInstallment,
          purpose: loanDetails.purpose || loanDetails.businessType || '',
        },
        createdBy: user?.uid || 'system',
        remarks
      };

      const applicationId = await loanService.createLoanApplication(applicationData);
      return applicationId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitApplication,
    loading,
    error
  };
};
