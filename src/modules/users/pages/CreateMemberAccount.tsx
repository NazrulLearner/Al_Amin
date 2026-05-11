// src/pages/Users/CreateMemberAccount.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase/firebase';
import { memberService } from '../../members/services/memberService';
import { User, Mail, Lock, Key, AlertCircle, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

interface Member {
  id: string;
  memberId: string;
  fullName: string;
  phone: string;
  email?: string;
  hasLogin?: boolean;
}

const CreateMemberAccount = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();

  // Load members without login
  useEffect(() => {
    loadMembersWithoutLogin();
  }, []);

  const loadMembersWithoutLogin = async () => {
    try {
      const allMembers = await memberService.getAllMembers();
      // Filter members without uid (no login account)
      const membersWithoutLogin = allMembers
        .filter(m => !m.uid)
        .map(m => ({
          id: m.id,
          memberId: m.memberId,
          fullName: m.fullName,
          phone: m.phone,
          email: m.email
        }));
      
      setMembers(membersWithoutLogin);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const filteredMembers = members.filter(m => 
    m.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.phone && m.phone.includes(searchTerm))
  );

  const validateForm = () => {
    if (!selectedMember) {
      setError('Please select a member');
      return false;
    }
    
    if (!loginEmail) {
      setError('Email is required');
      return false;
    }
    
    if (!loginEmail.includes('@')) {
      setError('Valid email is required');
      return false;
    }
    
    if (!loginPassword) {
      setError('Password is required');
      return false;
    }
    
    if (loginPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (loginPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (!adminPassword) {
      setError('Admin password is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const now = Timestamp.now();
      
      // 1. Create user account
      const { user: newUser } = await createUserWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      
      // 2. Create AppUser document
      await setDoc(doc(db, 'users', newUser.uid), {
        uid: newUser.uid,
        email: loginEmail,
        fullName: selectedMember!.fullName,
        phone: selectedMember!.phone || '',
        role: 'member',
        memberId: selectedMember!.memberId,
        status: 'active',
        createdAt: now,
        lastLoginAt: now,
        updatedAt: now,
      });
      
      // 3. Update member document with uid
      const memberRef = doc(db, 'members', selectedMember!.memberId);
      await updateDoc(memberRef, {
        uid: newUser.uid,
        hasLoginAccount: true,
        loginEmail: loginEmail,
        'metadata.updatedAt': now,
      });
      
      // 4. Re-login as admin
      await signInWithEmailAndPassword(auth, user!.email, adminPassword);
      
      setSuccess(`✅ Login account created for ${selectedMember!.fullName}!
      
Member ID: ${selectedMember!.memberId}
Email: ${loginEmail}
Password: ${loginPassword}`);
      
      // Reset form
      setSelectedMember(null);
      setLoginEmail('');
      setLoginPassword('');
      setConfirmPassword('');
      setAdminPassword('');
      setSearchTerm('');
      
      // Refresh list
      loadMembersWithoutLogin();
      
    } catch (error: any) {
      console.error('Error creating account:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else if (error.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters');
      } else if (error.code === 'auth/wrong-password') {
        setError('Admin password is incorrect');
      } else {
        setError(error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate('/members/index')}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Members
      </button>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
        
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Member Login Account</h1>
          <p className="text-sm text-gray-500 mb-6">Create login accounts for members who don't have one yet</p>
          
          {/* Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Member</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Member ID, Name or Phone"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          {/* Members List */}
          <div className="mb-6 max-h-60 overflow-y-auto border rounded-lg">
            {filteredMembers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No members found' : 'All members already have login accounts'}
              </div>
            ) : (
              filteredMembers.map(member => (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`p-3 border-b cursor-pointer hover:bg-green-50 transition-colors ${
                    selectedMember?.id === member.id ? 'bg-green-100 border-l-4 border-l-green-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User size={16} className="text-gray-400 mr-3" />
                      <div>
                        <span className="font-medium">{member.memberId}</span>
                        <span className="text-gray-600 ml-2">{member.fullName}</span>
                      </div>
                    </div>
                    {member.phone && <span className="text-xs text-gray-400">{member.phone}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Selected Member */}
          {selectedMember && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-2 flex items-center">
                <CheckCircle size={16} className="mr-2" />
                Selected Member
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-600">Member ID:</span> <span className="font-medium">{selectedMember.memberId}</span></div>
                <div><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedMember.fullName}</span></div>
                <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{selectedMember.phone || 'N/A'}</span></div>
              </div>
            </div>
          )}
          
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
          
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Login Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="member@example.com"
                  disabled={!selectedMember || loading}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Minimum 6 characters"
                    disabled={!selectedMember || loading}
                    minLength={6}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Confirm password"
                    disabled={!selectedMember || loading}
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Admin Password <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">Required to verify your identity</p>
              <div className="relative">
                <Key size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Your admin password"
                  disabled={!selectedMember || loading}
                />
              </div>
              <div className="flex items-center mt-1">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showAdminPassword}
                  onChange={(e) => setShowAdminPassword(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="showPassword" className="text-xs text-gray-500">Show password</label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/members/index')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={!selectedMember || loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMemberAccount;
