// src/modules/Investments/pages/InvestmentPending.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, XCircle, Eye, Clock, AlertCircle, 
  Building2, Users, DollarSign, Calendar, TrendingUp,
  Search, Filter, ChevronRight, FileText, Banknote, Landmark
} from 'lucide-react';
import { useInvestments } from '../hooks/useInvestments';
import { useAuth } from '../../../app/providers/AuthProvider';
import { formatCurrencyAmount, formatDateString } from '../utils/investmentHelpers';
import { toast } from 'sonner';
import type { Investment, CoInvestor } from '../types/investment.types';

const InvestmentPending: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData, currentMember } = useAuth();
  const { pendingInvestments, approveInvestment, rejectInvestment, refresh } = useInvestments();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectInvestmentId, setRejectInvestmentId] = useState<string | null>(null);

  // Debug log
  console.log('📊 Pending Investments:', pendingInvestments);
  console.log('📊 Pending Investments count:', pendingInvestments.length);

  const handleApprove = async (investmentId: string) => {
    setLoading(investmentId);
    try {
      await approveInvestment(investmentId, 'অ্যাডমিন অনুমোদন করেছেন');
      toast.success('বিনিয়োগ অনুমোদন করা হয়েছে!');
      refresh();
    } catch (error) {
      toast.error('অনুমোদন করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectInvestmentId) return;
    if (!rejectReason.trim()) {
      toast.error('বাতিলের কারণ লিখুন');
      return;
    }
    setLoading(rejectInvestmentId);
    try {
      await rejectInvestment(rejectInvestmentId, rejectReason);
      toast.error('বিনিয়োগ বাতিল করা হয়েছে');
      setShowRejectModal(false);
      setRejectReason('');
      setRejectInvestmentId(null);
      refresh();
    } catch (error) {
      toast.error('বাতিল করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(null);
    }
  };

  const openDetailModal = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowDetailModal(true);
  };

  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">সত্যায়িত</span>;
      case 'under_review':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">পর্যালোচনাধীন</span>;
      default:
        return <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">জমা দেওয়া</span>;
    }
  };

  const getTotalCoInvestorPaid = (coInvestors: CoInvestor[]) => {
    return coInvestors.reduce((sum, ci) => sum + (ci.paidAmount || 0), 0);
  };

  const getTotalCoInvestorPending = (coInvestors: CoInvestor[]) => {
    return coInvestors.reduce((sum, ci) => sum + ((ci.contributedAmount || 0) - (ci.paidAmount || 0)), 0);
  };

  if (pendingInvestments.length === 0) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">কোনো পেন্ডিং বিনিয়োগ নেই</p>
          <p className="text-xs text-slate-400 mt-1">সব বিনিয়োগ ইতিমধ্যে অনুমোদিত বা বাতিল করা হয়েছে</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">বিনিয়োগ অনুমোদন</h1>
        <p className="text-slate-500 text-sm mt-1">
          নিচের বিনিয়োগগুলো অনুমোদনের অপেক্ষায় রয়েছে
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-yellow-600">অনুমোদনের অপেক্ষায়</p>
              <p className="text-2xl font-bold text-yellow-700">{pendingInvestments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-blue-600">মোট বিনিয়োগের পরিমাণ</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrencyAmount(pendingInvestments.reduce((sum, inv) => sum + inv.totalAmount, 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-purple-600">মোট সহ-বিনিয়োগকারী</p>
              <p className="text-2xl font-bold text-purple-700">
                {pendingInvestments.reduce((sum, inv) => sum + (inv.coInvestors?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Investment List */}
      <div className="space-y-4">
        {pendingInvestments.map((investment) => {
          const totalCoPaid = getTotalCoInvestorPaid(investment.coInvestors || []);
          const totalCoPending = getTotalCoInvestorPending(investment.coInvestors || []);
          const totalCoContribution = investment.coInvestorsTotalContribution || 0;
          
          return (
            <div key={investment.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Investment Header */}
              <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-slate-800">{investment.investmentName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {investment.investmentId} · {formatDateString(investment.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> পেন্ডিং
                    </span>
                    <button
                      onClick={() => openDetailModal(investment)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Investment Body */}
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-slate-400">মোট পরিমাণ</p>
                    <p className="text-sm font-bold text-slate-700">{formatCurrencyAmount(investment.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">সমিতির অবদান</p>
                    <p className="text-sm font-bold text-emerald-700">{formatCurrencyAmount(investment.somityContribution)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">সহ-বিনিয়োগকারী</p>
                    <p className="text-sm font-bold text-blue-700">{investment.coInvestors?.length || 0} জন</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">প্রত্যাশিত লাভ</p>
                    <p className="text-sm font-bold text-emerald-700">{formatCurrencyAmount(investment.expectedProfit)}</p>
                  </div>
                </div>

                {/* Co-investor List with Payment Status */}
                {investment.coInvestors && investment.coInvestors.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-600 mb-2">সহ-বিনিয়োগকারীদের তথ্য</p>
                    <div className="space-y-2">
                      {investment.coInvestors.map((ci, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                          <div>
                            <p className="text-sm font-medium">{ci.name}</p>
                            <p className="text-xs text-slate-500">
                              অবদান: {formatCurrencyAmount(ci.contributedAmount)} · মুনাফা: {ci.profitSharePercentage}%
                            </p>
                            {ci.paymentMethod && (
                              <p className="text-xs text-slate-400">মাধ্যম: {ci.paymentMethod === 'bank' ? 'ব্যাংক' : 'নগদ'}</p>
                            )}
                          </div>
                          {getPaymentStatusBadge(ci.paymentStatus)}
                        </div>
                      ))}
                    </div>
                    
                    {/* Payment Summary Bar */}
                    <div className="mt-3 p-3 rounded-lg bg-slate-50">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-500">মোট অবদান: {formatCurrencyAmount(totalCoContribution)}</span>
                        <span className="text-green-600">পরিশোধিত: {formatCurrencyAmount(totalCoPaid)}</span>
                        <span className="text-amber-600">বাকি: {formatCurrencyAmount(totalCoPending)}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: totalCoContribution > 0 ? (totalCoPaid / totalCoContribution) * 100 : 0 }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleApprove(investment.id)}
                    disabled={loading === investment.id}
                    className="flex-1 py-2 rounded-lg text-white font-medium text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 disabled:opacity-50"
                  >
                    {loading === investment.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> অনুমোদন করুন</>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setRejectInvestmentId(investment.id);
                      setShowRejectModal(true);
                    }}
                    disabled={loading === investment.id}
                    className="flex-1 py-2 rounded-lg text-white font-medium text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> বাতিল করুন
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedInvestment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-slate-100 p-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">বিনিয়োগের বিস্তারিত</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400">বিনিয়োগের নাম</p>
                  <p className="text-sm font-medium">{selectedInvestment.investmentName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">রেফারেন্স নম্বর</p>
                  <p className="text-sm font-medium">{selectedInvestment.investmentId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">বিভাগ</p>
                  <p className="text-sm font-medium">{selectedInvestment.category}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">শুরুর তারিখ</p>
                  <p className="text-sm font-medium">{formatDateString(selectedInvestment.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">মোট পরিমাণ</p>
                  <p className="text-sm font-bold text-slate-700">{formatCurrencyAmount(selectedInvestment.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">প্রত্যাশিত লাভ</p>
                  <p className="text-sm font-bold text-emerald-700">{formatCurrencyAmount(selectedInvestment.expectedProfit)}</p>
                </div>
              </div>

              {/* Somity Info */}
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-xs font-semibold text-emerald-700 mb-2">সমিতির তথ্য</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">অবদান</p>
                    <p className="font-semibold">{formatCurrencyAmount(selectedInvestment.somityContribution)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">মুনাফার অংশ</p>
                    <p className="font-semibold">{selectedInvestment.somityProfitShare}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">অর্থের উৎস</p>
                    <p className="font-semibold">
                      {selectedInvestment.moneySource === 'cash' ? 'নগদ' : 
                       selectedInvestment.moneySource === 'bank' ? 'ব্যাংক' : 'নগদ + ব্যাংক'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Co-investors List */}
              {selectedInvestment.coInvestors && selectedInvestment.coInvestors.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">সহ-বিনিয়োগকারী তালিকা</p>
                  <div className="space-y-2">
                    {selectedInvestment.coInvestors.map((ci, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                        <div>
                          <p className="text-sm font-medium">{ci.name}</p>
                          <p className="text-xs text-slate-500">
                            অবদান: {formatCurrencyAmount(ci.contributedAmount)} · মুনাফা: {ci.profitSharePercentage}%
                          </p>
                          {ci.paymentMethod && (
                            <p className="text-xs text-slate-400">মাধ্যম: {ci.paymentMethod === 'bank' ? 'ব্যাংক' : 'নগদ'}</p>
                          )}
                        </div>
                        {getPaymentStatusBadge(ci.paymentStatus)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedInvestment.description && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">বিবরণ</p>
                  <p className="text-sm text-slate-600">{selectedInvestment.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-slate-800">বিনিয়োগ বাতিল করুন</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                বিনিয়োগটি বাতিলের কারণ লিখুন:
              </p>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="যেমন: তথ্য সঠিক নয়, অনুমোদন দেওয়া যায় না..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-400"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleReject}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white font-medium text-sm"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setRejectInvestmentId(null);
                  }}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm"
                >
                  ফিরে যান
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentPending;