// src/modules/Investments/components/InvestmentForm/ManagementSection.tsx

import React from 'react';
import { Shield, Users, AlertCircle, FileText, Eye, ClipboardList, UserCheck } from 'lucide-react';
import { RISK_LEVELS } from '../../constants/investmentConstants';

interface ManagementSectionProps {
  form: any;
  updateForm: (key: string, value: any) => void;
  errors: Record<string, string>;
}

const ManagementSection: React.FC<ManagementSectionProps> = ({ form, updateForm, errors }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      {/* Section Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5 bg-gradient-to-r from-emerald-600 to-green-500">
          ৬
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-700">পরিচালনা ও ঝুঁকি মূল্যায়ন</h2>
          <p className="text-xs text-slate-400">
            বিনিয়োগ পরিচালনার ধরন ও ঝুঁকির মাত্রা নির্ধারণ করুন
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Management Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">
            <Users className="inline w-4 h-4 mr-1" /> পরিচালনার ধরন
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateForm('managementType', 'somity_direct')}
              className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                form.managementType === 'somity_direct'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-300'
              }`}
            >
              <Shield className="w-4 h-4" /> সমিতি সরাসরি
            </button>
            <button
              type="button"
              onClick={() => updateForm('managementType', 'member_committee')}
              className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                form.managementType === 'member_committee'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-300'
              }`}
            >
              <Users className="w-4 h-4" /> সদস্য কমিটি
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {form.managementType === 'somity_direct' 
              ? 'সমিতি সরাসরি বিনিয়োগটি পরিচালনা করবে এবং সিদ্ধান্ত নিবে' 
              : 'একটি কমিটি গঠন করে বিনিয়োগ পরিচালনা করা হবে'}
          </p>
        </div>

        {/* Risk Level */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">
            <AlertCircle className="inline w-4 h-4 mr-1" /> ঝুঁকির মাত্রা
          </label>
          <select
            value={form.riskLevel || 'medium'}
            onChange={(e) => updateForm('riskLevel', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 bg-white cursor-pointer"
          >
            {RISK_LEVELS.map((risk) => (
              <option key={risk.value} value={risk.value}>
                {risk.label}
              </option>
            ))}
          </select>
          <div className="mt-2">
            {form.riskLevel === 'very_low' && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Shield className="w-3 h-3" /> অত্যন্ত নিরাপদ — ব্যাংক FDR বা সরকারি বন্ডের মতো
              </p>
            )}
            {form.riskLevel === 'low' && (
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <Shield className="w-3 h-3" /> নিরাপদ — স্বল্প ঝুঁকিপূর্ণ বিনিয়োগ
              </p>
            )}
            {form.riskLevel === 'medium' && (
              <p className="text-xs text-yellow-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> মাঝারি ঝুঁকি — স্বাভাবিক ব্যবসায়িক বিনিয়োগ
              </p>
            )}
            {form.riskLevel === 'high' && (
              <p className="text-xs text-orange-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> উচ্চ ঝুঁকি — লাভের সম্ভাবনা বেশি কিন্তু অনিশ্চিত
              </p>
            )}
            {form.riskLevel === 'very_high' && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> অত্যন্ত উচ্চ ঝুঁকি — সতর্কতা প্রয়োজন
              </p>
            )}
          </div>
        </div>

        {/* Committee Details (only when member_committee is selected) */}
        {form.managementType === 'member_committee' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                <UserCheck className="inline w-4 h-4 mr-1" /> কমিটি প্রধানের নাম
              </label>
              <input
                type="text"
                value={form.committeeHead || ''}
                onChange={(e) => updateForm('committeeHead', e.target.value)}
                placeholder="যেমন: মোঃ আব্দুর রহমান"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                <Users className="inline w-4 h-4 mr-1" /> কমিটির সদস্যবৃন্দ
              </label>
              <input
                type="text"
                value={form.committeeMembers || ''}
                onChange={(e) => updateForm('committeeMembers', e.target.value)}
                placeholder="নাম লিখুন (কমা দিয়ে আলাদা করুন)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
              />
              <p className="text-xs text-slate-400 mt-1">
                যেমন: মোঃ করিম, মোঃ রহিম, মোঃ জসিম
              </p>
            </div>
          </>
        )}
      </div>

      {/* Risk Assessment Note */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <label className="block text-sm font-semibold text-slate-600 mb-1.5">
          <ClipboardList className="inline w-4 h-4 mr-1" /> ঝুঁকি মূল্যায়ন নোট (ঐচ্ছিক)
        </label>
        <textarea
          rows={2}
          value={form.riskAssessmentNotes || ''}
          onChange={(e) => updateForm('riskAssessmentNotes', e.target.value)}
          placeholder="কেন এই ঝুঁকির মাত্রা নির্ধারণ করলেন? বিস্তারিত লিখুন..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
        />
        <p className="text-xs text-slate-400 mt-1">
          উদাহরণ: ব্যাংকে FDR হওয়ায় ঝুঁকি খুবই কম, অথবা ব্যবসায়িক বিনিয়োগ হওয়ায় মাঝারি ঝুঁকি
        </p>
      </div>

      {/* Special Remarks */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <label className="block text-sm font-semibold text-slate-600 mb-1.5">
          <FileText className="inline w-4 h-4 mr-1" /> বিশেষ মন্তব্য / নির্দেশনা
        </label>
        <textarea
          rows={3}
          value={form.remarks || ''}
          onChange={(e) => updateForm('remarks', e.target.value)}
          placeholder="অনুমোদনকারীর জন্য বিশেষ কোনো তথ্য বা মন্তব্য..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
        />
      </div>
    </div>
  );
};

export default ManagementSection;