// src/modules/finance/services/cash.service.ts

import { getDoc, updateDoc, setDoc, increment } from 'firebase/firestore';
import { collections } from '../../../services/firebase/firebaseCollections';
import { bankService } from './bank.service';
import { financeService } from './financeService';

export const cashService = {
  // ✅ GUARD: empty cashierId হলে null return
  async getCashBalance(cashierId: string): Promise<any | null> {
    try {
      if (!cashierId) {
        console.warn('⚠️ getCashBalance called with empty cashierId');
        return null;
      }

      const cashRef = collections.cashBalance(cashierId);
      const snapshot = await getDoc(cashRef);

      if (snapshot.exists()) {
        const data = snapshot.data() as any;
        return {
          id: snapshot.id,
          cashierId: data?.cashierId || cashierId,
          cashierName: data?.cashierName || '',
          cashierMemberId: data?.cashierMemberId || cashierId,
          openingBalance: Number(data?.openingBalance) || 0,
          currentBalance: Number(data?.currentBalance) || 0,
          totalCollection: Number(data?.totalCollection) || 0,
          totalDeposit: Number(data?.totalDeposit) || 0,
          totalDisbursement: Number(data?.totalDisbursement) || 0,
          lastTransactionDate: data?.lastTransactionDate || new Date(),
          status: data?.status || 'open',
          shiftStartTime: data?.shiftStartTime || new Date(),
          createdAt: data?.createdAt || new Date(),
          updatedAt: data?.updatedAt || new Date()
        };
      }

      // Initialize if not exists
      const initialData = {
        cashierId,
        cashierName: '',
        cashierMemberId: cashierId,
        openingBalance: 0,
        currentBalance: 0,
        totalCollection: 0,
        totalDeposit: 0,
        totalDisbursement: 0,
        lastTransactionDate: new Date(),
        status: 'open',
        shiftStartTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(cashRef, initialData);
      return { id: cashierId, ...initialData };
    } catch (error) {
      console.error('Error getting cash balance:', error);
      return null;
    }
  },

  async depositToBank(data: {
    amount: number;
    bankId: string;
    cashierId: string;
    cashierName: string;
    note?: string;
    createdBy: string;
    createdByName: string;
  }): Promise<void> {
    try {
      if (!data.cashierId) throw new Error('cashierId required');
      if (!data.bankId) throw new Error('bankId required');
      if (!data.amount || data.amount <= 0) throw new Error('Invalid amount');

      // Update cashier balance (subtract)
      const cashRef = collections.cashBalance(data.cashierId);
      await updateDoc(cashRef, {
        currentBalance: increment(-data.amount),
        totalDeposit: increment(data.amount),
        lastTransactionDate: new Date(),
        updatedAt: new Date()
      });

      // Update bank balance (add)
      await bankService.updateBalance(data.bankId, data.amount, 'add');

      // Create transaction record
      await financeService.transferFunds({
        amount: data.amount,
        fromType: 'cashier',
        fromId: data.cashierId,
        toType: 'bank',
        toId: data.bankId,
        paymentMethod: 'bank',
        referenceNo: `DEPOSIT-${Date.now()}`,
        note: data.note,
        createdBy: data.createdBy,
        createdByName: data.createdByName
      });
    } catch (error) {
      console.error('Error depositing to bank:', error);
      throw error;
    }
  }
};

export default cashService;