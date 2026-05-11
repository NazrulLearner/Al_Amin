import * as admin from 'firebase-admin';
import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2/options';

// Set global options (optional)
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 10,
});

// Initialize Firebase Admin SDK
admin.initializeApp();

// ============================================
// CREATE MEMBER AUTH ACCOUNT CLOUD FUNCTION (v2)
// ============================================
export const createMemberAuthAccount = onCall(
  async (request: CallableRequest<{
    email: string;
    password: string;
    memberData: any;
  }>) => {
    try {
      // 🔐 Check if caller (admin) is authenticated
      if (!request.auth) {
        throw new HttpsError(
          'unauthenticated',
          'আপনি লগইন নেই। আবার লগইন করুন।'
        );
      }

      const { email, password, memberData } = request.data;
      
      // 📝 Validate required fields
      if (!email || !password || !memberData) {
        throw new HttpsError(
          'invalid-argument',
          'ইমেইল, পাসওয়ার্ড এবং মেম্বার ডেটা প্রয়োজন'
        );
      }

      // 🔍 Check if user already exists by email
      try {
        await admin.auth().getUserByEmail(email);
        // যদি ইউজার আগে থেকে থাকে
        throw new HttpsError(
          'already-exists',
          'এই ইমেইলে আগে থেকে একটি অ্যাকাউন্ট আছে'
        );
      } catch (error: any) {
        // User doesn't exist - this is what we want
        if (error.code !== 'auth/user-not-found') {
          throw error;
        }
      }

      // ✅ 1️⃣ Create Auth user using Admin SDK (doesn't affect current session)
      const newUser = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: memberData.fullName || `${memberData.firstName} ${memberData.lastName}`.trim(),
        phoneNumber: memberData.phone,
        disabled: false,
      });

      // ✅ 2️⃣ Set custom claims for role
      await admin.auth().setCustomUserClaims(newUser.uid, {
        role: memberData.role || 'member'
      });

      console.log(`✅ Auth user created: ${newUser.uid}`);

      // ✅ 3️⃣ Create user document in somity's subcollection
      const userRef = admin.firestore().collection('users').doc(newUser.uid);

      const userDocData = {
        uid: newUser.uid,
        email: email,
        firstName: memberData.firstName || '',
        lastName: memberData.lastName || '',
        fullName: memberData.fullName || '',
        phone: memberData.phone || '',
        role: memberData.role || 'member',
        orgId: 'config',
        currentOrgId: 'config',
        memberId: memberData.memberId,
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: null,
        createdBy: request.auth.uid  // Who created this user (admin)
      };

      await userRef.set(userDocData);
      console.log(`? User document created in users collection`);


      // ✅ 5️⃣ Update member document with uid
      const memberRef = admin.firestore().collection('members').doc(memberData.memberId);

      await memberRef.update({
        uid: newUser.uid,
        hasLoginAccount: true,
        loginEmail: email,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Member document updated with uid`);

      // ✅ Return success response
      return {
        success: true,
        uid: newUser.uid,
        message: 'মেম্বার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে'
      };

    } catch (error: any) {
      console.error('❌ Error creating member account:', error);
      
      // Handle known Firebase Auth errors
      if (error.code === 'auth/email-already-exists') {
        throw new HttpsError(
          'already-exists',
          'এই ইমেইলে আগে থেকে একটি অ্যাকাউন্ট আছে'
        );
      }
      
      if (error.code === 'auth/invalid-email') {
        throw new HttpsError(
          'invalid-argument',
          'সঠিক ইমেইল ঠিকানা দিন'
        );
      }
      
      if (error.code === 'auth/weak-password') {
        throw new HttpsError(
          'invalid-argument',
          'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'
        );
      }
      
      // If it's already an HttpsError, rethrow it
      if (error instanceof HttpsError) {
        throw error;
      }
      
      // Generic error
      throw new HttpsError(
        'internal',
        'মেম্বার অ্যাকাউন্ট তৈরি করতে সমস্যা: ' + error.message
      );
    }
  }
);

// ============================================
// OPTIONAL: GET MEMBER ACCOUNT STATUS (v2)
// ============================================
export const getMemberAccountStatus = onCall(
  async (request: CallableRequest<{
    memberId: string;
    somityId?: string;
  }>) => {
    try {
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'লগইন প্রয়োজন');
      }

      const { memberId } = request.data;

      if (!memberId) {
        throw new HttpsError('invalid-argument', 'Member ID required');
      }

      const memberRef = admin.firestore().collection('members').doc(memberId);

      const memberSnap = await memberRef.get();

      if (!memberSnap.exists) {
        throw new HttpsError('not-found', 'Member not found');
      }

      const memberData = memberSnap.data();

      return {
        hasLoginAccount: memberData?.hasLoginAccount || false,
        loginEmail: memberData?.loginEmail || null,
        uid: memberData?.uid || null
      };

    } catch (error: any) {
      console.error('Error checking member account:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);
