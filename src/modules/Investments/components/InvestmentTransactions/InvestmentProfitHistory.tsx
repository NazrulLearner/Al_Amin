import React from 'react';
import type { InvestmentProfitDistribution } from '../../types/investmentTransaction.types';

interface InvestmentProfitHistoryProps {
  profits: InvestmentProfitDistribution[];
  loading?: boolean;
}

const InvestmentProfitHistory: React.FC<InvestmentProfitHistoryProps> = ({ profits, loading }) => {
  if (loading) {
    return <div className="text-center py-8">লোড হচ্ছে...</div>;
  }

  if (profits.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        এখন পর্যন্ত কোনো মুনাফা বিতরণ করা হয়নি
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {profits.map(profit => (
          <div key={profit.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">
                  {profit.distributionDate.toLocaleDateString('bn-BD')}
                </p>
                <p className="text-lg font-bold text-green-600 mt-1">
                  ৳ {profit.profitAmount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  সময়কাল: {profit.periodStart.toLocaleDateString()} - {profit.periodEnd.toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                profit.status === 'distributed' ? 'bg-green-100 text-green-800' :
                profit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {profit.status === 'distributed' ? 'বিতরণ করা হয়েছে' : 
                 profit.status === 'pending' ? ' pending' : 'ব্যর্থ'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestmentProfitHistory;