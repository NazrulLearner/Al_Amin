// src/pages/Members/profile/tabs/OverviewTab.tsx
import React from 'react';
import { Users, DollarSign, TrendingUp, Clock, FileText, Calendar, PieChart } from 'lucide-react';
import type { Member } from '../../../../types';

interface OverviewTabProps {
  member: Member;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ member }) => {
  const stats = [
    {
      title: 'Total Shares',
      value: member.membership?.shareCount || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+0'
    },
    {
      title: 'Total Fees Paid',
      value: `৳${(member.financials?.totalFeesPaid || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: ''
    },
    {
      title: 'Unclaimed Profit',
      value: `৳${((member.financials?.totalSavings || 0) * 0.1).toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: 'Estimated 10%'
    },
    {
      title: 'Pending Amount',
      value: `৳${(member.financials?.totalPendingAmount || 0).toLocaleString()}`,
      icon: Clock,
      color: 'bg-orange-500',
      change: member.financials?.totalPendingMonths ? `${member.financials.totalPendingMonths} months` : ''
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                  <Icon size={20} className={`${stat.color.replace('bg-', 'text-')}`} />
                </div>
                {stat.change && (
                  <span className="text-xs text-green-600">{stat.change}</span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Profit Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <PieChart size={20} className="mr-2 text-purple-500" />
          Profit Distribution
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-gray-600">Total Savings/Investment</span>
            <span className="font-semibold">৳{(member.financials?.totalSavings || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-gray-600">Estimated Profit Rate</span>
            <span className="font-semibold text-green-600">10% per year</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-gray-600">Current Profit (Unclaimed)</span>
            <span className="font-semibold text-purple-600">৳{((member.financials?.totalSavings || 0) * 0.1).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-600">Total Value (Savings + Profit)</span>
            <span className="font-bold text-lg text-green-600">৳{((member.financials?.totalSavings || 0) * 1.1).toLocaleString()}</span>
          </div>
        </div>
        <button className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
          Claim Profit
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FileText size={20} className="mr-2 text-blue-500" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Calendar size={14} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-800">Joined as member</p>
              <p className="text-xs text-gray-500">{member.membership?.dateOfJoin || 'N/A'}</p>
            </div>
          </div>
          {member.financials?.lastFeePaidMonth && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <DollarSign size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-800">Last fee payment</p>
                <p className="text-xs text-gray-500">{member.financials.lastFeePaidMonth} {member.financials.lastFeePaidYear}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;