// src/modules/finance/pages/CashManagement.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/providers/SomitySettingsProvider';
import { cashService } from '../services/cash.service';
import { bankService } from '../services/bank.service';
import { 
  Wallet, TrendingUp, Landmark, 
  RefreshCw, Loader2, 
  Clock, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import AmountInput from '../components/common/AmountInput';
import AccountSelector from '../components/common/AccountSelector';
import FinanceStatsCard from '../components/common/FinanceStatsCard';

const CashManagement: React.FC = () => {
  const { user, currentMember } = useAuth();
  const { formatAmount } = useSomitySettings();
  const [loading, setLoading] = useState(true);
  const [cashBalance, setCashBalance] = useState<any>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [] = useState(false);
  const [, setBanks] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    amount: 0,
    bankId: '',
    note: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cash, bankList] = await Promise.all([
        cashService.getCashBalance(currentMember?.memberId || ''),
        bankService.getAllAccounts()
      ]);
      setCashBalance(cash);
      setBanks(bankList.filter(b => b.isActive));
    } catch (error) {
      console.error('Error fetching cash data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!formData.amount || formData.amount <= 0) {
      toast.error('সঠিক পরিমাণ দিন');
      return;
    }
    if (!formData.bankId) {
      toast.error('ব্যাংক নির্বাচন করুন');
      return;
    }

    setSubmitting(true);
    try {
      await cashService.depositToBank({
        amount: formData.amount,
        bankId: formData.bankId,
        cashierId: currentMember?.memberId || '',
        cashierName: currentMember?.fullName || '',
        note: formData.note,
        createdBy: user?.uid || '',
        createdByName: currentMember?.fullName || ''
      });
      toast.success('✅ টাকা ব্যাংকে জমা হয়েছে!');
      setShowDepositModal(false);
      setFormData({ amount: 0, bankId: '', note: '' });
      fetchData();
    } catch (error) {
      console.error('Error depositing:', error);
      toast.error('জমা করতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ক্যাশ ব্যবস্থাপনা</h1>
          <p className="text-gray-500 mt-1">আপনার হাতে থাকা টাকা ও ব্যাংকে জমা ট্র্যাক করুন</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <FinanceStatsCard
            title="হাতে নগদ"
            value={cashBalance?.currentBalance || 0}
            icon={<Wallet className="h-6 w-6 text-green-600" />}
            color="hover:shadow-md"
          />
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">মোট সংগ্রহ</p>
                <p className="text-2xl font-bold text-blue-600">{formatAmount(cashBalance?.totalCollection || 0)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">মোট জমা</p>
                <p className="text-2xl font-bold text-purple-600">{formatAmount(cashBalance?.totalDeposit || 0)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Landmark className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
          >
            <Landmark className="h-5 w-5" />
            ব্যাংকে জমা দিন
          </button>
          <button
            disabled
            className="flex items-center justify-center gap-2 p-4 bg-gray-400 text-white rounded-xl cursor-not-allowed opacity-50"
          >
            <RefreshCw className="h-5 w-5" />
            ডেইলি ক্লোজিং (শীঘ্রই আসছে)
          </button>
        </div>

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold">ব্যাংকে জমা দিন</h2>
                <p className="text-sm text-gray-500">আপনার হাতে থাকা টাকা ব্যাংকে জমা করুন</p>
              </div>
              
              <div className="p-6 space-y-5">
                <AmountInput
                  label="জমার পরিমাণ"
                  value={formData.amount}
                  onChange={(val) => setFormData(prev => ({ ...prev, amount: val }))}
                  required
                />
                
                <AccountSelector
                  type="bank"
                  value={formData.bankId}
                  onChange={(val) => setFormData(prev => ({ ...prev, bankId: val }))}
                  label="ব্যাংক অ্যাকাউন্ট"
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">নোট (ঐচ্ছিক)</label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="যেমন: ডেইলি কালেকশন জমা"
                  />
                </div>

                <div className="bg-yellow-50 rounded-lg p-3 flex items-start gap-2">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-700">
                    জমা দেওয়ার পর আপনার হাতে থাকা টাকা থেকে পরিমাণ কমে যাবে এবং ব্যাংক ব্যালেন্স বাড়বে।
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowDepositModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={handleDeposit}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    {submitting ? 'প্রক্রিয়াকরণ...' : 'জমা নিশ্চিত করুন'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashManagement;