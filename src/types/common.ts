// src/types/common.ts
// ============================================
// COMMON ENUMS & CONSTANTS
// ============================================

export type UserRole = 'super_admin' | 'admin' | 'cashier' | 'manager' | 'accountant' | 'collector' | 'member';  // ✅ super_admin আছে
export type MemberStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'terminated';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type PaymentType = 'cash' | 'bank' | 'bikash' | 'nogod' | 'rocket' | 'other';
export type FeeType = 'monthly' | 'advance' | 'yearly' | 'arrear' | 'multiple' | 'loan';
export type PaymentStatus = 'paid' | 'partial_paid' | 'cancelled';
export type MembershipType = 'regular' | 'special';
export type CollectionStatus = 'collected' | 'deposited' | 'transferred';