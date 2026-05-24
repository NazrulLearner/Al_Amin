// src/modules/finance/pages/FundTransfer.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/context/SomitySettingsProvider';
import { bankService } from '../services/bank.service';
import { cashService } from '../services/cash.service';
import { financeService } from '../services/financeService';
import { 
  ArrowLeft, ArrowRight, Landmark, Wallet, 
  RefreshCw, Loader2, AlertCircle,
  Building2, History, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import AmountInput from '../components/common/AmountInput';
import AccountSelector from '../components/common/AccountSelector';
import FinanceStatsCard from '../components/common/FinanceStatsCard';
import type { BankAccount } from '../types';

const FundTransfer: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData, currentMember } = useAuth();
  const { formatAmount } = useSomitySettings();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [cashBalance, setCashBalance] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: 0,
    fromType: 'bank' as 'bank' | 'cashier',
    fromId: '',
    toType: 'cashier' as 'bank' | 'cashier',
    toId: '',
    referenceNo: '',
    note: ''
  });
  const [transferHistory, setTransferHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bankList, cash] = await Promise.all([
        bankService.getAllAccounts(),
        cashService.getCashBalance(currentMember?.memberId || '')
      ]);
      setBanks(bankList.filter(b => b.isActive));
      setCashBalance(cash);
      
      const transactions = await financeService.getAllTransactions(10);
      setTransferHistory(transactions.filter(t => t.type === 'transfer'));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('ডাটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFormData(prev => ({
      ...prev,
      fromType: prev.toType,
      fromId: '',
      toType: prev.fromType,
      toId: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || formData.amount <= 0) {
      toast.error('সঠিক পরিমাণ দিন');
      return;
    }
    
    if (!formData.fromId) {
      toast.error('উৎস নির্বাচন করুন');
      return;
    }
    
    if (!formData.toId) {
      toast.error('গন্তব্য নির্বাচন করুন');
      return;
    }
    
    if (formData.fromType === formData.toType && formData.fromId === formData.toId) {
      toast.error('উৎস এবং গন্তব্য একই হতে পারে না');
      return;
    }
    
    // Check balance
    if (formData.fromType === 'bank') {
      const bank = banks.find(b => b.id === formData.fromId);
      if (bank && bank.currentBalance < formData.amount) {
        toast.error(`পর্যাপ্ত ব্যালেন্স নেই। উপলব্ধ: ${formatAmount(bank.currentBalance)}`);
        return;
      }
    } else {
      if (cashBalance && cashBalance.currentBalance < formData.amount) {
        toast.error(`পর্যাপ্ত ব্যালেন্স নেই। উপলব্ধ: ${formatAmount(cashBalance.currentBalance)}`);
        return;
      }
    }
    
    setSubmitting(true);
    try {
      await financeService.transferFunds({
        amount: formData.amount,
        fromType: formData.fromType,
        fromId: formData.fromId,
        toType: formData.toType,
        toId: formData.toId,
        paymentMethod: 'bank',
        referenceNo: formData.referenceNo || `TRF-${Date.now()}`,
        note: formData.note,
        createdBy: user?.uid || 'system',
        createdByName: currentMember?.fullName || userData?.fullName || 'System'
      });
      
      toast.success('✅ টাকা সফলভাবে ট্রান্সফার হয়েছে!');
      setFormData({
        amount: 0,
        fromType: 'bank',
        fromId: '',
        toType: 'cashier',
        toId: '',
        referenceNo: '',
        note: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error transferring:', error);
      toast.error('ট্রান্সফার করতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const getAccountName = (type: string, id: string): string => {
    if (type === 'bank') {
      const bank = banks.find(b => b.id === id);
      return bank?.accountName || 'অজানা ব্যাংক';
    }
    return 'ক্যাশিয়ার - হাতে নগদ';
  };

  const getAccountBalance = (type: string, id: string): number => {
    if (type === 'bank') {
      const bank = banks.find(b => b.id === id);
      return bank?.currentBalance || 0;
    }
    return cashBalance?.currentBalance || 0;
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/finance')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            ফিরে যান
          </button>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ফান্ড ট্রান্সফার</h1>
              <p className="text-gray-500 mt-1">এক অ্যাকাউন্ট থেকে অন্য অ্যাকাউন্টে টাকা স্থানান্তর করুন</p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <History className="h-4 w-4" />
              {showHistory ? 'ট্রান্সফার ফর্ম' : 'ইতিহাস দেখুন'}
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <FinanceStatsCard
            title="মোট ব্যাংক ব্যালেন্স"
            value={banks.reduce((sum, b) => sum + b.currentBalance, 0)}
            icon={<Landmark className="h-6 w-6 text-blue-600" />}
            color="hover:shadow-md"
          />
          <FinanceStatsCard
            title="হাতে নগদ"
            value={cashBalance?.currentBalance || 0}
            icon={<Wallet className="h-6 w-6 text-green-600" />}
            color="hover:shadow-md"
          />
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-100">মোট ট্রান্সফার (এ পর্যন্ত)</p>
                <p className="text-2xl font-bold">
                  {formatAmount(transferHistory.reduce((sum, t) => sum + t.amount, 0))}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <RefreshCw className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Form or History */}
        {!showHistory ? (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Amount */}
              <AmountInput
                label="ট্রান্সফার পরিমাণ"
                value={formData.amount}
                onChange={(val) => setFormData(prev => ({ ...prev, amount: val }))}
                required
              />

              {/* Transfer Direction */}
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* From Section */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <ArrowRight className="h-4 w-4 text-red-600 rotate-180" />
                      </div>
                      <span className="font-semibold text-gray-700">উৎস (থেকে)</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, fromType: 'bank', fromId: '' }))}
                          className={`flex-1 p-2 rounded-lg text-sm font-medium transition-all ${
                            formData.fromType === 'bank'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          <Building2 className="h-4 w-4 inline mr-1" />
                          ব্যাংক
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, fromType: 'cashier', fromId: '' }))}
                          className={`flex-1 p-2 rounded-lg text-sm font-medium transition-all ${
                            formData.fromType === 'cashier'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          <Wallet className="h-4 w-4 inline mr-1" />
                          ক্যাশ
                        </button>
                      </div>
                      
                      <AccountSelector
                        type={formData.fromType}
                        value={formData.fromId}
                        onChange={(val) => setFormData(prev => ({ ...prev, fromId: val }))}
                        placeholder={formData.fromType === 'bank' ? 'ব্যাংক অ্যাকাউন্ট নির্বাচন' : 'ক্যাশিয়ার নির্বাচন'}
                        required
                      />
                      
                      {formData.fromId && (
                        <div className="text-sm text-gray-600">
                          উপলব্ধ ব্যালেন্স: <span className="font-bold text-green-600">
                            {formatAmount(getAccountBalance(formData.fromType, formData.fromId))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <button
                      type="button"
                      onClick={handleSwap}
                      className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                    >
                      <RefreshCw className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>

                  {/* To Section */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <ArrowRight className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-semibold text-gray-700">গন্তব্য (থেকে)</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, toType: 'bank', toId: '' }))}
                          className={`flex-1 p-2 rounded-lg text-sm font-medium transition-all ${
                            formData.toType === 'bank'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          <Building2 className="h-4 w-4 inline mr-1" />
                          ব্যাংক
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, toType: 'cashier', toId: '' }))}
                          className={`flex-1 p-2 rounded-lg text-sm font-medium transition-all ${
                            formData.toType === 'cashier'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          <Wallet className="h-4 w-4 inline mr-1" />
                          ক্যাশ
                        </button>
                      </div>
                      
                      <AccountSelector
                        type={formData.toType}
                        value={formData.toId}
                        onChange={(val) => setFormData(prev => ({ ...prev, toId: val }))}
                        placeholder={formData.toType === 'bank' ? 'ব্যাংক অ্যাকাউন্ট নির্বাচন' : 'ক্যাশিয়ার নির্বাচন'}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reference & Note */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    রেফারেন্স নম্বর (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={formData.referenceNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, referenceNo: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="যেমন: INV-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    নোট (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={formData.note}
                    onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="অতিরিক্ত তথ্য"
                  />
                </div>
              </div>

              {/* Preview */}
              {formData.amount > 0 && formData.fromId && formData.toId && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-800 mb-2">📋 ট্রান্সফার প্রিভিউ</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">পরিমাণ:</span>
                      <span className="font-bold text-green-600">{formatAmount(formData.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">উৎস:</span>
                      <span>{getAccountName(formData.fromType, formData.fromId)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">গন্তব্য:</span>
                      <span>{getAccountName(formData.toType, formData.toId)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800">গুরুত্বপূর্ণ তথ্য</h4>
                  <p className="text-sm text-amber-700">
                    ট্রান্সফার সম্পন্ন হওয়ার পর তা পূর্বাবস্থায় ফেরানো যাবে না। 
                    সঠিক তথ্য প্রদান করুন এবং যথেষ্ট ব্যালেন্স আছে কিনা নিশ্চিত করুন।
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/finance')}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                  {submitting ? 'ট্রান্সফার হচ্ছে...' : 'ট্রান্সফার করুন'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Transfer History Table */
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <History className="h-5 w-5" />
                ট্রান্সফার ইতিহাস
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">তারিখ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">থেকে</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">থেকে</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">পরিমাণ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">রেফারেন্স</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transferHistory.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm">
                        {new Date(tx.createdAt).toLocaleDateString('bn-BD')}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {tx.from?.type === 'bank' ? <Building2 className="h-4 w-4 text-blue-500" /> : <Wallet className="h-4 w-4 text-green-500" />}
                          <span className="text-sm">{tx.from?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {tx.to?.type === 'bank' ? <Building2 className="h-4 w-4 text-blue-500" /> : <Wallet className="h-4 w-4 text-green-500" />}
                          <span className="text-sm">{tx.to?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-green-600">
                        {formatAmount(tx.amount)}
                      </td>
                      <td className="px-6 py-3 text-sm font-mono">{tx.referenceNo || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {transferHistory.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">কোনো ট্রান্সফার ইতিহাস নেই</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FundTransfer;