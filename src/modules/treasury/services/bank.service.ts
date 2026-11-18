// src/modules/finance/services/bank.service.ts

import {
  getDocs,
  getDoc,
  updateDoc,
  setDoc,
  query,
  orderBy,
  Timestamp,
  increment
} from 'firebase/firestore';
import { collections } from '../../../services/firebase/firebaseCollections';
import type { BankAccount, CreateBankAccountDto, UpdateBankAccountDto } from '../types';

export const bankService = {
  async createAccount(data: CreateBankAccountDto): Promise<string> {
    try {
      const accountId = `BANK-${Date.now()}`;
      const accountRef = collections.bankAccount(accountId);
      const now = Timestamp.now();

      const openingBalance = Number(data.openingBalance) || 0;

      const accountData: any = {
        id: accountId,
        accountId,
        accountName: data.accountName || '',
        accountNumber: data.accountNumber || '',
        bankName: data.bankName || '',
        branchName: data.branchName || '',
        accountType: data.accountType || 'savings',
        openingBalance,
        currentBalance: openingBalance,
        isActive: true,
        notes: data.notes || '',
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
        createdBy: data.createdBy || '',
        createdByName: data.createdByName || ''
      };

      await setDoc(accountRef, accountData);
      return accountId;
    } catch (error) {
      console.error('Error creating bank account:', error);
      throw error;
    }
  },

  // ✅ MAIN FIX: data normalize করা হয়েছে
  async getAllAccounts(): Promise<BankAccount[]> {
    try {
      const accountsRef = collections.bankAccounts();
      const q = query(accountsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data() as any;
        const openingBalance = Number(data?.openingBalance) || 0;
        const currentBalance =
          typeof data?.currentBalance === 'number'
            ? data.currentBalance
            : openingBalance;

        return {
          id: doc.id,
          accountId: data?.accountId || doc.id,
          accountName: data?.accountName || '',
          accountNumber: data?.accountNumber || '',
          bankName: data?.bankName || '',
          branchName: data?.branchName || '',
          accountType: data?.accountType || 'savings',
          openingBalance,
          currentBalance,
          isActive: data?.isActive ?? true,
          notes: data?.notes || '',
          createdAt: data?.createdAt || new Date(),
          updatedAt: data?.updatedAt || new Date(),
          createdBy: data?.createdBy || '',
          createdByName: data?.createdByName || ''
        } as BankAccount;
      });
    } catch (error) {
      console.error('Error getting bank accounts:', error);
      return [];
    }
  },

  // ✅ এটাও normalize করা হয়েছে
  async getAccountById(accountId: string): Promise<BankAccount | null> {
    try {
      const accountRef = collections.bankAccount(accountId);
      const snapshot = await getDoc(accountRef);
      if (!snapshot.exists()) return null;

      const data = snapshot.data() as any;
      const openingBalance = Number(data?.openingBalance) || 0;
      const currentBalance =
        typeof data?.currentBalance === 'number'
          ? data.currentBalance
          : openingBalance;

      return {
        id: snapshot.id,
        accountId: data?.accountId || snapshot.id,
        accountName: data?.accountName || '',
        accountNumber: data?.accountNumber || '',
        bankName: data?.bankName || '',
        branchName: data?.branchName || '',
        accountType: data?.accountType || 'savings',
        openingBalance,
        currentBalance,
        isActive: data?.isActive ?? true,
        notes: data?.notes || '',
        createdAt: data?.createdAt || new Date(),
        updatedAt: data?.updatedAt || new Date(),
        createdBy: data?.createdBy || '',
        createdByName: data?.createdByName || ''
      } as BankAccount;
    } catch (error) {
      console.error('Error getting bank account:', error);
      return null;
    }
  },

  async updateAccount(accountId: string, data: UpdateBankAccountDto): Promise<void> {
    try {
      const accountRef = collections.bankAccount(accountId);
      await updateDoc(accountRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating bank account:', error);
      throw error;
    }
  },

  async updateBalance(accountId: string, amount: number, operation: 'add' | 'subtract'): Promise<void> {
    try {
      const accountRef = collections.bankAccount(accountId);
      const incrementValue = operation === 'add' ? amount : -amount;
      await updateDoc(accountRef, {
        currentBalance: increment(incrementValue),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating bank balance:', error);
      throw error;
    }
  },

  async toggleStatus(accountId: string, isActive: boolean): Promise<void> {
    try {
      const accountRef = collections.bankAccount(accountId);
      await updateDoc(accountRef, {
        isActive,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error toggling account status:', error);
      throw error;
    }
  },

  async getTotalBalance(): Promise<number> {
    try {
      const accounts = await this.getAllAccounts();
      return accounts.reduce(
        (sum, acc) => sum + (acc.isActive ? acc.currentBalance || 0 : 0),
        0
      );
    } catch (error) {
      console.error('Error getting total balance:', error);
      return 0;
    }
  }
};

export default bankService;