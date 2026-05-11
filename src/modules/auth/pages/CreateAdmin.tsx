// src/pages/auth/CreateAdmin.tsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../../services/firebase/firebase';
import { Shield, User, Mail, AlertCircle, Loader2 } from 'lucide-react';

const CreateAdmin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    // Admin Personal Info
    firstName: '',
    middleName: '',
    lastName: '',
    
    // Contact Info
    email: '',
    phone: '',
    
    // Account Info
    memberId: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Name validation
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    
    // Contact validation
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Valid email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    
    // Account validation
    if (!formData.memberId.trim()) {
      setError('Member ID is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const now = Timestamp.now();
      const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.replace(/\s+/g, ' ').trim();
      
      // 1. Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const newUser = userCredential.user;
      
      // 2. Create User document (root level)
      const userRef = doc(db, 'users', newUser.uid);
      await setDoc(userRef, {
        uid: newUser.uid,
        memberId: formData.memberId,
        email: formData.email,
        fullName: fullName,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        phone: formData.phone,
        photoURL: '',
        role: 'admin',
        createdAt: now,
        updatedAt: now
      });
      
      // 3. Create Member document (root level)
      const memberRef = doc(db, 'members', formData.memberId);
      await setDoc(memberRef, {
        id: newUser.uid,
        memberId: formData.memberId,
        uid: newUser.uid,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        fullName: fullName,
        email: formData.email,
        phone: formData.phone,
        alternatePhone: '',
        nidNumber: '',
        dateOfBirth: '',
        photoUrl: '',
        signatureUrl: '',
        fatherName: '',
        motherName: '',
        spouseName: '',
        referenceMemberId: '',
        address: {
          country: 'Bangladesh',
          division: '',
          district: '',
          upazila: '',
          union: '',
          village: '',
          presentAddress: '',
          permanentAddress: '',
          sameAsPresent: false,
        },
        membership: {
          dateOfJoin: new Date().toISOString().split('T')[0],
          membershipType: 'regular',
          position: 'Admin',
          role: 'admin',
          status: 'active',
          shareCount: 1,
          perShareFee: 1000,
          monthlyFee: 1000,
          totalShareValue: 1000,
        },
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
          monthlyDueAmount: 1000,
          currentLoanBalance: 0,
          isLoanActive: false,
          lastLoanAmount: null,
          lastLoanDate: null,
          totalLoanPaid: 0,
        },
        verification: {
          status: 'verified',
          verifiedBy: newUser.uid,
          verifiedAt: now.toDate(),
        },
        metadata: {
          createdBy: newUser.uid,
          createdAt: now.toDate(),
          updatedAt: now.toDate(),
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
        },
      });
      
      // 4. Create Somity Settings (root level)
      const settingsRef = doc(db, 'somity_settings', 'config');
      await setDoc(settingsRef, {
        general: {
          somityName: 'Al-Amin Somity',
          somityEmail: '',
          somityPhone: '',
          somityAddress: '',
        },
        monthlyContribute: 1000,
        paymentMethods: ['Cash', 'Bank Transfer', 'Mobile Banking'],
        somityAccounts: {
          cash: { name: 'Cash', balance: 0 },
          bank: { name: 'Bank', accountNumber: '', balance: 0 }
        },
        receiptPrefix: 'AM',
        createdAt: now,
        createdBy: newUser.uid
      });
      
      setSuccess('Admin account created successfully!');
      
      // Clear form
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone: '',
        memberId: '',
        password: '',
        confirmPassword: ''
      });
      
    } catch (err: any) {
      console.error('Error creating admin:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError(err.message || 'Failed to create admin account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Create Admin Account</h2>
          <p className="text-sm text-gray-600 mt-2">Set up your admin user for Al-Amin Somity</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <p className="font-medium">✅ {success}</p>
            <p className="text-sm mt-1">You can now login with your email and password.</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Admin Personal Info Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Last Name"
                />
              </div>
            </div>
          </div>
          
          {/* Contact Info Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </div>
          </div>
          
          {/* Account Info Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Account Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., ADMIN001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value="Admin"
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Confirm password"
                />
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Create Admin Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAdmin;
