// src/modules/Investments/components/InvestmentForm/InvestmentCoreSection.tsx

import React from 'react';
import { Calendar, DollarSign, FileText, Tag, Building2, Target, TrendingUp, Percent, DollarSign as DollarIcon } from 'lucide-react';
import { CATEGORIES, PROFIT_FREQUENCIES } from '../../constants/investmentConstants';

interface InvestmentCoreSectionProps {
  form: any;
  updateForm: (key: string, value: any) => void;
  errors: Record<string, string>;
}

const InvestmentCoreSection: React.FC<InvestmentCoreSectionProps> = ({ form, updateForm, errors }) => {
  const profitType = form.profitType || 'percentage';
  
  // Auto-calculate maturity date
  const handleDurationChange = (months: number) => {
    updateForm('durationMonths', months);
    if (form.startDate && months > 0) {
      const start = new Date(form.startDate);
      start.setMonth(start.getMonth() + months);
      updateForm('maturityDate', start.toISOString().split('T')[0]);
    }
  };

  const handleStartDateChange = (date: string) => {
    updateForm('startDate', date);
    if (date && form.durationMonths > 0) {
      const start = new Date(date);
      start.setMonth(start.getMonth() + parseInt(form.durationMonths));
      updateForm('maturityDate', start.toISOString().split('T')[0]);
    }
  };

  // Calculate preview values
  const totalAmount = form.totalAmount || 0;
  const profitRate = form.profitRate || 0;
  const durationMonths = form.durationMonths || 12;
  
  const expectedProfit = profitType === 'percentage'
    ? (totalAmount * profitRate * durationMonths) / (12 * 100)
    : profitType === 'fixed_amount'
    ? profitRate
    : 0;
    
  const totalReturn = totalAmount + expectedProfit;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5 bg-gradient-to-r from-emerald-600 to-green-500">
          ১
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-700">মূল বিনিয়োগের তথ্য</h2>
          <p className="text-xs text-slate-400">বিনিয়োগের মূল কাঠামো ও প্রত্যাশিত লাভ নির্ধারণ করুন</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Investment Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">
            বিনিয়োগের নাম / শিরোনাম <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.investmentName || ''}
            onChange={(e) => updateForm('investmentName', e.target.value)}
            placeholder="যেমন: ডাকা ব্যাংক এফডিআর — জানুয়ারি ২০২৬"
            className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.investmentName ? 'border-red-400 bg-red-50' : 'border-slate-200'} text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100`}
          />
          {errors.investmentName && <p className="text-xs text-red-500 mt-1">{errors.investmentName}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">
            <Building2 className="inline w-4 h-4 mr-1" /> বিনিয়োগের ধরন <span className="text-red-500">*</span>
          </label>
          <select
            value={form.category || 'fixed_deposit'}
            onChange={(e) => updateForm('category', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Investment Place */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">
            <Building2 className="inline w-4 h-4 mr-1" /> বিনিয়োগের স্থান / প্রতিষ্ঠান <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.investmentPlace || ''}
            onChange={(e) => updateForm('investmentPlace', e.target.value)}
            placeholder={form.category === 'fixed_deposit' ? 'ব্যাংকের নাম' : form.category === 'business' ? 'কোম্পানির নাম' : 'প্রজেক্টের অবস্থান'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
          />
          <p className="text-xs text-slate-400 mt-1">
            {form.category === 'fixed_deposit' ? 'যেমন: ডাকা ব্যাংক' : 
             form.category === 'business' ? 'যেমন: ABC ট্রেডিং লিমিটেড' : 
             'যেমন: গাজীপুর প্রজেক্ট সাইট'}
          </p>
        </div>

        {/* Purpose */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">
            <Target className="inline w-4 h-4 mr-1" /> বিনিয়োগের উদ্দেশ্য / লক্ষ্য
          </label>
          <input
            type="text"
            value={form.purpose || 'Growth'}
            onChange={(e) => updateForm('purpose', e.target.value)}
            placeholder="যেমন: সমিতির তহবিল বৃদ্ধি করা, ভবিষ্যৎ পরিকল্পনা বাস্তবায়ন"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
          />
        </div>

        {/* Total Amount */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">
            <DollarSign className="inline w-4 h-4 mr-1" /> মোট বিনিয়োগের পরিমাণ <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={form.totalAmount || ''}
            onChange={(e) => updateForm('totalAmount', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.totalAmount ? 'border-red-400 bg-red-50' : 'border-slate-200'} text-sm outline-none focus:border-emerald-400`}
          />
          {errors.totalAmount && <p className="text-xs text-red-500 mt-1">{errors.totalAmount}</p>}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">
            <Calendar className="inline w-4 h-4 mr-1" /> মেয়াদ (মাস)
          </label>
          <input
            type="number"
            min="1"
            value={form.durationMonths || ''}
            onChange={(e) => handleDurationChange(parseInt(e.target.value) || 0)}
            placeholder="যেমন: 12"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">
            <Calendar className="inline w-4 h-4 mr-1" /> শুরুর তারিখ <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.startDate || ''}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.startDate ? 'border-red-400 bg-red-50' : 'border-slate-200'} text-sm outline-none focus:border-emerald-400`}
          />
          {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
        </div>

        {/* Maturity Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">
            <Calendar className="inline w-4 h-4 mr-1" /> মেয়াদ শেষের তারিখ
          </label>
          <input
            type="date"
            value={form.maturityDate || ''}
            onChange={(e) => updateForm('maturityDate', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 bg-slate-50"
            readOnly={!!form.startDate && !!form.durationMonths}
          />
          {form.maturityDate && (
            <p className="text-xs text-emerald-600 mt-1">
              ✓ স্বয়ংক্রিয়ভাবে গণনা করা হয়েছে
            </p>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">
            <FileText className="inline w-4 h-4 mr-1" /> বিস্তারিত বিবরণ
          </label>
          <textarea
            rows={3}
            value={form.description || ''}
            onChange={(e) => updateForm('description', e.target.value)}
            placeholder="বিনিয়োগের বিস্তারিত বিবরণ, পটভূমি বা গুরুত্বপূর্ণ তথ্য লিখুন..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* ─── PROFIT STRUCTURE SECTION ─── */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-700">লাভের কাঠামো</h3>
          <span className="text-xs text-slate-400">লাভের ধরন, হার ও পরিশোধের সময়সূচি নির্ধারণ করুন</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Profit Type - Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              লাভের ধরন <span className="text-red-500">*</span>
            </label>
            <select
              value={profitType}
              onChange={(e) => updateForm('profitType', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white cursor-pointer"
            >
              <option value="percentage">শতাংশ (%) - বার্ষিক হার ভিত্তিক</option>
              <option value="fixed_amount">নির্দিষ্ট পরিমাণ (৳) - নির্ধারিত টাকার পরিমাণ</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              {profitType === 'percentage' 
                ? 'ব্যাংক FDR বা বার্ষিক শতাংশ ভিত্তিক লাভের জন্য নির্বাচন করুন' 
                : 'নির্দিষ্ট পরিমাণের লাভ (যেমন: প্রজেক্ট ভিত্তিক) জন্য নির্বাচন করুন'}
            </p>
          </div>

          {/* Profit Rate */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              {profitType === 'percentage' ? 'বার্ষিক লাভের হার (%)' : 'মোট লাভের পরিমাণ (৳)'}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step={profitType === 'percentage' ? '0.1' : '1000'}
              value={form.profitRate || ''}
              onChange={(e) => updateForm('profitRate', parseFloat(e.target.value) || 0)}
              placeholder={profitType === 'percentage' ? 'যেমন: 8.5' : 'যেমন: 50000'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
            />
          </div>

          {/* Payment Frequency - Dropdown */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              লাভ পরিশোধের সময়সূচি <span className="text-red-500">*</span>
            </label>
            <select
              value={form.profitPaymentFrequency || 'on_maturity'}
              onChange={(e) => updateForm('profitPaymentFrequency', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white cursor-pointer"
            >
              <option value="monthly">মাসিক - প্রতি মাসে লাভ প্রদান</option>
              <option value="quarterly">ত্রৈমাসিক - প্রতি ৩ মাস অন্তর লাভ প্রদান</option>
              <option value="half_yearly">অর্ধ-বার্ষিক - প্রতি ৬ মাস অন্তর লাভ প্রদান</option>
              <option value="yearly">বার্ষিক - বছরে একবার লাভ প্রদান</option>
              <option value="on_maturity">মেয়াদান্তে - মেয়াদ শেষে সমস্ত লাভ একসাথে</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              লাভ কখন পাবেন তা নির্ধারণ করুন — মাসিক, ত্রৈমাসিক, অর্ধ-বার্ষিক, বার্ষিক অথবা মেয়াদান্তে
            </p>
          </div>
        </div>

        {/* Live Preview */}
        {totalAmount > 0 && profitRate > 0 && (
          <div className="mt-4 rounded-xl p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">📊 লাইভ ক্যালকুলেশন</p>
            <div className="flex justify-between items-center py-1.5 border-b border-emerald-100">
              <span className="text-xs text-slate-600">মোট মূলধন</span>
              <span className="text-sm font-semibold text-slate-800">৳ {totalAmount.toLocaleString('en-BD')}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-emerald-100">
              <span className="text-xs text-slate-600">
                {profitType === 'percentage' ? `প্রত্যাশিত লাভ (বার্ষিক ${profitRate}%)` : 'প্রত্যাশিত লাভ (নির্দিষ্ট)'}
              </span>
              <span className="text-sm font-semibold text-emerald-700">৳ {Math.round(expectedProfit).toLocaleString('en-BD')}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-slate-600">মোট প্রত্যাশিত রিটার্ন</span>
              <span className="text-sm font-bold text-green-700">৳ {Math.round(totalReturn).toLocaleString('en-BD')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentCoreSection;