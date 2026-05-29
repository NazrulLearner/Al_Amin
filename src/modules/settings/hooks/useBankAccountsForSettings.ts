// src/modules/settings/hooks/useBankAccountsForSettings.ts

import { useState, useEffect, useCallback } from 'react';
import { 
  collection, getDocs, query, where, orderBy
} from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import type { BankAccount } from '../../../types/settings';

export const useBankAccountsForSettings = (ownerType: 'somity' | 'collector', collectorId?: string) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      let constraints: any[] = [];
      constraints.push(where('ownerType', '==', ownerType));
      
      if (ownerType === 'collector' && collectorId) {
        constraints.push(where('collectorId', '==', collectorId));
      }
      
      constraints.push(where('isActive', '==', true));
      constraints.push(orderBy('bankName', 'asc'));
      
      const q = query(collection(db, 'bank_accounts'), ...constraints);
      const snapshot = await getDocs(q);
      const accountsData: BankAccount[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        accountsData.push({
          id: doc.id,
          accountId: data.accountId || doc.id,
          accountName: data.accountName || '',
          accountNumber: data.accountNumber || '',
          bankName: data.bankName || '',
          branchName: data.branchName || '',
          accountType: data.accountType || 'savings',
          isActive: data.isActive === true,
          balance: data.balance || 0,
          openingBalance: data.openingBalance || 0,
          routingNumber: data.routingNumber || '',
          swiftCode: data.swiftCode || '',
          notes: data.notes || '',
          ownerType: data.ownerType || ownerType,
          ownerId: data.ownerId || '',
          collectorId: data.collectorId,
          collectorName: data.collectorName,
          collectorMemberId: data.collectorMemberId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as BankAccount);
      });
      
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  }, [ownerType, collectorId]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  return { accounts, loading, loadAccounts };
};

export default useBankAccountsForSettings;