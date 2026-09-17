// src/modules/Investments/services/investmentService.ts

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  collection,
  CollectionReference,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import { generateId } from '../../../utils/generators/systemCounter';
import { bankTransactionService } from '../../bank-transactions/services/bankTransactionService';
import type { Investment, CreateInvestmentRequest, InvestmentSummary, CoInvestor } from '../types/investment.types';
import type { InvestmentTransaction, ProfitRecord } from '../types/investmentTransaction.types';
import type { CreateBankTransactionRequest } from '../../../types/bankTransactions';

const INVESTMENTS_COLLECTION = 'investments';
const getInvestmentsCollection = (): CollectionReference => collection(db, INVESTMENTS_COLLECTION);
const getInvestmentDoc = (id: string) => doc(db, INVESTMENTS_COLLECTION, id);
const getCoInvestorsCollection = (investmentId: string) => collection(db, INVESTMENTS_COLLECTION, investmentId, 'coInvestors');
const getTransactionsCollection = (investmentId: string) => collection(db, INVESTMENTS_COLLECTION, investmentId, 'transactions');
const getProfitRecordsCollection = (investmentId: string) => collection(db, INVESTMENTS_COLLECTION, investmentId, 'profitRecords');
const getDocumentsCollection = (investmentId: string) => collection(db, INVESTMENTS_COLLECTION, investmentId, 'documents');

export const investmentService = {
  // ============ CREATE INVESTMENT WITH BANK TRANSACTIONS ============
  async createInvestment(
    request: CreateInvestmentRequest,
    createdBy: string,
    createdByName: string
  ): Promise<Investment> {
    const investmentId = await generateId('investments');
    const now = new Date().toISOString();
    const nowDate = new Date();

    // Calculate expected profit if not provided
    const expectedProfit =
      request.expectedProfit ??
      (request.profitType === 'percentage'
        ? (request.totalAmount * request.profitRate * (request.durationMonths || 12)) / (12 * 100)
        : request.profitType === 'fixed_amount'
        ? request.profitRate
        : (request.totalAmount * request.profitRate) / 100);

    const expectedTotalReturn = request.totalAmount + expectedProfit;
    
    const totalPaidFromCoInvestors = request.coInvestors?.reduce(
      (sum, ci) => sum + (ci.paidAmount || ci.contributedAmount || 0), 
      0
    ) || 0;

    const investment: Investment = {
      id: investmentId,
      investmentId: `INV_${investmentId.slice(-4)}`,
      ...request,
      investmentPlace: request.investmentPlace || '',
      expectedProfit,
      expectedTotalReturn,
      actualProfitReceived: 0,
      actualTotalReturn: 0,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      createdBy,
      createdByName,
      outTransactions: [],      // সমিতির বের হওয়া টাকা (direction: 'out')
      inTransactions: [],       // ইনকামিং টাকা (direction: 'in')
      totalCoInvestorsPaid: totalPaidFromCoInvestors,
      coInvestorsPaymentStatus: totalPaidFromCoInvestors >= request.coInvestorsTotalContribution ? 'completed' : 
                               totalPaidFromCoInvestors > 0 ? 'partial' : 'pending',
    } as Investment;

    await setDoc(getInvestmentDoc(investmentId), investment);

    const outTransactions: string[] = [];
    const inTransactions: string[] = [];

    // ============================================================
    // 📤 1. SOMITY CONTRIBUTION (সমিতি টাকা বের করছে)
    //    direction: 'out' → টাকা বের হচ্ছে (সমিতির ব্যাংক থেকে)
    // ============================================================
    if (request.somityContribution > 0) {
      const isBankTransfer = request.moneySource === 'bank' || request.moneySource === 'both';
      const isCash = request.moneySource === 'cash';
      
      const bankTransactionRequest: CreateBankTransactionRequest = {
        transactionType: 'investment',
        direction: 'out',
        sourceCollection: 'investments',
        sourceId: investmentId,
        amount: request.somityContribution,
        paymentMethod: isBankTransfer ? 'bank' : 'cash',
        paymentReference: request.chequeNo || `INV-OUT-${investmentId.slice(-6)}`,
        paymentDate: request.startDate ? new Date(request.startDate) : nowDate,
        handlerId: createdBy,
        handlerName: createdByName,
        handlerType: 'somity',
        holdingType: isCash ? 'collector' : 'somity_bank',
        destinationType: 'investment',
        destinationBankAccountId: isBankTransfer ? request.bankAccountId : undefined,
        remarks: `সমিতির অবদান: ${request.investmentName}`,
      };
      
      const transactionId = await bankTransactionService.createBankTransaction(bankTransactionRequest);
      outTransactions.push(transactionId);
    }

    // ============================================================
    // 📥 2. CO-INVESTOR CONTRIBUTION (সহ-বিনিয়োগকারী টাকা দিচ্ছে)
    //    direction: 'in' → টাকা আসছে (সহ-বিনিয়োগকারী → সমিতি)
    // ============================================================
    if (request.hasCoInvestors && request.coInvestors?.length) {
      const batch = writeBatch(db);
      
      for (const ci of request.coInvestors) {
        const ciRef = doc(getCoInvestorsCollection(investmentId));
        
        // ✅ সহ-বিনিয়োগকারী সমিতিকে টাকা দিচ্ছে → direction 'in'
        const isBankTransfer = ci.paymentMethod === 'bank';
        const ciTransactionId = await bankTransactionService.createBankTransaction({
          transactionType: 'investment',
          direction: 'in',   // ✅ টাকা আসছে (সহ-বিনিয়োগকারী → সমিতি)
          sourceCollection: 'investments',
          sourceId: investmentId,
          amount: ci.contributedAmount,
          paymentMethod: isBankTransfer ? 'bank' : 'cash',
          paymentReference: ci.paymentReference || `CO-INV-${ciRef.id.slice(-6)}`,
          paymentDate: request.startDate ? new Date(request.startDate) : nowDate,
          handlerType: ci.investorType === 'member' ? 'member' : 'external',
          handlerId: ci.memberId || ci.id || 'unknown',
          handlerName: ci.name,
          holdingType: isBankTransfer ? 'somity_bank' : 'collector',  // নগদ হলে collector এ থাকবে
          destinationType: 'somity_bank',
          destinationBankAccountId: isBankTransfer ? ci.paymentBankAccountId : undefined,
          remarks: `সহ-বিনিয়োগকারী ${ci.name} এর অবদান: ${request.investmentName}`,
          memberId: ci.memberId,
          memberName: ci.name,
          investmentId: investmentId,
          coInvestorId: ciRef.id,
        });
        
        inTransactions.push(ciTransactionId);
        
        batch.set(ciRef, {
          ...ci,
          id: ciRef.id,
          investmentId,
          linkedTransactionId: ciTransactionId,
          createdAt: now,
          paymentStatus: (ci.paidAmount || ci.contributedAmount) >= ci.contributedAmount ? 'submitted' : 'under_review',
        });
      }
      
      await batch.commit();
    }

    // Update investment with transaction IDs
    if (outTransactions.length > 0) {
      await this.updateInvestment(investmentId, {
        outTransactions: outTransactions
      });
    }
    if (inTransactions.length > 0) {
      await this.updateInvestment(investmentId, {
        inTransactions: inTransactions
      });
    }

    // ============================================================
    // 📝 3. INVESTMENT TRANSACTION (শুধু ইতিহাসের জন্য)
    //    এটা bank_transactions না, শুধু ইনভেস্টমেন্টের নিজস্ব লগ
    // ============================================================
    await this.createTransaction({
      investmentId,
      transactionType: 'investment',
      amount: request.totalAmount,
      date: now,
      status: 'completed',
      description: 'প্রাথমিক বিনিয়োগ আবেদন জমা হয়েছে',
      type: 'deposit',
      createdBy,
      createdByName,
    });

    return { ...investment, id: investmentId };
  },

  // ============ APPROVE INVESTMENT ============
  async approveInvestment(
    id: string,
    approvedBy: string,
    approvedByName: string,
    remarks?: string
  ): Promise<void> {
    await this.updateInvestment(id, {
      status: 'active',
      approvedBy,
      approvedAt: new Date().toISOString(),
      remarks: remarks || '',
    });
    
    const investment = await this.getInvestment(id);
    if (investment) {
      await this.createTransaction({
        investmentId: id,
        transactionType: 'investment',
        amount: investment.totalAmount,
        date: new Date().toISOString(),
        status: 'completed',
        description: 'বিনিয়োগ অনুমোদিত হয়েছে',
        type: 'approval',
        createdBy: approvedBy,
        createdByName: approvedByName,
      });
    }
  },

  // ============ REJECT INVESTMENT ============
  async rejectInvestment(
    id: string,
    rejectedBy: string,
    rejectedByName: string,
    reason: string
  ): Promise<void> {
    await this.updateInvestment(id, {
      status: 'rejected',
      approvedBy: rejectedBy,
      approvedAt: new Date().toISOString(),
      rejectedReason: reason,
      remarks: reason,
    });
  },

  // ============ RECORD PROFIT (IN TRANSACTION) ============
  async recordProfit(
    investmentId: string,
    profitAmount: number,
    profitPeriod: string,
    recordedBy: string,
    recordedByName: string,
    bankAccountId?: string,
    transactionReference?: string
  ): Promise<string> {
    const investment = await this.getInvestment(investmentId);
    if (!investment) throw new Error('Investment not found');
    
    // 📥 CREATE BANK TRANSACTION (IN) - লাভ আসছে
    const transactionId = await bankTransactionService.createBankTransaction({
      transactionType: 'profit',
      direction: 'in',
      sourceCollection: 'investments',
      sourceId: investmentId,
      amount: profitAmount,
      paymentMethod: 'bank',
      paymentReference: transactionReference || `PROFIT-${investmentId.slice(-6)}-${Date.now()}`,
      paymentDate: new Date(),
      handlerId: recordedBy,
      handlerName: recordedByName,
      handlerType: 'somity',
      holdingType: 'somity_bank',
      destinationType: 'somity_bank',
      destinationBankAccountId: bankAccountId,
      remarks: `${investment.investmentName} - ${profitPeriod} মেয়াদের লাভ`,
      investmentId: investmentId,
      profitRecordId: `PR-${Date.now()}`,
    });
    
    await this.createProfitRecord({
      investmentId,
      period: profitPeriod,
      expectedAmount: profitAmount,
      receivedAmount: profitAmount,
      status: 'received',
      receivedDate: new Date(),
      linkedBankTransactionId: transactionId,
      notes: `লাভ প্রাপ্তি - ${profitPeriod}`,
    });
    
    const newTotalProfit = (investment.actualProfitReceived || 0) + profitAmount;
    await this.updateInvestment(investmentId, {
      actualProfitReceived: newTotalProfit,
      actualTotalReturn: investment.totalAmount + newTotalProfit,
      inTransactionId: transactionId,
    });
    
    // Add to inTransactions if not already there
    const currentInTx = investment.inTransactions || [];
    if (!currentInTx.includes(transactionId)) {
      await this.updateInvestment(investmentId, {
        inTransactions: [...currentInTx, transactionId]
      });
    }
    
    await this.createTransaction({
      investmentId,
      transactionType: 'profit',
      amount: profitAmount,
      date: new Date().toISOString(),
      status: 'completed',
      description: `${profitPeriod} মেয়াদের লাভ প্রাপ্তি: ${profitAmount} টাকা`,
      type: 'profit',
      createdBy: recordedBy,
      createdByName: recordedByName,
      linkedBankTransactionId: transactionId,
    });
    
    return transactionId;
  },

  // ============ MATURE INVESTMENT (FINAL RETURN) ============
  async matureInvestment(
    id: string,
    actualProfit: number,
    maturedBy: string,
    maturedByName: string,
    bankAccountId?: string,
    transactionReference?: string
  ): Promise<void> {
    const investment = await this.getInvestment(id);
    if (!investment) throw new Error('Investment not found');
    
    const totalReturn = investment.totalAmount + actualProfit;
    
    // 📥 CREATE BANK TRANSACTION (IN) - আসল + লাভ ফেরত আসছে
    const transactionId = await bankTransactionService.createBankTransaction({
      transactionType: 'investment_return',
      direction: 'in',
      sourceCollection: 'investments',
      sourceId: id,
      amount: totalReturn,
      paymentMethod: 'bank',
      paymentReference: transactionReference || `MATURITY-${id.slice(-6)}-${Date.now()}`,
      paymentDate: new Date(),
      handlerId: maturedBy,
      handlerName: maturedByName,
      handlerType: 'somity',
      holdingType: 'somity_bank',
      destinationType: 'somity_bank',
      destinationBankAccountId: bankAccountId,
      remarks: `${investment.investmentName} - মেয়াদ শেষে আসল + লাভ ফেরত`,
      investmentId: id,
    });
    
    await this.updateInvestment(id, {
      status: 'matured',
      actualProfitReceived: actualProfit,
      actualTotalReturn: totalReturn,
      currentValue: totalReturn,
      maturedBy,
      maturedAt: new Date().toISOString(),
      inTransactionId: transactionId,
    });
    
    // Add to inTransactions
    const currentInTx = investment.inTransactions || [];
    if (!currentInTx.includes(transactionId)) {
      await this.updateInvestment(id, {
        inTransactions: [...currentInTx, transactionId]
      });
    }
    
    await this.createTransaction({
      investmentId: id,
      transactionType: 'maturity',
      amount: totalReturn,
      date: new Date().toISOString(),
      status: 'completed',
      description: `বিনিয়োগ মেয়াদ শেষ - আসল: ${investment.totalAmount}, লাভ: ${actualProfit}, মোট: ${totalReturn}`,
      type: 'withdrawal',
      createdBy: maturedBy,
      createdByName: maturedByName,
      linkedBankTransactionId: transactionId,
    });
  },

  // ============ CO-INVESTOR PAYMENT VERIFICATION ============
  async verifyCoInvestorPayment(
    investmentId: string,
    coInvestorId: string,
    verifiedBy: string,
    verifiedByName: string,
    bankAccountId?: string
  ): Promise<void> {
    const ciRef = doc(getCoInvestorsCollection(investmentId), coInvestorId);
    const ciSnap = await getDoc(ciRef);
    
    if (!ciSnap.exists()) throw new Error('Co-investor not found');
    
    const ciData = ciSnap.data() as CoInvestor;
    
    // Update co-investor payment status
    await updateDoc(ciRef, {
      paymentStatus: 'verified',
      verifiedBy: verifiedBy,
      verifiedAt: new Date().toISOString(),
      notes: `অ্যাডমিন ${verifiedByName} দ্বারা সত্যায়িত`,
    });
    
    // If payment was in collector holding, mark as deposited to bank
    if (ciData.paymentMethod === 'cash' && ciData.linkedTransactionId) {
      await bankTransactionService.markAsDeposited(
        ciData.linkedTransactionId,
        bankAccountId || 'SOMITY_BANK_001',
        `CO-INV-VERIFIED-${Date.now()}`,
        verifiedBy
      );
    }
  },

  // ============ GET INVESTMENT ============
  async getInvestment(id: string): Promise<Investment | null> {
    const snap = await getDoc(getInvestmentDoc(id));
    if (!snap.exists()) return null;
    const data = snap.data() as Investment;

    const coInvestorsSnap = await getDocs(getCoInvestorsCollection(id));
    const coInvestors: CoInvestor[] = [];
    coInvestorsSnap.forEach((docSnap) =>
      coInvestors.push({ id: docSnap.id, ...docSnap.data() } as CoInvestor)
    );

    return { ...data, id: snap.id, coInvestors };
  },

  // ============ GET ALL INVESTMENTS (WITH CO-INVESTORS) ============
async getAllInvestments(limitCount = 100, status?: string): Promise<Investment[]> {
  let constraints: any[] = [orderBy('createdAt', 'desc')];
  if (status) constraints.push(where('status', '==', status));
  constraints.push(limit(limitCount));

  const snapshot = await getDocs(query(getInvestmentsCollection(), ...constraints));
  const investments: Investment[] = [];
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data() as Investment;
    
    // ✅ Load co-investors for each investment
    const coInvestorsSnap = await getDocs(getCoInvestorsCollection(docSnap.id));
    const coInvestors: CoInvestor[] = [];
    coInvestorsSnap.forEach((ciDoc) => {
      coInvestors.push({ id: ciDoc.id, ...ciDoc.data() } as CoInvestor);
    });
    
    investments.push({ 
      ...data, 
      id: docSnap.id, 
      coInvestors: coInvestors 
    });
  }
  return investments;
},

  // ============ GET PENDING INVESTMENTS ============
  async getPendingInvestments(): Promise<Investment[]> {
    return this.getAllInvestments(100, 'pending');
  },

  // ============ GET ACTIVE INVESTMENTS ============
  async getActiveInvestments(): Promise<Investment[]> {
    return this.getAllInvestments(100, 'active');
  },

  // ============ GET MATURED INVESTMENTS ============
  async getMaturedInvestments(): Promise<Investment[]> {
    return this.getAllInvestments(100, 'matured');
  },

  // ============ GET WITHDRAWN INVESTMENTS ============
  async getWithdrawnInvestments(): Promise<Investment[]> {
    return this.getAllInvestments(100, 'withdrawn');
  },

  // ============ GET INVESTMENTS BY USER ============
  async getInvestmentsByUser(userId: string): Promise<Investment[]> {
    let constraints: any[] = [where('createdBy', '==', userId), orderBy('createdAt', 'desc')];
    const snapshot = await getDocs(query(getInvestmentsCollection(), ...constraints));
    const investments: Investment[] = [];
    for (const docSnap of snapshot.docs) {
      investments.push({ id: docSnap.id, ...docSnap.data() } as Investment);
    }
    return investments;
  },

  // ============ UPDATE INVESTMENT ============
  async updateInvestment(id: string, updates: Partial<Investment>): Promise<void> {
    await updateDoc(getInvestmentDoc(id), { ...updates, updatedAt: new Date().toISOString() });
  },

  // ============ DELETE INVESTMENT (SOFT DELETE) ============
  async deleteInvestment(id: string): Promise<void> {
    await this.updateInvestment(id, { status: 'withdrawn' });
  },

  // ============ CREATE TRANSACTION ============
async createTransaction(transaction: Omit<InvestmentTransaction, 'id'>): Promise<InvestmentTransaction> {
  const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const txRef = doc(getTransactionsCollection(transaction.investmentId), txId);
  
  // Handle date properly - convert string to Date if needed
  let transactionDate: Date;
  if (typeof transaction.date === 'string') {
    transactionDate = new Date(transaction.date);
  } else if (transaction.date instanceof Date) {
    transactionDate = transaction.date;
  } else {
    transactionDate = new Date();
  }
  
  const newTransaction: InvestmentTransaction = {
    id: txId,
    ...transaction,
    date: transactionDate,
    createdAt: transactionDate,
  } as InvestmentTransaction;
  
  await setDoc(txRef, newTransaction);
  return newTransaction;
},

  // ============ GET INVESTMENT TRANSACTIONS ============
  async getInvestmentTransactions(investmentId: string): Promise<InvestmentTransaction[]> {
    const snapshot = await getDocs(
      query(getTransactionsCollection(investmentId), orderBy('date', 'desc'))
    );
    const transactions: InvestmentTransaction[] = [];
    snapshot.forEach((docSnap) => {
      transactions.push({ id: docSnap.id, ...docSnap.data() } as InvestmentTransaction);
    });
    return transactions;
  },

  // ============ CREATE PROFIT RECORD ============
  async createProfitRecord(record: Omit<ProfitRecord, 'id'>): Promise<string> {
    const recordId = `profit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const recordRef = doc(getProfitRecordsCollection(record.investmentId), recordId);
    
    const newRecord: ProfitRecord = {
      id: recordId,
      ...record,
      status: record.status || 'pending',
    } as ProfitRecord;
    
    await setDoc(recordRef, newRecord);
    return recordId;
  },

  // ============ GET PROFIT RECORDS ============
  async getProfitRecords(investmentId: string): Promise<ProfitRecord[]> {
    const snapshot = await getDocs(
      query(getProfitRecordsCollection(investmentId), orderBy('period', 'desc'))
    );
    const records: ProfitRecord[] = [];
    snapshot.forEach((docSnap) => {
      records.push({ id: docSnap.id, ...docSnap.data() } as ProfitRecord);
    });
    return records;
  },

  // ============ GET CO-INVESTORS ============
  async getCoInvestors(investmentId: string): Promise<CoInvestor[]> {
    const snapshot = await getDocs(getCoInvestorsCollection(investmentId));
    const coInvestors: CoInvestor[] = [];
    snapshot.forEach((docSnap) => {
      coInvestors.push({ id: docSnap.id, ...docSnap.data() } as CoInvestor);
    });
    return coInvestors;
  },

  // ============ GET INVESTMENT SUMMARY ============
  async getInvestmentSummary(): Promise<InvestmentSummary> {
    const investments = await this.getAllInvestments(10000);
    let totalInvested = 0,
      totalActive = 0,
      totalMatured = 0,
      totalPending = 0,
      totalProfitReceived = 0;
    let activeCount = 0,
      maturedCount = 0,
      pendingCount = 0;

    investments.forEach((inv) => {
      totalInvested += inv.totalAmount;
      totalProfitReceived += inv.actualProfitReceived || 0;
      if (inv.status === 'active') {
        totalActive += inv.totalAmount;
        activeCount++;
      } else if (inv.status === 'matured') {
        totalMatured += inv.totalAmount;
        maturedCount++;
      } else if (inv.status === 'pending') {
        totalPending += inv.totalAmount;
        pendingCount++;
      }
    });

    return {
      totalInvested,
      totalActive,
      totalMatured,
      totalPending,
      totalProfitReceived,
      activeCount,
      maturedCount,
      pendingCount,
    };
  },
};

export default investmentService;