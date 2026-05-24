// src/modules/finance/pages/BankAccounts.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/context/SomitySettingsProvider';
import { bankService } from '../services/bank.service';
import { 
  Plus, Building2, Landmark, Wallet, 
  Loader2, Search, X, CheckCircle, AlertCircle,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import FinanceStatsCard from '../components/common/FinanceStatsCard';
import type { BankAccount } from '../types';
import { Eye, XCircle } from 'lucide-react';

const BankAccounts: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData, currentMember } = useAuth();
  const { formatAmount } = useSomitySettings();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    branchName: '',
    accountType: 'savings' as 'savings' | 'current' | 'fixed',
    openingBalance: 0,
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = accounts.filter(acc =>
        acc.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.bankName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAccounts(filtered);
    } else {
      setFilteredAccounts(accounts);
    }
  }, [searchTerm, accounts]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await bankService.getAllAccounts();
      setAccounts(data);
      setFilteredAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('ব্যাংক অ্যাকাউন্ট লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (accountId: string, isActive: boolean) => {
    try {
      await bankService.toggleStatus(accountId, isActive);
      toast.success(`অ্যাকাউন্ট ${isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`);
      fetchAccounts();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.accountName.trim()) newErrors.accountName = 'অ্যাকাউন্টের নাম দিন';
    if (!formData.accountNumber.trim()) newErrors.accountNumber = 'অ্যাকাউন্ট নম্বর দিন';
    if (!formData.bankName.trim()) newErrors.bankName = 'ব্যাংকের নাম দিন';
    if (formData.openingBalance < 0) newErrors.openingBalance = 'প্রাথমিক ব্যালেন্স ০ বা তার বেশি হতে হবে';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      await bankService.createAccount({
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        branchName: formData.branchName,
        accountType: formData.accountType,
        openingBalance: formData.openingBalance,
        notes: formData.notes,
        createdBy: user?.uid || 'system',
        createdByName: currentMember?.fullName || userData?.fullName || 'System'
      });
      toast.success('✅ ব্যাংক অ্যাকাউন্ট সফলভাবে যোগ করা হয়েছে!');
      setShowModal(false);
      resetForm();
      fetchAccounts();
    } catch (error) {
      console.error('Error creating bank account:', error);
      toast.error('অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      accountName: '',
      accountNumber: '',
      bankName: '',
      branchName: '',
      accountType: 'savings',
      openingBalance: 0,
      notes: ''
    });
    setErrors({});
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.isActive ? acc.currentBalance : 0), 0);
  const activeAccounts = accounts.filter(acc => acc.isActive).length;

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
        {/* Header with Add Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ব্যাংক অ্যাকাউন্ট সমূহ</h1>
            <p className="text-gray-500 mt-1">সোমিটির ব্যাংক অ্যাকাউন্ট পরিচালনা করুন</p>
          </div>
          
          {/* ✅ Add Bank Account Button - Opens Modal */}
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
          >
            <Plus className="h-5 w-5" />
            নতুন ব্যাংক অ্যাকাউন্ট
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <FinanceStatsCard
            title="মোট ব্যালেন্স"
            value={totalBalance}
            icon={<Landmark className="h-6 w-6 text-green-600" />}
            color="hover:shadow-md"
          />
          <FinanceStatsCard
            title="মোট অ্যাকাউন্ট"
            value={accounts.length}
            icon={<Building2 className="h-6 w-6 text-blue-600" />}
            color="hover:shadow-md"
            subtitle={`${activeAccounts} টি সক্রিয়`}
          />
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-100">গড় ব্যালেন্স</p>
                <p className="text-2xl font-bold">
                  {formatAmount(accounts.length ? totalBalance / accounts.length : 0)}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="অ্যাকাউন্ট নাম, ব্যাংক বা অ্যাকাউন্ট নম্বর দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAccounts.map((account) => (
            <div key={account.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${
              !account.isActive ? 'opacity-70 bg-gray-50' : ''
            }`}>
              {/* Header */}
              <div className={`px-5 py-4 border-b ${account.isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-500'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-white" />
                    <h3 className="font-semibold text-white truncate">{account.accountName}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        // Toggle balance visibility - optional feature
                      }}
                      className="text-white/80 hover:text-white p-1 rounded"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Body */}
              <div className="p-5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">ব্যাংক</span>
                  <span className="font-medium">{account.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">অ্যাকাউন্ট নম্বর</span>
                  <span className="font-mono text-sm">••••{account.accountNumber.slice(-4)}</span>
                </div>
                {account.branchName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">শাখা</span>
                    <span className="text-sm">{account.branchName}</span>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">বর্তমান ব্যালেন্স</span>
                    <span className={`text-xl font-bold ${account.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {formatAmount(account.currentBalance)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-5 py-3 bg-gray-50 border-t flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {account.isActive ? (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" /> সক্রিয়
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-600">
                      <XCircle className="h-3 w-3" /> নিষ্ক্রিয়
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/finance/ledger/${account.id}`)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    লেজার দেখুন
                  </button>
                  <button
                    onClick={() => handleToggleStatus(account.id, !account.isActive)}
                    className={`text-xs ${account.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                  >
                    {account.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAccounts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border">
            <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">কোনো ব্যাংক অ্যাকাউন্ট পাওয়া যায়নি</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="mt-4 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              প্রথম অ্যাকাউন্ট যোগ করুন
            </button>
          </div>
        )}
      </div>

      {/* Add Bank Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">নতুন ব্যাংক অ্যাকাউন্ট</h2>
                <p className="text-sm text-gray-500">সোমিটির ব্যাংক অ্যাকাউন্ট তথ্য দিন</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  অ্যাকাউন্টের নাম <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
                      errors.accountName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="যেমন: আল-আমিন সোমিটি - চালান অ্যাকাউন্ট"
                  />
                </div>
                {errors.accountName && <p className="text-red-500 text-xs mt-1">{errors.accountName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ব্যাংকের নাম <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Landmark className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                      className={`w-full pl-10 pr-3 py-2.5 border rounded-xl ${
                        errors.bankName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="যেমন: ইসলামী ব্যাংক"
                    />
                  </div>
                  {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    শাখার নাম
                  </label>
                  <input
                    type="text"
                    value={formData.branchName}
                    onChange={(e) => setFormData(prev => ({ ...prev, branchName: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                    placeholder="শাখার নাম"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    অ্যাকাউন্ট নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-xl font-mono ${
                      errors.accountNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="অ্যাকাউন্ট নম্বর"
                  />
                  {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    অ্যাকাউন্ট টাইপ
                  </label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value as any }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                  >
                    <option value="savings">সেভিংস অ্যাকাউন্ট</option>
                    <option value="current">কারেন্ট অ্যাকাউন্ট</option>
                    <option value="fixed">ফিক্সড ডিপোজিট</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  প্রাথমিক ব্যালেন্স
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
                  <input
                    type="number"
                    value={formData.openingBalance || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, openingBalance: parseFloat(e.target.value) || 0 }))}
                    className={`w-full pl-8 pr-3 py-2.5 border rounded-xl ${
                      errors.openingBalance ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                </div>
                {errors.openingBalance && <p className="text-red-500 text-xs mt-1">{errors.openingBalance}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  নোট (ঐচ্ছিক)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl"
                    placeholder="অতিরিক্ত তথ্য"
                  />
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800">গুরুত্বপূর্ণ তথ্য</h4>
                  <p className="text-sm text-amber-700">
                    প্রাথমিক ব্যালেন্স দিলে তা সোমিটির সম্পত্তি হিসেবে গণ্য হবে। 
                    সঠিক তথ্য প্রদান করুন।
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                  {submitting ? 'যোগ হচ্ছে...' : 'অ্যাকাউন্ট যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccounts;