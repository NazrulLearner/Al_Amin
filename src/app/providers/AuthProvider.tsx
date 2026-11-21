// src/app/providers/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../services/firebase/firebase';
import { collections } from '../../services/firebase/firebaseCollections';
import type { AppUser, Member, UserRole } from '../../types';

// ============================================
// Somity Type (Single somity app)
// ============================================

interface SomityInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  settings: any;
}

// ============================================
// AUTH CONTEXT TYPES
// ============================================

// Multi-role foundation: store roles array in userData even though
// the current UI renders only one role per user. Future work will
// expose multi-role selection in Admin/User management pages.
export interface AuthUser {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  /** Primary display role (derived from userData.role for backward compat) */
  role: UserRole;
  /** Full roles array — foundation for multi-role support */
  roles: UserRole[];
  memberId: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  userData: AppUser | null;
  somityInfo: SomityInfo | null;
  currentMember: Member | null;
  loading: boolean;
  error: string | null;
  
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  refreshUserData: () => Promise<void>;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  
  isSuperAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// ============================================
// AUTH PROVIDER
// ============================================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [somityInfo, setSomityInfo] = useState<SomityInfo | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref to prevent redundant somity_settings reads across auth-state transitions.
  // somity_settings/config is a singleton — fetch once after initial auth load.
  const somityInfoLoadedRef = useRef(false);

  // ============================================
  // LOAD SOMITY INFO (from somity_settings/config)
  // Fetched once per session, not on every auth-state change.
  // ============================================

  const loadSomityInfo = async () => {
    if (somityInfoLoadedRef.current) return;
    somityInfoLoadedRef.current = true;

    try {
      const settingsRef = collections.somitySettings();
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        const general = data.general || {};
        setSomityInfo({
          id: 'config',
          name: general.somityName || 'আমাদের সোমিটি',
          email: general.somityEmail || '',
          phone: general.somityPhone || '',
          address: general.somityAddress || '',
          settings: data,
        });
      } else {
        setSomityInfo({
          id: 'config',
          name: 'আমাদের সোমিটি',
          email: '',
          phone: '',
          address: '',
          settings: {},
        });
      }
    } catch (err) {
      console.error('Error loading somity info:', err);
      // Set defaults on error so the app never breaks
      setSomityInfo({
        id: 'config',
        name: 'আমাদের সোমিটি',
        email: '',
        phone: '',
        address: '',
        settings: {},
      });
    }
  };

  // ============================================
  // LOAD MEMBER DATA
  // ============================================
  
  const loadMemberData = async (memberId: string) => {
    try {
      const memberRef = collections.member(memberId);
      const memberSnap = await getDoc(memberRef);
      
      if (memberSnap.exists()) {
        const memberData = memberSnap.data();
        setCurrentMember({
          id: memberData.id || memberId,
          memberId: memberData.memberId || memberId,
          uid: memberData.uid || null,
          firstName: memberData.firstName || '',
          lastName: memberData.lastName || '',
          fullName: memberData.fullName || '',
          phone: memberData.phone || '',
          email: memberData.email || '',
          nidNumber: memberData.nidNumber || '',
          dateOfBirth: memberData.dateOfBirth || '',
          fatherName: memberData.fatherName || '',
          motherName: memberData.motherName || '',
          spouseName: memberData.spouseName || '',
          address: memberData.address || {},
          membership: memberData.membership || {},
          financials: memberData.financials || {},
          verification: memberData.verification || {},
          metadata: memberData.metadata || {},
        } as Member);
      } else {
        setCurrentMember(null);
      }
    } catch (err) {
      console.error('Error loading member data:', err);
    }
  };

  // ============================================
  // LOAD USER DATA
  // ============================================
  
  const loadUserData = async (user: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        const appUser: AppUser = {
          uid: data.uid || user.uid,
          email: data.email || user.email || '',
          firstName: data.firstName || data.fullName?.split(' ')[0] || '',
          lastName: data.lastName || data.fullName?.split(' ').slice(1).join(' ') || '',
          fullName: data.fullName || '',
          phone: data.phone || '',
          photoURL: data.photoURL || '',
          role: data.role || 'member',
          memberId: data.memberId || '',
          createdAt: data.createdAt?.toDate?.() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null,
        };
        setUserData(appUser);
        
        if (appUser.memberId) {
          await loadMemberData(appUser.memberId);
        }
      } else {
        console.warn('User document not found for:', user.uid);
        setUserData(null);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  // ============================================
  // LISTEN TO AUTH STATE
  // ============================================

  useEffect(() => {
    // Load somity settings once (lazy — won't block auth state listener)
    void loadSomityInfo();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        await loadUserData(user);
      } else {
        setUserData(null);
        setCurrentMember(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ============================================
  // SIGN IN
  // FUTURE CLOUD FUNCTION MIGRATION:
  //   Why: signIn combines Firebase Auth credential validation with a Firestore
  //        write (lastLoginAt). Client-side writes are visible in network tab and
  //        cannot enforce server-side business rules (e.g., IP-based lockout,
  //        device fingerprinting, audit logging).
  //   What it does now: signInWithEmailAndPassword → loadUserData → updateDoc(lastLoginAt).
  //   CF replaces: A callable HTTPS Cloud Function that accepts email+password,
  //        verifies credentials via custom token, records lastLoginAt atomically
  //        alongside an auth_audit log entry, and returns the user doc.
  //   Remove when: AuthProvider.signIn() body replaced by functions.httpsCallable('signIn');
  //                delete the direct auth/ and firestore/ imports and the separate updateDoc call.
  // ============================================

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await loadUserData(firebaseUser);

      // Consolidate lastLoginAt write into the same batch-like flow.
      // Two separate calls (loadUserData + updateDoc) are not atomic but
      // are both low-frequency (once per login), so the risk is acceptable.
      // TODO: Replace with runTransaction when Cloud Function is deployed.
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        await updateDoc(userRef, { lastLoginAt: Timestamp.now() });
      } catch (err) {
        console.warn('Could not update last login time:', err);
      }

    } catch (err: any) {
      console.error('SignIn error:', err);

      if (err.code === 'auth/user-not-found') {
        setError('এই ইমেইলে কোনো অ্যাকাউন্ট নেই।');
      } else if (err.code === 'auth/wrong-password') {
        setError('পাসওয়ার্ড ভুল হয়েছে।');
      } else if (err.code === 'auth/invalid-email') {
        setError('সঠিক ইমেইল ঠিকানা দিন।');
      } else if (err.code === 'auth/too-many-requests') {
        setError('অনেকবার ভুল চেষ্টা। পরে আবার চেষ্টা করুন।');
      } else {
        setError('লগইন করতে সমস্যা হয়েছে।');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOGOUT
  // ============================================

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      await signOut(auth);
      console.log('👋 User signed out');
    } catch (err: any) {
      console.error('Logout error:', err);
      setError('লগআউট করতে সমস্যা: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RESET PASSWORD
  // FUTURE CLOUD FUNCTION MIGRATION:
  //   Why: sendPasswordResetEmail currently runs client-side without auditing.
  //   What it does now: Calls Firebase Auth backend directly.
  //   CF replaces: A Cloud Function that validates the email exists in Firestore
  //        first (to avoid user enumeration), then triggers the reset email.
  //   Remove when: replace with functions.httpsCallable('sendPasswordReset').
  // ============================================

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      console.log('📧 Password reset email sent to:', email);
    } catch (err: any) {
      console.error('Reset password error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('এই ইমেইলে কোনো অ্যাকাউন্ট নেই।');
      } else if (err.code === 'auth/invalid-email') {
        setError('সঠিক ইমেইল ঠিকানা দিন।');
      } else if (err.code === 'auth/too-many-requests') {
        setError('অনেকবার চেষ্টা করেছেন। কিছুক্ষণ পর আবার চেষ্টা করুন।');
      } else {
        setError('পাসওয়ার্ড রিসেট করতে সমস্যা।');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // REFRESH USER DATA
  // ============================================

  const refreshUserData = async () => {
    if (firebaseUser) {
      await loadUserData(firebaseUser);
    }
  };

  // ============================================
  // CHECK PERMISSION
  // Supports both legacy single-role (`role`) and future multi-role (`roles[]`) models.
  // ============================================

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!userData) return false;
    // Super-admin bypass (legacy single-role check)
    if ((userData.role as UserRole) === 'super_admin') return true;
    // Multi-role check: any of the user's roles satisfies the requirement
    const userRoles: UserRole[] = (userData as AppUser & { roles?: UserRole[] }).roles ?? [userData.role];
    return userRoles.some(r => requiredRoles.includes(r));
  };

  // ============================================
  // DERIVED VALUES
  // ============================================

  const isSuperAdmin = (userData?.role as UserRole) === 'super_admin';

  // Build AuthUser with explicit roles array for multi-role readiness
  const authUser: AuthUser | null = firebaseUser && userData
    ? {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role || 'member',
        // Spread roles if present; otherwise derive from single role field
        roles: (userData as AppUser & { roles?: UserRole[] }).roles
          ?? [(userData.role as UserRole) || 'member'],
        memberId: userData.memberId || '',
      }
    : null;

  const value: AuthContextType = {
    user: authUser,
    userData,
    somityInfo,
    currentMember,
    loading,
    error,
    signIn,
    logout,
    resetPassword,
    refreshUserData,
    hasPermission,
    isSuperAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
