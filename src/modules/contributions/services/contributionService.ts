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

export { memberDueService } from './memberDueService';
export { summaryService } from './summaryService';

export const feesService = {
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
      depositDate?: string;
      depositorName?: string;
      depositorId?: string;
      paymentDate?: string;
    }
  ): Promise<{ receiptId: string; transactionId: string }> {
    try {
      const receiptPrefix = request.receiptPrefix || 'RCPT-';
      const finalReceiptId = request.receiptId || generateReceiptId(receiptPrefix);
      const now = Timestamp.now();
      const createdAt = now.toDate();
      const paymentDate = request.paymentDate ? new Date(request.paymentDate) : createdAt;
      const depositDate = request.depositDate ? new Date(request.depositDate) : null;

      const sortedMonths = sortMonths(request.months) as typeof request.months;

      // ✅ Duplicate check using memberId
      const transactionsRef = collections.contributions();
      const existingQuery = query(
        transactionsRef,
        where('memberId', '==', request.memberId),
        where('status', '==', 'paid')
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      const existingPaidMonths: { month: string; year: number }[] = [];
      existingSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.paidMonthsDetails && Array.isArray(data.paidMonthsDetails)) {
          existingPaidMonths.push(...data.paidMonthsDetails);
        }
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

      const paymentPeriod = sortedMonths.length === 1
        ? `${firstMonth.month} ${firstMonth.year}`
        : `${firstMonth.month} ${firstMonth.year} - ${lastMonth.month} ${lastMonth.year}`;

      // ============================================
      // 📦 COMPLETE FLAT STRUCTURE - ROOT LEVEL FIELDS
      // ============================================
      
      const transactionData = {
        // --- Basic Info ---
        amount: request.totalAmount,
        feeAmount: request.totalAmount,
        balanceDue: 0,
        
        // --- Status ---
        collectionStatus: request.collectionStatus || 'collected',
        status: 'paid',
        payType: request.paymentType,
        feeType: sortedMonths.length > 1 ? 'multiple' : 'monthly',
        isAdvancePayment: false,
        isPartialPayment: false,
        
        // --- Remarks ---
        remarks: request.remarks || null,
        
        // --- Dates ---
        createdAt,
        updatedAt: null,
        paymentDate,
        paymentPeriod,
        
        // --- Receipt ---
        receiptId: finalReceiptId,
        receiptFooter: request.receiptFooter || '',
        referenceNo: request.referenceNo || null,
        transferReference: null,
        
        // ============================================
        // 👤 MEMBER INFO (Flat - Root Level)
        // ============================================
        memberId: request.memberId,
        memberName: request.memberName,
        memberShare: request.memberShare || 0,
        
        // ============================================
        // 👥 COLLECTOR INFO (Flat - Root Level)
        // ============================================
        collectorId: request.collectorId || null,
        collectorMemberId: request.collectorMemberId || null,
        collectorName: request.collectorName || null,
        
        // ============================================
        // ⌨️ ENTERED BY (Flat - Root Level)
        // ============================================
        enteredById: request.enteredById || 'system',
        enteredByMemberId: request.enteredByMemberId || 'SYS',
        enteredByName: request.enteredByName || 'System',
        
        // ============================================
        // 💳 PAYMENT METHOD (Flat - Root Level)
        // ============================================
        paymentMethod: request.paymentType,
        paymentReferenceNo: request.referenceNo || null,
        
        // ============================================
        // 🏦 DEPOSIT INFO (Flat - Root Level)
        // ============================================
        depositBankName: request.bankName || null,
        depositDate: depositDate,
        depositorName: request.depositorName || null,
        depositorId: request.depositorId || null,
        depositReference: request.bankReference || null,
        depositStatus: request.collectionStatus === 'deposited' ? 'deposited' : 'pending',
        
        // ============================================
        // 📅 MONTH RANGE (Flat - Root Level)
        // ============================================
        feeMonthFrom: firstMonth.month,
        feeMonthTo: lastMonth.month,
        feeYearFrom: firstMonth.year,
        feeYearTo: lastMonth.year,
        
        // ============================================
        // 📊 MONTH DETAILS (Flat - Root Level)
        // ============================================
        month: `${firstMonth.month} ${firstMonth.year}`,
        monthsPaid: sortedMonths.length,
        
        // ============================================
        // 📋 PAID MONTHS ARRAYS (Flat - Root Level)
        // ============================================
        paidMonths: sortedMonths.map(m => m.month),
        paidYears: [...new Set(sortedMonths.map(m => m.year))],
        paidMonthsDetails: sortedMonths,
        advanceMonths: [],
      };

      await setDoc(transactionRef, transactionData);

      // ✅ Update member financials
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

  async getAllTransactions(limitCount: number = 100): Promise<FeeTransaction[]> {
    try {
      const transactionsRef = collections.contributions();
      const q = query(transactionsRef, orderBy('createdAt', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      const transactions: FeeTransaction[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || data.createdAt;
        const paymentDate = data.paymentDate?.toDate?.() || data.paymentDate;
        const updatedAt = data.updatedAt?.toDate?.() || data.updatedAt;
        const depositDate = data.depositDate?.toDate?.() || data.depositDate;

        transactions.push({
          id: doc.id,
          ...data,
          createdAt,
          paymentDate,
          updatedAt,
          depositDate,
        } as FeeTransaction);
      });

      return transactions;
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  },

  async deleteTransaction(transactionId: string, memberId: string, amount: number): Promise<void> {
    try {
      const batch = writeBatch(db);
      const transactionRef = collections.contribution(transactionId);
      batch.delete(transactionRef);

      const memberRef = collections.member(memberId);
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

  async updateTransaction(
    transactionId: string,
    updates: {
      remarks?: string;
      referenceNo?: string;
      collectionStatus?: string;
      depositBankName?: string;
      depositReference?: string;
      depositorName?: string;
    }
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