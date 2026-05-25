import React from 'react';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const ProfitLossPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Profit & Loss</h1>
        <p className="text-gray-500 mt-1">Monthly and yearly profit/loss calculation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Income Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Monthly Fee</span>
              <span className="text-green-600">৳ 50,000</span>
            </div>
            <div className="flex justify-between">
              <span>Loan Interest</span>
              <span className="text-green-600">৳ 12,500</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total Income</span>
              <span className="text-green-600">৳ 62,500</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Expense Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Salary</span>
              <span className="text-red-600">৳ 30,000</span>
            </div>
            <div className="flex justify-between">
              <span>Maintenance</span>
              <span className="text-red-600">৳ 15,000</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total Expense</span>
              <span className="text-red-600">৳ 45,000</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-emerald-100">Net Profit (This Month)</p>
            <p className="text-3xl font-bold mt-1">৳ 17,500</p>
          </div>
          <TrendingUp size={40} className="text-emerald-200" />
        </div>
      </div>
    </div>
  );
};

export default ProfitLossPage;