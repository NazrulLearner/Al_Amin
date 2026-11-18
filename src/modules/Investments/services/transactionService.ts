// ==========================================
// Transaction Service — Firestore CRUD
// ==========================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import type {
  InvestmentTransaction,
  TransactionCreateInput,
  TransactionUpdateInput,
} from '../types';

const COLLECTION = 'investmentTransactions';

const fromFirestore = (id: string, data: Record<string, unknown>): InvestmentTransaction => {
  return {
    id,
    ...data,
    created_date:
      data.created_date instanceof Timestamp
        ? data.created_date.toDate().toISOString()
        : (data.created_date as string | undefined),
  } as InvestmentTransaction;
};

export const transactionService = {
  async create(input: TransactionCreateInput): Promise<InvestmentTransaction> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...input,
      status: input.status || 'Completed',
      created_date: serverTimestamp(),
    });
    const created = await getDoc(docRef);
    return fromFirestore(created.id, created.data() as Record<string, unknown>);
  },

  async listByInvestment(investmentId: string): Promise<InvestmentTransaction[]> {
    // where() only: where()+orderBy() needs a composite index. Sorted in JS instead.
    const q = query(collection(db, COLLECTION), where('investment_id', '==', investmentId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => String(b.transaction_date ?? '').localeCompare(String(a.transaction_date ?? '')));
  },

  async listAll(): Promise<InvestmentTransaction[]> {
    const q = query(collection(db, COLLECTION), orderBy('transaction_date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>));
  },

  async update(id: string, input: TransactionUpdateInput): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { ...input });
  },

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  },
};