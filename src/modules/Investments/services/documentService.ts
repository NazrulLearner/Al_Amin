// ==========================================
// Document Service — Firestore CRUD
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
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import type {
  InvestmentDocument,
  DocumentCreateInput,
  DocumentUpdateInput,
} from '../types';

const COLLECTION = 'investmentDocuments';

const fromFirestore = (id: string, data: Record<string, unknown>): InvestmentDocument => {
  return {
    id,
    ...data,
    created_date:
      data.created_date instanceof Timestamp
        ? data.created_date.toDate().toISOString()
        : (data.created_date as string | undefined),
  } as InvestmentDocument;
};

export const documentService = {
  async create(input: DocumentCreateInput): Promise<InvestmentDocument> {
    // Firestore rejects `undefined` values, so drop them first.
    const clean = Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined));
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...clean,
      status: input.status || 'Active',
      created_date: serverTimestamp(),
    });
    const created = await getDoc(docRef);
    return fromFirestore(created.id, created.data() as Record<string, unknown>);
  },

  async bulkCreate(inputs: DocumentCreateInput[]): Promise<void> {
    const batch = writeBatch(db);
    inputs.forEach((input) => {
      const ref = doc(collection(db, COLLECTION));
      batch.set(ref, {
        ...input,
        status: input.status || 'Active',
        created_date: serverTimestamp(),
      });
    });
    await batch.commit();
  },

  async listByInvestment(investmentId: string): Promise<InvestmentDocument[]> {
    // where() only: where()+orderBy() needs a composite index. Sorted in JS instead.
    const q = query(collection(db, COLLECTION), where('investment_id', '==', investmentId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => String(b.upload_date ?? '').localeCompare(String(a.upload_date ?? '')));
  },

  async listAll(): Promise<InvestmentDocument[]> {
    const q = query(collection(db, COLLECTION), orderBy('upload_date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>));
  },

  async update(id: string, input: DocumentUpdateInput): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { ...input });
  },

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  },
};