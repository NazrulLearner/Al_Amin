import React from 'react';
import { Wallet, TrendingUp, TrendingDown, History } from 'lucide-react';

const CashManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cash Management</h1>
          <p className="text-gray-500 mt-1">Track all cash inflows and outflows</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Cash in Hand</p>
              <p className="text-2xl font-bold">৳ 1,25,000</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Cash In</p>
              <p className="text-2xl font-bold">৳ 5,50,000</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Cash Out</p>
              <p className="text-2xl font-bold">৳ 4,25,000</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Transactions</h3>
        <p className="text-gray-400 text-center py-8">Cash transaction list will appear here</p>
      </div>
    </div>
  );
};

export default CashManagement;