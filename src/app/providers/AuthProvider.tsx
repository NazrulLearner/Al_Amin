// src/app/providers/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
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

export interface AuthUser {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
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

  // ============================================
  // LOAD SOMITY INFO (from somity_settings/config)
  // ============================================
  
  const loadSomityInfo = async () => {
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
    loadSomityInfo();
    
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
  // ============================================

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      await loadUserData(firebaseUser);
      
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
  // ============================================

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if ((userData?.role as UserRole) === 'super_admin') return true;
    if (!userData) return false;
    return requiredRoles.includes(userData.role || 'member');
  };

  // ============================================
  // DERIVED VALUES
  // ============================================

  const isSuperAdmin = (userData?.role as UserRole) === 'super_admin';
  
  const authUser: AuthUser | null = firebaseUser && userData
    ? {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role || 'member',
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
