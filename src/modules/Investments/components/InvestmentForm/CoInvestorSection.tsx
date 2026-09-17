// src/modules/Investments/components/InvestmentForm/CoInvestorSection.tsx

import React from 'react';
import { Users, PlusCircle, Trash2, Edit2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { formatCurrencyAmount, getInitials } from '../../utils/investmentHelpers';
import type { CoInvestor, CoInvestorPaymentStatus } from '../../types/investment.types';

interface CoInvestorSectionProps {
  coInvestors: CoInvestor[];
  setCoInvestors: React.Dispatch<React.SetStateAction<CoInvestor[]>>;
  openModal: (editIndex?: number) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  somityProfitShare: number;
}

// ==================== HELPER FUNCTIONS ====================

const getPaymentStatusIcon = (status?: CoInvestorPaymentStatus) => {
  switch (status) {
    case 'verified':
      return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
    case 'under_review':
      return <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />;
    default:
      return <Clock className="w-3.5 h-3.5 text-slate-400" />;
  }
};

const getPaymentStatusLabel = (status?: CoInvestorPaymentStatus): string => {
  switch (status) {
    case 'verified':
      return 'সত্যায়িত';
    case 'under_review':
      return 'পর্যালোচনাধীন';
    default:
      return 'জমা দেওয়া';
  }
};

const getStatusBadgeColor = (status?: CoInvestorPaymentStatus): string => {
  switch (status) {
    case 'verified':
      return 'bg-green-100 text-green-700';
    case 'under_review':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const getPaymentMethodLabel = (method?: string): string => {
  switch (method) {
    case 'bank':
      return 'ব্যাংক';
    default:
      return 'নগদ';
  }
};

const CoInvestorSection: React.FC<CoInvestorSectionProps> = ({
  coInvestors,
  setCoInvestors,
  openModal,
  onEdit,
  onDelete,
  somityProfitShare,
}) => {
  // ==================== CALCULATIONS ====================
  
  // Profit share calculations
  const totalCoProfitShare = coInvestors.reduce((sum, c) => sum + (c.profitSharePercentage || 0), 0);
  const maxAllowed = 100 - somityProfitShare;
  const isOver = totalCoProfitShare > maxAllowed;
  
  // Contribution calculations
  const totalCoContribution = coInvestors.reduce((sum, c) => sum + (c.contributedAmount || 0), 0);
  const totalPaidAmount = coInvestors.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
  const totalRemainingAmount = totalCoContribution - totalPaidAmount;
  
  // Status wise amounts (for summary cards)
  const totalSubmittedAmount = coInvestors
    .filter(c => c.paymentStatus === 'submitted')
    .reduce((sum, c) => sum + (c.paidAmount || 0), 0);
  
  const totalUnderReviewAmount = coInvestors
    .filter(c => c.paymentStatus === 'under_review')
    .reduce((sum, c) => sum + (c.paidAmount || 0), 0);
  
  const totalVerifiedAmount = coInvestors
    .filter(c => c.paymentStatus === 'verified')
    .reduce((sum, c) => sum + (c.paidAmount || 0), 0);
  
  // Status wise counts
  const submittedCount = coInvestors.filter(c => c.paymentStatus === 'submitted').length;
  const underReviewCount = coInvestors.filter(c => c.paymentStatus === 'under_review').length;
  const verifiedCount = coInvestors.filter(c => c.paymentStatus === 'verified').length;

  // ==================== RENDER ====================
  
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      {/* Section Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5 bg-gradient-to-r from-emerald-600 to-green-500">
          ৩
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-700">সহ-বিনিয়োগকারী</h2>
          <p className="text-xs text-slate-400">
            সদস্য বা বাহ্যিক ব্যক্তি যারা এই বিনিয়োগে অংশীদার
          </p>
        </div>
      </div>

      {/* Add Button Section */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-50">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-700">সহ-বিনিয়োগকারী যুক্ত করুন</p>
          <p className="text-xs text-slate-400">
            সদস্য বা বাহ্যিক যে কেউ হতে পারেন — অবদান ও মুনাফার অংশ নির্ধারণ করুন
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors text-sm font-medium"
        >
          <PlusCircle className="w-4 h-4" /> যোগ করুন
        </button>
      </div>

      {/* Co-Investor List */}
      {coInvestors.length > 0 && (
        <>
          {/* Payment Summary Cards - Showing Amounts */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {/* Verified Card */}
            <div className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
              <p className="text-xs text-green-600 flex items-center justify-center gap-1">
                <CheckCircle className="w-3 h-3" /> সত্যায়িত
              </p>
              <p className="text-sm font-bold text-green-700">
                {formatCurrencyAmount(totalVerifiedAmount)}
              </p>
              <p className="text-xs text-green-500">{verifiedCount} জন</p>
            </div>
            
            {/* Under Review Card */}
            <div className="bg-yellow-50 rounded-lg p-2 text-center border border-yellow-200">
              <p className="text-xs text-yellow-600 flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" /> পর্যালোচনাধীন
              </p>
              <p className="text-sm font-bold text-yellow-700">
                {formatCurrencyAmount(totalUnderReviewAmount)}
              </p>
              <p className="text-xs text-yellow-500">{underReviewCount} জন</p>
            </div>
            
            {/* Submitted Card */}
            <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-200">
              <p className="text-xs text-slate-600 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> জমা দেওয়া
              </p>
              <p className="text-sm font-bold text-slate-700">
                {formatCurrencyAmount(totalSubmittedAmount)}
              </p>
              <p className="text-xs text-slate-500">{submittedCount} জন</p>
            </div>
          </div>

          {/* Co-Investor List */}
          <div className="space-y-3">
            {coInvestors.map((ci, idx) => (
              <div 
                key={ci.id || idx} 
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50"
              >
                {/* Avatar */}
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: ci.investorType === 'member' ? '#3B82F6' : '#10B981' }}
                >
                  {getInitials(ci.name)}
                </div>
                
                {/* Investor Details */}
                <div className="flex-1 min-w-0">
                  {/* Name and Status Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-700 truncate">
                      {ci.name}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getStatusBadgeColor(ci.paymentStatus)}`}>
                      {getPaymentStatusIcon(ci.paymentStatus)}
                      {getPaymentStatusLabel(ci.paymentStatus)}
                    </span>
                  </div>
                  
                  {/* Contribution and Profit */}
                  <p className="text-xs text-slate-500">
                    অবদান: {formatCurrencyAmount(ci.contributedAmount)} · 
                    মুনাফা: {ci.profitSharePercentage}%
                  </p>
                  
                  {/* Payment Details */}
                  <div className="text-xs mt-1">
                    {ci.paymentStatus === 'verified' ? (
                      <p className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> 
                        পরিশোধিত: {formatCurrencyAmount(ci.paidAmount || ci.contributedAmount)}
                      </p>
                    ) : ci.paymentStatus === 'under_review' ? (
                      <p className="text-yellow-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> 
                        পরিশোধিত: {formatCurrencyAmount(ci.paidAmount || 0)} | 
                        বাকি: {formatCurrencyAmount((ci.contributedAmount - (ci.paidAmount || 0)))}
                      </p>
                    ) : (
                      <p className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 
                        জমা দেওয়া হয়েছে, অ্যাডমিন ভেরিফিকেশনের অপেক্ষায়
                      </p>
                    )}
                  </div>
                  
                  {/* Payment Method & Reference */}
                  {ci.paymentMethod && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      মাধ্যম: {getPaymentMethodLabel(ci.paymentMethod)}
                      {ci.paymentReference && ` · রেফ: ${ci.paymentReference.slice(0, 12)}`}
                      {ci.paymentSenderBank && ` · ${ci.paymentSenderBank}`}
                    </p>
                  )}
                  
                  {/* Notes */}
                  {ci.notes && (
                    <p className="text-xs text-slate-400 mt-0.5 italic">
                      📝 {ci.notes.slice(0, 50)}
                    </p>
                  )}
                </div>
                
                {/* Action Buttons */}
                <button 
                  onClick={() => onEdit(idx)} 
                  className="text-emerald-500 hover:text-emerald-700 p-1.5"
                  title="সম্পাদনা করুন"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDelete(idx)} 
                  className="text-red-500 hover:text-red-700 p-1.5"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {/* Summary Footer */}
            <div className="flex justify-between items-center text-xs px-1 pt-3 border-t border-slate-200">
              <span className="text-slate-500">
                মোট অবদান: <strong className="text-slate-700">{formatCurrencyAmount(totalCoContribution)}</strong>
              </span>
              <span className="text-slate-500">
                মোট পরিশোধিত: <strong className="text-green-700">{formatCurrencyAmount(totalPaidAmount)}</strong>
              </span>
              <span className="text-slate-500">
                মোট বাকি: <strong className="text-amber-700">{formatCurrencyAmount(totalRemainingAmount)}</strong>
              </span>
              <span className={isOver ? 'text-red-500 font-semibold' : 'text-slate-500'}>
                মোট মুনাফা: <strong>{totalCoProfitShare}%</strong>
                {isOver && ` (সর্বোচ্চ ${maxAllowed}%)`}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {coInvestors.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">কোনো সহ-বিনিয়োগকারী যুক্ত হয়নি</p>
          <p className="text-xs text-slate-400 mt-1">
            উপরের "যোগ করুন" বাটনে ক্লিক করে সহ-বিনিয়োগকারী যুক্ত করুন
          </p>
        </div>
      )}
    </div>
  );
};

export default CoInvestorSection;