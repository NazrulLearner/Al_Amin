// src/modules/Investments/components/InvestmentForm/ProfitDistributionSection.tsx

import React, { useState } from 'react';
import { PieChart, Building2, Users, TrendingUp, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrencyAmount } from '../../utils/investmentHelpers';
import type { CoInvestor } from '../../types/investment.types';

interface ProfitDistributionSectionProps {
  somityProfitShare: number;
  updateForm: (key: string, value: any) => void;
  totalProfit: number;
  coInvestors: CoInvestor[];
  somityContribution: number;
  totalCoContribution: number;
}

const ProfitDistributionSection: React.FC<ProfitDistributionSectionProps> = ({
  somityProfitShare,
  updateForm,
  totalProfit,
  coInvestors,
  somityContribution,
  totalCoContribution,
}) => {
  const [localSomityShare, setLocalSomityShare] = useState(somityProfitShare);
  
  const coInvestorsTotalShare = 100 - localSomityShare;
  const somityProfitAmount = (totalProfit * localSomityShare) / 100;
  const coInvestorsProfitAmount = totalProfit - somityProfitAmount;
  
  const getCoInvestorProfitShare = (investorContribution: number) => {
    if (totalCoContribution === 0) return 0;
    const investorPercentage = (investorContribution / totalCoContribution) * 100;
    return (coInvestorsProfitAmount * investorPercentage) / 100;
  };

  const handleSliderChange = (value: number) => {
    setLocalSomityShare(value);
    updateForm('somityProfitShare', value);
  };

  const presets = [
    { somity: 50, co: 50, label: '৫০% - ৫০%', description: 'সমান ভাগ' },
    { somity: 60, co: 40, label: '৬০% - ৪০%', description: 'সমিতি বেশি' },
    { somity: 70, co: 30, label: '৭০% - ৩০%', description: 'সমিতি অধিক' },
    { somity: 40, co: 60, label: '৪০% - ৬০%', description: 'সহ-বিনিয়োগকারী বেশি' },
    { somity: 30, co: 70, label: '৩০% - ৭০%', description: 'সহ-বিনিয়োগকারী অধিক' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5 bg-gradient-to-r from-emerald-600 to-green-500">
          ৩
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-700">লাভ বণ্টন</h2>
          <p className="text-xs text-slate-400">
            সমিতি ও সহ-বিনিয়োগকারীদের মধ্যে লাভ ভাগ করে নিন — স্লাইডার বা প্রিসেট ব্যবহার করুন
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT SIDE: Distribution Controls */}
        <div>
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-700">
                <strong className="font-semibold">লাভ বণ্টনের নিয়ম:</strong> সমিতি ও সহ-বিনিয়োগকারীরা মিলে 
                মোট লাভের {totalProfit > 0 ? formatCurrencyAmount(totalProfit) : '০'} টাকা ভাগ করে নিবেন। 
                নিচের স্লাইডার ব্যবহার করে সমিতির শতাংশ নির্ধারণ করুন।
              </p>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                <Building2 className="w-4 h-4 text-emerald-600" /> সমিতি
              </span>
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                <Users className="w-4 h-4 text-emerald-600" /> সহ-বিনিয়োগকারী
              </span>
            </div>
            
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{localSomityShare}%</span>
              <span>{coInvestorsTotalShare}%</span>
            </div>
            
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={localSomityShare}
                onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200"
                style={{
                  background: `linear-gradient(to right, #10B981 0%, #10B981 ${localSomityShare}%, #E2E8F0 ${localSomityShare}%, #E2E8F0 100%)`
                }}
              />
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <div className="text-center flex-1">
                <div className="text-2xl font-bold text-emerald-600">{localSomityShare}%</div>
                <p className="text-xs text-slate-500">সমিতির অংশ</p>
              </div>
              <div className="text-center flex-1">
                <div className="text-2xl font-bold text-emerald-600">{coInvestorsTotalShare}%</div>
                <p className="text-xs text-slate-500">সহ-বিনিয়োগকারীর অংশ</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-medium text-slate-500 mb-2">দ্রুত নির্ধারণ (প্রিসেট)</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSliderChange(preset.somity)}
                  className={`py-2 px-1 rounded-lg text-xs font-medium transition-all text-center ${
                    localSomityShare === preset.somity
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <div>{preset.label}</div>
                  <div className="text-[10px] opacity-80">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-600 mb-2">অবদানের সারসংক্ষেপ</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">সমিতির অবদান:</span>
                <span className="font-medium text-slate-700">{formatCurrencyAmount(somityContribution)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">সহ-বিনিয়োগকারীদের অবদান:</span>
                <span className="font-medium text-slate-700">{formatCurrencyAmount(totalCoContribution)}</span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                <span className="text-slate-600">মোট বিনিয়োগ:</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrencyAmount(somityContribution + totalCoContribution)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Profit Preview */}
        <div>
          <div className="rounded-xl p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                লাভ বণ্টনের পূর্বাভাস
              </p>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-emerald-100">
              <span className="text-xs text-slate-600">মোট প্রত্যাশিত লাভ</span>
              <span className="text-sm font-bold text-emerald-700">
                {formatCurrencyAmount(totalProfit)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-emerald-100">
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> সমিতি ({localSomityShare}%)
              </span>
              <span className="text-sm font-semibold text-emerald-700">
                {formatCurrencyAmount(somityProfitAmount)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-emerald-100">
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <Users className="w-3 h-3" /> সহ-বিনিয়োগকারী ({coInvestorsTotalShare}%)
              </span>
              <span className="text-sm font-semibold text-emerald-700">
                {formatCurrencyAmount(coInvestorsProfitAmount)}
              </span>
            </div>
            
            {coInvestors.length > 0 && (
              <div className="mt-3 pt-2 border-t border-emerald-100">
                <p className="text-xs font-medium text-slate-500 mb-2">
                  সহ-বিনিয়োগকারীদের ভাগ (অবদান অনুযায়ী)
                </p>
                <div className="space-y-1.5">
                  {coInvestors.map((investor, idx) => {
                    const investorProfit = getCoInvestorProfitShare(investor.contributedAmount);
                    const investorPercentage = totalCoContribution > 0 
                      ? (investor.contributedAmount / totalCoContribution) * 100 
                      : 0;
                    return (
                      <div key={investor.id || idx} className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">
                          {investor.name} ({investorPercentage.toFixed(0)}% অবদান)
                        </span>
                        <span className="font-medium text-slate-700">
                          {formatCurrencyAmount(investorProfit)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center py-2 mt-2 border-t border-emerald-200">
              <span className="text-xs font-semibold text-slate-600">মোট রিটার্ন</span>
              <span className="text-sm font-bold text-green-700">
                {formatCurrencyAmount((somityContribution + totalCoContribution) + totalProfit)}
              </span>
            </div>
          </div>
          
          {coInvestors.length === 0 && (
            <div className="mt-3 p-2 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-700 flex items-center gap-1">
                <Info className="w-3 h-3" />
                এখনো কোনো সহ-বিনিয়োগকারী যুক্ত হয়নি। সহ-বিনিয়োগকারী যুক্ত করলে এখানে তাদের লাভের ভাগ দেখাবে।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfitDistributionSection;