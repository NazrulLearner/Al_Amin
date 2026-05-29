// src/utils/generators/systemCounter.ts (UPDATE - Add transactions counter)

import { runTransaction, doc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/firebase';

export type CounterName = 
  | 'bank_accounts_somity'
  | 'bank_accounts_collector'
  | 'members'
  | 'loans'
  | 'loan_applications'
  | 'contributions'
  | 'receipts'
  | 'transactions'           // 🆕 NEW
  | 'investments'
  | 'businesses';

export interface CounterConfig {
  prefix: string;
  padLength: number;
  separator?: string;
}

export const COUNTER_CONFIGS: Record<CounterName, CounterConfig> = {
  bank_accounts_somity: { prefix: 'SOMITY_BANK', padLength: 3, separator: '_' },
  bank_accounts_collector: { prefix: 'COLLECTOR_BANK', padLength: 3, separator: '_' },
  members: { prefix: 'MBR', padLength: 4, separator: '_' },
  loans: { prefix: 'LN', padLength: 4, separator: '_' },
  loan_applications: { prefix: 'APP', padLength: 5, separator: '_' },
  contributions: { prefix: 'CTRB', padLength: 6, separator: '_' },
  receipts: { prefix: 'RCPT', padLength: 6, separator: '_' },
  transactions: { prefix: 'TRX', padLength: 8, separator: '_' },  // 🆕 NEW
  investments: { prefix: 'INV', padLength: 4, separator: '_' },
  businesses: { prefix: 'BSN', padLength: 4, separator: '_' }
};

export const generateId = async (
  counterName: CounterName,
  customPrefix?: string,
  customPadLength?: number
): Promise<string> => {
  const config = COUNTER_CONFIGS[counterName];
  const prefix = customPrefix || config.prefix;
  const padLength = customPadLength || config.padLength;
  const separator = config.separator || '_';
  
  const counterRef = doc(db, 'system_counters', counterName);
  
  try {
    let newCount = 1;
    
    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      const currentCount = counterDoc.exists() ? (counterDoc.data().count || 0) : 0;
      newCount = currentCount + 1;
      
      transaction.set(counterRef, {
        count: newCount,
        updatedAt: Timestamp.now(),
        lastGenerated: `${prefix}${separator}${String(newCount).padStart(padLength, '0')}`
      });
    });
    
    return `${prefix}${separator}${String(newCount).padStart(padLength, '0')}`;
  } catch (error) {
    console.error(`Error generating ID for ${counterName}:`, error);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 4);
    return `${prefix}${separator}${timestamp}_${random}`;
  }
};

export const resetCounter = async (
  counterName: CounterName,
  newCount: number = 0
): Promise<void> => {
  const counterRef = doc(db, 'system_counters', counterName);
  await runTransaction(db, async (transaction) => {
    transaction.set(counterRef, {
      count: newCount,
      updatedAt: Timestamp.now(),
      resetAt: Timestamp.now(),
      resetBy: 'admin'
    });
  });
};

export const getCurrentCount = async (counterName: CounterName): Promise<number> => {
  try {
    const counterRef = doc(db, 'system_counters', counterName);
    const snapshot = await getDoc(counterRef);
    return snapshot.exists() ? (snapshot.data().count || 0) : 0;
  } catch (error) {
    console.error('Error getting counter:', error);
    return 0;
  }
};

export const previewNextId = async (counterName: CounterName): Promise<string> => {
  const config = COUNTER_CONFIGS[counterName];
  const currentCount = await getCurrentCount(counterName);
  const nextCount = currentCount + 1;
  return `${config.prefix}${config.separator || '_'}${String(nextCount).padStart(config.padLength, '0')}`;
};

export const isValidId = (id: string, counterName: CounterName): boolean => {
  const config = COUNTER_CONFIGS[counterName];
  const pattern = new RegExp(`^${config.prefix}${config.separator || '_'}\\d{${config.padLength}}$`);
  return pattern.test(id);
};