// src/modules/contributions/components/ContributionStatusCard.tsx
import React from 'react';
import { Calendar } from 'lucide-react';
import { getDueStatusStyle } from '../../../utils/calculations/contributionCalculator';

interface FeeStatus {
  startMonth: string;
  startYear: number;
  totalMonths: number;
  paidMonths: { month: string; year: number }[];
  paidCount: number;
  lastPaidMonth: string;
  lastPaidYear: number;
  nextDueMonth: string;
  nextDueYear: number;
  dueMonths: { month: string; year: number }[];
  totalDue: number;
  monthlyFee: number;
}

interface ContributionStatusCardProps {
  feeStatus: FeeStatus | null;
}

const ContributionStatusCard: React.FC<ContributionStatusCardProps> = ({ feeStatus }) => {
  if (!feeStatus) return null;

  const dueStyle = getDueStatusStyle({
    totalDue: feeStatus.totalDue,
    dueMonthsCount: feeStatus.dueMonths.length,
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-500" />
          অবদান স্ট্যাটাস
        </h2>
      </div>

      <div className="p-5">
        <div className={`p-4 rounded-lg border ${dueStyle.containerClass} mb-4`}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">সূচনা তারিখ</p>
              <p className="font-semibold">{feeStatus.startMonth} {feeStatus.startYear}</p>
            </div>
            <div>
              <p className="text-gray-500">মোট মাস</p>
              <p className="font-semibold">{feeStatus.totalMonths} মাস</p>
            </div>
            <div>
              <p className="text-gray-500">জমা হয়েছে</p>
              <p className="font-semibold text-green-600">{feeStatus.paidCount} মাস</p>
            </div>
            <div>
              <p className="text-gray-500">বকেয়া</p>
              <p className="font-semibold text-red-600">{feeStatus.dueMonths.length} মাস</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-dashed">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">মোট বকেয়া পরিমাণ:</span>
              <span className={`font-bold text-lg ${dueStyle.statusColor}`}>
                ৳{feeStatus.totalDue.toLocaleString()}
              </span>
            </div>
            {feeStatus.lastPaidMonth && (
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-500">শেষ জমা:</span>
                <span className="font-medium">
                  {feeStatus.lastPaidMonth} {feeStatus.lastPaidYear}
                </span>
              </div>
            )}
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-gray-500">পরবর্তী জমা:</span>
              <span className="font-medium text-blue-600">
                {feeStatus.nextDueMonth} {feeStatus.nextDueYear}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-3 text-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${dueStyle.containerClass} ${dueStyle.statusColor}`}>
              {dueStyle.statusText}
            </span>
          </div>
        </div>

        {/* Due Months List */}
        {feeStatus.dueMonths.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">বকেয়া মাসসমূহ:</p>
            <div className="flex flex-wrap gap-1">
              {feeStatus.dueMonths.map((month, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                >
                  {month.month} {month.year}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContributionStatusCard;