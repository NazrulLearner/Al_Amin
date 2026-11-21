// src/pages/auth/Login.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import { getDoc } from 'firebase/firestore';
import { collections } from '../../../services/firebase/firebaseCollections';
import { Eye, EyeOff, Loader2, UserCircle, Mail, ShieldCheck } from 'lucide-react';

// ─── Shared sub-components ───────────────────────────────────────

const ToggleChip: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
      active
        ? 'bg-[hsl(160,84%,19%)] text-white shadow-md shadow-green-900/20'
        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
    ].join(' ')}
  >
    {icon}
    {label}
  </button>
);

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
    {children}
    {required && <span className="text-red-400 ml-0.5">*</span>}
  </label>
);

const InputField: React.FC<{
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}> = ({ icon, suffix, error, children }) => (
  <div className="relative">
    {icon && (
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
        {icon}
      </div>
    )}
    <div className={icon ? 'pl-11' : ''}>{children}</div>
    {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">{suffix}</div>}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const SuggestionRow: React.FC<{ memberId: string; name: string; onClick: () => void }> = ({
  memberId,
  name,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-emerald-50 transition-colors border-b last:border-b-0 border-slate-100"
  >
    <UserCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-800 truncate">{memberId}</p>
      {name && <p className="text-xs text-slate-500 truncate">{name}</p>}
    </div>
  </button>
);

// ─── Main component ──────────────────────────────────────────────

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    memberId: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'member'>('email');
  const [showPassword, setShowPassword] = useState(false);

  const [memberIdSuggestions, setMemberIdSuggestions] = useState<Array<{ memberId: string; name: string }>>([]);
  const [showMemberSuggestions, setShowMemberSuggestions] = useState(false);
  const [isSearchingMember, setIsSearchingMember] = useState(false);

  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus first input on mount & method switch
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [loginMethod]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'super_admin':
          navigate('/super-admin', { replace: true });
          break;
        case 'admin':
          navigate('/admin-dashboard', { replace: true });
          break;
        case 'cashier':
          navigate('/cashier-dashboard', { replace: true });
          break;
        case 'collector':
          navigate('/collector/dashboard', { replace: true });
          break;
        case 'manager':
        case 'accountant':
        case 'member':
          navigate('/member-dashboard', { replace: true });
          break;
        default:
          navigate('/welcome', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'memberId') {
      if (value.length >= 2) {
        searchMemberIds(value);
      } else {
        setMemberIdSuggestions([]);
        setShowMemberSuggestions(false);
      }
    }
  };

  const searchMemberIds = async (searchText: string) => {
    setIsSearchingMember(true);
    try {
      const memberSnap = await getDoc(collections.member(searchText));
      if (memberSnap.exists()) {
        const data = memberSnap.data();
        setMemberIdSuggestions([{
          memberId: data.memberId || memberSnap.id,
          name: data.fullName || data.name || '',
        }]);
        setShowMemberSuggestions(true);
      } else {
        setMemberIdSuggestions([]);
        setShowMemberSuggestions(false);
      }
    } catch {
      console.error('Error searching members');
    } finally {
      setIsSearchingMember(false);
    }
  };

  const selectMemberId = (memberId: string) => {
    setFormData(prev => ({ ...prev, memberId }));
    setShowMemberSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      setError('অনেকবার ভুল চেষ্টা করেছেন। ৫ মিনিট পর আবার চেষ্টা করুন।');
      return;
    }

    if (loginMethod === 'email') {
      if (!formData.email || !formData.password) {
        setError('ইমেইল এবং পাসওয়ার্ড দিত হবে');
        return;
      }
    } else {
      if (!formData.memberId || !formData.password) {
        setError('মেম্বার আইডি এবং পাসওয়ার্ড দিত হবে');
        return;
      }
    }

    setError('');
    setLoading(true);

    try {
      let loginEmail = formData.email;

      if (loginMethod === 'member') {
        const memberSnap = await getDoc(collections.member(formData.memberId));

        if (!memberSnap.exists()) {
          throw new Error('মেম্বার আইডি সঠিক নয়');
        }

        const member = memberSnap.data();
        if (!member.email) {
          throw new Error('এই মেম্বারের ইমেইল নেই। অনুগ্রহ করে ইমেল লগইন ব্যবহার করুন।');
        }

        loginEmail = member.email;
      }

      await signIn(loginEmail, formData.password);
      setLoginAttempts(0);

    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorObj = err as { message?: string; code?: string };

      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 3) {
        setIsLocked(true);
        setTimeout(() => {
          setIsLocked(false);
          setLoginAttempts(0);
        }, 5 * 60 * 1000);
      }

      const msg = errorObj.message ?? '';
      if (msg.includes('user-not-found') || msg.includes('wrong-password')) {
        setError('ইমেইল/মেম্বার আইডি বা পাসওয়ার্ড ভুল হয়েছে।');
      } else if (msg.includes('invalid-email')) {
        setError('সঠিক ইমেইল ঠিকানা দিন।');
      } else if (msg.includes('too-many-requests')) {
        setError('অনেকবার ভুল চেষ্টা। ৫ মিনিট পর আবার চেষ্টা করুন।');
        setIsLocked(true);
        setTimeout(() => setIsLocked(false), 5 * 60 * 1000);
      } else {
        setError(errorObj.message ?? 'লগইন করতে সমস্যা।');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ═══ LEFT PANEL — branding / illustration ═══ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[hsl(160,84%,14%)] via-[hsl(160,84%,22%)] to-[hsl(200,60%,20%)]">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-16 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 left-1/4 w-64 h-64 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo area */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <ShieldCheck className="w-7 h-7 text-emerald-200" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Al-Amin Somity</h1>
                <p className="text-xs text-emerald-200/70 font-medium tracking-widest uppercase">Islamic Microfinance</p>
              </div>
            </div>
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
              আস্থার সাথে<br />
              <span className="text-emerald-300">আর্থিক সহযোগিতা</span>
            </h2>
            <p className="text-emerald-100/70 text-base leading-relaxed max-w-sm">
              শরিয়ত-সম্মত সুদমুক্ত আর্থিক সেবা — সমুদায় সদস্যের কল্যাণে ও সমৃদ্ধিতে নিয়োজিত।
            </p>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '১,০০০+', label: 'সদস্য' },
              { value: '৳৫০ ল', label: 'মোট জমা' },
              { value: '১২ বছর', label: 'অভিজ্ঞতা' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/8 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-emerald-200/60 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — login form ═══ */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-[hsl(160,84%,19%)] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Al-Amin Somity</h1>
              <p className="text-[11px] text-slate-400 font-medium tracking-widest uppercase">Islamic Microfinance</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">স্বাগতম</h2>
            <p className="text-slate-500 mt-1 text-sm">আপনার অ্যাকাউন্টে প্রবেশ করতে লগইন করুন</p>
          </div>

          {/* Method toggle */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            <ToggleChip
              active={loginMethod === 'email'}
              onClick={() => setLoginMethod('email')}
              icon={<Mail className="w-4 h-4" />}
              label="ইমেইল লগইন"
            />
            <ToggleChip
              active={loginMethod === 'member'}
              onClick={() => setLoginMethod('member')}
              icon={<UserCircle className="w-4 h-4" />}
              label="মেম্বার লগইন"
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {loginMethod === 'member' ? (
              <InputField
                icon={<UserCircle className="w-4 h-4" />}
                error={error && !formData.memberId ? 'মেম্বার আইডি প্রয়োজন' : undefined}
              >
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    name="memberId"
                    value={formData.memberId}
                    onChange={handleChange}
                    onFocus={() => formData.memberId.length >= 2 && setShowMemberSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowMemberSuggestions(false), 200)}
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(160,84%,19%)]/30 focus:border-[hsl(160,84%,19%)] disabled:opacity-50 transition-all"
                    placeholder="মেম্বার আইডি লিখুন…"
                    disabled={isLocked}
                    autoComplete="off"
                  />
                  {isSearchingMember && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 animate-spin" />
                  )}
                  {/* Suggestions dropdown */}
                  {showMemberSuggestions && memberIdSuggestions.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-lg border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
                      {memberIdSuggestions.map((s, i) => (
                        <SuggestionRow
                          key={i}
                          memberId={s.memberId}
                          name={s.name}
                          onClick={() => selectMemberId(s.memberId)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </InputField>
            ) : (
              <InputField icon={<Mail className="w-4 h-4" />} error={error && !formData.email ? 'ইমেইল প্রয়োজন' : undefined}>
                <input
                  ref={inputRef}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(160,84%,19%)]/30 focus:border-[hsl(160,84%,19%)] disabled:opacity-50 transition-all"
                  placeholder="your@email.com"
                  disabled={isLocked}
                />
              </InputField>
            )}

            {/* Password */}
            <InputField
              icon={<ShieldCheck className="w-4 h-4" />}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={error && !formData.password ? 'পাসওয়ার্ড প্রয়োজন' : undefined}
            >
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(160,84%,19%)]/30 focus:border-[hsl(160,84%,19%)] disabled:opacity-50 transition-all"
                placeholder="••••••••"
                disabled={isLocked}
                required
              />
            </InputField>

            {/* Global error */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || isLocked}
              className={[
                'w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-200',
                'bg-[hsl(160,84%,19%)] text-white',
                'hover:bg-[hsl(160,84%,16%)] hover:shadow-lg hover:shadow-green-900/20',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
              ].join(' ')}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  লগইন হচ্ছে…
                </>
              ) : isLocked ? (
                'অপেক্ষা করুন… (' + Math.ceil((5 * 60 * 1000 - (Date.now() % (5 * 60 * 1000))) / 60000) + ' মিনিট)'
              ) : (
                'প্রবেশ করুন'
              )}
            </button>

            {/* Forgot password */}
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-slate-400 hover:text-[hsl(160,84%,19%)] transition-colors underline-offset-4 hover:underline"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>
            </div>
          </form>

          {/* Footer note */}
          <div className="mt-8 rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">লগইন পদ্ধতি</p>
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="w-3 h-3 text-emerald-700" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <span className="font-medium text-slate-700">ইমেইল লগইন</span> — আপনার রেজিস্টার্ড ইমেইল ও পাসওয়ার্ড দিয়ে প্রবেশ করুন
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <UserCircle className="w-3 h-3 text-blue-600" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <span className="font-medium text-slate-700">মেম্বার লগইন</span> — মেম্বার আইডি ও পাসওয়ার্ড দিয়ে প্রবেশ করুন (আইডি সাজেশন স্বয়ংক্রিয়)
              </p>
            </div>
            <p className="text-[11px] text-amber-600/80 flex items-center gap-1.5 pt-1">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
              </svg>
              ৩ বার ভুল চেষ্টায় ৫ মিনিট লক হবে
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
