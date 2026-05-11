// src/pages/Members/profile/tabs/InvestmentTab.tsx
import React from 'react';
import { TrendingUp, Users } from 'lucide-react';
import type { Member } from '../../../../types';

interface InvestmentTabProps {
  member: Member;
}

const InvestmentTab: React.FC<InvestmentTabProps> = ({ member }) => {
  const shareCount = member.membership?.shareCount || 0;
  const shareValue = member.membership?.perShareFee || 1000;
  const totalInvestment = shareCount * shareValue;
  const profitRate = 10; // 10% per year
  const estimatedProfit = (totalInvestment * profitRate) / 100;
  const totalValue = totalInvestment + estimatedProfit;

  return (
    <div className="space-y-6">
      {/* Investment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
          <p className="text-purple-100 text-sm">Total Investment</p>
          <p className="text-3xl font-bold">৳{totalInvestment.toLocaleString()}</p>
          <p className="text-purple-200 text-xs mt-1">{shareCount} shares × ৳{shareValue}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
          <p className="text-green-100 text-sm">Estimated Profit</p>
          <p className="text-3xl font-bold">৳{estimatedProfit.toLocaleString()}</p>
          <p className="text-green-200 text-xs mt-1">{profitRate}% annual return</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
          <p className="text-blue-100 text-sm">Total Value</p>
          <p className="text-3xl font-bold">৳{totalValue.toLocaleString()}</p>
          <p className="text-blue-200 text-xs mt-1">Investment + Profit</p>
        </div>
      </div>

      {/* Share Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Users size={20} className="mr-2 text-purple-500" />
          Share Details
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-gray-600">Number of Shares</span>
            <span className="font-semibold">{shareCount}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-gray-600">Per Share Value</span>
            <span className="font-semibold">৳{shareValue}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-gray-600">Total Investment</span>
            <span className="font-semibold text-purple-600">৳{totalInvestment.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-600">Profit Share Ratio</span>
            <span className="font-semibold text-green-600">{profitRate}% of investment</span>
          </div>
        </div>
      </div>

      {/* Profit History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingUp size={20} className="mr-2 text-green-500" />
          Profit History
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-800">Q4 2024</p>
              <p className="text-xs text-gray-400">October - December</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-600">+৳{(totalInvestment * 0.025).toLocaleString()}</p>
              <p className="text-xs text-gray-400">2.5% return</p>
            </div>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-800">Q3 2024</p>
              <p className="text-xs text-gray-400">July - September</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-600">+৳{(totalInvestment * 0.025).toLocaleString()}</p>
              <p className="text-xs text-gray-400">2.5% return</p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <div>
              <p className="font-medium text-gray-800">Q2 2024</p>
              <p className="text-xs text-gray-400">April - June</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-600">+৳{(totalInvestment * 0.025).toLocaleString()}</p>
              <p className="text-xs text-gray-400">2.5% return</p>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Button */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 text-center">
        <p className="text-purple-800 mb-3">Your unclaimed profit is accumulating</p>
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Claim Profit
        </button>
      </div>
    </div>
  );
};

export default InvestmentTab;