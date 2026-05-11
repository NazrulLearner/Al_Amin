// src/components/Loans/RepaymentModal.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/providers/SomitySettingsProvider';
import { loanService } from '../services/FinancingService';
import { DollarSign, CreditCard, X, Loader2, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import BankInfoFields from '../../../shared/components/Common/BankInfoFields';

interface RepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  loanId: string;
  memberId: string;
  dueAmount: number;
  monthlyInstallment: number;
  // 🔥 NEW: Additional props for frequency support
  installmentFrequency?: 'monthly' | 'quarterly' | 'halfYearly' | 'yearly' | 'lumpSum';
  totalInstallments?: number;
  paidInstallments?: number;
  nextDueDate?: Date;
}

const RepaymentModal: React.FC<RepaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  loanId,
  memberId,
  dueAmount,
  monthlyInstallment,
  installmentFrequency = 'monthly',
  totalInstallments = 0,
  paidInstallments = 0,
  nextDueDate
}) => {
  const { somityInfo } = useAuth();
  const { settings, formatAmount } = useSomitySettings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: 0,
    paymentType: 'cash' as 'cash' | 'bank' | 'bikash' | 'nogod' | 'rocket',
    collectionStatus: 'collected' as 'collected' | 'deposited' | 'transferred',
    referenceNo: '',
    bankName: '',
    bankReference: ''
  });

  const currencySymbol = settings?.financial?.currencySymbol || '৳';
  const allowedPaymentMethods = (settings?.collection?.allowedPaymentMethods as Array<'cash' | 'bank' | 'bikash' | 'nogod' | 'rocket'>) || ['cash', 'bank', 'bikash', 'nogod', 'rocket'];

  // 🔥 NEW: Get installment label based on frequency
  const getInstallmentLabel = (): string => {
    const labels: Record<string, string> = {
      monthly: 'Monthly Installment',
      quarterly: 'Quarterly Installment (3 months)',
      halfYearly: 'Half-Yearly Installment (6 months)',
      yearly: 'Yearly Installment (12 months)',
      lumpSum: 'Total Payable (Lump Sum)'
    };
    return labels[installmentFrequency] || 'Installment Amount';
  };

  // 🔥 NEW: Get progress info
  const getProgressText = (): string => {
    if (totalInstallments > 0) {
      return `Installment ${paidInstallments + 1} of ${totalInstallments}`;
    }
    return '';
  };

  // 🔥 NEW: Format next due date
  const formatDueDate = (date?: Date): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        amount: Math.min(monthlyInstallment, dueAmount || monthlyInstallment || 0),
        paymentType: allowedPaymentMethods.includes(prev.paymentType) ? prev.paymentType : 'cash',
        referenceNo: '',
        bankName: '',
        bankReference: ''
      }));
    }
  }, [isOpen, monthlyInstallment, dueAmount, allowedPaymentMethods]);

  const paymentMethodLabels: Record<string, string> = {
    cash: 'নগদ',
    bank: 'ব্যাংক',
    bikash: 'bKash',
    nogod: 'Nagad',
    rocket: 'Rocket'
  };

  const getCollectionStatusInfo = () => {
    const statusMap: Record<string, { label: string; description: string; color: string }> = {
      collected: {
        label: 'সংগৃহীত',
        description: 'ক্যাশিয়ারের ব্যাংক অ্যাকাউন্টে জমা হয়েছে',
        color: 'text-blue-600'
      },
      deposited: {
        label: 'জমা হয়েছে',
        description: 'সোমিটির ব্যাংক অ্যাকাউন্টে জমা হয়েছে',
        color: 'text-green-600'
      },
      transferred: {
        label: 'ট্রান্সফার',
        description: 'অন্য ব্যাংক অ্যাকাউন্টে ট্রান্সফার করা হয়েছে',
        color: 'text-purple-600'
      }
    };
    return statusMap[formData.collectionStatus];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!somityInfo?.id) return;

    if (formData.amount <= 0 || formData.amount > dueAmount) {
      toast.error(`পেমেন্টের পরিমাণ ১ থেকে ${currencySymbol}${dueAmount.toLocaleString()} এর মধ্যে হতে হবে`);
      return;
    }

    if (formData.paymentType === 'bank' && formData.collectionStatus === 'deposited' && (!formData.bankName || !formData.bankReference)) {
      toast.error('ব্যাংকে জমা হলে ব্যাংকের নাম ও রেফারেন্স নম্বর প্রদান করা আবশ্যক।');
      return;
    }
    
    setLoading(true);
    try {
      await loanService.addRepayment(
        loanId,
        memberId,
        formData.amount,
        formData.paymentType,
        formData.referenceNo,
        formData.bankName,
        formData.bankReference,
        formData.collectionStatus
      );
      toast.success('✅ কিস্তি পরিশোধ সফলভাবে রেকর্ড করা হয়েছে!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error recording repayment:', error);
      toast.error(error.message || 'কিস্তি পরিশোধ রেকর্ড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NEW: Quick amount buttons
  const setQuickAmount = (amount: number) => {
    setFormData(prev => ({ ...prev, amount }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full mt-10">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800">কিস্তি পরিশোধ রেকর্ড করুন</h2>
            {getProgressText() && (
              <p className="text-sm text-gray-500 mt-0.5">{getProgressText()}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Due Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{getInstallmentLabel()}:</span>
                <span className="font-bold text-lg text-blue-700">{formatAmount(monthlyInstallment)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">মোট বকেয়া:</span>
                <span className="font-bold text-lg text-red-600">{formatAmount(dueAmount)}</span>
              </div>
              {nextDueDate && (
                <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    পরবর্তী কিস্তির তারিখ:
                  </span>
                  <span className="font-medium text-gray-800">{formatDueDate(nextDueDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পেমেন্টের পরিমাণ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="number"
                required
                min="1"
                max={dueAmount}
                value={formData.amount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="পরিমাণ লিখুন"
              />
            </div>
            
            {/* 🔥 NEW: Quick amount buttons */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setQuickAmount(monthlyInstallment)}
                className="flex-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                কিস্তি: {formatAmount(monthlyInstallment)}
              </button>
              <button
                type="button"
                onClick={() => setQuickAmount(dueAmount)}
                className="flex-1 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                সম্পূর্ণ: {formatAmount(dueAmount)}
              </button>
              <button
                type="button"
                onClick={() => setQuickAmount(Math.round(dueAmount / 2))}
                className="flex-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                অর্ধেক: {formatAmount(Math.round(dueAmount / 2))}
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-1">
              সর্বনিম্ন: {currencySymbol}১ | সর্বোচ্চ: {currencySymbol}{dueAmount.toLocaleString()}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পেমেন্ট পদ্ধতি <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {allowedPaymentMethods.map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, paymentType: method as any }))}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    formData.paymentType === method
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {paymentMethodLabels[method] || method}
                </button>
              ))}
            </div>
          </div>

          {/* Reference No for digital payments */}
          {(formData.paymentType === 'bank' || formData.paymentType === 'bikash' || formData.paymentType === 'nogod' || formData.paymentType === 'rocket') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ট্রানজেকশন আইডি / রেফারেন্স নম্বর
              </label>
              <input
                type="text"
                value={formData.referenceNo}
                onChange={(e) => setFormData(prev => ({ ...prev, referenceNo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="যেমন: TRX123456"
              />
            </div>
          )}

          {/* Bank-specific collection status */}
          {formData.paymentType === 'bank' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <span>💡</span>
                  ব্যাংক পেমেন্ট হলে এখনই দেখান যে টাকা কোথায় আছে: ক্যাশিয়ারের ব্যাংক অ্যাকাউন্টে আছে, সরাসরি সোমিটির ব্যাংকে জমা হয়েছে, কিংবা অন্য কোনও অ্যাকাউন্টে ট্রান্সফার হয়েছে।
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-4">
                {(['collected', 'deposited', 'transferred'] as const).map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, collectionStatus: status }))}
                    className={`p-4 rounded-xl text-left transition-all ${
                      formData.collectionStatus === status
                        ? 'bg-blue-100 border-2 border-blue-500 shadow-md'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-gray-800">
                      {status === 'collected' ? '📥 সংগৃহীত' : status === 'deposited' ? '🏦 জমা হয়েছে' : '🔄 ট্রান্সফার'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {status === 'collected'
                        ? 'সদস্য ক্যাশিয়ারের ব্যাংক অ্যাকাউন্টে টাকা দিয়েছেন'
                        : status === 'deposited'
                          ? 'টাকা সরাসরি সোমিটির ব্যাংক অ্যাকাউন্টে জমা হয়েছে'
                          : 'অন্য কোনও অ্যাকাউন্টে ট্রান্সফার করা হয়েছে'}
                    </div>
                  </button>
                ))}
              </div>

              {(formData.collectionStatus === 'deposited' || formData.collectionStatus === 'collected') && (
                <div className="mt-4 pt-4 border-t border-yellow-200">
                  {formData.collectionStatus === 'collected' && (
                    <div className="bg-blue-100 p-3 rounded-lg mb-4">
                      <p className="text-sm text-blue-700 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>সদস্য টাকা ক্যাশিয়ারের ব্যক্তিগত ব্যাংক অ্যাকাউন্টে দিয়েছেন। ব্যাংক নাম ও ট্রানজেকশন আইডি দিন।</span>
                      </p>
                    </div>
                  )}

                  <BankInfoFields
                    bankName={formData.bankName}
                    bankReference={formData.bankReference}
                    onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
                    required={formData.collectionStatus === 'deposited'}
                    placeholder={{
                      bankName: formData.collectionStatus === 'collected'
                        ? 'ক্যাশিয়ারের ব্যাংকের নাম'
                        : 'যেমন: Islami Bank, DBBL, Sonali Bank',
                      bankReference: formData.collectionStatus === 'collected'
                        ? 'ট্রানজেকশন রেফারেন্স'
                        : 'স্লিপ নং / চেক নং / ট্রানজেকশন আইডি'
                    }}
                  />
                </div>
              )}

              <div className={`mt-4 p-3 rounded-lg ${
                formData.collectionStatus === 'collected' ? 'bg-blue-100' : 
                formData.collectionStatus === 'deposited' ? 'bg-green-100' : 'bg-purple-100'
              }`}>
                <p className="text-xs text-gray-600">
                  <strong>বর্তমান অবস্থা:</strong> {getCollectionStatusInfo()?.description}
                </p>
              </div>
            </div>
          )}

          {/* 🔥 NEW: Warning for lump sum payment */}
          {installmentFrequency === 'lumpSum' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                এটি এককালীন পরিশোধের লোন। সম্পূর্ণ বকেয়া একসাথে পরিশোধ করতে হবে।
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              {loading ? 'প্রক্রিয়াকরণ...' : 'পেমেন্ট রেকর্ড করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepaymentModal;