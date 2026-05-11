// src/modules/members/services/memberService.ts
// Core CRUD operations - Trimmed & Cleaned

import { 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { collections } from '../../../services/firebase/firebaseCollections';
import type { Member, MemberStatus, UserRole } from '../../../types';
import { compressProfilePhoto, compressSignature } from '../utils/imageCompression';
import { validateMemberData } from './memberValidation';
import { memberQueryService } from './memberQueryService';

// ============================================
// RE-EXPORTS (Backward Compatibility)
// ============================================

export { memberQueryService } from './memberQueryService';
export { validateMemberData, isValidMemberId, isValidPhone } from './memberValidation';
export { compressImageToBase64, compressProfilePhoto, compressSignature } from '../utils/imageCompression';

// ============================================
// COLLECTION REFERENCES
// ============================================

export const getMembersCollection = () => {
  return collections.members();
};

export const getMemberDocRef = (memberId: string) => {
  return collections.member(memberId);
};

// ============================================
// CREATE NEW MEMBER
// ============================================

export interface CreateMemberParams {
  id?: string;
  uid?: string;
  memberId: string;
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
  address: {
    country?: string;
    division: string;
    district: string;
    upazila?: string;
    union?: string;
    village?: string;
    presentAddress: string;
    permanentAddress?: string;
    sameAsPresent?: boolean;
  };
  membership: {
    dateOfJoin: string;
    membershipType?: 'regular' | 'special';
    position: string;
    role?: UserRole;
    status?: MemberStatus;
    shareCount: number;
    perShareFee?: number;
    monthlyFee: number;
    totalShareValue: number;
  };
  createdBy: string;
}

export const createMember = async (
  params: CreateMemberParams,
  photoFile?: File | null,
  signatureFile?: File | null
): Promise<string> => {
  try {
    // 🛡️ Validate
    const validation = validateMemberData(params);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    if (!params.memberId) throw new Error('Member ID is required');
    
    // Check if memberId already exists
    const existingMember = await getMemberByMemberId(params.memberId);
    if (existingMember) {
      throw new Error(`Member ID ${params.memberId} already exists`);
    }
    
    const now = Timestamp.now();
    
    // 🖼️ Compress images using utility
    let photoUrl = params.photoUrl || '';
    let signatureUrl = params.signatureUrl || '';
    
    if (photoFile) {
      try {
        photoUrl = await compressProfilePhoto(photoFile);
        console.log('✅ Photo compressed, length:', photoUrl.length);
      } catch (error) {
        console.error('❌ Error compressing photo:', error);
      }
    }
    
    if (signatureFile) {
      try {
        signatureUrl = await compressSignature(signatureFile);
        console.log('✅ Signature compressed, length:', signatureUrl.length);
      } catch (error) {
        console.error('❌ Error compressing signature:', error);
      }
    }
    
    // Handle address
    const sameAsPresent = params.address.sameAsPresent || false;
    const permanentAddress = sameAsPresent 
      ? params.address.presentAddress 
      : (params.address.permanentAddress || params.address.presentAddress);
    
    // Create clean member object
    const memberUid = params.id || params.uid || null;
    
    const member: Member = {
      id: memberUid || '',
      memberId: params.memberId,
      uid: memberUid,

      // Personal Information
      firstName: params.firstName || '',
      middleName: params.middleName || '',
      lastName: params.lastName || '',
      fullName: params.fullName || '',
      phone: params.phone || '',
      alternatePhone: params.alternatePhone || '',
      email: params.email || '',
      nidNumber: params.nidNumber || '',
      dateOfBirth: params.dateOfBirth || '',
      photoUrl: photoUrl,
      signatureUrl: signatureUrl,

      // Family Information
      fatherName: params.fatherName || '',
      motherName: params.motherName || '',
      spouseName: params.spouseName || '',
      nominee: params.nominee ? {
        name: params.nominee.name || '',
        relation: params.nominee.relation || '',
        nid: params.nominee.nid || '',
        phone: params.nominee.phone || '',
        share: params.nominee.share || 0,
      } : undefined,
      referenceMemberId: params.referenceMemberId || '',

      // Address
      address: {
        country: params.address.country || 'Bangladesh',
        division: params.address.division || '',
        district: params.address.district || '',
        upazila: params.address.upazila || '',
        union: params.address.union || '',
        village: params.address.village || '',
        presentAddress: params.address.presentAddress || '',
        permanentAddress: permanentAddress,
        sameAsPresent: sameAsPresent,
      },

      // Membership
      membership: {
        dateOfJoin: params.membership.dateOfJoin || new Date().toISOString().split('T')[0],
        membershipType: params.membership.membershipType || 'regular',
        position: params.membership.position || 'General Member',
        role: params.membership.role || 'member',
        status: params.membership.status || 'active',
        shareCount: params.membership.shareCount || 1,
        perShareFee: params.membership.perShareFee || 1000,
        monthlyFee: params.membership.monthlyFee || 1000,
        totalShareValue: params.membership.totalShareValue || 1000,
      },

      // Financials
      financials: {
        totalSavings: 0,
        activeLoanBalance: 0,
        dueAmount: 0,
        totalFeesPaid: 0,
        lastFeePaidMonth: null,
        lastFeePaidYear: null,
        lastFeeReceiptId: null,
        totalPendingMonths: 0,
        totalPendingAmount: 0,
        monthlyDueAmount: params.membership.monthlyFee || 1000,
        currentLoanBalance: 0,
        isLoanActive: false,
        lastLoanAmount: null,
        lastLoanDate: null,
        totalLoanPaid: 0,
      },

      // Verification
      verification: {
        status: 'pending',
        verifiedBy: null,
        verifiedAt: null,
      },

      // Metadata
      metadata: {
        createdBy: params.createdBy || 'system',
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
    };
    
    // Save to Firestore
    const memberRef = getMemberDocRef(params.memberId);
    await setDoc(memberRef, member);
    
    console.log(`✅ Member created: ${params.memberId}`);
    return params.memberId;
    
  } catch (error: any) {
    console.error('❌ Error creating member:', error);
    throw error;
  }
};

// ============================================
// ADD MEMBER (alias with flexible params)
// ============================================

export const addMember = async (
  memberData: any,
  photoFile?: File | null,
  signatureFile?: File | null
): Promise<string> => {
  const params: CreateMemberParams = {
    id: memberData.id || memberData.uid || undefined,
    uid: memberData.uid || memberData.id || undefined,
    memberId: memberData.memberId || memberData.id,
    firstName: memberData.firstName || memberData.personal?.firstName || '',
    middleName: memberData.middleName || memberData.personal?.middleName || '',
    lastName: memberData.lastName || memberData.personal?.lastName || '',
    fullName: memberData.fullName || memberData.personal?.fullName || '',
    phone: memberData.phone || memberData.personal?.phone || '',
    alternatePhone: memberData.alternatePhone || memberData.personal?.alternatePhone || '',
    email: memberData.email || memberData.personal?.email || '',
    nidNumber: memberData.nidNumber || memberData.personal?.nidNumber || '',
    dateOfBirth: memberData.dateOfBirth || memberData.personal?.dateOfBirth || '',
    photoUrl: memberData.photoUrl || memberData.personal?.photoUrl || '',
    signatureUrl: memberData.signatureUrl || memberData.personal?.signatureUrl || '',
    fatherName: memberData.fatherName || memberData.family?.fatherName || '',
    motherName: memberData.motherName || memberData.family?.motherName || '',
    spouseName: memberData.spouseName || memberData.family?.spouseName || '',
    nominee: memberData.nominee || memberData.family?.nominee,
    referenceMemberId: memberData.referenceMemberId || memberData.family?.referenceMemberId || '',
    address: memberData.address || {
      division: '',
      district: '',
      presentAddress: '',
    },
    membership: memberData.membership || {
      dateOfJoin: new Date().toISOString().split('T')[0],
      position: 'General Member',
      shareCount: 1,
      monthlyFee: 1000,
      totalShareValue: 1000,
    },
    createdBy: memberData.createdBy || memberData.metadata?.createdBy || 'system'
  };
  
  return createMember(params, photoFile, signatureFile);
};

// ============================================
// GET MEMBER BY MEMBER ID
// ============================================

export const getMemberByMemberId = async (memberId: string): Promise<Member | null> => {
  try {
    const memberRef = getMemberDocRef(memberId);
    const memberSnap = await getDoc(memberRef);
    
    if (memberSnap.exists()) {
      return memberSnap.data() as Member;
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting member:', error);
    return null;
  }
};

// ============================================
// UPDATE MEMBER
// ============================================

export const updateMember = async (
  memberId: string, 
  updates: Partial<Member>,
  updatedBy: string
): Promise<void> => {
  try {
    const memberRef = getMemberDocRef(memberId);
    
    const updateData = {
      ...updates,
      'metadata.updatedAt': Timestamp.now(),
      'metadata.updatedBy': updatedBy
    };
    
    await updateDoc(memberRef, updateData);
    console.log(`✅ Member ${memberId} updated`);
  } catch (error: any) {
    console.error('❌ Error updating member:', error);
    throw error;
  }
};

// ============================================
// UPDATE MEMBER PHOTO
// ============================================

export const updateMemberPhoto = async (
  memberId: string,
  photoFile: File,
  updatedBy: string
): Promise<string> => {
  try {
    const photoBase64 = await compressProfilePhoto(photoFile);
    
    const memberRef = getMemberDocRef(memberId);
    await updateDoc(memberRef, {
      photoUrl: photoBase64,
      'metadata.updatedAt': Timestamp.now(),
      'metadata.updatedBy': updatedBy
    });
    
    console.log(`✅ Member ${memberId} photo updated`);
    return photoBase64;
  } catch (error) {
    console.error('❌ Error updating member photo:', error);
    throw error;
  }
};

// ============================================
// UPDATE MEMBER SIGNATURE
// ============================================

export const updateMemberSignature = async (
  memberId: string,
  signatureFile: File,
  updatedBy: string
): Promise<string> => {
  try {
    const signatureBase64 = await compressSignature(signatureFile);
    
    const memberRef = getMemberDocRef(memberId);
    await updateDoc(memberRef, {
      signatureUrl: signatureBase64,
      'metadata.updatedAt': Timestamp.now(),
      'metadata.updatedBy': updatedBy
    });
    
    console.log(`✅ Member ${memberId} signature updated`);
    return signatureBase64;
  } catch (error) {
    console.error('❌ Error updating member signature:', error);
    throw error;
  }
};

// ============================================
// DELETE MEMBER (soft delete)
// ============================================

export const deleteMember = async (
  memberId: string, 
  deletedBy: string
): Promise<void> => {
  try {
    const memberRef = getMemberDocRef(memberId);
    
    await updateDoc(memberRef, {
      'metadata.isDeleted': true,
      'metadata.deletedAt': Timestamp.now(),
      'metadata.deletedBy': deletedBy,
      'membership.status': 'inactive'
    });
    
    console.log(`✅ Member ${memberId} soft deleted`);
  } catch (error: any) {
    console.error('❌ Error deleting member:', error);
    throw error;
  }
};

// ============================================
// HARD DELETE MEMBER
// ============================================

export const hardDeleteMember = async (memberId: string): Promise<void> => {
  try {
    const memberRef = getMemberDocRef(memberId);
    await deleteDoc(memberRef);
    console.log(`✅ Member ${memberId} hard deleted`);
  } catch (error: any) {
    console.error('❌ Error hard deleting member:', error);
    throw error;
  }
};

// ============================================
// LINK USER TO MEMBER
// ============================================

export const linkUserToMember = async (
  memberId: string,
  uid: string
): Promise<void> => {
  try {
    const memberRef = getMemberDocRef(memberId);
    
    await updateDoc(memberRef, {
      uid: uid,
      'verification.status': 'verified',
      'verification.verifiedBy': uid,
      'verification.verifiedAt': Timestamp.now(),
      'metadata.updatedAt': Timestamp.now()
    });
    
    console.log(`✅ User ${uid} linked to member ${memberId}`);
  } catch (error) {
    console.error('❌ Error linking user to member:', error);
    throw error;
  }
};

// ============================================
// ALIASES & BACKWARD COMPATIBILITY
// ============================================

export const getMemberById = getMemberByMemberId;

// Delegate to query service for backward compatibility
export const getAllMembers = () => memberQueryService.getAllMembersRaw();
export const getSimpleMembers = () => memberQueryService.getAllMembers();
export const searchMembers = (searchTerm: string) => memberQueryService.searchMembers(searchTerm);
export const getMembersByStatus = (status: MemberStatus) => memberQueryService.getMembersByStatus(status);
export const getMembersByRole = (role: UserRole) => memberQueryService.getMembersByRole(role);
export const generateNextMemberId = (prefix?: string) => memberQueryService.generateNextMemberId(prefix);
export const getMemberStats = () => memberQueryService.getMemberStats();

// ============================================
// EXPORT SERVICE OBJECT
// ============================================

export const memberService = {
  // Core CRUD
  createMember,
  addMember,
  getMemberByMemberId,
  getMemberById,
  updateMember,
  updateMemberPhoto,
  updateMemberSignature,
  deleteMember,
  hardDeleteMember,
  linkUserToMember,
  
  // Query operations (delegated)
  getAllMembers,
  getSimpleMembers,
  searchMembers,
  getMembersByStatus,
  getMembersByRole,
  generateNextMemberId,
  getMemberStats,
  
  // Validation & Utilities (exported but also here)
  validateMemberData,
};

export default memberService;