// src/types/user.ts
import type { UserRole } from './common';

export interface AppUser {
  uid: string;
  email: string;
  fullName: string;
  firstName: string;    // ✅ Required (not optional)
  lastName: string;     // ✅ Required (not optional)
  phone: string;
  photoURL: string;
  role: UserRole;
  memberId: string;     // ✅ Required (not optional)
  createdAt: Date;
  lastLoginAt: Date | null;
  updatedAt: Date | null;
}