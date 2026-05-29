// src/modules/bank-transactions/hooks/useBankTransactions.ts

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { bankTransactionService } from '../services/bankTransactionService';
import type { BankTransaction, TransactionFilters } from '../../../types/bankTransactions';

// ✅ Named export function
export const useBankTransactions = () => {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [cashInHand, setCashInHand] = useState(0);

  const loadTransactions = useCallback(async (filters?: TransactionFilters) => {
    setLoading(true);
    try {
      const data = await bankTransactionService.getAllBankTransactions(500, filters);
      setTransactions(data);
      
      const summaryData = await bankTransactionService.getTransactionSummary(filters);
      setSummary(summaryData);
      
      const cash = await bankTransactionService.getCashInHand();
      setCashInHand(cash);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('লেনদেন লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  }, []);

  const getTransaction = useCallback(async (id: string) => {
    return await bankTransactionService.getBankTransaction(id);
  }, []);

  const markAsDeposited = useCallback(async (
    transactionId: string,
    bankAccountId: string,
    depositReference?: string,
    depositedBy?: string
  ) => {
    try {
      await bankTransactionService.markAsDeposited(
        transactionId,
        bankAccountId,
        depositReference,
        depositedBy
      );
      await loadTransactions();
      toast.success('টাকা ব্যাংকে জমা হিসাবে চিহ্নিত করা হয়েছে');
    } catch (error) {
      toast.error('আপডেট করতে ব্যর্থ হয়েছে');
      throw error;
    }
  }, [loadTransactions]);

  const markAsReconciled = useCallback(async (
    transactionId: string,
    bankStatementRef: string,
    reconciledBy: string
  ) => {
    try {
      await bankTransactionService.markAsReconciled(
        transactionId,
        bankStatementRef,
        reconciledBy
      );
      await loadTransactions();
      toast.success('লেনদেন রিকনসাইল করা হয়েছে');
    } catch (error) {
      toast.error('রিকনসাইল করতে ব্যর্থ হয়েছে');
      throw error;
    }
  }, [loadTransactions]);

  const reverseTransaction = useCallback(async (
    transactionId: string,
    reversedBy: string,
    reason?: string
  ) => {
    try {
      await bankTransactionService.reverseBankTransaction(
        transactionId,
        reversedBy,
        reason
      );
      await loadTransactions();
      toast.warning('লেনদেন রিভার্স করা হয়েছে');
    } catch (error) {
      toast.error('রিভার্স করতে ব্যর্থ হয়েছে');
      throw error;
    }
  }, [loadTransactions]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    loading,
    summary,
    cashInHand,
    loadTransactions,
    getTransaction,
    markAsDeposited,
    markAsReconciled,
    reverseTransaction
  };
};

// ✅ Default export for backward compatibility
export default useBankTransactions;