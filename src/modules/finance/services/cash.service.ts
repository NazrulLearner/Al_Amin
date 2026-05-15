// src/modules/finance/services/cash.service.ts

import { doc, getDoc, updateDoc, increment, Timestamp } from 'firebase/firestore';
import { collections } from '../../../services/firebase/firebaseCollections';
import { bankService } from './bank.service';
import { financeService } from './financeService';

export const cashService = {
  async getCashBalance(cashierId: string): Promise<any | null> {
    try {
      const cashRef = collections.cashBalance(cashierId);
      const snapshot = await getDoc(cashRef);
      if (snapshot.exists()) return { id: snapshot.id, ...snapshot.data() };
      
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
      return initialState;
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

// Add missing import
import { setDoc } from 'firebase/firestore';