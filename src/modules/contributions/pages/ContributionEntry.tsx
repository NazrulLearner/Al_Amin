// src/modules/contributions/pages/ContributionEntry.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Loader2, Hash, FileText, UserCheck, Calendar } from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSomitySettings } from '../../../app/context/SomitySettingsProvider';
import { memberService } from '../../members/services/memberService';
import { memberDueService } from '../services/memberDueService';
import { feesService } from '../services/contributionService';
import { toast } from 'sonner';

// 🧮 Calculator utilities
import {
  calculatePaymentMonths,
  calculateTotalAmount,
  parseFiscalYearStart,
  generateReceiptId,
} from '../../../utils/calculations/contributionCalculator';

// 🛡️ Validator
import { validateContributionEntry } from '../../../utils/validators/contributionValidator';

// 🧩 Components
import MemberSearchCard from '../components/MemberSearchCard';
import type { SimpleMember as MemberCardSimpleMember } from '../components/MemberSearchCard';
import ContributionStatusCard from '../components/ContributionStatusCard';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import MonthSelector from '../components/MonthSelector';
import CollectionStatusSection from '../components/CollectionStatusSection';
import ContributionSummary from '../components/ContributionSummary';
import CollectorSelect from '../components/CollectorSelect';


import type { CollectorAssignment } from '../../../types';
import type { BankAccount } from '../../../types/settings';

// Types
interface SimpleMember extends MemberCardSimpleMember {
  dateOfJoin: string;
  status?: string;
}

interface FeeStatus {
  startMonth: string;
  startYear: number;
  totalMonths: number;
  paidMonths: { month: string; year: number }[];
  paidCount: number;
  lastPaidMonth: string;
  lastPaidYear: number;
  nextDueMonth: string;
  nextDueYear: number;
  dueMonths: { month: string; year: number }[];
  totalDue: number;
  monthlyFee: number;
}

type PayType = 'cash' | 'bank' | 'bikash' | 'nogod' | 'rocket' | 'other';
type CollectionStatusType = 'collected' | 'deposited' | 'transferred';

interface FormData {
  paymentDate: string;
  payType: PayType;
  collectionStatus: CollectionStatusType;
  bankName: string;
  bankAccountId: string;
  bankAccountName: string;
  bankReference: string;
  depositDate: string;
  depositorName: string;
  depositorId: string;
  referenceNo: string;
  remarks: string;
  numberOfMonths: number;
  startMonth: string;
  startYear: number;
  calculatedMonths: { month: string; year: number; amount: number }[];
  totalAmount: number;
}

const INITIAL_FORM_DATA: FormData = {
  paymentDate: new Date().toISOString().split('T')[0],
  payType: 'cash',
  collectionStatus: 'collected',
  bankName: '',
  bankAccountId: '',
  bankAccountName: '',
  bankReference: '',
  depositDate: new Date().toISOString().split('T')[0],
  depositorName: '',
  depositorId: '',
  referenceNo: '',
  remarks: '',
  numberOfMonths: 1,
  startMonth: '',
  startYear: new Date().getFullYear(),
  calculatedMonths: [],
  totalAmount: 0,
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================

const ContributionEntry: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData, currentMember } = useAuth();
  const { settings } = useSomitySettings();

  // --- State ---
  const [members, setMembers] = useState<SimpleMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<SimpleMember | null>(null);
  const [feeStatus, setFeeStatus] = useState<FeeStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showMemberList, setShowMemberList] = useState(false);
  const [generatedReceiptId, setGeneratedReceiptId] = useState('');
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>('');
  const [showDepositorList, setShowDepositorList] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  // --- Settings ---
  const collectionSettings = settings?.collection;
  const allowedPaymentMethods = collectionSettings?.allowedPaymentMethods || ['cash', 'bank', 'bikash', 'nogod', 'rocket'];
  const autoGenerateReceipt = collectionSettings?.autoGenerateReceipt ?? true;
  const receiptPrefix = collectionSettings?.receiptPrefix || 'RCPT-';
  const receiptFooter = collectionSettings?.receiptFooter || '';
  
  // Collector settings
  const collectorSettings = settings?.collection?.collectorSettings;
  const collectorEnabled = collectorSettings?.enabled ?? false;
  const activeCollectors: CollectorAssignment[] = collectorSettings?.collectors?.filter((c: CollectorAssignment) => c.isActive) || [];
  const selectedCollector = activeCollectors.find(c => c.id === selectedCollectorId);
  const somityBankAccounts: BankAccount[] = (settings?.bankAccounts || []).filter((account: BankAccount) => account.isActive);
  const collectorBankAccounts: BankAccount[] = settings?.collectorBanking?.useCollectorBankAccounts
    ? (settings?.collectorBanking?.collectorBankAccounts || []).filter((account: BankAccount) =>
        account.isActive && selectedCollector?.memberId && account.collectorMemberId === selectedCollector.memberId
      )
    : [];
  const bankAccountsForSelection: BankAccount[] =
    formData.payType === 'bank' && formData.collectionStatus === 'collected'
      ? collectorBankAccounts
      : formData.collectionStatus === 'deposited'
      ? somityBankAccounts
      : [];
  const bankAccountContextLabel =
    formData.payType === 'bank' && formData.collectionStatus === 'collected'
      ? 'Collector bank account'
      : 'Somity bank account';

  const { startMonth: somityStartMonth, startYear: somityStartYear } = parseFiscalYearStart(
    settings?.financial?.fiscalYearStart || 'July-2021'
  );

  const currentYear = new Date().getFullYear();
  const shouldShowBankDepositFields = formData.payType === 'bank' && formData.collectionStatus === 'deposited';
  const depositorSearch = formData.depositorName.trim().toLowerCase();
  const filteredDepositors = depositorSearch
    ? members
        .filter(member =>
          member.fullName.toLowerCase().includes(depositorSearch) ||
          member.memberId.toLowerCase().includes(depositorSearch)
        )
        .slice(0, 8)
    : members.slice(0, 8);

  // --- Effects ---
  useEffect(() => {
    loadMembers();
  }, []);

  // Generate receipt ID
  useEffect(() => {
    if (autoGenerateReceipt && selectedMember) {
      setGeneratedReceiptId(generateReceiptId(receiptPrefix));
    } else {
      setGeneratedReceiptId('');
    }
  }, [autoGenerateReceipt, selectedMember, receiptPrefix]);

  // Calculate months
  useEffect(() => {
    if (formData.startMonth && formData.startYear && formData.numberOfMonths > 0 && selectedMember) {
      const months = calculatePaymentMonths(
        formData.startMonth,
        formData.startYear,
        formData.numberOfMonths,
        selectedMember.monthlyFee
      );
      const total = calculateTotalAmount(months);
      setFormData(prev => ({ ...prev, calculatedMonths: months, totalAmount: total }));
    }
  }, [formData.numberOfMonths, formData.startMonth, formData.startYear, selectedMember]);

  // Close member list on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.member-search-area')) {
        setShowMemberList(false);
      }
      if (!target.closest('.depositor-search-area')) {
        setShowDepositorList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Data Fetching ---
  const loadMembers = async () => {
    try {
      const membersData = await memberService.getSimpleMembers();
      setMembers(membersData as SimpleMember[]);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('সদস্য লোড করতে ব্যর্থ');
    }
  };

  const loadMemberFeeStatus = async (member: SimpleMember) => {
    try {
      const status = await memberDueService.getMemberFeeStatus(
        member.memberId,
        somityStartMonth,
        somityStartYear
      );
      setFeeStatus({ ...status, monthlyFee: member.monthlyFee });

      setFormData(prev => ({
        ...prev,
        startMonth: status.nextDueMonth || somityStartMonth,
        startYear: status.nextDueYear || somityStartYear,
        numberOfMonths: 1,
      }));
    } catch (error) {
      console.error('Error loading fee status:', error);
      toast.error('অবদান স্ট্যাটাস লোড করতে ব্যর্থ');
    }
  };

  // --- Handlers ---
  const handleSelectMember = async (member: MemberCardSimpleMember) => {
    const fullMember = member as SimpleMember;
    setSelectedMember(fullMember);
    setSearchTerm('');
    setShowMemberList(false);
    setSelectedCollectorId('');
    await loadMemberFeeStatus(fullMember);
  };

  const handleSelectDepositor = (member: SimpleMember) => {
    setFormData(prev => ({
      ...prev,
      depositorName: member.fullName,
      depositorId: member.memberId,
    }));
    setShowDepositorList(false);
  };

  const handleSelectBankAccount = (accountId: string) => {
    const account = bankAccountsForSelection.find(item => item.id === accountId);
    setFormData(prev => ({
      ...prev,
      bankAccountId: account?.id || '',
      bankAccountName: account?.accountName || '',
      bankName: account ? `${account.bankName} - ${account.accountName}` : '',
    }));
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    setFeeStatus(null);
    setSelectedCollectorId('');
  };

  const handleResetForm = () => {
    handleClearMember();
    setFormData(INITIAL_FORM_DATA);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember) return;

    const validation = validateContributionEntry({
      memberId: selectedMember.memberId,
      memberName: selectedMember.fullName,
      calculatedMonths: formData.calculatedMonths,
      totalAmount: formData.totalAmount,
      payType: formData.payType,
      collectionStatus: formData.collectionStatus,
      bankAccountId: formData.bankAccountId,
      bankName: formData.bankName,
      bankReference: formData.bankReference,
      paymentDate: formData.paymentDate,
      depositDate: shouldShowBankDepositFields ? formData.depositDate : undefined,
      depositorId: shouldShowBankDepositFields ? formData.depositorId : undefined,
      referenceNo: formData.referenceNo || (shouldShowBankDepositFields ? formData.bankReference : undefined),
      existingPaidMonths: feeStatus?.paidMonths,
      collectorEnabled: collectorEnabled,
      hasCollectors: activeCollectors.length > 0,
      selectedCollectorId: selectedCollectorId,
    });

    if (!validation.isValid) {
      validation.errors.forEach((err: string) => toast.error(err));
      return;
    }

    setSubmitting(true);

    try {
      // Current user (who is entering the data into system)
      const currentUserName = currentMember?.fullName || userData?.fullName || 'System';
      const currentUserMemberId = currentMember?.memberId || 'SYS';
      const currentUserId = user?.uid || 'system';
      
      // Selected collector (who collected the money from member)
      const result = await feesService.addFeePayment({
        // Member info
        memberId: selectedMember.memberId,
        memberName: selectedMember.fullName,
        
        // Payment info
        months: formData.calculatedMonths,
        totalAmount: formData.totalAmount,
        paymentType: formData.payType,
        paymentDate: formData.paymentDate,
        referenceNo: formData.referenceNo || undefined,
        remarks: formData.remarks || undefined,
        memberShare: selectedMember.shareCount,
        
        // ENTERED BY = Current user (who is using the system)
        enteredById: currentUserId,
        enteredByName: currentUserName,
        enteredByMemberId: currentUserMemberId,
        
        // COLLECTOR = Selected collector (who collected money from member)
        collectorId: selectedCollector?.id,
        collectorName: selectedCollector?.memberName,
        collectorMemberId: selectedCollector?.memberId,
        
        // Receipt settings
        receiptId: autoGenerateReceipt ? generatedReceiptId : undefined,
        receiptFooter: receiptFooter,
        receiptPrefix: receiptPrefix,
        
        // Collection status
        collectionStatus: formData.collectionStatus,
        bankAccountId: formData.bankAccountId || undefined,
        bankAccountName: formData.bankAccountName || undefined,
        bankName: formData.bankName || undefined,
        bankReference: formData.bankReference || undefined,
        depositDate: shouldShowBankDepositFields ? formData.depositDate : undefined,
        depositorName: shouldShowBankDepositFields ? formData.depositorName : undefined,
        depositorId: shouldShowBankDepositFields ? formData.depositorId : undefined,
      });

      toast.success(
        <div>
          <p className="font-semibold">✅ অবদান জমা সফল!</p>
          <p className="text-sm">{formData.numberOfMonths} মাসের অবদান জমা হয়েছে</p>
          <p className="text-xs font-mono mt-1">রসিদ নং: {result.receiptId}</p>
        </div>
      );

      setTimeout(() => {
        navigate(`/fees/receipt/${result.receiptId}`);
      }, 1500);
    } catch (error: any) {
      console.error('Error recording contribution:', error);
      toast.error(error.message || 'অবদান জমা করতে ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = formData.calculatedMonths.length > 0 && selectedMember !== null && !!formData.paymentDate;

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">অবদান জমা</h1>
          <p className="text-gray-600">সদস্যের মাসিক অবদান জমা দিন ও রসিদ প্রিন্ট করুন</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-1 space-y-6 member-search-area">
            <MemberSearchCard
              members={members}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedMember={selectedMember}
              onSelectMember={handleSelectMember}
              onClearMember={handleClearMember}
              showMemberList={showMemberList}
              onShowMemberListChange={setShowMemberList}
            />
            <ContributionStatusCard feeStatus={feeStatus} />
          </div>

          {/* RIGHT COLUMN - ENTRY FORM */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  অবদান জমা ফরম
                </h2>
                <p className="text-sm text-gray-500 mt-1">সঠিক তথ্য প্রদান করুন</p>
              </div>

              <div className="p-6">
                {selectedMember && feeStatus ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Receipt ID + Payment Date + Payment Method */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FileText className="h-4 w-4 inline mr-1" />
                          রসিদ নম্বর
                        </label>
                        {autoGenerateReceipt ? (
                          <div className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-mono text-sm">
                            {generatedReceiptId || 'উৎপন্ন হচ্ছে...'}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={formData.referenceNo}
                            onChange={(e) => setFormData(prev => ({ ...prev, referenceNo: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="রসিদ নম্বর দিন"
                            required
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          জমার তারিখ
                        </label>
                        <input
                          type="date"
                          value={formData.paymentDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <PaymentMethodSelector
                        allowedMethods={allowedPaymentMethods}
                        selectedMethod={formData.payType}
                        onSelect={(method) => setFormData(prev => ({
                          ...prev,
                          payType: method as PayType,
                          bankAccountId: '',
                          bankAccountName: '',
                          bankName: '',
                        }))}
                      />
                    </div>

                    {/* Reference for non-cash */}
                    {['bank', 'bikash', 'nogod', 'rocket'].includes(formData.payType) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Hash className="h-4 w-4 inline mr-1" />
                          ট্রানজেকশন আইডি / রেফারেন্স নম্বর
                        </label>
                        <input
                          type="text"
                          value={formData.referenceNo}
                          onChange={(e) => setFormData(prev => ({ ...prev, referenceNo: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="যেমন: Bkash TRXID123456, Bank Chq#001"
                        />
                      </div>
                    )}

                    {/* Collector Selection - needed before collector bank account filtering */}
                    {collectorEnabled && (
                      <CollectorSelect
                        collectors={activeCollectors}
                        selectedCollectorId={selectedCollectorId}
                        onSelect={(collectorId) => {
                          setSelectedCollectorId(collectorId);
                          setFormData(prev => ({
                            ...prev,
                            bankAccountId: '',
                            bankAccountName: '',
                            bankName: '',
                          }));
                        }}
                        isRequired={activeCollectors.length > 0}
                      />
                    )}

                    {/* Collection Status */}
                    <CollectionStatusSection
                      collectionStatus={formData.collectionStatus}
                      payType={formData.payType}
                      bankName={formData.bankName}
                      bankReference={formData.bankReference}
                      bankAccounts={bankAccountsForSelection}
                      selectedBankAccountId={formData.bankAccountId}
                      bankAccountContextLabel={bankAccountContextLabel}
                      onStatusChange={(status) => setFormData(prev => ({
                        ...prev,
                        collectionStatus: status,
                        bankAccountId: '',
                        bankAccountName: '',
                        bankName: '',
                      }))}
                      onBankInfoChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
                      onBankAccountSelect={handleSelectBankAccount}
                    />

                    {shouldShowBankDepositFields && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-green-800 mb-4 flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          ব্যাংকে জমার তথ্য
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              জমার তারিখ <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={formData.depositDate}
                              onChange={(e) => setFormData(prev => ({ ...prev, depositDate: e.target.value }))}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              required
                            />
                          </div>

                          <div className="relative depositor-search-area">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              জমাদানকারী সদস্য <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.depositorName}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  depositorName: e.target.value,
                                  depositorId: '',
                                }));
                                setShowDepositorList(true);
                              }}
                              onFocus={() => setShowDepositorList(true)}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              placeholder="নাম টাইপ করুন"
                              required
                            />

                            {showDepositorList && (
                              <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                                {filteredDepositors.length > 0 ? (
                                  filteredDepositors.map(member => (
                                    <button
                                      key={member.memberId}
                                      type="button"
                                      onClick={() => handleSelectDepositor(member)}
                                      className="w-full px-3 py-2 text-left hover:bg-green-50 border-b border-gray-100 last:border-b-0"
                                    >
                                      <p className="text-sm font-medium text-gray-900">{member.fullName}</p>
                                      <p className="text-xs text-gray-500">ID: {member.memberId}</p>
                                    </button>
                                  ))
                                ) : (
                                  <p className="px-3 py-2 text-sm text-gray-500">কোনো সদস্য পাওয়া যায়নি</p>
                                )}
                              </div>
                            )}
                            {formData.depositorId && (
                              <p className="text-xs text-green-700 mt-1">Selected ID: {formData.depositorId}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Month Selector */}
                    <MonthSelector
                      startMonth={formData.startMonth}
                      startYear={formData.startYear}
                      numberOfMonths={formData.numberOfMonths}
                      calculatedMonths={formData.calculatedMonths}
                      somityStartYear={somityStartYear}
                      currentYear={currentYear}
                      onMonthChange={(month) => setFormData(prev => ({ ...prev, startMonth: month }))}
                      onYearChange={(year) => setFormData(prev => ({ ...prev, startYear: year }))}
                      onCountChange={(count) => setFormData(prev => ({ ...prev, numberOfMonths: count }))}
                    />

                    {/* Amount Summary */}
                    <ContributionSummary
                      monthlyFee={selectedMember.monthlyFee}
                      numberOfMonths={formData.numberOfMonths}
                      totalAmount={formData.totalAmount}
                    />

                    {/* Selected Collector Info - Blue background */}
                    {collectorEnabled && selectedCollectorId && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <UserCheck className="h-5 w-5 text-blue-600" />
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <span>
                              <strong>নির্বাচিত কালেক্টর:</strong>{' '}
                              {activeCollectors.find(c => c.id === selectedCollectorId)?.memberName || 'N/A'}
                            </span>
                            <span className="text-gray-300">|</span>
                            <span>
                              <strong>কালেক্টর আইডি:</strong>{' '}
                              {activeCollectors.find(c => c.id === selectedCollectorId)?.memberId || 'N/A'}
                            </span>
                            <span className="text-gray-300">|</span>
                            <span>
                              <strong>তারিখ:</strong> {new Date().toLocaleDateString('bn-BD')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Entry Info - Who entered the data (current user) - Gray background */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <FileText className="h-5 w-5 text-green-500" />
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          <span><strong>প্রবেশকারী:</strong> {currentMember?.fullName || userData?.fullName || 'System'}</span>
                          <span className="text-gray-300">|</span>
                          <span><strong>আইডি:</strong> {currentMember?.memberId || 'SYS'}</span>
                          <span className="text-gray-300">|</span>
                          <span><strong>তারিখ:</strong> {new Date().toLocaleDateString('bn-BD')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Remarks */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        মন্তব্য (ঐচ্ছিক)
                      </label>
                      <textarea
                        value={formData.remarks}
                        onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="যেমন: অগ্রিম জমা, ব্যাংক এর মাধ্যমে, চেক নং ইত্যাদি..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                      >
                        <X className="h-4 w-4 inline mr-2" />
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !isFormValid}
                        className="px-8 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md"
                      >
                        {submitting ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Save className="h-5 w-5" />
                        )}
                        {submitting
                          ? 'প্রক্রিয়াধীন...'
                          : `৳${formData.totalAmount.toLocaleString()} জমা দিন`}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Empty State */
                  <div className="text-center py-20 text-gray-500">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserCheck className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-600">সদস্য নির্বাচন করুন</p>
                    <p className="text-sm text-gray-400 mt-1">বাম পাশ থেকে একজন সদস্য নির্বাচন করুন</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionEntry;
