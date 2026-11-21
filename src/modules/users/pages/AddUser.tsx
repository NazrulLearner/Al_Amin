// src/modules/users/pages/AddUser.tsx
//
// FUTURE-PHASE PLACEHOLDER — Account creation has been consolidated into
// CreateMemberAccount.tsx (linking login accounts to existing Member Profiles).
// This page is intentionally non-functional until a future phase introduces
// direct admin/staff account creation with privileged role assignment.
//
// When ready to re-enable this flow:
//   1. Implement server-side account provisioning (Cloud Function or equivalent).
//   2. Re-add the form fields for full name, email, phone, role, password.
//   3. Enforce forbidden-role whitelist at service layer before writing docs.
//   4. Replace this placeholder markup with the active form.
//
// TODO: CLIENT-SIDE IMPLEMENTATION — REMOVE AFTER CLOUD FUNCTION OR FUTURE-PHASE FORM IS DEPLOYED.

import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Clock } from 'lucide-react';

export default function AddUser() {
  const navigate = useNavigate();

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
      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md space-y-5">

          {/* Page header */}
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              অ্যাডমিন/স্টাফ অ্যাকাউন্ট
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              এই কাজটি শীঘ্রই যুক্ত হবে
            </p>
          </div>

          {/* Placeholder content */}
          <div className="rounded-xl border border-slate-100 bg-white p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">শীঘ্রই আসছে</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                অ্যাডমিন ও স্টাফ অ্যাকাউন্ট তৈরির ব্যবস্থা ভবিষ্যৎ ফেজে যুক্ত হবে।
                এখন শুধুমাত্র সদস্য প্রোফাইলের সাথে যুক্ত লগইন অ্যাকাউন্ট তৈরি করা যায়।
              </p>
            </div>
            <button
              onClick={() => navigate('/users/create-member-account')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-[hsl(160,84%,19%)] text-white hover:bg-[hsl(160,84%,16%)] transition-colors shadow-md shadow-green-900/20"
            >
              সদস্য অ্যাকাউন্ট তৈরি করুন
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="text-xs font-medium text-slate-400 hover:text-[hsl(160,84%,19%)] transition-colors underline-offset-4 hover:underline"
            >
              ← ব্যবহারকারী তালিকায় ফিরে যান
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
