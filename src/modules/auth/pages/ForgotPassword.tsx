import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../services/firebase/firebase";
import { Link } from "react-router-dom";
import { Mail, ShieldCheck, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

type ResetState = "idle" | "loading" | "sent" | "error";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<ResetState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("ইমেইল ঠিকানা দিন");
      return;
    }
    setState("loading");
    setErrorMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setState("sent");
    } catch (err: unknown) {
      console.error("ForgotPassword error:", err);
      const errorObj = err as { code?: string; message?: string };
      let msg = "পাসওয়াৰ্ড রিসেট কর্তে সমস্যা। আবার চেষ্টা করুন।";
      if (errorObj.code === "auth/user-not-found") msg = "এই ইমেলের কোনো অ্যাকাউন্ট নেই।";
      else if (errorObj.code === "auth/invalid-email") msg = "সঠিক ইমেল ঠিকানা দিন।";
      else if (errorObj.code === "auth/too-many-requests") msg = "অনেকবার চেষ্টা করেছেন। কিছুক্ষণ পর আবার চেষ্টা করুন।";
      setErrorMessage(msg);
      setState("error");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ═══ LEFT PANEL — branding ═══ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[hsl(160,84%,14%)] via-[hsl(160,84%,22%)] to-[hsl(200,60%,20%)]">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-16 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 left-1/4 w-64 h-64 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
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
              নিরাপদ<br /><span className="text-emerald-300">আর্থিক সহযোগিতা</span>
            </h2>
            <p className="text-emerald-100/70 text-base leading-relaxed max-w-sm">
              শরিয়াহ-সম্মত সুদমুক্ত আর্থিক সেবায় — সদিগ্র সদস্যদের কল্যাণ ও সমৃদ্ধিতে নিয়োজিত।
            </p>
          </div>

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

      {/* ═══ RIGHT PANEL — reset form ═══ */}
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
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[hsl(160,84%,19%)] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              লগইনে ফিরে যান
            </Link>
            {state === "sent" ? (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">ইমেইল পাঠানো হয়েছে</h2>
                <p className="text-slate-500 mt-1 text-sm">নিচে যাচাই করে নিন</p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">পাসওয়ার্ড ভুলে গেছেন?</h2>
                <p className="text-slate-500 mt-1 text-sm">রেজিস্টার্ড ইমেইল দিলে রিসেট লিংক পাঠানো হবে</p>
              </div>
            )}
          </div>

          {state === "sent" ? (
            /* ── Success State ── */
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[hsl(160,84%,19%)]/10 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-[hsl(160,84%,19%)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">রিসেট লিংক পাঠানো হয়েছে</p>
                <p className="text-xs text-slate-500 mt-1">
                  {email} — এই ঠিকানায় পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। ইনবক্স চেক করুন।
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 w-full justify-center py-3 rounded-lg text-sm font-semibold bg-[hsl(160,84%,19%)] text-white hover:bg-[hsl(160,84%,16%)] transition-colors shadow-md shadow-green-900/20"
              >
                <ArrowLeft className="w-4 h-4" />
                লগইন পেজে ফিরে যান
              </Link>
            </div>
          ) : (
            /* ── Form State ── */
            <form onSubmit={handleReset} className="space-y-4">
              {/* Email input */}
              <div className="relative">
                <label htmlFor="reset-email" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                  ইমেইল
                  <span className="text-red-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={state === "loading"}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(160,84%,19%)]/30 focus:border-[hsl(160,84%,19%)] disabled:opacity-50 transition-all"
                  />
                </div>
              </div>

              {/* Error */}
              {state === "error" && errorMessage && (
                <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errorMessage}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={state === "loading"}
                className={[
                  'w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-200',
                  'bg-[hsl(160,84%,19%)] text-white',
                  'hover:bg-[hsl(160,84%,16%)] hover:shadow-lg hover:shadow-green-900/20',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
                ].join(' ')}
              >
                {state === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    পাঠানো হচ্ছে…
                  </>
                ) : (
                  "রিসেট লিংক পাঠান"
                )}
              </button>

              {/* Back link */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-400 hover:text-[hsl(160,84%,19%)] transition-colors underline-offset-4 hover:underline"
                >
                  ← লগইন পেজে ফিরে যান
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
