// src/services/authService.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  type User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, setDoc, getDoc, updateDoc, 
  collection, query, where, getDocs, Timestamp 
} from 'firebase/firestore';
import { auth, db } from '../../../services/firebase/firebase';
import type { AppUser, UserRole } from '../../../types';

// ============================================
// CREATE NEW USER ACCOUNT
// ============================================

export interface CreateUserAccountParams {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  memberId: string;
  role: UserRole;
}

export const createUserAccount = async (params: CreateUserAccountParams): Promise<FirebaseUser> => {
  try {
    console.log('📝 Creating user account for:', params.email);
    
    const userCredential = await createUserWithEmailAndPassword(auth, params.email, params.password);
    const user = userCredential.user;
    const userRef = doc(db, 'users', user.uid);
    const now = Timestamp.now();
    
    const appUser: AppUser = {
      uid: user.uid,
      email: params.email,
      fullName: params.fullName,
      firstName: params.fullName.split(' ')[0] || params.fullName,
      lastName: params.fullName.split(' ').slice(1).join(' ') || '',
      phone: params.phone || '',
      photoURL: '',
      role: params.role,
      memberId: params.memberId,
      createdAt: now.toDate(),
      lastLoginAt: now.toDate(),
      updatedAt: now.toDate()
    };
    
    await setDoc(userRef, appUser);
    console.log('✅ User account created successfully:', user.uid);
    return user;
    
  } catch (error: any) {
    console.error('❌ Error creating user account:', error);
    if (error.code === 'auth/email-already-in-use') throw new Error('এই ইমেইল আগে ব্যবহার করা হয়েছে। অন্য ইমেইল দিন।');
    if (error.code === 'auth/weak-password') throw new Error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
    if (error.code === 'auth/invalid-email') throw new Error('সঠিক ইমেইল ঠিকানা দিন।');
    throw new Error(error.message);
  }
};

// ============================================
// SIGN IN USER
// ============================================

export const signInUser = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { lastLoginAt: Timestamp.now() });
    console.log('✅ User signed in successfully:', user.uid);
    return user;
  } catch (error: any) {
    console.error('❌ Error signing in:', error);
    if (error.code === 'auth/user-not-found') throw new Error('এই ইমেইলে কোনো অ্যাকাউন্ট নেই।');
    if (error.code === 'auth/wrong-password') throw new Error('পাসওয়ার্ড ভুল হয়েছে।');
    if (error.code === 'auth/invalid-email') throw new Error('সঠিক ইমেইল ঠিকানা দিন।');
    if (error.code === 'auth/too-many-requests') throw new Error('অনেকবার ভুল চেষ্টা। পরে আবার চেষ্টা করুন।');
    throw new Error(error.message);
  }
};

// ============================================
// RESET PASSWORD
// ============================================

export const resetUserPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('📧 Password reset email sent to:', email);
  } catch (error: any) {
    console.error('❌ Error resetting password:', error);
    if (error.code === 'auth/user-not-found') throw new Error('এই ইমেইলে কোনো অ্যাকাউন্ট নেই।');
    if (error.code === 'auth/invalid-email') throw new Error('সঠিক ইমেইল ঠিকানা দিন।');
    throw new Error(error.message);
  }
};

// ============================================
// SIGN OUT
// ============================================

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('👋 User signed out');
  } catch (error: any) {
    console.error('❌ Error signing out:', error);
    throw new Error('লগআউট করতে সমস্যা: ' + error.message);
  }
};

// ============================================
// GET USER DATA
// ============================================

export const getUserData = async (uid: string): Promise<AppUser | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        uid: data.uid || uid,
        email: data.email || '',
        fullName: data.fullName || '',
        firstName: data.firstName || data.fullName?.split(' ')[0] || '',
        lastName: data.lastName || data.fullName?.split(' ').slice(1).join(' ') || '',
        phone: data.phone || '',
        photoURL: data.photoURL || '',
        role: data.role || 'member',
        memberId: data.memberId || '',
        createdAt: data.createdAt?.toDate?.() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null,
      } as AppUser
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    return null;
  }
};

// ============================================
// CHECK MEMBER LOGIN STATUS
// ============================================

export const checkMemberLoginStatus = async (memberId: string): Promise<{
  hasAccess: boolean; email: string | null; uid: string | null;
}> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('memberId', '==', memberId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as AppUser;
      return { hasAccess: true, email: userData.email, uid: userDoc.id };
    }
    return { hasAccess: false, email: null, uid: null };
  } catch (error) {
    console.error('❌ Error checking member login status:', error);
    return { hasAccess: false, email: null, uid: null };
  }
};

// ============================================
// UPDATE USER PROFILE
// ============================================

export const updateUserProfile = async (uid: string, updates: { fullName?: string; phone?: string; photoURL?: string }): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { ...updates, updatedAt: Timestamp.now() });
    console.log(`✅ User profile updated for ${uid}`);
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    throw error;
  }
};

// ============================================
// CHECK EMAIL EXISTS
// ============================================

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    await signInWithEmailAndPassword(auth, email, 'dummy-password-123!@#');
    return true;
  } catch (error: any) {
    if (error.code === 'auth/wrong-password') return true;
    if (error.code === 'auth/user-not-found') return false;
    throw error;
  }
};