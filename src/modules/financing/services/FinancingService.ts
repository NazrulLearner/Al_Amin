// src/modules/financing/services/FinancingService.ts

import { 
  collection, doc, setDoc, getDocs, getDoc, updateDoc,
  query, where, orderBy, Timestamp, limit
} from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import type { PaymentType, CollectionStatus } from '../../../types';
import { generateApplicationId, generateLoanId } from '../../../utils/generators/FinancingID';
import { calculateInstallmentSchedule, getNumberOfInstallments, getInstallmentAmount, type InstallmentFrequency } from '../utils/installmentCalculator';

// ============================================
// TYPES
// ============================================

export interface LoanApplicationData {
  applicant: {
    isMember: boolean;
    memberID?: string;
    name: string;
    phone: string;
    nid?: string;
    address?: string;
    occupation?: string;
    monthlyIncome?: number;
    email?: string;
  };
  grantor: {
    memberID: string;
    name: string;
    phone: string;
    relation: string;
  };
  loanType: string;
  loanDetails: any;
  remarks?: string;
  documents?: any[];
  loanApplicationDate?: Date;
  createdBy: string;
}

export interface LoanApplicationDoc {
  id: string;
  applicationId: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';
  applicant: any;
  grantor: any;
  loanType: string;
  loanDetails: any;
  remarks?: string;
  documents?: any[];
  loanApplicationDate?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface LoanDisbursement {
  id: string;
  disbursementId: string;
  loanId: string;
  memberId: string;
  memberName: string;
  amount: number;
  disbursementMethod: 'cash' | 'bank' | 'cheque' | 'transfer';
  disbursedFrom: 'cashier_fund' | 'somity_bank_account' | 'somity_cash';
  sourceDetails: {
    bankName?: string;
    accountNumber?: string;
    chequeNumber?: string;
    transactionId?: string;
  };
  receivedBy: string;
  receivedByName: string;
  receivedByMemberId: string;
  disbursedBy: string;
  disbursedByName: string;
  disbursedAt: Date;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  installmentSchedule?: any;
  createdAt: Date;
  createdBy: string;
}

// ============================================
// LOAN SERVICE
// ============================================

export const loanService = {
  
  // ============================================
  // LOAN APPLICATION
  // ============================================
  
  async createLoanApplication(data: LoanApplicationData): Promise<string> {
    try {
      const applicationId = await generateApplicationId();
      const now = Timestamp.now();
      const applicationRef = doc(collection(db, 'loanApplications'));
      
      const applicationData: LoanApplicationDoc = {
        id: applicationRef.id,
        applicationId,
        status: 'pending',
        applicant: data.applicant,
        grantor: data.grantor,
        loanType: data.loanType,
        loanDetails: data.loanDetails,
        remarks: data.remarks || '',
        documents: data.documents || [],
        loanApplicationDate: data.loanApplicationDate || now.toDate(),
        createdBy: data.createdBy,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };
      
      await setDoc(applicationRef, applicationData);
      console.log(`✅ Loan application created: ${applicationId}`);
      return applicationId;
    } catch (error) {
      console.error('Error creating loan application:', error);
      throw error;
    }
  },

  async getPendingApplications(): Promise<LoanApplicationDoc[]> {
    try {
      const appsRef = collection(db, 'loanApplications');
      const q = query(appsRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanApplicationDoc));
    } catch (error) {
      console.error('Error getting pending applications:', error);
      return [];
    }
  },

  async getAllApplications(): Promise<LoanApplicationDoc[]> {
    try {
      const appsRef = collection(db, 'loanApplications');
      const q = query(appsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanApplicationDoc));
    } catch (error) {
      console.error('Error getting applications:', error);
      return [];
    }
  },

  async getApplicationById(applicationId: string): Promise<LoanApplicationDoc | null> {
    try {
      const appRef = doc(db, 'loanApplications', applicationId);
      const snapshot = await getDoc(appRef);
      if (snapshot.exists()) return { id: snapshot.id, ...snapshot.data() } as LoanApplicationDoc;
      return null;
    } catch (error) {
      console.error('Error getting application:', error);
      return null;
    }
  },

  // ============================================
  // APPROVE LOAN APPLICATION
  // ============================================
  
  async approveLoanApplication(
    applicationId: string,
    approvedBy: string,
    settings?: any
  ): Promise<string> {
    try {
      const appRef = doc(db, 'loanApplications', applicationId);
      const appSnap = await getDoc(appRef);
      if (!appSnap.exists()) throw new Error('Application not found');
      
      const application = appSnap.data() as LoanApplicationDoc;
      if (application.status !== 'pending') throw new Error('This application has already been processed');
      
      // Get settings values
      const defaultInterestRate = settings?.loan?.defaultInterestRate || 10;
      const islamicConfig = settings?.islamicLoanConfig;
      
      // Update application status
      await updateDoc(appRef, {
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date()
      });
      
      // Calculate loan values based on loan type
      let amount = 0, durationMonths = 12, finalInterestRate = 0;
      let serviceChargePercent = 0, serviceChargeAmount = 0;
      let profitSharingRatio = 50;
      const installmentFrequency: InstallmentFrequency = application.loanDetails?.installmentFrequency || 'monthly';
      
      switch (application.loanType) {
        case 'qardHasanah':
          finalInterestRate = 0;
          serviceChargePercent = application.loanDetails?.serviceChargePercent || islamicConfig?.qardHasanah?.serviceFee || 0;
          amount = Number(application.loanDetails?.loanAmount || 0);
          durationMonths = Number(application.loanDetails?.durationMonths || 12);
          break;
        case 'murabaha':
          finalInterestRate = islamicConfig?.murabaha?.profitRate || defaultInterestRate;
          amount = Number(application.loanDetails?.assetCost || 0);
          durationMonths = Number(application.loanDetails?.durationMonths || 12);
          break;
        case 'musharaka':
          finalInterestRate = 0;
          amount = Number(application.loanDetails?.totalCapital || 0);
          durationMonths = Number(application.loanDetails?.durationMonths || 12);
          profitSharingRatio = application.loanDetails?.profitSharingRatio || islamicConfig?.musharaka?.profitSharingRatio || 50;
          break;
        case 'mudaraba':
          finalInterestRate = 0;
          amount = Number(application.loanDetails?.totalCapital || 0);
          durationMonths = Number(application.loanDetails?.durationMonths || 12);
          profitSharingRatio = application.loanDetails?.rabulMalShare || islamicConfig?.mudaraba?.profitSharingRatio || 50;
          break;
        case 'ijarah':
          finalInterestRate = 0;
          amount = Number(application.loanDetails?.assetValue || 0);
          durationMonths = Number(application.loanDetails?.leasePeriod || 12);
          break;
        case 'istisna':
        case 'tawarruq':
          finalInterestRate = islamicConfig?.istisna?.profitRate || defaultInterestRate;
          amount = Number(application.loanDetails?.totalCost || 0);
          durationMonths = Number(application.loanDetails?.durationMonths || 12);
          break;
        case 'salam':
          finalInterestRate = 0;
          amount = Number(application.loanDetails?.totalPrice || 0);
          durationMonths = Number(application.loanDetails?.deliveryPeriod || 12);
          break;
        case 'kafalah':
          finalInterestRate = 0;
          amount = Number(application.loanDetails?.guaranteeAmount || 0);
          durationMonths = Number(application.loanDetails?.durationMonths || 12);
          break;
        default:
          finalInterestRate = defaultInterestRate;
          amount = Number(application.loanDetails?.amount || 0);
          durationMonths = Number(application.loanDetails?.durationMonths || 12);
      }
      
      // Calculate total payable
      let totalPayable: number;
      if (application.loanType === 'qardHasanah') {
        serviceChargeAmount = (amount * serviceChargePercent) / 100;
        totalPayable = amount + serviceChargeAmount;
      } else if (application.loanType === 'ijarah') {
        totalPayable = (application.loanDetails?.rentalAmount || 0) * durationMonths;
      } else if (application.loanType === 'musharaka' || application.loanType === 'mudaraba') {
        totalPayable = amount;
      } else {
        totalPayable = amount * (1 + finalInterestRate / 100);
      }
      
      // Calculate installment schedule
      const loanStartDate = new Date();
      const installmentSchedule = calculateInstallmentSchedule(
        totalPayable,
        durationMonths,
        installmentFrequency,
        loanStartDate
      );
      
      const monthlyInstallment = durationMonths > 0 ? Math.round(totalPayable / durationMonths) : 0;
      
      // Generate loan ID
      const loanId = await generateLoanId(application.loanType as any);
      const loanRef = doc(db, 'loans', loanId);
      
      // Prepare loan data
      const loanData: any = {
        id: loanId,
        loanId,
        memberId: application.applicant.memberID || '',
        memberName: application.applicant.name,
        loanType: application.loanType,
        amount,
        interestRate: finalInterestRate,
        durationMonths,
        totalPayable,
        monthlyInstallment,
        installmentFrequency,
        totalInstallments: installmentSchedule.totalInstallments,
        installmentAmount: installmentSchedule.installmentAmount,
        nextDueDate: installmentSchedule.installments[0]?.dueDate || null,
        installmentSchedule: installmentSchedule.installments,
        purpose: application.loanDetails?.purpose || '',
        status: 'approved',
        guarantorId: application.grantor?.memberID,
        guarantorName: application.grantor?.name,
        approvedBy,
        approvedAt: new Date(),
        paidAmount: 0,
        dueAmount: totalPayable,
        paidInstallments: 0,
        remainingInstallments: installmentSchedule.totalInstallments,
        dueDate: new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000),
        loanApplicationDate: application.loanApplicationDate || new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: approvedBy,
        remarks: application.remarks,
      };
      
      // Add type-specific fields
      if (application.loanType === 'qardHasanah') {
        loanData.serviceChargePercent = serviceChargePercent;
        loanData.serviceChargeAmount = serviceChargeAmount;
      }
      if (application.loanType === 'musharaka') {
        loanData.profitSharingRatio = profitSharingRatio;
      }
      if (application.loanType === 'mudaraba') {
        loanData.profitSharingRatio = profitSharingRatio;
      }
      
      await setDoc(loanRef, loanData);
      console.log(`✅ Loan approved: ${loanId} with ${installmentSchedule.totalInstallments} installments`);
      return loanId;
    } catch (error) {
      console.error('Error approving loan application:', error);
      throw error;
    }
  },

  async rejectLoanApplication(applicationId: string, rejectedBy: string, reason?: string): Promise<void> {
    try {
      const appRef = doc(db, 'loanApplications', applicationId);
      await updateDoc(appRef, {
        status: 'rejected',
        rejectedBy,
        rejectedAt: new Date(),
        rejectionReason: reason || '',
        updatedAt: new Date()
      });
      console.log(`✅ Loan application rejected: ${applicationId}`);
    } catch (error) {
      console.error('Error rejecting loan application:', error);
      throw error;
    }
  },

  // ============================================
  // DISBURSEMENT
  // ============================================
  
  async recordDisbursement(
    loanId: string,
    data: {
      amount: number;
      disbursementDate?: Date;
      disbursementMethod: 'cash' | 'bank' | 'cheque' | 'transfer';
      disbursedFrom: 'cashier_fund' | 'somity_bank_account' | 'somity_cash';
      bankName?: string;
      accountNumber?: string;
      chequeNumber?: string;
      transactionId?: string;
      receivedBy: string;
      receivedByName: string;
      receivedByMemberId: string;
      disbursedBy: string;
      disbursedByName: string;
      notes?: string;
    }
  ): Promise<string> {
    try {
      const now = Timestamp.now();
      const disbursementId = `DISB-${Date.now()}`;
      const disbursementRef = doc(db, 'loanDisbursements', disbursementId);
      const disbursementAt = data.disbursementDate || now.toDate();
      
      // Get loan to get installment schedule
      const loan = await this.getLoanById(loanId);
      const installmentSchedule = (loan as any)?.installmentSchedule || [];
      
      const disbursementData: LoanDisbursement = {
        id: disbursementId,
        disbursementId,
        loanId,
        memberId: data.receivedBy,
        memberName: data.receivedByName,
        amount: data.amount,
        disbursementMethod: data.disbursementMethod,
        disbursedFrom: data.disbursedFrom,
        sourceDetails: {
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          chequeNumber: data.chequeNumber,
          transactionId: data.transactionId,
        },
        receivedBy: data.receivedBy,
        receivedByName: data.receivedByName,
        receivedByMemberId: data.receivedByMemberId,
        disbursedBy: data.disbursedBy,
        disbursedByName: data.disbursedByName,
        disbursedAt: disbursementAt,
        notes: data.notes,
        status: 'completed',
        installmentSchedule,
        createdAt: now.toDate(),
        createdBy: data.disbursedBy
      };
      
      await setDoc(disbursementRef, disbursementData);
      
      // Update loan status
      const loanRef = doc(db, 'loans', loanId);
      const firstInstallmentDueDate = installmentSchedule[0]?.dueDate || disbursementAt;
      
      await updateDoc(loanRef, {
        status: 'active',
        disbursementId,
        disbursementStatus: 'completed',
        disbursedAt: disbursementAt,
        loanStartDate: disbursementAt,
        nextDueDate: firstInstallmentDueDate,
        updatedAt: now.toDate()
      });
      
      console.log(`✅ Loan disbursement recorded: ${disbursementId}`);
      return disbursementId;
    } catch (error) {
      console.error('Error recording disbursement:', error);
      throw error;
    }
  },

  async getDisbursementByLoanId(loanId: string): Promise<LoanDisbursement | null> {
    try {
      const disbursementsRef = collection(db, 'loanDisbursements');
      const q = query(disbursementsRef, where('loanId', '==', loanId), orderBy('createdAt', 'desc'), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as LoanDisbursement;
      return null;
    } catch (error) {
      console.error('Error getting disbursement:', error);
      return null;
    }
  },

  // ============================================
  // LOAN MANAGEMENT
  // ============================================
  
  async getAllLoans(): Promise<any[]> {
    try {
      const loansRef = collection(db, 'loans');
      const q = query(loansRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting loans:', error);
      return [];
    }
  },

  async getLoansByStatus(status: string): Promise<any[]> {
    try {
      const loansRef = collection(db, 'loans');
      const q = query(loansRef, where('status', '==', status), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting loans by status:', error);
      return [];
    }
  },

  async getLoansByMember(memberId: string): Promise<any[]> {
    try {
      const loansRef = collection(db, 'loans');
      const q = query(loansRef, where('memberId', '==', memberId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting member loans:', error);
      return [];
    }
  },

  async getLoanById(loanId: string): Promise<any | null> {
    try {
      const loanRef = doc(db, 'loans', loanId);
      const snapshot = await getDoc(loanRef);
      if (snapshot.exists()) return { id: snapshot.id, ...snapshot.data() };
      return null;
    } catch (error) {
      console.error('Error getting loan:', error);
      return null;
    }
  },

  async updateLoanStatus(loanId: string, status: string, updatedBy?: string): Promise<void> {
    try {
      const loanRef = doc(db, 'loans', loanId);
      await updateDoc(loanRef, {
        status,
        updatedAt: new Date(),
        ...(updatedBy && { updatedBy }),
        ...(status === 'completed' && { completedAt: new Date() })
      });
      console.log(`✅ Loan status updated to ${status}`);
    } catch (error) {
      console.error('Error updating loan status:', error);
      throw error;
    }
  },

  // ============================================
  // REPAYMENT
  // ============================================
  
  async addRepayment(
    loanId: string,
    memberId: string,
    amount: number,
    paymentType: PaymentType,
    referenceNo?: string,
    bankName?: string,
    bankReference?: string,
    collectionStatus?: CollectionStatus
  ): Promise<void> {
    try {
      const now = Timestamp.now();
      const loan = await this.getLoanById(loanId);
      if (!loan) throw new Error('Loan not found');
      
      const installmentAmount = loan.installmentAmount || loan.monthlyInstallment;
      const installmentSchedule = loan.installmentSchedule || [];
      const currentInstallmentNo = (loan.paidInstallments || 0) + 1;
      
      const repaymentsRef = collection(db, 'loan_repayments');
      const repaymentRef = doc(repaymentsRef);
      
      const currentInstallment = installmentSchedule[currentInstallmentNo - 1];
      const dueDate = currentInstallment?.dueDate || new Date();
      const isFullPayment = amount >= installmentAmount;
      
      const repayment = {
        id: repaymentRef.id,
        loanId,
        memberId,
        installmentNo: currentInstallmentNo,
        dueDate,
        dueAmount: installmentAmount,
        paidAmount: amount,
        paidDate: now.toDate(),
        status: isFullPayment ? 'paid' : 'partial',
        paymentType,
        referenceNo,
        bankName: bankName || '',
        bankReference: bankReference || '',
        collectionStatus,
        createdAt: now.toDate()
      };
      
      await setDoc(repaymentRef, repayment);
      
      // Calculate new values
      const newPaidAmount = (loan.paidAmount || 0) + amount;
      const newDueAmount = loan.totalPayable - newPaidAmount;
      const newPaidInstallments = isFullPayment ? currentInstallmentNo : (loan.paidInstallments || 0);
      const remainingInstallments = loan.totalInstallments - newPaidInstallments;
      const nextDueDate = installmentSchedule[currentInstallmentNo]?.dueDate || null;
      
      await updateDoc(doc(db, 'loans', loanId), {
        paidAmount: newPaidAmount,
        dueAmount: newDueAmount,
        paidInstallments: newPaidInstallments,
        remainingInstallments,
        nextDueDate,
        status: newDueAmount <= 0 ? 'completed' : 'active',
        updatedAt: now.toDate()
      });
      
      console.log(`✅ Repayment added for loan ${loanId} - Installment ${currentInstallmentNo}`);
    } catch (error) {
      console.error('Error adding repayment:', error);
      throw error;
    }
  },

  async getRepaymentsByLoanId(loanId: string): Promise<any[]> {
    try {
      const repaymentsRef = collection(db, 'loan_repayments');
      const q = query(repaymentsRef, where('loanId', '==', loanId), orderBy('installmentNo', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting repayments:', error);
      return [];
    }
  },

  // ============================================
  // STATISTICS
  // ============================================
  
  async getLoanStats(): Promise<{
    totalLoans: number;
    totalAmount: number;
    activeLoans: number;
    pendingApproval: number;
    completedLoans: number;
    defaultedLoans: number;
    totalCollected: number;
  }> {
    try {
      const loans = await this.getAllLoans();
      return {
        totalLoans: loans.length,
        totalAmount: loans.reduce((sum, l) => sum + (l.amount || 0), 0),
        activeLoans: loans.filter(l => l.status === 'active').length,
        pendingApproval: loans.filter(l => l.status === 'pending').length,
        completedLoans: loans.filter(l => l.status === 'completed').length,
        defaultedLoans: loans.filter(l => l.status === 'defaulted').length,
        totalCollected: loans.reduce((sum, l) => sum + (l.paidAmount || 0), 0)
      };
    } catch (error) {
      console.error('Error getting loan stats:', error);
      return { totalLoans: 0, totalAmount: 0, activeLoans: 0, pendingApproval: 0, completedLoans: 0, defaultedLoans: 0, totalCollected: 0 };
    }
  },

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  getFrequencyLabel(frequency: InstallmentFrequency): string {
    const labels: Record<InstallmentFrequency, string> = {
      monthly: 'মাসিক',
      quarterly: 'ত্রৈমাসিক (৩ মাস)',
      halfYearly: 'অর্ধ-বার্ষিক (৬ মাস)',
      yearly: 'বার্ষিক (১২ মাস)',
      lumpSum: 'এককালীন'
    };
    return labels[frequency] || frequency;
  },

  getFrequencyLabelEn(frequency: InstallmentFrequency): string {
    const labels: Record<InstallmentFrequency, string> = {
      monthly: 'Monthly',
      quarterly: 'Quarterly (3 months)',
      halfYearly: 'Half-Yearly (6 months)',
      yearly: 'Yearly (12 months)',
      lumpSum: 'Lump Sum'
    };
    return labels[frequency] || frequency;
  },

  getNumberOfInstallments(durationMonths: number, frequency: InstallmentFrequency): number {
    return getNumberOfInstallments(durationMonths, frequency);
  },

  getInstallmentAmount(totalPayable: number, durationMonths: number, frequency: InstallmentFrequency): number {
    return getInstallmentAmount(totalPayable, durationMonths, frequency);
  }
};

export default loanService;