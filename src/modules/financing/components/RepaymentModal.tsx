// src/modules/financing/components/RepaymentModal.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/context/SomitySettingsProvider';
import { loanService } from '../services/FinancingService';
import { 
  DollarSign, CreditCard, X, Loader2, Calendar, AlertCircle, 
  CheckCircle, Clock, Banknote, Landmark, Smartphone, Wallet
} from 'lucide-react';
import { toast } from 'sonner';
import BankInfoFields from '../../../shared/components/Common/BankInfoFields';
import { getFrequencyLabel } from '../utils/installmentCalculator';

interface RepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  loanId: string;
  memberId: string;
  dueAmount: number;
  monthlyInstallment: number;
  installmentFrequency?: 'monthly' | 'quarterly' | 'halfYearly' | 'yearly' | 'lumpSum';
  totalInstallments?: number;
  paidInstallments?: number;
  nextDueDate?: Date;
  installmentSchedule?: any[];
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
  nextDueDate,
  installmentSchedule = []
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

  const getProgressText = (): string => {
    if (totalInstallments > 0) {
      return `Installment ${paidInstallments + 1} of ${totalInstallments}`;
    }
    return '';
  };

  const normalizeDate = (date?: any): Date | null => {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (typeof date?.toDate === 'function') return date.toDate();
    if (typeof date?.seconds === 'number') return new Date(date.seconds * 1000);
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const computedNextDueDate = normalizeDate(nextDueDate)
    || normalizeDate(installmentSchedule[paidInstallments]?.dueDate)
    || normalizeDate(installmentSchedule.find(item => !item?.isPaid)?.dueDate);

  const formatDueDate = (date?: any): string => {
    const normalized = normalizeDate(date);
    if (!normalized) return 'N/A';
    return normalized.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-5 w-5" />;
      case 'bank': return <Landmark className="h-5 w-5" />;
      case 'bikash': return <Smartphone className="h-5 w-5" />;
      case 'nogod': return <Smartphone className="h-5 w-5" />;
      case 'rocket': return <Smartphone className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  const getPaymentMethodColor = (method: string, isSelected: boolean) => {
    if (!isSelected) return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    switch (method) {
      case 'cash': return 'bg-green-600 text-white shadow-md';
      case 'bank': return 'bg-blue-600 text-white shadow-md';
      case 'bikash': return 'bg-pink-600 text-white shadow-md';
      case 'nogod': return 'bg-orange-600 text-white shadow-md';
      case 'rocket': return 'bg-purple-600 text-white shadow-md';
      default: return 'bg-gray-600 text-white shadow-md';
    }
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

  const setQuickAmount = (amount: number) => {
    setFormData(prev => ({ ...prev, amount }));
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-700 to-emerald-800 px-6 py-5 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">কিস্তি পরিশোধ রেকর্ড করুন</h2>
              {getProgressText() && (
                <p className="text-sm text-green-200">{getProgressText()}</p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Due Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Payment Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <p className="text-xs text-blue-600">{getInstallmentLabel()}</p>
                <p className="text-xl font-bold text-blue-700">{formatAmount(monthlyInstallment)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">মোট বকেয়া</p>
                <p className="text-xl font-bold text-red-600">{formatAmount(dueAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> পরবর্তী কিস্তির তারিখ
                </p>
                <p className="text-base font-medium text-gray-800">{formatDueDate(computedNextDueDate)}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-600">কিস্তির ধরণ</p>
              <p className="text-sm font-medium text-blue-800">{getFrequencyLabel(installmentFrequency)}</p>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              পেমেন্টের পরিমাণ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="number"
                required
                min="1"
                max={dueAmount}
                value={formData.amount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="পরিমাণ লিখুন"
              />
            </div>
            
            {/* Quick amount buttons */}
            <div className="grid grid-cols-3 gap-3 mt-3">
              <button
                type="button"
                onClick={() => setQuickAmount(monthlyInstallment)}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium">কিস্তি</span><br />
                <span className="text-xs">{formatAmount(monthlyInstallment)}</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickAmount(Math.round(dueAmount / 2))}
                className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <span className="font-medium">অর্ধেক</span><br />
                <span className="text-xs">{formatAmount(Math.round(dueAmount / 2))}</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickAmount(dueAmount)}
                className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <span className="font-medium">সম্পূর্ণ</span><br />
                <span className="text-xs">{formatAmount(dueAmount)}</span>
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              সর্বনিম্ন: {currencySymbol}১ | সর্বোচ্চ: {currencySymbol}{dueAmount.toLocaleString()}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              পেমেন্ট পদ্ধতি <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {allowedPaymentMethods.map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, paymentType: method as any }))}
                  className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    getPaymentMethodColor(method, formData.paymentType === method)
                  }`}
                >
                  {getPaymentMethodIcon(method)}
                  <span className="text-sm font-medium capitalize">{method}</span>
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="যেমন: TRX123456"
              />
            </div>
          )}

          {/* Bank-specific collection status */}
          {formData.paymentType === 'bank' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <span>💡</span>
                  ব্যাংক পেমেন্ট হলে - টাকা কোথায় আছে তা জানান
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {(['collected', 'deposited', 'transferred'] as const).map(status => {
                  const StatusIcon = status === 'collected' ? Wallet : status === 'deposited' ? Landmark : RefreshCw;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, collectionStatus: status }))}
                      className={`p-4 rounded-xl text-left transition-all border-2 ${
                        formData.collectionStatus === status
                          ? 'bg-blue-100 border-blue-500 shadow-md'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${formData.collectionStatus === status ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {status === 'collected' ? '📥 সংগৃহীত' : status === 'deposited' ? '🏦 জমা হয়েছে' : '🔄 ট্রান্সফার'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {status === 'collected'
                              ? 'সদস্য ক্যাশিয়ারের ব্যাংক অ্যাকাউন্টে টাকা দিয়েছেন'
                              : status === 'deposited'
                                ? 'টাকা সরাসরি সোমিটির ব্যাংক অ্যাকাউন্টে জমা হয়েছে'
                                : 'অন্য কোনও অ্যাকাউন্টে ট্রান্সফার করা হয়েছে'}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {(formData.collectionStatus === 'deposited' || formData.collectionStatus === 'collected') && (
                <div className="pt-4 border-t border-yellow-200">
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
            </div>
          )}

          {/* Warning for lump sum payment */}
          {installmentFrequency === 'lumpSum' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                এটি এককালীন পরিশোধের লোন। সম্পূর্ণ বকেয়া একসাথে পরিশোধ করতে হবে।
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-5 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
              {loading ? 'প্রক্রিয়াকরণ...' : 'পেমেন্ট রেকর্ড করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Import missing icon
import { RefreshCw } from 'lucide-react';

export default RepaymentModal;
