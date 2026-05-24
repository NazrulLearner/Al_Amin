import { db } from '../../../services/firebase/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  Timestamp,
  writeBatch} from 'firebase/firestore';
import type { Investment, InvestmentFilter } from '../types/investment.types';
import { investmentHelpers } from '../utils/investmentHelpers';

const COLLECTION_NAME = 'investments';

export const investmentService = {
  async create(data: Omit<Investment, 'id' | 'createdAt' | 'updatedAt' | 'reference_no'>): Promise<string> {
    const now = Timestamp.now();
    const reference_no = investmentHelpers.generateReferenceNo();
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      reference_no,
      startDate: Timestamp.fromDate(data.startDate),
      maturityDate: Timestamp.fromDate(data.maturityDate),
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  },

  async getAll(): Promise<Investment[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      maturityDate: doc.data().maturityDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      approvedAt: doc.data().approvedAt?.toDate()
    })) as Investment[];
  },

  async getById(id: string): Promise<Investment | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return {
      id: snapshot.id,
      ...snapshot.data(),
      startDate: snapshot.data().startDate?.toDate(),
      maturityDate: snapshot.data().maturityDate?.toDate(),
      createdAt: snapshot.data().createdAt?.toDate(),
      updatedAt: snapshot.data().updatedAt?.toDate(),
      approvedAt: snapshot.data().approvedAt?.toDate()
    } as Investment;
  },

  async update(id: string, data: Partial<Investment>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData: any = { ...data, updatedAt: Timestamp.now() };
    if (data.startDate) updateData.startDate = Timestamp.fromDate(data.startDate);
    if (data.maturityDate) updateData.maturityDate = Timestamp.fromDate(data.maturityDate);
    await updateDoc(docRef, updateData);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  async getByMember(memberId: string): Promise<Investment[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('memberId', '==', memberId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      maturityDate: doc.data().maturityDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Investment[];
  },

  async getActive(): Promise<Investment[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'active'),
      orderBy('maturityDate', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      maturityDate: doc.data().maturityDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Investment[];
  },

  async getFiltered(filter: InvestmentFilter): Promise<Investment[]> {
    let q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    
    if (filter.status) {
      q = query(q, where('status', '==', filter.status));
    }
    if (filter.memberId) {
      q = query(q, where('memberId', '==', filter.memberId));
    }
    if (filter.planId) {
      q = query(q, where('planId', '==', filter.planId));
    }
    
    const snapshot = await getDocs(q);
    let investments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      maturityDate: doc.data().maturityDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Investment[];

    if (filter.minAmount) {
      investments = investments.filter(inv => inv.amount >= filter.minAmount!);
    }
    if (filter.maxAmount) {
      investments = investments.filter(inv => inv.amount <= filter.maxAmount!);
    }

    return investments;
  },

  async getStatistics(): Promise<{
    totalInvestments: number;
    totalAmount: number;
    totalExpectedProfit: number;
    activeCount: number;
    activeAmount: number;
    maturedCount: number;
    maturedAmount: number;
  }> {
    const investments = await this.getAll();
    const active = investments.filter(i => i.status === 'active');
    const matured = investments.filter(i => i.status === 'matured');
    
    return {
      totalInvestments: investments.length,
      totalAmount: investments.reduce((sum, i) => sum + i.amount, 0),
      totalExpectedProfit: investments.reduce((sum, i) => sum + i.expectedProfitAmount, 0),
      activeCount: active.length,
      activeAmount: active.reduce((sum, i) => sum + i.amount, 0),
      maturedCount: matured.length,
      maturedAmount: matured.reduce((sum, i) => sum + i.amount, 0)
    };
  },

  async approveInvestment(id: string, approvedBy: string): Promise<void> {
    await this.update(id, {
      status: 'active',
      approvedAt: new Date(),
      approvedBy
    });
  },

  async markAsMatured(id: string): Promise<void> {
    const investment = await this.getById(id);
    if (investment) {
      await this.update(id, {
        status: 'matured',
        actualProfitAmount: investment.expectedProfitAmount,
        actualReturnPercent: investment.expectedReturnPercent
      });
    }
  },

  async bulkApprove(ids: string[], approvedBy: string): Promise<void> {
    const batch = writeBatch(db);
    ids.forEach(id => {
      const docRef = doc(db, COLLECTION_NAME, id);
      batch.update(docRef, {
        status: 'active',
        approvedAt: Timestamp.now(),
        approvedBy,
        updatedAt: Timestamp.now()
      });
    });
    await batch.commit();
  }
};