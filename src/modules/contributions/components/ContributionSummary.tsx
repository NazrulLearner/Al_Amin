// src/modules/contributions/components/ContributionSummary.tsx
import React from 'react';

interface ContributionSummaryProps {
  monthlyFee: number;
  numberOfMonths: number;
  totalAmount: number;
}

const ContributionSummary: React.FC<ContributionSummaryProps> = ({
  monthlyFee,
  numberOfMonths,
  totalAmount,
}) => {
  return (
    <div className="bg-gradient-to-r from-green-50 via-blue-50 to-green-50 p-5 rounded-xl border border-green-200">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-sm text-gray-600">মাসিক অবদান</p>
          <p className="text-xl font-semibold text-gray-800">
            ৳{monthlyFee.toLocaleString()} × {numberOfMonths} মাস
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">মোট পরিমাণ</p>
          <p className="text-3xl font-bold text-green-600">
            ৳{totalAmount.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContributionSummary;