// src/pages/Users/AddUser.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../../services/firebase/firebase';
import { Shield, User, DollarSign, Mail, Lock, Phone, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

const AddUser: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'member' as 'admin' | 'cashier' | 'member',
    memberId: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Valid email is required');
      return false;
    }
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
      // 1. Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const newUser = userCredential.user;
      
      // 2. Create AppUser document
      const userRef = doc(db, 'users', newUser.uid);
      await setDoc(userRef, {
        uid: newUser.uid,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone || '',
        photoURL: '',
        role: formData.role,
        memberId: formData.memberId,
        status: 'active',
        createdAt: now,
        lastLoginAt: now,
        updatedAt: now,
      });
      
      // 3. Create Member document if role is member
      if (formData.role === 'member') {
        const memberRef = doc(db, 'members', formData.memberId);
        await setDoc(memberRef, {
          id: formData.memberId,
          memberId: formData.memberId,
          uid: newUser.uid,
          firstName: formData.fullName.split(' ')[0] || '',
          lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
          fullName: formData.fullName,
          phone: formData.phone || '',
          email: formData.email,
          membership: {
            dateOfJoin: new Date().toISOString().split('T')[0],
            position: 'General Member',
            role: 'member',
            status: 'active',
            shareCount: 1,
            perShareFee: 1000,
            monthlyFee: 1000,
            totalShareValue: 1000,
          },
          metadata: {
            createdBy: user?.uid,
            createdAt: now,
            updatedAt: now,
            isDeleted: false,
          },
        });
      }
      
      setSuccess(`✅ User "${formData.fullName}" created successfully!\n\nLogin credentials:\nEmail: ${formData.email}\nPassword: ${formData.password}`);
      
      // Reset form
      setFormData({
        fullName: '', email: '', phone: '', role: 'member', memberId: '', password: '', confirmPassword: '',
      });
      
      setTimeout(() => {
        navigate('/users/index');
      }, 3000);
      
    } catch (err: any) {
      console.error('Error creating user:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else {
        setError(err.message || 'Failed to create user');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch(formData.role) {
      case 'admin': return <Shield size={20} className="text-purple-500" />;
      case 'cashier': return <DollarSign size={20} className="text-blue-500" />;
      default: return <User size={20} className="text-green-500" />;
    }
  };

  const getRoleDescription = () => {
    switch(formData.role) {
      case 'admin': return 'Admins have full access to all features';
      case 'cashier': return 'Cashiers can manage fees and transactions';
      default: return 'Members can view their own profile and loans';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={() => navigate('/users/index')}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Users
      </button>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
        
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Add New User</h1>
          <p className="text-sm text-gray-500 mb-6">Create a new user account for this somity</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center">
              <AlertCircle size={16} className="mr-2" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg whitespace-pre-line">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Md. Rahim Mia"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="user@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="017XXXXXXXX"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 uppercase"
                  placeholder="MEM001"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4 p-3 border rounded-lg bg-gray-50">
                {getRoleIcon()}
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="flex-1 bg-transparent focus:outline-none"
                >
                  <option value="member">Member</option>
                  <option value="cashier">Cashier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getRoleDescription()}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/users/index')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
