// src/modules/contributions/services/memberDueService.ts

import {
  getDocs,
  getDoc,
  query,
  where
} from 'firebase/firestore';
import { collections } from '../../../services/firebase/firebaseCollections';
import type { MemberDueInfo } from '../../../types';
import {
  getNextMonth,
  getMonthIndex,
  getUniquePaidMonths,
  calculateDueMonths,
  calculateNextDueMonth,
  calculateTotalDue,
  MONTHS,
} from '../../../utils/calculations/contributionCalculator';

export const memberDueService = {
  /**
   * Get monthly fee for a member based on share count and settings
   */
  async getMemberMonthlyFee(memberId: string): Promise<number> {
    try {
      // Get member document
      const memberRef = collections.member(memberId);
      const memberSnap = await getDoc(memberRef);
      
      if (!memberSnap.exists()) {
        return 1000; // Default fallback
      }
      
      const memberData = memberSnap.data();
      const shareCount = memberData?.membership?.shareCount || 1;
      
      // Get fee per share from somity settings
      const settingsRef = collections.somitySettings();
      const settingsSnap = await getDoc(settingsRef);
      
      let feePerShare = 1000; // Default
      if (settingsSnap.exists()) {
        const settings = settingsSnap.data();
        feePerShare = settings?.fee?.amountPerShare || 1000;
      }
      
      return shareCount * feePerShare;
    } catch (error) {
      console.error('Error getting member monthly fee:', error);
      return 1000; // Default fallback
    }
  },

  /**
   * Get complete fee status for a member
   */
  async getMemberFeeStatus(
    memberId: string,
    startMonth: string,
    startYear: number
  ): Promise<{
    startMonth: string;
    startYear: number;
    totalMonths: number;
    paidMonths: { month: string; year: number }[];
    paidCount: number;
    lastPaidMonth: string;
    lastPaidYear: number;
    nextDueMonth: string;
    nextDueYear: number;
    dueMonths: { month: string; year: number }[];
    totalDue: number;
    monthlyFee: number;
  }> {
    try {
      const transactionsRef = collections.contributions();
      
      // Query all paid transactions for this member. New documents use member.id,
      // while older documents used the flat memberId field.
      const legacyQuery = query(
        transactionsRef,
        where('memberId', '==', memberId),
        where('status', '==', 'paid')
      );
      const nestedQuery = query(
        transactionsRef,
        where('member.id', '==', memberId),
        where('status', '==', 'paid')
      );

      const [legacySnapshot, nestedSnapshot] = await Promise.all([
        getDocs(legacyQuery),
        getDocs(nestedQuery),
      ]);

      const allPaidMonths: { month: string; year: number }[] = [];

      // Extract paid months from transactions
      [...legacySnapshot.docs, ...nestedSnapshot.docs].forEach(doc => {
        const data = doc.data();
        if (data.paidMonthsDetails && Array.isArray(data.paidMonthsDetails)) {
          allPaidMonths.push(...data.paidMonthsDetails);
        } else if (data.feeMonthFrom && data.feeYearFrom && data.monthsPaid) {
          let currentMonth = data.feeMonthFrom;
          let currentYear = data.feeYearFrom;
          for (let i = 0; i < data.monthsPaid; i++) {
            allPaidMonths.push({ month: currentMonth, year: currentYear });
            const next = getNextMonth(currentMonth, currentYear);
            currentMonth = next.month;
            currentYear = next.year;
          }
        }
      });

      // Sort and deduplicate paid months
      const uniquePaidMonths = getUniquePaidMonths(allPaidMonths);

      // Get last paid month
      let lastPaidMonth = '';
      let lastPaidYear = 0;
      if (uniquePaidMonths.length > 0) {
        const last = uniquePaidMonths[uniquePaidMonths.length - 1];
        lastPaidMonth = last.month;
        lastPaidYear = last.year;
      }

      // Calculate next due month
      const nextDue = calculateNextDueMonth(startMonth, startYear, lastPaidMonth, lastPaidYear);

      // Get current date
      const now = new Date();
      const currentMonth = MONTHS[now.getMonth()];
      const currentYear = now.getFullYear();

      // Calculate due months
      const dueMonths = calculateDueMonths(startMonth, startYear, uniquePaidMonths, currentMonth, currentYear);

      // Get member's monthly fee
      const monthlyFee = await this.getMemberMonthlyFee(memberId);

      // Calculate total due
      const totalDue = calculateTotalDue(dueMonths, monthlyFee);

      // Calculate all months from start to current for total count
      const allMonthsFromStart = (() => {
        const months: { month: string; year: number }[] = [];
        let cm = startMonth;
        let cy = startYear;
        let safety = 0;
        while (safety < 500) {
          months.push({ month: cm, year: cy });
          if (cm === currentMonth && cy === currentYear) break;
          const next = getNextMonth(cm, cy);
          cm = next.month;
          cy = next.year;
          safety++;
        }
        return months;
      })();

      return {
        startMonth,
        startYear,
        totalMonths: allMonthsFromStart.length,
        paidMonths: uniquePaidMonths,
        paidCount: uniquePaidMonths.length,
        lastPaidMonth,
        lastPaidYear,
        nextDueMonth: nextDue.month,
        nextDueYear: nextDue.year,
        dueMonths,
        totalDue,
        monthlyFee,
      };
    } catch (error) {
      console.error('Error getting member fee status:', error);
      throw error;
    }
  },

  /**
   * Get member due information
   */
  async getMemberDue(
    memberId: string,
    memberMonthlyFee: number,
    startMonth: string,
    startYear: number
  ): Promise<MemberDueInfo> {
    try {
      const status = await this.getMemberFeeStatus(memberId, startMonth, startYear);

      const memberRef = collections.member(memberId);
      const memberSnap = await getDoc(memberRef);
      const memberName = memberSnap.exists() ? memberSnap.data()?.fullName || '' : '';
      const shareCount = memberSnap.exists() ? memberSnap.data()?.membership?.shareCount || 0 : 0;

      const lastPaymentDate = status.lastPaidMonth && status.lastPaidYear
        ? new Date(status.lastPaidYear, getMonthIndex(status.lastPaidMonth), 1)
        : undefined;

      return {
        memberId,
        memberName,
        shareCount,
        monthlyFee: status.monthlyFee,
        totalDue: status.totalDue,
        dueMonths: status.dueMonths.map(m => ({
          month: m.month,
          year: m.year,
          amount: status.monthlyFee,
          isOverdue: true,
        })),
        lastPaymentDate,
        nextDueMonth: status.nextDueMonth,
        nextDueYear: status.nextDueYear,
        paidMonths: status.paidMonths,
        paidCount: status.paidCount,
        totalMonths: status.totalMonths,
      };
    } catch (error) {
      console.error('Error getting member due:', error);
      return {
        memberId,
        memberName: '',
        shareCount: 0,
        monthlyFee: memberMonthlyFee,
        totalDue: 0,
        dueMonths: [],
        lastPaymentDate: undefined,
        nextDueMonth: startMonth,
        nextDueYear: startYear,
        paidMonths: [],
        paidCount: 0,
        totalMonths: 0,
      };
    }
  },

  /**
   * Get due summary for multiple members (for dashboard/reports)
   */
  async getMembersDueSummary(
    memberIds: string[],
    startMonth: string,
    startYear: number
  ): Promise<{
    totalDue: number;
    membersWithDue: number;
    membersFullyPaid: number;
    averageDue: number;
  }> {
    try {
      let totalDue = 0;
      let membersWithDue = 0;
      let membersFullyPaid = 0;

      for (const memberId of memberIds) {
        const status = await this.getMemberFeeStatus(memberId, startMonth, startYear);
        if (status.totalDue > 0) {
          totalDue += status.totalDue;
          membersWithDue++;
        } else {
          membersFullyPaid++;
        }
      }

      return {
        totalDue,
        membersWithDue,
        membersFullyPaid,
        averageDue: membersWithDue > 0 ? totalDue / membersWithDue : 0,
      };
    } catch (error) {
      console.error('Error getting members due summary:', error);
      return {
        totalDue: 0,
        membersWithDue: 0,
        membersFullyPaid: 0,
        averageDue: 0,
      };
    }
  },

  /**
   * Check if a member has any due
   */
  async hasDue(memberId: string, startMonth: string, startYear: number): Promise<boolean> {
    try {
      const status = await this.getMemberFeeStatus(memberId, startMonth, startYear);
      return status.totalDue > 0;
    } catch (error) {
      console.error('Error checking due:', error);
      return false;
    }
  },
};

export default memberDueService;
