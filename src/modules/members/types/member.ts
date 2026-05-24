// src/types/member.ts
import type { UserRole, MemberStatus, VerificationStatus, MembershipType } from '../../../types/common';

export interface Member {
  personal: any;
  id: string;
  memberId: string;
  uid: string | null;
  
  // Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  nidNumber?: string;
  dateOfBirth: string;
  photoUrl?: string;
  signatureUrl?: string;
  
  // Family Information
  fatherName: string;
  motherName: string;
  spouseName?: string;
  nominee?: {
    name: string;
    relation: string;
    nid?: string;
    phone?: string;
    share?: number;
  };
  referenceMemberId?: string;
  
  // Address
  address: {
    country: string;
    division: string;
    district: string;
    upazila: string;
    union: string;
    village: string;
    presentAddress: string;
    permanentAddress: string;
    sameAsPresent: boolean;
  };
  
  // Membership
  membership: {
    dateOfJoin: string;
    membershipType: MembershipType;
    position: string;
    role: UserRole;
    status: MemberStatus;
    shareCount: number;
    perShareFee: number;
    monthlyFee: number;
    totalShareValue: number;
  };
  
  // Financial
  financials: {
    totalSavings: number;
    activeLoanBalance: number;
    dueAmount: number;
    totalFeesPaid: number;
    lastFeePaidMonth?: string | null;
    lastFeePaidYear?: number | null;
    lastFeeReceiptId?: string | null;
    totalPendingMonths: number;
    totalPendingAmount: number;
    monthlyDueAmount: number;
    currentLoanBalance: number;
    isLoanActive: boolean;
    lastLoanAmount?: number | null;
    lastLoanDate?: string | null;
    totalLoanPaid: number;
  };
  
  // Verification
  verification: {
    status: VerificationStatus;
    verifiedBy?: string | null;
    verifiedAt?: Date | null;
  };
  
  // Metadata
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt?: Date | null;
    isDeleted: boolean;
    deletedAt?: Date | null;
    deletedBy?: string | null;
  };
}

export interface SimpleMember {
  id: string;
  memberId: string;
  fullName: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  position: string;
  role: UserRole;
  status: MemberStatus;
  shareCount: number;
  monthlyFee: number;
  totalFeesPaid: number;
  totalPendingMonths: number;
  totalPendingAmount: number;
  monthlyDueAmount: number;
  currentLoanBalance: number;
  isLoanActive: boolean;
  dateOfJoin: string;
  createdAt: Date;
  lastPaymentDate?: Date | null;
}

export const MEMBER_INITIAL_STATE = {
  uid: null as string | null,
  firstName: '', middleName: '', lastName: '', fullName: '',
  phone: '', alternatePhone: '', email: '', nidNumber: '', dateOfBirth: '',
  photoUrl: '', signatureUrl: '',
  fatherName: '', motherName: '', spouseName: '', referenceMemberId: '',
  address: {
    country: 'Bangladesh', division: '', district: '', upazila: '', union: '', village: '',
    presentAddress: '', permanentAddress: '', sameAsPresent: false,
  },
  membership: {
    dateOfJoin: new Date().toISOString().split('T')[0],
    membershipType: 'regular' as MembershipType, position: 'General Member',
    role: 'member' as UserRole, status: 'active' as MemberStatus,
    shareCount: 1, perShareFee: 1000, monthlyFee: 1000, totalShareValue: 1000,
  },
  financials: {
    totalFeesPaid: 0, lastFeePaidMonth: null, lastFeePaidYear: null, lastFeeReceiptId: null,
    totalPendingMonths: 0, totalPendingAmount: 0, monthlyDueAmount: 1000,
    currentLoanBalance: 0, isLoanActive: false,
    lastLoanAmount: null, lastLoanDate: null, totalLoanPaid: 0,
    totalSavings: 0, activeLoanBalance: 0, dueAmount: 0
  },
  verification: { status: 'pending' as VerificationStatus, verifiedBy: null, verifiedAt: null },
};