// src/modules/settings/hooks/useSettingsValidation.ts

import { useState } from 'react';
import { memberService } from '../../../modules/members/services/memberService';
import { feesService } from '../../../modules/contributions/services/contributionService';
import { loanService } from '../../../modules/financing/services/FinancingService';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';

export interface ValidationWarning {
  type: 'fee' | 'loan' | 'share' | 'member' | 'financial' | 'bank' | 'collector';
  message: string;
  impact: string;
  suggestion: string;
}

export const useSettingsValidation = () => {
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any>(null);

  // Check if there are any bank accounts
  const checkHasBankAccounts = async (): Promise<boolean> => {
    try {
      const snapshot = await getDocs(collection(db, 'bank_accounts'));
      return snapshot.size > 0;
    } catch {
      return false;
    }
  };

  // Check if there are any fund transactions
  const checkHasFundTransactions = async (): Promise<boolean> => {
    try {
      const snapshot = await getDocs(collection(db, 'fund_transactions'));
      return snapshot.size > 0;
    } catch {
      return false;
    }
  };

  const checkHasFeeTransactions = async (): Promise<boolean> => {
    try {
      const transactions = await feesService.getAllTransactions(1);
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
          message: '⚠️ ফি এর পরিমাণ পরিবর্তন করা হয়েছে!',
          impact: 'এটি ভবিষ্যতের সকল ফি ক্যালকুলেশনকে প্রভাবিত করবে। বিদ্যমান ফি রেকর্ড আপডেট হবে না।',
          suggestion: 'পরবর্তী মাস থেকে নতুন ফি সাইকেল শুরু করার কথা বিবেচনা করুন।'
        });
      }
    }

    // 2. Share Settings Change Warning
    if (newSettings?.share?.perShareValue !== oldSettings?.share?.perShareValue) {
      const hasMembers = await checkHasMembers();
      if (hasMembers) {
        warningsList.push({
          type: 'share',
          message: '⚠️ শেয়ারের মান পরিবর্তন করা হয়েছে!',
          impact: 'বর্তমান সদস্যদের শেয়ারের মান অপরিবর্তিত থাকবে। নতুন সদস্যরা নতুন মান পাবে।',
          suggestion: 'আপনি ম্যানুয়ালি বিদ্যমান সদস্যদের আপডেট করতে পারেন অথবা পুরনো মান রেখে দিতে পারেন।'
        });
      }
    }

    // 3. Loan Settings Change Warning
    if (newSettings?.loan?.defaultInterestRate !== oldSettings?.loan?.defaultInterestRate) {
      const hasActiveLoans = await checkHasActiveLoans();
      if (hasActiveLoans) {
        warningsList.push({
          type: 'loan',
          message: '⚠️ লোনের সুদের হার পরিবর্তন করা হয়েছে!',
          impact: 'সক্রিয় লোনগুলো তাদের বিদ্যমান সুদের হারে চলতে থাকবে। নতুন লোন নতুন হার ব্যবহার করবে।',
          suggestion: 'শুধুমাত্র ভবিষ্যতের লোন আবেদনের জন্য নতুন হার প্রয়োগ করার কথা বিবেচনা করুন।'
        });
      }
    }

    // 4. Member Settings Change Warning
    if (newSettings?.member?.memberIdPrefix !== oldSettings?.member?.memberIdPrefix) {
      const hasExistingMembers = await checkHasMembers();
      if (hasExistingMembers) {
        warningsList.push({
          type: 'member',
          message: '⚠️ সদস্য আইডির ফরম্যাট পরিবর্তন করা হয়েছে!',
          impact: 'বিদ্যমান সদস্যদের আইডি আপডেট হবে না। নতুন সদস্যরা নতুন ফরম্যাট পাবে।',
          suggestion: 'ভালো ট্র্যাকিংয়ের জন্য সামঞ্জস্যপূর্ণ আইডি ফরম্যাট রাখার পরামর্শ দেওয়া হয়।'
        });
      }
    }

    // 5. Fiscal Year Change Warning
    if (newSettings?.financial?.fiscalYearStart !== oldSettings?.financial?.fiscalYearStart) {
      const hasTransactions = await checkHasTransactions();
      if (hasTransactions) {
        warningsList.push({
          type: 'financial',
          message: '⚠️ অর্থবছরের শুরুর তারিখ পরিবর্তন করা হয়েছে!',
          impact: 'এটি ভবিষ্যতের সকল আর্থিক প্রতিবেদনকে প্রভাবিত করবে। ঐতিহাসিক ডাটা অপরিবর্তিত থাকবে।',
          suggestion: 'অর্থবছর শুধুমাত্র নতুন অর্থবছরের শুরুতে পরিবর্তন করা উচিত।'
        });
      }
    }

    // 6. Bank Account Delete Warning (if trying to delete active account)
    // This will be handled in the bank component separately

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