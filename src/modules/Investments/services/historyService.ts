// ==========================================
// History Service — Firestore CRUD
// ==========================================

import {
  collection,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import type { InvestmentHistory, HistoryCreateInput } from '../types';

const COLLECTION = 'investmentHistory';

const fromFirestore = (id: string, data: Record<string, unknown>): InvestmentHistory => {
  return {
    id,
    ...data,
    created_date:
      data.created_date instanceof Timestamp
        ? data.created_date.toDate().toISOString()
        : (data.created_date as string | undefined),
  } as InvestmentHistory;
};

export const historyService = {
  async create(input: HistoryCreateInput): Promise<InvestmentHistory> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...input,
      created_date: serverTimestamp(),
    });
    const created = await getDoc(docRef);
    return fromFirestore(created.id, created.data() as Record<string, unknown>);
  },

  async listByInvestment(investmentId: string): Promise<InvestmentHistory[]> {
    // where() only: where()+orderBy() needs a composite index. Sorted in JS instead.
    const q = query(collection(db, COLLECTION), where('investment_id', '==', investmentId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => String(b.event_date ?? '').localeCompare(String(a.event_date ?? '')));
  },

  async listAll(): Promise<InvestmentHistory[]> {
    const q = query(collection(db, COLLECTION), orderBy('event_date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>));
  },
};