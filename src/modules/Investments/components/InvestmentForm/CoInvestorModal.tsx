// src/modules/Investments/components/InvestmentForm/CoInvestorModal.tsx

import React, { useState, useEffect } from 'react';
import { X, User, Users, Search, Banknote, Landmark, CreditCard, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { memberService } from '../../../members/services/memberService';
import { formatCurrencyAmount } from '../../utils/investmentHelpers';
import { useBankAccountsForSettings } from '../../../settings/hooks/useBankAccountsForSettings';

interface CoInvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (investor: any) => void;
  initialData?: any;
  somityProfitShare: number;
  existingTotalProfitShare: number;
  maxContribution: number;
  existingTotalContribution?: number;
}

const CoInvestorModal: React.FC<CoInvestorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  somityProfitShare,
  existingTotalProfitShare,
  maxContribution,
  existingTotalContribution = 0,
}) => {
  // ==================== STATE DECLARATIONS ====================
  
  // Basic investor info
  const [investorType, setInvestorType] = useState<'member' | 'external'>('member');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [memberId, setMemberId] = useState('');
  
  // Financial info
  const [contributedAmount, setContributedAmount] = useState<number>(0);
  const [profitSharePercentage, setProfitSharePercentage] = useState<number>(0);
  
  // Payment info
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDocUrl, setPaymentDocUrl] = useState('');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentNotes, setPaymentNotes] = useState('');
  
  // Bank transfer specific fields
  const [paymentBankAccountId, setPaymentBankAccountId] = useState('');
  const [paymentSenderBank, setPaymentSenderBank] = useState('');
  
  // Member search
  const [memberSearch, setMemberSearch] = useState('');
  const [memberList, setMemberList] = useState<any[]>([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  // File upload
  const [uploading, setUploading] = useState(false);
  
  // Get somity bank accounts from settings
  const { accounts: somityBankAccounts, loading: bankLoading } = useBankAccountsForSettings('somity');
  const activeBankAccounts = somityBankAccounts.filter(acc => acc.isActive);
  const selectedSomityAccount = activeBankAccounts.find(acc => acc.id === paymentBankAccountId);

  // ==================== EFFECTS ====================
  
  useEffect(() => {
    if (initialData) {
      setInvestorType(initialData.investorType || 'member');
      setName(initialData.name || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setAddress(initialData.address || '');
      setMemberId(initialData.memberId || '');
      setContributedAmount(initialData.contributedAmount || 0);
      setProfitSharePercentage(initialData.profitSharePercentage || 0);
      setPaymentMethod(initialData.paymentMethod || 'cash');
      setPaymentReference(initialData.paymentReference || '');
      setPaymentDocUrl(initialData.paymentDocUrl || '');
      setPaymentBankAccountId(initialData.paymentBankAccountId || '');
      setPaymentSenderBank(initialData.paymentSenderBank || '');
      setPaidAmount(initialData.paidAmount || initialData.contributedAmount || 0);
      setPaymentNotes(initialData.notes || '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  // Auto-set paidAmount when contributedAmount changes
  useEffect(() => {
    if (contributedAmount > 0 && paidAmount === 0 && !initialData) {
      setPaidAmount(contributedAmount);
    }
  }, [contributedAmount, initialData]);

  // ==================== HELPER FUNCTIONS ====================
  
  const resetForm = () => {
    setInvestorType('member');
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setMemberId('');
    setContributedAmount(0);
    setProfitSharePercentage(0);
    setPaymentMethod('cash');
    setPaymentReference('');
    setPaymentDocUrl('');
    setPaymentBankAccountId('');
    setPaymentSenderBank('');
    setPaidAmount(0);
    setPaymentNotes('');
    setMemberSearch('');
  };

  const searchMembers = async (query: string) => {
    if (!query.trim()) {
      setMemberList([]);
      setShowMemberDropdown(false);
      return;
    }
    setLoadingMembers(true);
    try {
      const allMembers = await memberService.getSimpleMembers();
      const filtered = allMembers.filter(
        (m: any) =>
          m.fullName.toLowerCase().includes(query.toLowerCase()) ||
          m.memberId.toLowerCase().includes(query.toLowerCase()) ||
          m.phone?.includes(query)
      );
      setMemberList(filtered.slice(0, 10));
      setShowMemberDropdown(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const selectMember = (member: any) => {
    setName(member.fullName);
    setMemberId(member.memberId);
    setPhone(member.phone || '');
    setEmail(member.email || '');
    setMemberSearch('');
    setShowMemberDropdown(false);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const fakeUrl = URL.createObjectURL(file);
      setPaymentDocUrl(fakeUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  // ✅ এই ফাংশনটি ঠিক আছে - 'submitted' বা 'under_review' রিটার্ন করে
  const getPaymentStatus = (paid: number, total: number) => {
    if (paid >= total) return 'submitted';
    if (paid > 0) return 'under_review';
    return 'submitted';
  };

  // ==================== SAVE HANDLER ====================
  
  const handleSave = () => {
    // Validations
    if (!name.trim()) {
      alert('দয়া করে নাম দিন');
      return;
    }
    if (contributedAmount <= 0) {
      alert('অবদানের পরিমাণ দিন');
      return;
    }
    if (profitSharePercentage <= 0) {
      alert('মুনাফার অংশ দিন');
      return;
    }
    
    const newTotalProfit = existingTotalProfitShare + profitSharePercentage;
    const maxAllowed = 100 - somityProfitShare;
    if (newTotalProfit > maxAllowed) {
      alert(`সহ-বিনিয়োগকারীদের মুনাফার অংশ মোট ${maxAllowed}% এর বেশি হতে পারে না। বর্তমানে বাকি ${maxAllowed - existingTotalProfitShare}%`);
      return;
    }
    
    const remainingMaxContribution = maxContribution - existingTotalContribution;
    if (contributedAmount > remainingMaxContribution) {
      alert(`সর্বোচ্চ অবদান রাখতে পারবেন ${formatCurrencyAmount(remainingMaxContribution)}`);
      return;
    }
    
    if (paymentMethod === 'bank' && !paymentBankAccountId) {
      alert('দয়া করে সমিতির ব্যাংক অ্যাকাউন্ট নির্বাচন করুন');
      return;
    }

    // ✅ এখানেই paymentStatus সেট করা হচ্ছে
    const paymentStatus = getPaymentStatus(paidAmount, contributedAmount);
    
    onSave({
      investorType,
      name,
      phone,
      email,
      address,
      memberId: investorType === 'member' ? memberId : undefined,
      contributedAmount,
      profitSharePercentage,
      paymentMethod,
      paymentReference: paymentReference || undefined,
      paymentDocUrl: paymentDocUrl || undefined,
      paymentBankAccountId: paymentMethod === 'bank' ? paymentBankAccountId : undefined,
      paymentSenderBank: paymentSenderBank || undefined,
      paidAmount: paidAmount,
      remainingAmount: contributedAmount - paidAmount,
      paymentStatus,  // ✅ 'submitted' or 'under_review'
      lastPaymentDate: paidAmount > 0 ? new Date().toISOString() : undefined,
      notes: paymentNotes || undefined,
    });
    onClose();
  };

  // ==================== RENDER ====================
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-slate-100 p-4 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">
            {initialData ? 'তথ্য সম্পাদনা করুন' : 'সহ-বিনিয়োগকারী যোগ করুন'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          
          {/* 1. INVESTOR TYPE */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">বিনিয়োগকারীর ধরন</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInvestorType('member')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 flex items-center justify-center gap-1.5 transition-all ${
                  investorType === 'member'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                <Users className="w-4 h-4" /> সমিতির সদস্য
              </button>
              <button
                type="button"
                onClick={() => setInvestorType('external')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 flex items-center justify-center gap-1.5 transition-all ${
                  investorType === 'external'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                <User className="w-4 h-4" /> বাহ্যিক ব্যক্তি
              </button>
            </div>
          </div>

          {/* 2. MEMBER SEARCH */}
          {investorType === 'member' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">সদস্য খুঁজুন</label>
              <div className="relative">
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    searchMembers(e.target.value);
                  }}
                  placeholder="নাম, আইডি বা ফোন দিয়ে খুঁজুন..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 pl-9"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                {showMemberDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {loadingMembers && <div className="p-3 text-center text-slate-500">লোড হচ্ছে...</div>}
                    {memberList.length === 0 && !loadingMembers && (
                      <div className="p-3 text-center text-slate-500">কোনো সদস্য পাওয়া যায়নি</div>
                    )}
                    {memberList.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => selectMember(member)}
                        className="w-full px-3 py-2 text-left hover:bg-slate-50 border-b last:border-b-0 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                          {member.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{member.fullName}</p>
                          <p className="text-xs text-slate-500">ID: {member.memberId} | {member.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {memberId && <p className="text-xs text-emerald-600 mt-1">নির্বাচিত সদস্য আইডি: {memberId}</p>}
            </div>
          )}

          {/* 3. FULL NAME */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">পূর্ণ নাম <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
              placeholder="বিনিয়োগকারীর পূর্ণ নাম"
            />
          </div>

          {/* 4. CONTACT INFO */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">মোবাইল নম্বর</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
                placeholder="০১XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ইমেইল</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* 5. ADDRESS */}
          {investorType === 'external' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">বর্তমান ঠিকানা</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
                placeholder="বর্তমান ঠিকানা বিস্তারিত"
              />
            </div>
          )}

          {/* 6. AMOUNT & PROFIT SHARE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">অবদানের পরিমাণ (৳) *</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={contributedAmount || ''}
                onChange={(e) => setContributedAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
              />
              <p className="text-xs text-slate-400 mt-1">সর্বোচ্চ: {formatCurrencyAmount(maxContribution - existingTotalContribution)}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">মুনাফার অংশ (%) *</label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={profitSharePercentage || ''}
                onChange={(e) => setProfitSharePercentage(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
              />
              <p className="text-xs text-slate-400 mt-1">বাকি: {Math.max(0, 100 - somityProfitShare - existingTotalProfitShare)}%</p>
            </div>
          </div>

          {/* 7. PAYMENT INFORMATION */}
          <div className="rounded-xl p-4 space-y-3 bg-slate-50 border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> সমিতিকে টাকা প্রদানের তথ্য
            </p>
            
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">পরিশোধের মাধ্যম <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === 'cash'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  <Banknote className="w-4 h-4" /> নগদ (ক্যাশ)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                    paymentMethod === 'bank'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  <Landmark className="w-4 h-4" /> ব্যাংক ট্রান্সফার
                </button>
              </div>
            </div>

            {/* Bank Account Selection */}
            {paymentMethod === 'bank' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">সমিতির ব্যাংক অ্যাকাউন্ট নির্বাচন করুন <span className="text-red-500">*</span></label>
                  <select
                    value={paymentBankAccountId}
                    onChange={(e) => setPaymentBankAccountId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 bg-white cursor-pointer"
                  >
                    <option value="">-- অ্যাকাউন্ট নির্বাচন করুন --</option>
                    {activeBankAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.bankName} - {acc.accountName} ({acc.accountNumber.slice(-4)})
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedSomityAccount && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium mb-1">নির্বাচিত অ্যাকাউন্ট:</p>
                    <p className="text-xs text-slate-700">{selectedSomityAccount.bankName} - {selectedSomityAccount.accountName}</p>
                    <p className="text-xs text-slate-500 font-mono">A/C: {selectedSomityAccount.accountNumber}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">প্রদানকারীর ব্যাংক তথ্য (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={paymentSenderBank}
                    onChange={(e) => setPaymentSenderBank(e.target.value)}
                    placeholder="যে ব্যাংক থেকে ট্রান্সফার করছেন"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            )}

            {/* Transaction Reference */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ট্র্যানজেকশন রেফারেন্স (ঐচ্ছিক)</label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder={paymentMethod === 'bank' ? "ব্যাংক ট্রান্সফার রেফারেন্স / TRX ID" : "নগদ রসিদ নম্বর"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
              />
            </div>

            {/* Paid Amount */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">পরিশোধিত পরিমাণ (৳) <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="0"
                max={contributedAmount}
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
              />
              
              <div className="mt-2">
                {paidAmount >= contributedAmount ? (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">✓ সম্পূর্ণ পরিশোধিত — {formatCurrencyAmount(paidAmount)} / {formatCurrencyAmount(contributedAmount)}</span>
                  </div>
                ) : paidAmount > 0 ? (
                  <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">⚠ আংশিক পরিশোধিত — বাকি: {formatCurrencyAmount(contributedAmount - paidAmount)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-2 rounded-lg">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">⏳ এখনো পরিশোধ করা হয়নি</span>
                  </div>
                )}
              </div>
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">প্রমাণপত্র আপলোড (ঐচ্ছিক)</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="flex-1 text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
                  disabled={uploading}
                />
                {uploading && <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">মন্তব্য (ঐচ্ছিক)</label>
              <textarea
                rows={2}
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="যেমন: কিস্তিতে পরিশোধের শর্ত"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* 8. SAVE BUTTON */}
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl text-white font-bold text-sm mt-2 transition-all bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600"
          >
            {initialData ? 'তথ্য সংরক্ষণ করুন' : 'সহ-বিনিয়োগকারী যোগ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoInvestorModal;