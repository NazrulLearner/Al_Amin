// src/modules/financing/services/loanCollectionService.ts

import { 
  doc, updateDoc, getDoc, 
  collection, addDoc, query, 
  where, getDocs, Timestamp, 
  orderBy
} from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';

const getPaidInstallmentCount = (installmentSchedule: any[], paidAmount: number, fallbackInstallmentAmount: number): number => {
  if (paidAmount <= 0) return 0;
  if (!installmentSchedule.length) {
    return fallbackInstallmentAmount > 0 ? Math.floor(paidAmount / fallbackInstallmentAmount) : 0;
  }

  let paidCount = 0;
  let coveredAmount = 0;
  for (const installment of installmentSchedule) {
    coveredAmount += Number(installment?.amount || fallbackInstallmentAmount || 0);
    if (paidAmount + 0.001 >= coveredAmount) {
      paidCount += 1;
    } else {
      break;
    }
  }
  return Math.min(paidCount, installmentSchedule.length);
};

export interface RepaymentData {
  loanId: string;
  memberId: string;
  amount: number;
  paymentType: 'cash' | 'bank' | 'bikash' | 'nogod' | 'rocket';
  collectionStatus: 'collected' | 'deposited';
  collectorId?: string;
  collectorName?: string;
  bankName?: string;
  bankReference?: string;
  referenceNo?: string;
  collectedBy?: string;
  collectedByName?: string;
}

export const loanCollectionService = {
  
  /**
   * Collect loan repayment from member
   */
  async collectRepayment(data: RepaymentData): Promise<{ repaymentId: string; success: boolean }> {
    try {
      const now = Timestamp.now();
      
      // Get loan details
      const loanRef = doc(db, 'loans', data.loanId);
      const loanSnap = await getDoc(loanRef);
      
      if (!loanSnap.exists()) {
        throw new Error('Loan not found');
      }
      
      const loan = loanSnap.data();
      const currentPaidInstallments = loan.paidInstallments || 0;
      const totalInstallments = loan.totalInstallments || 0;
      const currentInstallmentNo = currentPaidInstallments + 1;
      
      // Get current installment details
      const installmentSchedule = loan.installmentSchedule || [];
      const currentInstallment = installmentSchedule[currentInstallmentNo - 1];
      
      if (!currentInstallment) {
        throw new Error('All installments are already paid');
      }
      
      const dueAmount = currentInstallment.amount;
      const isFullPayment = data.amount >= dueAmount;
      const lateFee = this.calculateLateFee(currentInstallment.dueDate, data.amount);
      
      // Create repayment record
      const repaymentData = {
        loanId: data.loanId,
        memberId: data.memberId,
        installmentNo: currentInstallmentNo,
        dueDate: currentInstallment.dueDate,
        dueAmount,
        paidAmount: data.amount,
        paidDate: now.toDate(),
        lateFee,
        paymentType: data.paymentType,
        collectionStatus: data.collectionStatus,
        collectorId: data.collectorId || null,
        collectorName: data.collectorName || null,
        bankName: data.bankName || null,
        bankReference: data.bankReference || null,
        referenceNo: data.referenceNo || null,
        collectedBy: data.collectedBy || null,
        collectedByName: data.collectedByName || null,
        status: isFullPayment ? 'paid' : 'partial',
        createdAt: now.toDate(),
      };
      
      // Add to repayments collection
      const repaymentRef = await addDoc(collection(db, 'loan_repayments'), repaymentData);
      
      // Calculate new totals
      const newPaidAmount = (loan.paidAmount || 0) + data.amount;
      const newPaidInstallments = getPaidInstallmentCount(installmentSchedule, newPaidAmount, dueAmount);
      const newRemainingInstallments = Math.max(0, totalInstallments - newPaidInstallments);
      const newDueAmount = loan.totalPayable - newPaidAmount;
      const nextDueDate = installmentSchedule[newPaidInstallments]?.dueDate || null;
      
      // Update loan document
      const updateData: any = {
        paidAmount: newPaidAmount,
        dueAmount: newDueAmount,
        paidInstallments: newPaidInstallments,
        remainingInstallments: newRemainingInstallments,
        nextDueDate,
        updatedAt: now.toDate(),
      };
      
      // Update status if completed
      if (newPaidAmount >= loan.totalPayable) {
        updateData.status = 'completed';
        updateData.completedAt = now.toDate();
      } else {
        updateData.status = 'active';
      }
      
      await updateDoc(loanRef, updateData);
      
      return { repaymentId: repaymentRef.id, success: true };
      
    } catch (error) {
      console.error('Error collecting repayment:', error);
      throw error;
    }
  },
  
  /**
   * Calculate late fee based on due date
   */
  calculateLateFee(dueDate: Date, paidAmount: number): number {
    const today = new Date();
    if (today <= dueDate) return 0;
    
    const daysLate = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    // Example: 2% of due amount if more than 30 days late
    if (daysLate > 30) {
      return Math.round(paidAmount * 0.02);
    }
    return 0;
  },
  
  /**
   * Get repayment history for a loan
   */
  async getRepaymentHistory(loanId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'loan_repayments'),
        where('loanId', '==', loanId),
        orderBy('installmentNo', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting repayment history:', error);
      return [];
    }
  },
  
  /**
   * Get all pending collections (for Cashier Dashboard)
   */
  async getPendingCollections(): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'loan_repayments'),
        where('collectionStatus', '==', 'collected'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting pending collections:', error);
      return [];
    }
  },
  
  /**
   * Deposit collected money to bank (Cashier action)
   */
  async depositToBank(repaymentId: string, bankName: string, bankReference: string): Promise<void> {
    try {
      const repaymentRef = doc(db, 'loan_repayments', repaymentId);
      await updateDoc(repaymentRef, {
        collectionStatus: 'deposited',
        bankName,
        bankReference,
        depositedAt: new Date(),
      });
    } catch (error) {
      console.error('Error depositing to bank:', error);
      throw error;
    }
  },
};
