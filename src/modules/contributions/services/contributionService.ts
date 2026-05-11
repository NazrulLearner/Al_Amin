// src/modules/contributions/services/contributionService.ts

import {
  doc,
  setDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import { collections } from '../../../services/firebase/firebaseCollections';
import type {
  FeeTransaction,
  FeePaymentRequest,
} from '../../../types';
import {
  sortMonths,
  generateReceiptId,
} from '../../../utils/calculations/contributionCalculator';

// Re-export for backward compatibility
export { memberDueService } from './memberDueService';
export { summaryService } from './summaryService';

export const feesService = {
  /**
   * Add a fee payment
   */
  async addFeePayment(
    request: FeePaymentRequest & {
      receiptId?: string;
      receiptFooter?: string;
      receiptPrefix?: string;
      enteredById?: string;
      enteredByName?: string;
      enteredByMemberId?: string;
      collectionStatus?: string;
      bankName?: string;
      bankReference?: string;
      collectorId?: string;
      collectorName?: string;
      collectorMemberId?: string;
    }
  ): Promise<{ receiptId: string; transactionId: string }> {
    try {
      const receiptPrefix = request.receiptPrefix || 'RCPT-';
      const finalReceiptId = request.receiptId || generateReceiptId(receiptPrefix);
      const now = Timestamp.now();
      const createdAt = now.toDate();
      const paymentDate = request.paymentDate ? new Date(request.paymentDate) : createdAt;
      const depositDate = request.depositDate ? new Date(request.depositDate) : null;

      // 🧮 Sort months
      const sortedMonths = sortMonths(request.months) as typeof request.months;

      // ✅ DUPLICATE PROTECTION: Check for already paid months
      const transactionsRef = collections.contributions();
      const legacyExistingQuery = query(
        transactionsRef,
        where('memberId', '==', request.memberId),
        where('status', '==', 'paid')
      );
      const nestedExistingQuery = query(
        transactionsRef,
        where('member.id', '==', request.memberId),
        where('status', '==', 'paid')
      );
      const [legacySnapshot, nestedSnapshot] = await Promise.all([
        getDocs(legacyExistingQuery),
        getDocs(nestedExistingQuery),
      ]);
      const existingPaidMonths: { month: string; year: number }[] = [];

      const collectPaidMonths = (data: any) => {
        if (data.paidMonthsDetails && Array.isArray(data.paidMonthsDetails)) {
          existingPaidMonths.push(...data.paidMonthsDetails);
        }
      };

      legacySnapshot.forEach(doc => {
        const data = doc.data();
        collectPaidMonths(data);
      });

      nestedSnapshot.forEach(doc => {
        const data = doc.data();
        collectPaidMonths(data);
      });

      const existingSet = new Set(
        existingPaidMonths.map(m => `${m.month}-${m.year}`)
      );
      const duplicates = sortedMonths.filter(m =>
        existingSet.has(`${m.month}-${m.year}`)
      );

      if (duplicates.length > 0) {
        const monthsList = duplicates
          .map(m => `${m.month} ${m.year}`)
          .join(', ');
        throw new Error(`এই মাসগুলো ইতিমধ্যে জমা আছে: ${monthsList}`);
      }

      const firstMonth = sortedMonths[0];
      const lastMonth = sortedMonths[sortedMonths.length - 1];

      const transactionRef = doc(transactionsRef);

      // ✅ Cleaner payment period
      const paymentPeriod = sortedMonths.length === 1
        ? `${firstMonth.month} ${firstMonth.year}`
        : `${firstMonth.month} ${firstMonth.year} - ${lastMonth.month} ${lastMonth.year}`;

      const transactionData = {
        receiptId: finalReceiptId,
        receiptFooter: request.receiptFooter || '',
        memberId: request.memberId,
        memberName: request.memberName,
        member: {
          id: request.memberId,
          name: request.memberName,
        },
        feeAmount: request.totalAmount,
        amount: request.totalAmount,
        month: `${firstMonth.month} ${firstMonth.year}`,
        isPartialPayment: false,
        balanceDue: 0,
        paymentDate: now.toDate(),
        payType: request.paymentType,
        payment: {
          method: request.paymentType,
          referenceNo: request.referenceNo || null,
        },
        referenceNo: request.referenceNo || null,
        feeType: sortedMonths.length > 1 ? 'multiple' : 'monthly',
        feeMonthFrom: firstMonth.month,
        feeYearFrom: firstMonth.year,
        monthsPaid: sortedMonths.length,
        feeMonthTo: lastMonth.month,
        feeYearTo: lastMonth.year,
        paymentPeriod, // ✅ Cleaner format
        paidMonths: sortedMonths.map(m => m.month),
        paidYears: [...new Set(sortedMonths.map(m => m.year))],
        paidMonthsDetails: sortedMonths,
        advanceMonths: [],
        isAdvancePayment: false,
        collectionStatus: request.collectionStatus || 'collected',
        collectedBy: request.collectorName || 'System',
        collectedById: request.collectorId || 'system',
        collectedByInfo: {
          id: request.collectorId || 'system',
          name: request.collectorName || 'System',
          memberId: request.collectorMemberId || 'SYS',
        },
        collectedAt: now.toDate(),
        deposit: {
          status: request.collectionStatus === 'deposited' ? 'deposited' : 'pending',
          method: request.bankName || null,
          reference: request.bankReference || null,
        },
        depositedBy: request.collectionStatus === 'deposited' ? request.collectorName : null,
        depositedAt: request.collectionStatus === 'deposited' ? now.toDate() : null,
        depositedTo: request.bankName || null,
        transferReference: request.bankReference || null,
        
        // ✅ Separate collector and enteredBy for future multi-collector support
        collector: {
          id: request.collectorId || null,
          name: request.collectorName || null,
          memberId: request.collectorMemberId || null,
        },
        enteredBy: {
          id: request.enteredById || 'system',
          name: request.enteredByName || 'System',
          memberId: request.enteredByMemberId || 'SYS',
        },
        
        // Legacy fields for backward compatibility
        collectorId: request.collectorId || null,
        collectorName: request.collectorName || null,
        collectorMemberId: request.collectorMemberId || null,
        enteredById: request.enteredById || 'system',
        enteredByName: request.enteredByName || 'System',
        enteredByMemberId: request.enteredByMemberId || 'SYS',
        
        status: 'paid',
        createdAt: now.toDate(),
        createdBy: request.enteredById || 'system',
        remarks: request.remarks || null,
        updatedAt: null,
      };

      Object.assign(transactionData, {
        member: {
          id: request.memberId,
          name: request.memberName,
          share: request.memberShare || 0,
        },
        collector: {
          id: request.collectorId || null,
          memberId: request.collectorMemberId || null,
          name: request.collectorName || null,
        },
        enteredBy: {
          id: request.enteredById || 'system',
          memberId: request.enteredByMemberId || 'SYS',
          name: request.enteredByName || 'System',
        },
        paymentDate,
        createdAt,
        deposit: {
          bankName: request.bankName || null,
          depositDate,
          depositorName: request.depositorName || null,
          depositorId: request.depositorId || null,
          reference: request.bankReference || null,
          status: request.collectionStatus === 'deposited' ? 'deposited' : 'pending',
        },
      });

      [
        'receiptFooter',
        'memberId',
        'memberName',
        'collectedBy',
        'collectedById',
        'collectedByInfo',
        'collectedAt',
        'depositedBy',
        'depositedAt',
        'depositedTo',
        'collectorId',
        'collectorName',
        'collectorMemberId',
        'enteredById',
        'enteredByName',
        'enteredByMemberId',
        'createdBy',
      ].forEach(field => delete (transactionData as any)[field]);

      await setDoc(transactionRef, transactionData);

      // ✅ Use increment() for atomic update
      const memberRef = collections.member(request.memberId);
      await updateDoc(memberRef, {
        'financials.totalFeesPaid': increment(request.totalAmount),
        'financials.lastFeePaidMonth': lastMonth.month,
        'financials.lastFeePaidYear': lastMonth.year,
        'financials.lastFeeReceiptId': finalReceiptId,
        updatedAt: now.toDate(),
      });

      console.log(`✅ Fee payment recorded: ${finalReceiptId} for ${request.memberName}`);
      return { receiptId: finalReceiptId, transactionId: transactionRef.id };
    } catch (error) {
      console.error('Error adding fee payment:', error);
      throw error;
    }
  },

  /**
   * Get all transactions
   */
  async getAllTransactions(limitCount: number = 100): Promise<FeeTransaction[]> {
    try {
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
      console.error('Error getting transactions:', error);
      return [];
    }
  },

  /**
   * Delete a transaction
   */
  async deleteTransaction(transactionId: string, memberId: string, amount: number): Promise<void> {
    try {
      const batch = writeBatch(db);
      const transactionRef = collections.contribution(transactionId);
      batch.delete(transactionRef);

      const memberRef = collections.member(memberId);
      // ✅ Use increment() for atomic update
      batch.update(memberRef, {
        'financials.totalFeesPaid': increment(-amount),
        updatedAt: new Date(),
      });

      await batch.commit();
      console.log(`✅ Transaction ${transactionId} deleted`);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  /**
   * Update a transaction
   */
  async updateTransaction(
    transactionId: string,
    updates: { remarks?: string; referenceNo?: string }
  ): Promise<void> {
    try {
      const transactionRef = collections.contribution(transactionId);
      await updateDoc(transactionRef, {
        ...updates,
        updatedAt: new Date(),
      });
      console.log(`✅ Transaction ${transactionId} updated`);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },
};

export const feeTransactionService = {
  getAllTransactions: feesService.getAllTransactions,
  addTransaction: feesService.addFeePayment,
};

export default feesService;
