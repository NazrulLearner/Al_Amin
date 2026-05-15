// src/modules/finance/services/financeService.ts

import {
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  increment,
  limit
} from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import { collections } from '../../../services/firebase/firebaseCollections';

export interface BankAccountData {
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchName?: string;
  accountType: 'savings' | 'current' | 'fixed';
  openingBalance: number;
  notes?: string;
  createdBy: string;
  createdByName: string;
}

export interface FundTransferData {
  amount: number;
  fromType: 'cashier' | 'bank';
  fromId: string;
  toType: 'cashier' | 'bank';
  toId: string;
  paymentMethod?: 'cash' | 'bank' | 'bikash' | 'nogod' | 'rocket';
  referenceNo?: string;
  bankReference?: string;
  note?: string;
  createdBy: string;
  createdByName: string;
}

export const financeService = {

  // ============================================
  // BANK ACCOUNT MANAGEMENT
  // ============================================
  
  async createBankAccount(data: BankAccountData): Promise<string> {
    try {
      const bankId = `BANK-${Date.now()}`;
      const bankRef = collections.bankAccount(bankId);
      const now = Timestamp.now();
      
      const bankData: any = {
        id: bankId,
        accountId: bankId,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        bankName: data.bankName,
        branchName: data.branchName || '',
        accountType: data.accountType,
        openingBalance: data.openingBalance,
        currentBalance: data.openingBalance,
        isActive: true,
        notes: data.notes || '',
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
        createdBy: data.createdBy,
        createdByName: data.createdByName
      };
      
      await setDoc(bankRef, bankData);
      console.log(`✅ Bank account created: ${bankId}`);
      return bankId;
    } catch (error) {
      console.error('Error creating bank account:', error);
      throw error;
    }
  },
  
  async getAllBankAccounts(): Promise<any[]> {
    try {
      const bankRef = collections.bankAccounts();
      const q = query(bankRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting bank accounts:', error);
      return [];
    }
  },
  
  async getBankAccountById(bankId: string): Promise<any | null> {
    try {
      const bankRef = collections.bankAccount(bankId);
      const snapshot = await getDoc(bankRef);
      if (snapshot.exists()) return { id: snapshot.id, ...snapshot.data() };
      return null;
    } catch (error) {
      console.error('Error getting bank account:', error);
      return null;
    }
  },
  
  async updateBankBalance(bankId: string, amount: number, operation: 'add' | 'subtract'): Promise<void> {
    try {
      const bankRef = collections.bankAccount(bankId);
      const incrementValue = operation === 'add' ? amount : -amount;
      await updateDoc(bankRef, {
        currentBalance: increment(incrementValue),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating bank balance:', error);
      throw error;
    }
  },
  
  async toggleBankAccountStatus(bankId: string, isActive: boolean): Promise<void> {
    try {
      const bankRef = collections.bankAccount(bankId);
      await updateDoc(bankRef, {
        isActive,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error toggling bank account status:', error);
      throw error;
    }
  },
  
  // ============================================
  // CASHIER CASH MANAGEMENT
  // ============================================
  
  async getCashierBalance(cashierId: string): Promise<any | null> {
    try {
      const cashRef = collections.cashBalance(cashierId);
      const snapshot = await getDoc(cashRef);
      if (snapshot.exists()) return { id: snapshot.id, ...snapshot.data() };
      return null;
    } catch (error) {
      console.error('Error getting cashier balance:', error);
      return null;
    }
  },
  
  async initializeCashierBalance(
    cashierId: string,
    cashierName: string,
    cashierMemberId: string,
    openingBalance: number = 0
  ): Promise<void> {
    try {
      const cashRef = collections.cashBalance(cashierId);
      const now = Timestamp.now();
      
      const cashData = {
        id: cashierId,
        cashierId,
        cashierName,
        cashierMemberId,
        openingBalance,
        currentBalance: openingBalance,
        totalCollection: 0,
        totalDeposit: 0,
        totalDisbursement: 0,
        lastTransactionDate: now.toDate(),
        status: 'open',
        shiftStartTime: now.toDate(),
        createdAt: now.toDate(),
        updatedAt: now.toDate()
      };
      
      await setDoc(cashRef, cashData);
      console.log(`✅ Cashier balance initialized: ${cashierId}`);
    } catch (error) {
      console.error('Error initializing cashier balance:', error);
      throw error;
    }
  },
  
  async updateCashierBalance(cashierId: string, amount: number, operation: 'add' | 'subtract'): Promise<void> {
    try {
      const cashRef = collections.cashBalance(cashierId);
      const cashSnap = await getDoc(cashRef);
      
      if (!cashSnap.exists()) {
        throw new Error('Cashier balance not found');
      }
      
      const incrementValue = operation === 'add' ? amount : -amount;
      
      await updateDoc(cashRef, {
        currentBalance: increment(incrementValue),
        lastTransactionDate: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating cashier balance:', error);
      throw error;
    }
  },
  
  async addToCashierCollection(cashierId: string, amount: number): Promise<void> {
    try {
      const cashRef = collections.cashBalance(cashierId);
      await updateDoc(cashRef, {
        totalCollection: increment(amount),
        currentBalance: increment(amount),
        lastTransactionDate: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error adding to cashier collection:', error);
      throw error;
    }
  },
  
  async addToCashierDeposit(cashierId: string, amount: number): Promise<void> {
    try {
      const cashRef = collections.cashBalance(cashierId);
      await updateDoc(cashRef, {
        totalDeposit: increment(amount),
        currentBalance: increment(-amount),
        lastTransactionDate: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error adding to cashier deposit:', error);
      throw error;
    }
  },
  
  // ============================================
  // FUND TRANSFER
  // ============================================
  
  async transferFunds(data: FundTransferData): Promise<string> {
    try {
      const batch = writeBatch(db);
      const transactionId = `TRX-${Date.now()}`;
      const transactionRef = collections.fundTransaction(transactionId);
      const now = Timestamp.now();
      
      // Get names for from and to
      let fromName = '';
      let toName = '';
      
      if (data.fromType === 'bank') {
        const bank = await this.getBankAccountById(data.fromId);
        fromName = bank?.accountName || 'Unknown Bank';
      } else if (data.fromType === 'cashier') {
        const cash = await this.getCashierBalance(data.fromId);
        fromName = cash?.cashierName || 'Unknown Cashier';
      }
      
      if (data.toType === 'bank') {
        const bank = await this.getBankAccountById(data.toId);
        toName = bank?.accountName || 'Unknown Bank';
      } else if (data.toType === 'cashier') {
        const cash = await this.getCashierBalance(data.toId);
        toName = cash?.cashierName || 'Unknown Cashier';
      }
      
      // Create transaction record
      const transactionData = {
        id: transactionId,
        transactionId,
        type: 'transfer',
        amount: data.amount,
        from: {
          type: data.fromType,
          id: data.fromId,
          name: fromName
        },
        to: {
          type: data.toType,
          id: data.toId,
          name: toName
        },
        paymentMethod: data.paymentMethod || null,
        referenceNo: data.referenceNo || null,
        bankReference: data.bankReference || null,
        note: data.note || null,
        status: 'completed',
        completedBy: data.createdBy,
        completedByName: data.createdByName,
        completedAt: now.toDate(),
        createdAt: now.toDate(),
        createdBy: data.createdBy,
        createdByName: data.createdByName
      };
      
      batch.set(transactionRef, transactionData);
      
      // Update source balance
      if (data.fromType === 'bank') {
        const sourceRef = collections.bankAccount(data.fromId);
        batch.update(sourceRef, {
          currentBalance: increment(-data.amount),
          updatedAt: now.toDate()
        });
      } else if (data.fromType === 'cashier') {
        const sourceRef = collections.cashBalance(data.fromId);
        batch.update(sourceRef, {
          currentBalance: increment(-data.amount),
          lastTransactionDate: now.toDate(),
          updatedAt: now.toDate()
        });
      }
      
      // Update destination balance
      if (data.toType === 'bank') {
        const destRef = collections.bankAccount(data.toId);
        batch.update(destRef, {
          currentBalance: increment(data.amount),
          updatedAt: now.toDate()
        });
      } else if (data.toType === 'cashier') {
        const destRef = collections.cashBalance(data.toId);
        batch.update(destRef, {
          currentBalance: increment(data.amount),
          lastTransactionDate: now.toDate(),
          updatedAt: now.toDate()
        });
      }
      
      await batch.commit();
      console.log(`✅ Fund transfer completed: ${transactionId}`);
      return transactionId;
    } catch (error) {
      console.error('Error transferring funds:', error);
      throw error;
    }
  },
  
  // ============================================
  // TRANSACTIONS
  // ============================================
  
  async getAllTransactions(limitCount: number = 100): Promise<any[]> {
    try {
      const transRef = collections.fundTransactions();
      const q = query(transRef, orderBy('createdAt', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  },
  
  async getTransactionsByCashier(cashierId: string, limitCount: number = 50): Promise<any[]> {
    try {
      const transRef = collections.fundTransactions();
      const q = query(
        transRef,
        where('from.id', '==', cashierId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting cashier transactions:', error);
      return [];
    }
  },
  
  async getTransactionsByBank(bankId: string, limitCount: number = 50): Promise<any[]> {
    try {
      const transRef = collections.fundTransactions();
      const q = query(
        transRef,
        where('from.id', '==', bankId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting bank transactions:', error);
      return [];
    }
  },
  
  // ============================================
  // DAILY CLOSING
  // ============================================
  
  async getDailyClosing(cashierId: string, date: Date): Promise<any | null> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const closingId = `${cashierId}_${dateStr}`;
      const closingRef = collections.dailyClosingDoc(closingId);
      const snapshot = await getDoc(closingRef);
      if (snapshot.exists()) return { id: snapshot.id, ...snapshot.data() };
      return null;
    } catch (error) {
      console.error('Error getting daily closing:', error);
      return null;
    }
  },
  
  async createDailyClosing(data: any): Promise<string> {
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const closingId = `${data.cashierId}_${dateStr}`;
      const closingRef = collections.dailyClosingDoc(closingId);
      
      await setDoc(closingRef, {
        ...data,
        id: closingId,
        closingId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return closingId;
    } catch (error) {
      console.error('Error creating daily closing:', error);
      throw error;
    }
  },
  
  // ============================================
  // DASHBOARD STATS
  // ============================================
  
  async getTotalBankBalance(): Promise<number> {
    try {
      const banks = await this.getAllBankAccounts();
      return banks.reduce((sum, bank) => sum + (bank.currentBalance || 0), 0);
    } catch (error) {
      console.error('Error getting total bank balance:', error);
      return 0;
    }
  },
  
  async getTotalCashInHand(): Promise<number> {
    try {
      const cashRef = collections.cashBalances();
      const snapshot = await getDocs(cashRef);
      let total = 0;
      snapshot.forEach(doc => {
        total += doc.data().currentBalance || 0;
      });
      return total;
    } catch (error) {
      console.error('Error getting total cash in hand:', error);
      return 0;
    }
  },
  
  async getTodayTransactions(): Promise<{
    totalCollection: number;
    totalDeposit: number;
    totalDisbursement: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const transRef = collections.fundTransactions();
      const q = query(
        transRef,
        where('createdAt', '>=', today),
        where('createdAt', '<', tomorrow)
      );
      const snapshot = await getDocs(q);
      
      let totalCollection = 0;
      let totalDeposit = 0;
      let totalDisbursement = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.type === 'collection') {
          totalCollection += data.amount;
        } else if (data.type === 'deposit') {
          totalDeposit += data.amount;
        } else if (data.type === 'disbursement') {
          totalDisbursement += data.amount;
        }
      });
      
      return { totalCollection, totalDeposit, totalDisbursement };
    } catch (error) {
      console.error('Error getting today transactions:', error);
      return { totalCollection: 0, totalDeposit: 0, totalDisbursement: 0 };
    }
  }
};

export default financeService;