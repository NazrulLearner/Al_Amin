// ==========================================
// Return Service — Firestore CRUD
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
import type { ReturnRecord, ReturnCreateInput, ReturnUpdateInput } from '../types';

const COLLECTION = 'returnRecords';

const fromFirestore = (id: string, data: Record<string, unknown>): ReturnRecord => {
  return {
    id,
    ...data,
    created_date:
      data.created_date instanceof Timestamp
        ? data.created_date.toDate().toISOString()
        : (data.created_date as string | undefined),
  } as ReturnRecord;
};

export const returnService = {
  async create(input: ReturnCreateInput): Promise<ReturnRecord> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...input,
      created_date: serverTimestamp(),
    });
    const created = await getDoc(docRef);
    return fromFirestore(created.id, created.data() as Record<string, unknown>);
  },

  async listByInvestment(investmentId: string): Promise<ReturnRecord[]> {
    // where() only: where()+orderBy() needs a composite index. Sorted in JS instead.
    const q = query(collection(db, COLLECTION), where('investment_id', '==', investmentId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => String(b.return_date ?? '').localeCompare(String(a.return_date ?? '')));
  },

  async listAll(): Promise<ReturnRecord[]> {
    const q = query(collection(db, COLLECTION), orderBy('return_date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>));
  },

  async update(id: string, input: ReturnUpdateInput): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { ...input });
  },

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  },
};