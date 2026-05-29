// src/modules/bank-transactions/services/bankTransactionService.ts

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  collection,
  CollectionReference,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import { generateId } from '../../../utils/generators/systemCounter';
import type { 
  BankTransaction, 
  CreateBankTransactionRequest,
  TransactionFilters
} from '../../../types/bankTransactions';

const getBankTransactionsCollection = (): CollectionReference => {
  return collection(db, 'bank_transactions');
};

const getBankTransactionDoc = (id: string) => {
  return doc(db, 'bank_transactions', id);
};

export const bankTransactionService = {
  /**
   * Create a new bank transaction
   * Logic based on holdingType:
   * - holdingType = 'somity_bank' → status = 'completed', affectsBalance = true
   * - holdingType = 'collector' → status = 'pending', affectsBalance = false
   */
  async createBankTransaction(request: CreateBankTransactionRequest): Promise<string> {
    const transactionId = await generateId('transactions');
    const now = Timestamp.now();
    const paymentDate = request.paymentDate || now.toDate();
    
    const fee = 0;
    const netAmount = request.amount - fee;
    
    // Determine status and affectsBalance based on holdingType
    const isCompleted = request.holdingType === 'somity_bank';
    const status = isCompleted ? 'completed' : 'pending';
    const affectsBalance = isCompleted;
    
    const bankTransaction: any = {
      id: transactionId,
      transactionType: request.transactionType,
      direction: request.direction,
      sourceCollection: request.sourceCollection,
      sourceId: request.sourceId,
      sourceReceiptId: request.sourceReceiptId || null,  // Add sourceReceiptId to transaction if provided
      amount: request.amount,
      fee: fee,
      netAmount: netAmount,
      paymentMethod: request.paymentMethod,
      paymentReference: request.paymentReference || null,
      paymentDate: paymentDate,
      handlerType: request.handlerType,
      handlerId: request.handlerId,
      handlerName: request.handlerName,
      holdingType: request.holdingType,
      destinationType: request.destinationType,
      status: status,
      affectsBalance: affectsBalance,
      createdBy: request.handlerId,
      createdByName: request.handlerName,
      createdAt: now,
      isReconciled: false,
    };
    
    // Add deposit reference if provided
    if (request.depositReference) {
      bankTransaction.depositReference = request.depositReference;
    }
    
    // Add destination bank account if provided
    if (request.destinationBankAccountId) {
      bankTransaction.destinationBankAccountId = request.destinationBankAccountId;
    }
    
    // Add member info if provided
    if (request.memberId) {
      bankTransaction.memberId = request.memberId;
    }
    if (request.memberName) {
      bankTransaction.memberName = request.memberName;
    }
    
    // Add remarks if provided
    if (request.remarks) {
      bankTransaction.remarks = request.remarks;
    }
    
    // If deposited directly to bank, set deposit info
    if (request.holdingType === 'somity_bank' && request.destinationBankAccountId) {
      bankTransaction.depositBankAccountId = request.destinationBankAccountId;
      bankTransaction.depositDate = now;
      bankTransaction.depositedBy = request.handlerId;
    }
    
    const bankTransactionRef = getBankTransactionDoc(transactionId);
    await setDoc(bankTransactionRef, bankTransaction);
    
    console.log(`✅ Bank transaction created: ${transactionId} (${status}, affectsBalance: ${affectsBalance})`);
    return transactionId;
  },

  /**
   * Mark transaction as deposited (collector to bank)
   * Updates: holdingType → 'somity_bank', status → 'completed', affectsBalance → true
   */
  async markAsDeposited(
    transactionId: string,
    bankAccountId: string,
    depositReference?: string,
    depositedBy?: string
  ): Promise<void> {
    const now = Timestamp.now();
    await this.updateBankTransaction(transactionId, {
      holdingType: 'somity_bank',
      status: 'completed',
      affectsBalance: true,
      destinationBankAccountId: bankAccountId,
      depositBankAccountId: bankAccountId,
      depositReference: depositReference,
      depositDate: now,
      depositedBy: depositedBy,
      updatedAt: now
    });
    console.log(`✅ Transaction ${transactionId} marked as deposited to bank`);
  },

  async getBankTransaction(transactionId: string): Promise<BankTransaction | null> {
    try {
      const docRef = getBankTransactionDoc(transactionId);
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          id: snapshot.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          paymentDate: data.paymentDate?.toDate?.() || data.paymentDate,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          depositDate: data.depositDate?.toDate?.() || data.depositDate,
          reconciledAt: data.reconciledAt?.toDate?.() || data.reconciledAt,
        } as BankTransaction;
      }
      return null;
    } catch (error) {
      console.error('Error getting bank transaction:', error);
      return null;
    }
  },

  async getAllBankTransactions(limitCount: number = 100, filters?: TransactionFilters): Promise<BankTransaction[]> {
    try {
      let constraints: any[] = [orderBy('createdAt', 'desc')];
      
      if (filters?.startDate) {
        constraints.push(where('createdAt', '>=', Timestamp.fromDate(filters.startDate)));
      }
      if (filters?.endDate) {
        constraints.push(where('createdAt', '<=', Timestamp.fromDate(filters.endDate)));
      }
      if (filters?.transactionType) {
        constraints.push(where('transactionType', '==', filters.transactionType));
      }
      if (filters?.direction) {
        constraints.push(where('direction', '==', filters.direction));
      }
      if (filters?.paymentMethod) {
        constraints.push(where('paymentMethod', '==', filters.paymentMethod));
      }
      if (filters?.handlerId) {
        constraints.push(where('handlerId', '==', filters.handlerId));
      }
      if (filters?.memberId) {
        constraints.push(where('memberId', '==', filters.memberId));
      }
      if (filters?.holdingType) {
        constraints.push(where('holdingType', '==', filters.holdingType));
      }
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters?.isReconciled !== undefined) {
        constraints.push(where('isReconciled', '==', filters.isReconciled));
      }
      if (filters?.affectsBalance !== undefined) {
        constraints.push(where('affectsBalance', '==', filters.affectsBalance));
      }
      
      constraints.push(limit(limitCount));
      
      const q = query(getBankTransactionsCollection(), ...constraints);
      const snapshot = await getDocs(q);
      
      const transactions: BankTransaction[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          paymentDate: data.paymentDate?.toDate?.() || data.paymentDate,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          depositDate: data.depositDate?.toDate?.() || data.depositDate,
          reconciledAt: data.reconciledAt?.toDate?.() || data.reconciledAt,
        } as BankTransaction);
      });
      
      return transactions;
    } catch (error) {
      console.error('Error getting bank transactions:', error);
      return [];
    }
  },

  async updateBankTransaction(transactionId: string, updates: Partial<BankTransaction>): Promise<void> {
    try {
      const docRef = getBankTransactionDoc(transactionId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      console.log(`✅ Bank transaction updated: ${transactionId}`);
    } catch (error) {
      console.error('Error updating bank transaction:', error);
      throw error;
    }
  },

  async markAsReconciled(
    transactionId: string,
    bankStatementRef: string,
    reconciledBy: string,
    notes?: string
  ): Promise<void> {
    await this.updateBankTransaction(transactionId, {
      isReconciled: true,
      reconciledAt: Timestamp.now(),
      reconciledBy: reconciledBy,
      bankStatementRef: bankStatementRef,
      updatedAt: Timestamp.now()
    });
  },

  async reverseBankTransaction(transactionId: string, reversedBy: string, reason?: string): Promise<void> {
    await this.updateBankTransaction(transactionId, {
      status: 'reversed',
      affectsBalance: false,
      updatedAt: Timestamp.now(),
      updatedBy: reversedBy,
      remarks: reason ? `REVERSED: ${reason}` : 'REVERSED'
    });
  },

  async getTransactionSummary(filters?: TransactionFilters): Promise<{
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    byType: Record<string, number>;
    byPaymentMethod: Record<string, number>;
    byDirection: Record<string, number>;
    pendingAmount: number;      // Money with collectors
    reconciledAmount: number;
    unreconciledAmount: number;
  }> {
    const transactions = await this.getAllBankTransactions(10000, filters);
    
    let totalIncome = 0;
    let totalExpense = 0;
    const byType: Record<string, number> = {};
    const byPaymentMethod: Record<string, number> = {};
    const byDirection: Record<string, number> = { in: 0, out: 0 };
    let pendingAmount = 0;
    let reconciledAmount = 0;
    let unreconciledAmount = 0;
    
    transactions.forEach(t => {
      // Only count completed transactions that affect balance
      if (t.status === 'completed' && t.affectsBalance) {
        if (t.direction === 'in') {
          totalIncome += t.amount;
          byDirection.in += t.amount;
        } else {
          totalExpense += t.amount;
          byDirection.out += t.amount;
        }
      }
      
      // Pending amount = money with collectors (holdingType = 'collector')
      if (t.holdingType === 'collector' && t.status === 'pending') {
        pendingAmount += t.amount;
      }
      
      byType[t.transactionType] = (byType[t.transactionType] || 0) + t.amount;
      byPaymentMethod[t.paymentMethod] = (byPaymentMethod[t.paymentMethod] || 0) + t.amount;
      
      if (t.isReconciled) {
        reconciledAmount += t.amount;
      } else if (t.status === 'completed') {
        unreconciledAmount += t.amount;
      }
    });
    
    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      byType,
      byPaymentMethod,
      byDirection,
      pendingAmount,
      reconciledAmount,
      unreconciledAmount
    };
  },

  async getCashInHand(): Promise<number> {
    const transactions = await this.getAllBankTransactions(10000, {
      holdingType: 'collector',
      paymentMethod: 'cash'
    });
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  },

  async getMobileWalletBalance(): Promise<number> {
    const transactions = await this.getAllBankTransactions(10000, {
      holdingType: 'collector',
      paymentMethod: 'bikash'
    });
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  },

  async getTransactionsByCollector(collectorId: string): Promise<BankTransaction[]> {
    return this.getAllBankTransactions(1000, { handlerId: collectorId });
  },

  async getTransactionsByMember(memberId: string): Promise<BankTransaction[]> {
    return this.getAllBankTransactions(1000, { memberId: memberId });
  },

  async getPendingTransactions(): Promise<BankTransaction[]> {
    return this.getAllBankTransactions(10000, { holdingType: 'collector', status: 'pending' });
  },

  async getCompletedTransactions(): Promise<BankTransaction[]> {
    return this.getAllBankTransactions(10000, { holdingType: 'somity_bank', status: 'completed' });
  },

  async getUnreconciledTransactions(): Promise<BankTransaction[]> {
    return this.getAllBankTransactions(10000, { isReconciled: false, status: 'completed' });
  },

  async getBalance(): Promise<{ totalIn: number; totalOut: number; netBalance: number }> {
    const summary = await this.getTransactionSummary();
    return {
      totalIn: summary.totalIncome,
      totalOut: summary.totalExpense,
      netBalance: summary.netProfit
    };
  }
};

export default bankTransactionService;