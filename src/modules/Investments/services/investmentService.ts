// ==========================================
// Investment Service — Firestore CRUD
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
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import type {
  Investment,
  InvestmentCreateInput,
  InvestmentUpdateInput,
  InvestmentFilters,
} from '../types';

const COLLECTION = 'investments';

// ===== Helpers =====

const fromFirestore = (id: string, data: Record<string, unknown>): Investment => {
  return {
    id,
    ...data,
    created_date:
      data.created_date instanceof Timestamp
        ? data.created_date.toDate().toISOString()
        : (data.created_date as string | undefined),
    updated_date:
      data.updated_date instanceof Timestamp
        ? data.updated_date.toDate().toISOString()
        : (data.updated_date as string | undefined),
  } as Investment;
};

// ===== CRUD Operations =====

export const investmentService = {
  /**
   * Create new investment
   */
  async create(input: InvestmentCreateInput): Promise<Investment> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...input,
      actual_return_amount: input.actual_return_amount || 0,
      created_date: serverTimestamp(),
      updated_date: serverTimestamp(),
    });
    const created = await getDoc(docRef);
    return fromFirestore(created.id, created.data() as Record<string, unknown>);
  },

  /**
   * For the list page: newest first, soft-deleted removed, ONE query.
   * Safety cap of 100 documents (the society expects ~50 at most). The caller is told when the cap is hit.
   * `is_deleted` is filtered here in code (not in the query) so older documents that
   * do not have the field yet still show up — no backfill needed.
   */
  async listForTable(max = 100): Promise<{ items: Investment[]; capped: boolean }> {
    const snap = await getDocs(query(collection(db, COLLECTION), orderBy('created_date', 'desc'), limit(max)));
    const all = snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>));
    return { items: all.filter((i) => !i.is_deleted), capped: snap.docs.length >= max };
  },

  /**
   * Is this reference number already used? (exact match; used to WARN, not block)
   */
  async referenceExists(reference: string): Promise<boolean> {
    const ref = reference.trim();
    if (!ref) return false;
    const snap = await getDocs(query(collection(db, COLLECTION), where('reference_number', '==', ref)));
    return snap.docs.length > 0;
  },

  /**
   * Get investment by ID
   */
  async getById(id: string): Promise<Investment | null> {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return fromFirestore(snap.id, snap.data() as Record<string, unknown>);
  },

  /**
   * List all investments with optional filters
   */
  async list(filters?: InvestmentFilters): Promise<Investment[]> {
    const constraints: Parameters<typeof query>[1][] = [];

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters?.category) {
      constraints.push(where('category', '==', filters.category));
    }

    constraints.push(orderBy('created_date', 'desc'));

    const q = query(collection(db, COLLECTION), ...constraints);
    const snap = await getDocs(q);

    let results = snap.docs.map((d) =>
      fromFirestore(d.id, d.data() as Record<string, unknown>)
    );

    // Client-side filter for search
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      results = results.filter(
        (inv) =>
          inv.investment_name?.toLowerCase().includes(s) ||
          inv.reference_number?.toLowerCase().includes(s) ||
          inv.opportunity?.toLowerCase().includes(s) ||
          inv.lead_investor_name?.toLowerCase().includes(s)
      );
    }

    // Client-side filter for structure, role, risk
    if (filters?.structure) {
      results = results.filter((i) => i.investment_structure === filters.structure);
    }
    if (filters?.role) {
      results = results.filter((i) => i.somity_role === filters.role);
    }
    if (filters?.risk) {
      results = results.filter((i) => i.risk_level === filters.risk);
    }

    return results;
  },

  /**
   * Update investment
   */
  async update(id: string, input: InvestmentUpdateInput): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      ...input,
      updated_date: serverTimestamp(),
    });
  },

  /**
   * Delete investment
   */
  async remove(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  },

  /**
   * Update status only
   */
  async updateStatus(id: string, status: Investment['status']): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      status,
      updated_date: serverTimestamp(),
    });
  },
};