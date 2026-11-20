// ==========================================
// Participant Service — Firestore CRUD
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
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import type {
  InvestmentParticipant,
  ParticipantCreateInput,
  ParticipantUpdateInput,
} from '../types';

const COLLECTION = 'investmentParticipants';

const fromFirestore = (id: string, data: Record<string, unknown>): InvestmentParticipant => {
  return {
    id,
    ...data,
    created_date:
      data.created_date instanceof Timestamp
        ? data.created_date.toDate().toISOString()
        : (data.created_date as string | undefined),
  } as InvestmentParticipant;
};

export const participantService = {
  async create(input: ParticipantCreateInput): Promise<InvestmentParticipant> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...input,
      created_date: serverTimestamp(),
    });
    const created = await getDoc(docRef);
    return fromFirestore(created.id, created.data() as Record<string, unknown>);
  },

  async bulkCreate(inputs: ParticipantCreateInput[]): Promise<void> {
    const batch = writeBatch(db);
    inputs.forEach((input) => {
      const ref = doc(collection(db, COLLECTION));
      batch.set(ref, { ...input, created_date: serverTimestamp() });
    });
    await batch.commit();
  },

  async listByInvestment(investmentId: string): Promise<InvestmentParticipant[]> {
    const q = query(collection(db, COLLECTION), where('investment_id', '==', investmentId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>));
  },

  // Only the Somity's own rows (one per investment) — used for the "Funded" column on the list page.
  async listSomity(): Promise<InvestmentParticipant[]> {
    const q = query(collection(db, COLLECTION), where('participant_type', '==', 'Somity'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>));
  },

  async listAll(): Promise<InvestmentParticipant[]> {
    const snap = await getDocs(collection(db, COLLECTION));
    return snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>));
  },

  async update(id: string, input: ParticipantUpdateInput): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { ...input });
  },

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  },

  async removeByInvestment(investmentId: string): Promise<void> {
    const q = query(collection(db, COLLECTION), where('investment_id', '==', investmentId));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  },
};