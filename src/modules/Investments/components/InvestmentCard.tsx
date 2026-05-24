import React from 'react';
import type { Investment } from '../types/investment.types';
import { INVESTMENT_STATUS_COLORS, INVESTMENT_STATUS_LABELS } from '../constants/investmentStatuses';
import { investmentCalculator } from '../utils/investmentCalculator';
import { useNavigate } from 'react-router-dom';

interface InvestmentCardProps {
  investment: Investment;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({ investment, onEdit }) => {
  const navigate = useNavigate();
  const progress = investmentCalculator.calculateProgressPercentage(
    investment.startDate,
    investment.maturityDate
  );
  const remainingDays = investmentCalculator.calculateRemainingDays(investment.maturityDate);

  const getStatusColor = () => {
    return INVESTMENT_STATUS_COLORS[investment.status as keyof typeof INVESTMENT_STATUS_COLORS] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = () => {
    return INVESTMENT_STATUS_LABELS[investment.status as keyof typeof INVESTMENT_STATUS_LABELS] || investment.status;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{investment.memberName}</h3>
            <p className="text-sm text-gray-500">{investment.planName}</p>
            {investment.reference_no && (
              <p className="text-xs text-gray-400 mt-1">রেফ: {investment.reference_no}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusLabel()}
          </span>
        </div>

        {/* Amount */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-800">৳ {investment.amount.toLocaleString()}</p>
          <p className="text-sm text-green-600">প্রত্যাশিত মুনাফা: {investment.expectedReturnPercent}%</p>
        </div>

        {/* Progress Bar */}
        {investment.status === 'active' && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>অগ্রগতি</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {remainingDays > 0 ? `${remainingDays} দিন বাকি` : 'মেয়াদ শেষ'}
            </p>
          </div>
        )}

        {/* Dates */}
        <div className="space-y-1 text-sm text-gray-600 mb-4">
          <div className="flex justify-between">
            <span>শুরুর তারিখ:</span>
            <span>{investment.startDate.toLocaleDateString('bn-BD')}</span>
          </div>
          <div className="flex justify-between">
            <span>মেয়াদ শেষ:</span>
            <span className={remainingDays <= 7 && remainingDays > 0 ? 'text-orange-600 font-medium' : ''}>
              {investment.maturityDate.toLocaleDateString('bn-BD')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => navigate(`/investments/${investment.id}`)}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
          >
            বিস্তারিত
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(investment.id!)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
            >
              সম্পাদনা
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentCard;