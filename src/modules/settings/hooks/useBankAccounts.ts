// src/modules/settings/hooks/useBankAccounts.ts

import { useState, useEffect, useCallback } from 'react';
import { 
  collection, getDocs, updateDoc, deleteDoc, doc, Timestamp,
  query, where, orderBy, getDoc, setDoc, runTransaction
} from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import { toast } from 'sonner';
import { generateId } from '../../../utils/generators/systemCounter';

export interface BankAccount {
  id?: string;
  accountId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchName?: string;
  accountType: string;
  isActive: boolean;
  balance: number;
  openingBalance?: number;
  routingNumber?: string;
  swiftCode?: string;
  notes?: string;
  ownerType: 'somity' | 'collector';
  ownerId: string;
  collectorId?: string;
  collectorName?: string;
  collectorMemberId?: string;
  createdAt?: any;
  updatedAt?: any;
  updatedBy?: string;
  deletedAt?: any;  // ✅ Track when deleted
  deletedBy?: string; // ✅ Who deleted
}

// ✅ Check if account has any transactions
const checkAccountHasTransactions = async (accountId: string): Promise<boolean> => {
  try {
    // Check in bank_transactions collection
    const transactionsQuery = query(
      collection(db, 'bank_transactions'),
      where('bankAccountId', '==', accountId)
    );
    const transactionsSnap = await getDocs(transactionsQuery);
    
    if (transactionsSnap.size > 0) return true;
    
    // Check in contributions (linked transactions)
    const contributionsQuery = query(
      collection(db, 'contributions'),
      where('linkedBankAccountId', '==', accountId)
    );
    const contributionsSnap = await getDocs(contributionsQuery);
    
    return contributionsSnap.size > 0;
  } catch (error) {
    console.error('Error checking transactions:', error);
    return false;
  }
};

// ✅ Check if account has any pending balance
const checkAccountHasBalance = async (accountId: string): Promise<boolean> => {
  try {
    const accountRef = doc(db, 'bank_accounts', accountId);
    const accountSnap = await getDoc(accountRef);
    
    if (accountSnap.exists()) {
      const balance = accountSnap.data().balance || 0;
      return balance > 0;
    }
    return false;
  } catch (error) {
    console.error('Error checking balance:', error);
    return false;
  }
};

const checkDuplicateAccountNumber = async (accountNumber: string, excludeId?: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'bank_accounts'),
      where('accountNumber', '==', accountNumber),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    
    if (excludeId) {
      return snapshot.docs.some(doc => doc.id !== excludeId);
    }
    return snapshot.size > 0;
  } catch (error) {
    console.error('Error checking duplicate:', error);
    return false;
  }
};

export const useBankAccounts = (ownerType: 'somity' | 'collector', collectorId?: string) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string>('system');

  useEffect(() => {
    try {
      const auth = localStorage.getItem('user');
      if (auth) {
        const user = JSON.parse(auth);
        setCurrentUser(user.uid || user.email || 'unknown');
      }
    } catch (e) {}
  }, []);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      let constraints = [];
      constraints.push(where('ownerType', '==', ownerType));
      
      if (ownerType === 'collector' && collectorId) {
        constraints.push(where('collectorId', '==', collectorId));
      }
      
      const q = query(
        collection(db, 'bank_accounts'),
        ...constraints,
        orderBy('accountId', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const accountsData: BankAccount[] = [];
      snapshot.forEach((doc) => {
        accountsData.push({ id: doc.id, ...doc.data() } as BankAccount);
      });
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('অ্যাকাউন্ট লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  }, [ownerType, collectorId]);

  const addAccount = async (data: Omit<BankAccount, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>) => {
    const isDuplicate = await checkDuplicateAccountNumber(data.accountNumber);
    if (isDuplicate) {
      toast.error('এই অ্যাকাউন্ট নম্বর ইতিমধ্যে বিদ্যমান!');
      throw new Error('Duplicate account number');
    }
    
    try {
      const counterName = ownerType === 'somity' ? 'bank_accounts_somity' : 'bank_accounts_collector';
      const accountId = await generateId(counterName);
      
      const newAccount = {
        ...data,
        accountId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        updatedBy: currentUser
      };
      
      const accountRef = doc(db, 'bank_accounts', accountId);
      await setDoc(accountRef, newAccount);
      
      await loadAccounts();
      toast.success(`ব্যাংক অ্যাকাউন্ট যোগ করা হয়েছে! ID: ${accountId}`);
      return accountId;
    } catch (error) {
      console.error('Error adding account:', error);
      toast.error('অ্যাকাউন্ট যোগ করতে ব্যর্থ হয়েছে');
      throw error;
    }
  };

  const updateAccount = async (accountId: string, data: Partial<BankAccount>) => {
    try {
      if (data.accountNumber) {
        const oldAccount = accounts.find(a => a.accountId === accountId);
        if (oldAccount && oldAccount.accountNumber !== data.accountNumber) {
          const isDuplicate = await checkDuplicateAccountNumber(data.accountNumber, accountId);
          if (isDuplicate) {
            toast.error('এই অ্যাকাউন্ট নম্বর ইতিমধ্যে বিদ্যমান!');
            throw new Error('Duplicate account number');
          }
        }
      }
      
      const accountRef = doc(db, 'bank_accounts', accountId);
      await updateDoc(accountRef, { 
        ...data, 
        updatedAt: Timestamp.now(),
        updatedBy: currentUser
      });
      
      await loadAccounts();
      toast.success('অ্যাকাউন্ট আপডেট করা হয়েছে!');
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('অ্যাকাউন্ট আপডেট করতে ব্যর্থ হয়েছে');
      throw error;
    }
  };

  // ✅ Toggle active status (Temporary block/enable)
  const toggleAccountStatus = async (accountId: string) => {
    const account = accounts.find(a => a.accountId === accountId);
    if (!account) return;
    
    try {
      const accountRef = doc(db, 'bank_accounts', accountId);
      await updateDoc(accountRef, { 
        isActive: !account.isActive,
        updatedAt: Timestamp.now(),
        updatedBy: currentUser,
        ...(!account.isActive ? { reactivatedAt: Timestamp.now() } : { deactivatedAt: Timestamp.now() })
      });
      
      await loadAccounts();
      const newStatus = !account.isActive ? 'activated' : 'deactivated';
      toast.success(`Account ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error toggling account status:', error);
      toast.error('Failed to change account status');
      throw error;
    }
  };

  // ✅ Permanent delete with validation
  const permanentDeleteAccount = async (accountId: string) => {
    const account = accounts.find(a => a.accountId === accountId);
    if (!account) {
      toast.error('Account not found');
      return;
    }
    
    // ✅ Check if account has any transactions
    const hasTransactions = await checkAccountHasTransactions(accountId);
    if (hasTransactions) {
      toast.error(`Cannot delete account "${account.bankName}" because it has transaction history!`, {
        description: 'Please transfer all funds and archive transactions first.',
        duration: 5000
      });
      throw new Error('Account has transaction history');
    }
    
    // ✅ Check if account has balance
    const hasBalance = await checkAccountHasBalance(accountId);
    if (hasBalance) {
      toast.error(`Cannot delete account "${account.bankName}" because it has remaining balance!`, {
        description: `Current balance: ৳ ${account.balance.toLocaleString()}. Please withdraw/transfer first.`,
        duration: 5000
      });
      throw new Error('Account has remaining balance');
    }
    
    // ✅ Show confirmation dialog
    const confirmed = window.confirm(
      `⚠️ PERMANENT DELETE WARNING!\n\n` +
      `Account: ${account.bankName} (${account.accountId})\n` +
      `Account Name: ${account.accountName}\n` +
      `Account Number: ${account.accountNumber}\n\n` +
      `This action is IRREVERSIBLE!\n` +
      `All data will be permanently removed.\n\n` +
      `Are you absolutely sure?`
    );
    
    if (!confirmed) return;
    
    // ✅ Double confirmation for safety
    const finalConfirm = window.prompt(
      `Type "DELETE ${account.accountId}" to permanently delete this account:`
    );
    
    if (finalConfirm !== `DELETE ${account.accountId}`) {
      toast.error('Verification failed. Account not deleted.');
      return;
    }
    
    try {
      const accountRef = doc(db, 'bank_accounts', accountId);
      await deleteDoc(accountRef); // Hard delete
      
      await loadAccounts();
      toast.success(`Account "${account.bankName}" permanently deleted!`);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
      throw error;
    }
  };

  const getAccountById = useCallback(async (accountId: string): Promise<BankAccount | null> => {
    try {
      const accountRef = doc(db, 'bank_accounts', accountId);
      const snapshot = await getDoc(accountRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as BankAccount;
      }
      return null;
    } catch (error) {
      console.error('Error fetching account:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  return { 
    accounts, 
    loading, 
    loadAccounts, 
    addAccount, 
    updateAccount, 
    toggleAccountStatus,  // ✅ New
    permanentDeleteAccount, // ✅ New (replaces old deleteAccount)
    getAccountById
  };
};