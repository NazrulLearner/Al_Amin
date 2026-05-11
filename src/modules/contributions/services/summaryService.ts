// src/modules/contributions/services/summaryService.ts

import {
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp  // ✅ এই লাইনটা যোগ করুন
} from 'firebase/firestore';
import { collections } from '../../../services/firebase/firebaseCollections';
import type { FeeSummary, FeeTransaction } from '../../../types';
import {
  parseFiscalYearStart,
  calculateCollectionRate,
} from '../../../utils/calculations/contributionCalculator';
import { memberDueService } from './memberDueService';

export const summaryService = {
  async getFeeSummary(startMonth: string, startYear: number): Promise<FeeSummary> {
    try {
      const { startMonth: sMonth, startYear: sYear } = parseFiscalYearStart(
        `${startMonth}-${startYear}`
      );

      const membersRef = collections.members();
      const membersSnap = await getDocs(membersRef);
      const members = membersSnap.docs.map(doc => doc.data());

      const activeMembers = members.filter(
        m => m.membership?.status === 'active'
      ).length;

      const transactions = await this.getAllTransactionsForSummary(1000);

      const totalCollected = transactions.reduce(
        (sum, t) => sum + (t.feeAmount || 0),
        0
      );

      const now = new Date();
      const thisMonthTransactions = transactions.filter(t => {
        const date = t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });
      const thisMonthCollection = thisMonthTransactions.reduce(
        (sum, t) => sum + (t.feeAmount || 0),
        0
      );

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

  async getAllTransactionsForSummary(limitCount: number = 1000): Promise<FeeTransaction[]> {
    try {
      const transactionsRef = collections.contributions();
      const q = query(transactionsRef, orderBy('createdAt', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      const transactions: FeeTransaction[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        // ✅ Flat structure অনুযায়ী সব field map করা
        const transaction: FeeTransaction = {
          id: doc.id,
          amount: data.amount || 0,
          feeAmount: data.feeAmount || 0,
          balanceDue: data.balanceDue || 0,
          collectionStatus: data.collectionStatus || 'collected',
          status: data.status || 'paid',
          payType: data.payType || 'cash',
          feeType: data.feeType || 'monthly',
          isAdvancePayment: data.isAdvancePayment || false,
          isPartialPayment: data.isPartialPayment || false,
          remarks: data.remarks || null,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || null,
          paymentDate: data.paymentDate?.toDate?.() || data.paymentDate,
          paymentPeriod: data.paymentPeriod || '',
          receiptId: data.receiptId || '',
          receiptFooter: data.receiptFooter || '',
          referenceNo: data.referenceNo || null,
          transferReference: data.transferReference || null,
          memberId: data.memberId || '',
          memberName: data.memberName || '',
          memberShare: data.memberShare || 0,
          collectorId: data.collectorId || null,
          collectorMemberId: data.collectorMemberId || null,
          collectorName: data.collectorName || null,
          enteredById: data.enteredById || '',
          enteredByMemberId: data.enteredByMemberId || '',
          enteredByName: data.enteredByName || '',
          paymentMethod: data.paymentMethod || data.payType || 'cash',
          paymentReferenceNo: data.paymentReferenceNo || null,
          depositBankName: data.depositBankName || null,
          depositDate: data.depositDate?.toDate?.() || data.depositDate || null,
          depositorName: data.depositorName || null,
          depositorId: data.depositorId || null,
          depositReference: data.depositReference || null,
          depositStatus: data.depositStatus || 'pending',
          feeMonthFrom: data.feeMonthFrom || '',
          feeMonthTo: data.feeMonthTo || '',
          feeYearFrom: data.feeYearFrom || 0,
          feeYearTo: data.feeYearTo || 0,
          month: data.month || '',
          monthsPaid: data.monthsPaid || 0,
          paidMonths: data.paidMonths || [],
          paidYears: data.paidYears || [],
          paidMonthsDetails: data.paidMonthsDetails || [],
          advanceMonths: data.advanceMonths || [],
        };
        transactions.push(transaction);
      });

      return transactions;
    } catch (error) {
      console.error('Error getting transactions for summary:', error);
      return [];
    }
  },

  async getSummaryByCollector(collectorId: string): Promise<{
    totalCollected: number;
    totalDeposited: number;
    totalPending: number;
    transactionCount: number;
  }> {
    try {
      const transactionsRef = collections.contributions();
      const q = query(
        transactionsRef,
        where('collectorId', '==', collectorId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      let totalCollected = 0;
      let totalDeposited = 0;
      let transactionCount = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const amount = data.feeAmount || 0;
        transactionCount++;
        totalCollected += amount;
        
        if (data.collectionStatus === 'deposited') {
          totalDeposited += amount;
        }
      });
      
      return {
        totalCollected,
        totalDeposited,
        totalPending: totalCollected - totalDeposited,
        transactionCount,
      };
    } catch (error) {
      console.error('Error getting collector summary:', error);
      return {
        totalCollected: 0,
        totalDeposited: 0,
        totalPending: 0,
        transactionCount: 0,
      };
    }
  },

  async getSummaryByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalAmount: number;
    transactionCount: number;
    byPaymentMethod: Record<string, { count: number; amount: number }>;
  }> {
    try {
      const transactionsRef = collections.contributions();
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);
      
      const q = query(
        transactionsRef,
        where('createdAt', '>=', startTimestamp),
        where('createdAt', '<=', endTimestamp),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      let totalAmount = 0;
      let transactionCount = 0;
      const byPaymentMethod: Record<string, { count: number; amount: number }> = {};
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const amount = data.feeAmount || 0;
        const payType = data.payType || 'cash';
        
        transactionCount++;
        totalAmount += amount;
        
        if (!byPaymentMethod[payType]) {
          byPaymentMethod[payType] = { count: 0, amount: 0 };
        }
        byPaymentMethod[payType].count++;
        byPaymentMethod[payType].amount += amount;
      });
      
      return {
        totalAmount,
        transactionCount,
        byPaymentMethod,
      };
    } catch (error) {
      console.error('Error getting date range summary:', error);
      return {
        totalAmount: 0,
        transactionCount: 0,
        byPaymentMethod: {},
      };
    }
  },
};

export default summaryService;