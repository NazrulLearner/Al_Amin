// src/modules/users/pages/CreateMemberAccount.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../../services/firebase/firebase';
import { memberService } from '../../members/services/memberService';
import { ShieldCheck, Mail, Lock, ArrowLeft, CheckCircle2, Loader2, UserCircle, AlertCircle } from 'lucide-react';

interface Member {
  id: string;
  memberId: string;
  fullName: string;
  phone: string;
  email?: string;
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  let pw = '';
  for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

type CreateState = 'idle' | 'loading' | 'sent' | 'error';

export default function CreateMemberAccount() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [state, setState] = useState<CreateState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadMembersWithoutLogin();
  }, []);

  // Root cause fix: getAllMembers() maps docs with `id: memberSnap.id`,
  // preserving the real document ID. getAllMembersRaw() drops ids via
  // `docs.map(d => d.data())` — every item would get id=undefined.
  const loadMembersWithoutLogin = async () => {
    try {
      setLoadError(null);
      const allMembers = await memberService.getAllMembers();
      const eligible = allMembers
        .filter((m: any) => !m.uid)
        .map((m: any) => ({
          id: m.id,
          memberId: m.memberId,
          fullName: m.fullName,
          phone: m.phone,
          email: m.email,
        }));
      setMembers(eligible);
    } catch (err: unknown) {
      console.error('Error loading members:', err);
      setLoadError('সদস্য লোড করত্ে সমস্যা হচ্ছে। পাতা রিফ্রেশ করুন।');
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.phone && m.phone.includes(searchTerm))
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const email = loginEmail.trim() || selectedMember.email?.trim() || '';
    if (!email || !email.includes('@')) {
      setErrorMessage('সঠিক ইমেল ঠিকানা দিতে হবে');
      setState('error');
      return;
    }

    setState('loading');
    setErrorMessage('');

    try {
      const now = Timestamp.now();
      const tempPw = generateTempPassword();
      setTempPassword(tempPw);

      // ── CLOUD FUNCTION MIGRATION MARKER ──
      // TODO: CLOUD FUNCTION MIGRATION
      //   Why: This flow creates a Firebase Auth user, writes a users doc,
      //        updates a members doc, and sends a reset email — all client-side
      //        with no server-side authorization enforcement or audit trail.
      //   What it does now: Runs each step sequentially from the browser using
      //        the default auth instance (same as Admin's session).
      //   CF replaces: A callable HTTPS Cloud Function that validates admin
      //        session, creates the auth user + users doc + members update
      //        atomically, logs an admin_action audit entry, and sends the
      //        welcome/reset email server-side.
      //   Remove when: replace body with functions.httpsCallable('createMemberAccount');
      //                delete direct auth/ and firestore/ imports below.

      // Create Firebase Auth user with temporary password
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, tempPw);

      // Write AppUser document
      await setDoc(doc(db, 'users', newUser.uid), {
        uid: newUser.uid,
        email,
        fullName: selectedMember.fullName,
        phone: selectedMember.phone || '',
        role: 'member' as const,
        memberId: selectedMember.memberId,
        status: 'active',
        createdAt: now,
        lastLoginAt: now,
        updatedAt: now,
      });

      // Update member document with uid
      const memberRef = doc(db, 'members', selectedMember.memberId);
      await updateDoc(memberRef, {
        uid: newUser.uid,
        hasLoginAccount: true,
        loginEmail: email,
        'metadata.updatedAt': now,
      });

      // Send password reset link so member sets their own permanent password
      await sendPasswordResetEmail(auth, email);

      setState('sent');
    } catch (err: unknown) {
      console.error('CreateMemberAccount error:', err);
      const errorObj = err as { code?: string; message?: string };
      let msg = 'অ্যাকাউন্ট তৈরি করতে সমস্যা। আবার চেষ্টা করুন।';
      if (errorObj.code === 'auth/email-already-in-use') msg = 'এই ইমেল দিয়ে আগেই অ্যাকাউন্ট আছে।';
      else if (errorObj.code === 'auth/weak-password') msg = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
      else if (errorObj.code === 'auth/invalid-email') msg = 'সঠিক ইমেল ঠিকানা দিন।';
      else if (errorObj.code === 'auth/too-many-requests') msg = 'অনেকবার চেষ্টা করেছেন। কিছুক্ষণ পর আবার চেষ্টা করুন।';
      setErrorMessage(msg);
      setState('error');
    }
  };

  const handleResetSearch = () => {
    setSelectedMember(null);
    setSearchTerm('');
    setLoginEmail('');
    setTempPassword('');
    setState('idle');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Top bar */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/users')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[hsl(160,84%,19%)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          ফিরে যান
        </button>
        <div className="h-5 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[hsl(160,84%,19%)] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Al-Amin Somity</span>
        </div>
      </div>

      {/* Main content — centered single column */}
      <div className="flex-1 flex items-start justify-center py-8 px-4">
        <div className="w-full max-w-lg space-y-5">

          {/* Page header */}
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              নতুন লগইন অ্যাকাউন্ট তৈরি
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              সদস্য নির্বাচন করুন এবং তাদের জন্য লগইন অ্যাকাউন্ট তৈরি করুন
            </p>
          </div>

          {state === 'sent' ? (
            /* ── Success State ── */
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[hsl(160,84%,19%)]/10 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-[hsl(160,84%,19%)]" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-slate-700">
                  {selectedMember?.fullName} —{' '}
                  <span className="text-[hsl(160,84%,19%)]">{selectedMember?.memberId}</span>
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  লগইন অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।{' '}
                  <span className="font-medium">{loginEmail}</span> ঠিকানায় পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।
                  সদস্যকে তাদের ইনবক্স চেক করতে বলুন।
                </p>
              </div>
              <button
                onClick={handleResetSearch}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold bg-[hsl(160,84%,19%)] text-white hover:bg-[hsl(160,84%,16%)] transition-colors shadow-md shadow-green-900/20"
              >
                <UserCircle className="w-4 h-4" />
                নতুন অ্যাকাউন্ট তৈরি করুন
              </button>
            </div>
          ) : (
            /* ── Form State ── */
            <form onSubmit={handleCreate} className="space-y-4">

              {/* Member search & selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  সদস্য নির্বাচন করুন
                  <span className="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="মেম্বার আইডি, নাম বা ফোন নম্বর লিখুন…"
                  disabled={state === 'loading'}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(160,84%,19%)]/30 focus:border-[hsl(160,84%,19%)] transition-all disabled:opacity-50"
                />
                {filteredMembers.length > 0 ? (
                  <div className="mt-1 bg-white rounded-lg border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden max-h-48 overflow-y-auto">
                    {filteredMembers.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedMember(m);
                          setSearchTerm('');
                          setLoginEmail(m.email || '');
                        }}
                        disabled={state === 'loading'}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-emerald-50 transition-colors border-b last:border-b-0 ${
                          selectedMember?.id === m.id ? 'bg-emerald-50' : ''
                        }`}
                      >
                        <UserCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{m.memberId}</p>
                          <p className="text-xs text-slate-500 truncate">{m.fullName}{m.phone ? ` · ${m.phone}` : ''}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchTerm ? (
                  <p className="mt-2 text-xs text-slate-400">
                    "{searchTerm}" — কোনো সদস্য পাওয়া যায়নি
                  </p>
                ) : loadError ? (
                  <div className="mt-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600">
                    {loadError}
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    সদস্য লোড হচ্ছে…
                  </div>
                )}
              </div>

              {/* Selected member info */}
              {selectedMember && (
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[hsl(160,84%,19%)]" />
                    <span className="text-sm font-semibold text-slate-700">নির্বাচিত সদস্য</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pl-6">
                    <p className="text-slate-600"><span className="font-medium text-slate-700">আইডি:</span> {selectedMember.memberId}</p>
                    <p className="text-slate-600"><span className="font-medium text-slate-700">নাম:</span> {selectedMember.fullName}</p>
                    <p className="text-slate-600 col-span-2"><span className="font-medium text-slate-700">ফোন:</span> {selectedMember.phone || '—'}</p>
                  </div>
                </div>
              )}

              {/* Login Email */}
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  লগইন ইমেল
                  <span className="text-red-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={selectedMember?.email || 'your@email.com'}
                    disabled={state === 'loading'}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(160,84%,19%)]/30 focus:border-[hsl(160,84%,19%)] disabled:opacity-50 transition-all"
                  />
                </div>
              </div>

              {/* Temporary password display */}
              {tempPassword && state !== 'loading' && (
                <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">অস্থায়ী পাসওয়ার্ড</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <code className="text-sm font-mono text-amber-800 break-all flex-1">{tempPassword}</code>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(tempPassword)}
                      className="text-xs text-amber-600 hover:text-amber-800 shrink-0"
                    >
                      কপি
                    </button>
                  </div>
                  <p className="text-xs text-amber-600/80">
                    এই অস্থায়ী পাসওয়ার্ড ব্যবহার করে লগইন করার পর সদস্যকে অবশ্যই পাসওয়ার্ড পরিবর্তন করতে হবে। রিসেট লিংক ইমেলে পাঠানো হয়েছে।
                  </p>
                </div>
              )}

              {/* Error */}
              {state === 'error' && errorMessage && (
                <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errorMessage}
                </div>
              )}

              {/* Info note */}
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">কী হবে?</p>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>সদস্যের মেম্বার প্রোফাইলের সাথে এই লগইন অ্যাকাউন্ট যুক্ত হবে</li>
                  <li>একটি অস্থায়ী পাসওয়ার্ড তৈরি করা হবে</li>
                  <li>ইমেটে পাসওয়ার্ড রিসেট লিংক পাঠানো হবে</li>
                  <li>সদস্য নিজেই স্থায়ী পাসওয়ার্ড সেট করবেন</li>
                </ul>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={state === 'loading' || !selectedMember}
                className={[
                  'w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-200',
                  'bg-[hsl(160,84%,19%)] text-white',
                  'hover:bg-[hsl(160,84%,16%)] hover:shadow-lg hover:shadow-green-900/20',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
                ].join(' ')}
              >
                {state === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    তৈরি হচ্ছে…
                  </>
                ) : (
                  'অ্যাকাউন্ট তৈরি করুন'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/users')}
                  className="text-xs font-medium text-slate-400 hover:text-[hsl(160,84%,19%)] transition-colors underline-offset-4 hover:underline"
                >
                  ← ব্যবহারকারী তালিকায় ফিরে যান
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
