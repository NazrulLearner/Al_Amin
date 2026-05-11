// src/pages/auth/Login.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import { getDoc } from 'firebase/firestore';
import { collections } from '../../../services/firebase/firebaseCollections';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    memberId: '',
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'member'>('email');
  const [showPassword, setShowPassword] = useState(false);
  
  const [memberIdSuggestions, setMemberIdSuggestions] = useState<Array<{memberId: string, name: string}>>([]);
  const [showMemberSuggestions, setShowMemberSuggestions] = useState(false);
  const [isSearchingMember, setIsSearchingMember] = useState(false);
  
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      switch(user.role) {
        case 'super_admin':
          navigate('/super-admin', { replace: true });
          break;
        case 'admin':
          navigate('/admin-dashboard', { replace: true });
          break;
        case 'cashier':
          navigate('/cashier-dashboard', { replace: true });
          break;
        default:
          navigate('/member-dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Trigger suggestions for member ID
    if (name === 'memberId' && value.length >= 2) {
      searchMemberIds(value);
    } else if (name === 'memberId' && value.length < 2) {
      setMemberIdSuggestions([]);
      setShowMemberSuggestions(false);
    }
  };

  // Search member IDs with debounce and cache
  const searchMemberIds = async (searchText: string) => {
    setIsSearchingMember(true);
    try {
      const memberSnap = await getDoc(collections.member(searchText));
      if (memberSnap.exists()) {
        const data = memberSnap.data();
        setMemberIdSuggestions([{ memberId: data.memberId || memberSnap.id, name: data.fullName || data.name || '' }]);
        setShowMemberSuggestions(true);
      } else {
        setMemberIdSuggestions([]);
        setShowMemberSuggestions(false);
      }
    } catch (error) {
      console.error('Error searching members:', error);
    } finally {
      setIsSearchingMember(false);
    }
  };
  
  const selectMemberId = (memberId: string) => {
    setFormData(prev => ({ ...prev, memberId: memberId }));
    setShowMemberSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setError('অনেকবার ভুল চেষ্টা করেছেন। ৫ মিনিট পর আবার চেষ্টা করুন।');
      return;
    }
    
    // Validation based on login method
    if (loginMethod === 'email') {
      if (!formData.email || !formData.password) {
        setError('ইমেইল এবং পাসওয়ার্ড দিন');
        return;
      }
    } else {
      if (!formData.memberId || !formData.password) {
        setError('সোমিটি কোড, মেম্বার আইডি এবং পাসওয়ার্ড দিন');
        return;
      }
    }
    
    setError('');
    setLoading(true);
    
    try {
      let loginEmail = formData.email;
      
      // If using member login, find the email from member ID
      if (loginMethod === 'member') {
        const memberSnap = await getDoc(collections.member(formData.memberId));

        if (!memberSnap.exists()) {
          throw new Error('মেম্বার আইডি সঠিক নয়');
        }
        
        const member = memberSnap.data();
        if (!member.email) {
          throw new Error('এই মেম্বারের ইমেইল নেই। অনুগ্রহ করে ইমেইল লগইন ব্যবহার করুন।');
        }
        
        loginEmail = member.email;
      }
      
      await signIn(loginEmail, formData.password);
      setLoginAttempts(0);
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        setTimeout(() => {
          setIsLocked(false);
          setLoginAttempts(0);
        }, 5 * 60 * 1000);
      }
      
      if (error.message.includes('user-not-found') || error.message.includes('wrong-password')) {
        setError('ইমেইল/মেম্বার আইডি বা পাসওয়ার্ড ভুল হয়েছে।');
      } else if (error.message.includes('invalid-email')) {
        setError('সঠিক ইমেইল ঠিকানা দিন।');
      } else if (error.message.includes('too-many-requests')) {
        setError('অনেকবার ভুল চেষ্টা। ৫ মিনিট পর আবার চেষ্টা করুন।');
        setIsLocked(true);
        setTimeout(() => setIsLocked(false), 5 * 60 * 1000);
      } else {
        setError(error.message || 'লগইন করতে সমস্যা।');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">সমিতি অ্যাপে স্বাগতম</h2>
          <p className="text-sm text-gray-600 mt-2">লগইন করতে নিচের তথ্য দিন</p>
        </div>
        
        {/* Login Method Toggle */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setLoginMethod('email')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              loginMethod === 'email' 
                ? 'bg-green-600 text-white shadow' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            📧 ইমেইল লগইন
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('member')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              loginMethod === 'member' 
                ? 'bg-green-600 text-white shadow' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            🆔 মেম্বার লগইন
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {loginMethod === 'member' ? (
            <>
              {/* Member ID with Suggestions */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  মেম্বার আইডি <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="memberId"
                    value={formData.memberId}
                    onChange={handleChange}
                    onFocus={() => formData.memberId.length >= 2 && setShowMemberSuggestions(true)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Member ID"
                    disabled={isLocked}
                    autoComplete="off"
                  />
                  {isSearchingMember && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
                {/* Member Suggestions Dropdown */}
                {showMemberSuggestions && memberIdSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {memberIdSuggestions.map((sugg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectMemberId(sugg.memberId)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium">{sugg.memberId}</div>
                        <div className="text-xs text-gray-500">{sugg.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Email Field */
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ইমেইল <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your@email.com"
                disabled={isLocked}
              />
            </div>
          )}
          
          {/* Password - Common for both */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              পাসওয়ার্ড <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                placeholder="••••••••"
                disabled={isLocked}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                লগইন হচ্ছে...
              </>
            ) : isLocked ? (
              'অপেক্ষা করুন...'
            ) : (
              'লগইন'
            )}
          </button>
          
          <div className="flex justify-between text-sm">
            <Link to="/forgot-password" className="text-green-600 hover:underline">
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
            <Link to="/create-admin" className="text-green-600 hover:underline">
              অ্যাডমিন তৈরি করুন
            </Link>
          </div>
        </form>
        
        {/* Login Method Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-xs text-blue-700 space-y-2">
          <p className="font-medium">🔐 লগইন পদ্ধতি:</p>
          <p>📧 <strong>ইমেইল লগইন</strong> - আপনার অ্যাকাউন্টের ইমেইল এবং পাসওয়ার্ড দিয়ে লগইন করুন</p>
          <p>🆔 <strong>মেম্বার লগইন</strong> - সোমিটি কোড + মেম্বার আইডি + পাসওয়ার্ড দিয়ে লগইন করুন</p>
          <p className="text-xs text-blue-600 mt-2">💡 টাইপ করতে থাকলে সম্পর্কিত সোমিটি কোড ও মেম্বার আইডি সাজেশন দেখাবে</p>
          <p className="text-xs text-red-600">⚠️ ৩ বার ভুল চেষ্টায় ৫ মিনিট লক হবে</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
