// src/modules/contributions/services/summaryService.ts

import {
  getDocs,
} from 'firebase/firestore';
import { collections } from '../../../services/firebase/firebaseCollections';
import type { FeeSummary, FeeTransaction } from '../../../types';
import {
  parseFiscalYearStart,
  calculateCollectionRate,
} from '../../../utils/calculations/contributionCalculator';
import { memberDueService } from './memberDueService';

export const summaryService = {
  /**
   * Get fee summary
   */
  async getFeeSummary(startMonth: string, startYear: number): Promise<FeeSummary> {
    try {
      const { startMonth: sMonth, startYear: sYear } = parseFiscalYearStart(
        `${startMonth}-${startYear}`
      );

      const membersRef = collections.members();
      const membersSnap = await getDocs(membersRef);
      const members = membersSnap.docs.map(doc => doc.data());

      // 🧮 Count active members
      const activeMembers = members.filter(
        m => m.membership?.status === 'active'
      ).length;

      // Get all transactions for totals
      const transactions = await this.getAllTransactionsForSummary(1000);

      // 🧮 total collected
      const totalCollected = transactions.reduce(
        (sum, t) => sum + (t.feeAmount || 0),
        0
      );

      // 🧮 this month collection
      const now = new Date();
      const thisMonthTransactions = transactions.filter(t => {
        const date = t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });
      const thisMonthCollection = thisMonthTransactions.reduce(
        (sum, t) => sum + (t.feeAmount || 0),
        0
      );

      // 🧮 last month collection
      const lastMonth = new Date(now);
      lastMonth.setMonth(now.getMonth() - 1);
      const lastMonthTransactions = transactions.filter(t => {
        const date = t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt);
        return (
          date.getMonth() === lastMonth.getMonth() &&
          date.getFullYear() === lastMonth.getFullYear()
        );
      });
      const lastMonthCollection = lastMonthTransactions.reduce(
        (sum, t) => sum + (t.feeAmount || 0),
        0
      );

      let totalDue = 0;
      let pendingMembers = 0;

      for (const member of members) {
        if (member.membership?.status === 'active') {
          const status = await memberDueService.getMemberFeeStatus(
            member.memberId,
            sMonth,
            sYear
          );
          if (status.totalDue > 0) {
            totalDue += status.totalDue;
            pendingMembers++;
          }
        }
      }

      // 🧮 collection rate
      const collectionRate = calculateCollectionRate(totalCollected, totalDue);

      return {
        totalCollected,
        totalDue,
        collectionRate,
        thisMonthCollection,
        lastMonthCollection,
        pendingMembers,
        activeMembers,
      };
    } catch (error) {
      console.error('Error getting fee summary:', error);
      return {
        totalCollected: 0,
        totalDue: 0,
        collectionRate: 0,
        thisMonthCollection: 0,
        lastMonthCollection: 0,
        pendingMembers: 0,
        activeMembers: 0,
      };
    }
  },

  /**
   * Get collection status summary
   */
  async getCollectionStatusSummary(): Promise<{
    collectedAmount: number;
    depositedAmount: number;
    transferredAmount: number;
    pendingTransactions: FeeTransaction[];
  }> {
    try {
      const transactions = await this.getAllTransactionsForSummary(1000);

      const collectedAmount = transactions
        .filter(t => t.collectionStatus === 'collected')
        .reduce((sum, t) => sum + (t.feeAmount || 0), 0);

      const depositedAmount = transactions
        .filter(t => t.collectionStatus === 'deposited')
        .reduce((sum, t) => sum + (t.feeAmount || 0), 0);

      const transferredAmount = transactions
        .filter(t => t.collectionStatus === 'transferred')
        .reduce((sum, t) => sum + (t.feeAmount || 0), 0);

      const pendingTransactions = transactions.filter(
        t => t.collectionStatus === 'collected'
      );

      return {
        collectedAmount,
        depositedAmount,
        transferredAmount,
        pendingTransactions,
      };
    } catch (error) {
      console.error('Error getting collection status summary:', error);
      return {
        collectedAmount: 0,
        depositedAmount: 0,
        transferredAmount: 0,
        pendingTransactions: [],
      };
    }
  },

  /**
   * Helper: Get all transactions for summary calculations
   */
  async getAllTransactionsForSummary(limitCount: number = 1000): Promise<FeeTransaction[]> {
    try {
      const { query, orderBy, limit, getDocs } = await import('firebase/firestore');
      const transactionsRef = collections.contributions();
      const q = query(transactionsRef, orderBy('createdAt', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      const transactions: FeeTransaction[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        transactions.push({
          ...data,
          id: doc.id,
          memberId: data.memberId || data.member?.id || '',
          memberName: data.memberName || data.member?.name || '',
          bankName: data.bankName || data.deposit?.bankName || '',
          bankReference: data.bankReference || data.deposit?.reference || '',
          enteredById: data.enteredById || data.enteredBy?.id || '',
          enteredByName: data.enteredByName || data.enteredBy?.name || '',
          enteredByMemberId: data.enteredByMemberId || data.enteredBy?.memberId || '',
          collectorName: data.collectorName || data.collector?.name || '',
          paymentDate: data.paymentDate?.toDate?.() || data.paymentDate,
          deposit: data.deposit ? {
            ...data.deposit,
            depositDate: data.deposit.depositDate?.toDate?.() || data.deposit.depositDate,
          } : data.deposit,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || null,
        } as FeeTransaction);
      });

      return transactions;
    } catch (error) {
      console.error('Error getting transactions for summary:', error);
      return [];
    }
  },
};

export default summaryService;
