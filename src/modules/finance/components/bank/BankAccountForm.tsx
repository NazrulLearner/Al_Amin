// src/modules/finance/components/bank/BankAccountForm.tsx

import React, { useState } from 'react';
import { Building2, Landmark, FileText, AlertCircle, Loader2, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../../../../app/providers/AuthProvider';
import { bankService } from '../../services/bank.service';
import { toast } from 'sonner';

interface BankAccountFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({ 
  onSuccess, 
  onCancel, 
  initialData, 
  isEditing 
}) => {
  const { user, userData, currentMember } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountName: initialData?.accountName || '',
    accountNumber: initialData?.accountNumber || '',
    bankName: initialData?.bankName || '',
    branchName: initialData?.branchName || '',
    accountType: initialData?.accountType || 'savings',
    openingBalance: initialData?.openingBalance || 0,
    notes: initialData?.notes || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    
    setLoading(true);
    try {
      await bankService.createAccount({
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        branchName: formData.branchName,
        accountType: formData.accountType as any,
        openingBalance: formData.openingBalance,
        notes: formData.notes,
        createdBy: user?.uid || 'system',
        createdByName: currentMember?.fullName || userData?.fullName || 'System'
      });
      toast.success('✅ ব্যাংক অ্যাকাউন্ট সফলভাবে যোগ করা হয়েছে!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating bank account:', error);
      toast.error('অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
            onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value }))}
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
        <p className="text-xs text-gray-400 mt-1">অ্যাকাউন্ট খোলার সময় প্রাথমিক ব্যালেন্স (যদি থাকে)</p>
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
            rows={3}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl"
            placeholder="অতিরিক্ত তথ্য যেমন: অ্যাকাউন্ট খোলার তারিখ, শাখা কোড ইত্যাদি"
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
            সঠিক তথ্য প্রদান করুন, পরবর্তীতে পরিবর্তন করতে সমস্যা হতে পারে।
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <X className="h-4 w-4" />
            বাতিল
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
          {loading ? 'যুক্ত হচ্ছে...' : (isEditing ? 'আপডেট করুন' : 'অ্যাকাউন্ট যোগ করুন')}
        </button>
      </div>
    </form>
  );
};

export default BankAccountForm;