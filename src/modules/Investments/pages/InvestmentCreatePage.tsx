// src/modules/Investments/pages/InvestmentCreatePage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Info } from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useInvestments } from '../hooks/useInvestments';
import InvestmentCoreSection from '../components/InvestmentForm/InvestmentCoreSection';
import MoneySourceSection from '../components/InvestmentForm/MoneySourceSection';
import ProfitDistributionSection from '../components/InvestmentForm/ProfitDistributionSection';
import CoInvestorSection from '../components/InvestmentForm/CoInvestorSection';
import CoInvestorModal from '../components/InvestmentForm/CoInvestorModal';
import ManagementSection from '../components/InvestmentForm/ManagementSection';
import { calculateExpectedProfit, getRandomId } from '../utils/investmentHelpers';
import { toast } from 'sonner';
import type { CreateInvestmentRequest, CoInvestor } from '../types/investment.types';

const SECTIONS = [
  { id: 'core', name: 'মূল বিনিয়োগ' },
  { id: 'moneySource', name: 'অর্থের উৎস' },
  { id: 'profitDist', name: 'লাভ বণ্টন' },
  { id: 'management', name: 'পরিচালনা' },
];

const InvestmentCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { createInvestment } = useInvestments();
  const { user, userData, currentMember } = useAuth();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    investmentName: '',
    referenceNo: '',
    category: 'fixed_deposit' as any,
    investmentPlace: '',
    purpose: '',
    totalAmount: 0,
    startDate: '',
    durationMonths: 0,
    maturityDate: '',
    description: '',
    profitType: 'percentage' as any,
    profitRate: 0,
    profitPaymentFrequency: 'on_maturity' as any,
    somityContribution: 0,
    moneySource: 'bank' as any,
    bankAccountId: '',
    bankName: '',
    bankBranch: '',
    accountNumber: '',
    accountType: 'savings',
    accountHolderName: '',
    chequeNo: '',
    cashAmount: 0,
    cashVault: '',
    cashReceivedBy: '',
    cashReceiptNo: '',
    bankAmount: 0,
    somityProfitShare: 60,
    managementType: 'somity_direct' as any,
    committeeHead: '',
    committeeMembers: '',
    riskLevel: 'medium' as any,
    riskAssessmentNotes: '',
    remarks: '',
  });

  const [coInvestors, setCoInvestors] = useState<CoInvestor[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = (key: string, value: any) => {
    setForm((prev) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const totalAmount = form.totalAmount;
  const somityContribution = form.somityContribution;
  const expectedProfit = calculateExpectedProfit(
    totalAmount, 
    form.profitType, 
    form.profitRate, 
    form.durationMonths || 12
  );
  
  const totalCoProfitShare = coInvestors.reduce((sum, c) => sum + (c.profitSharePercentage || 0), 0);
  const totalCoContribution = coInvestors.reduce((sum, c) => sum + (c.contributedAmount || 0), 0);
  const maxCoContribution = totalAmount - somityContribution;

  const openModal = (editIndex?: number) => {
    setEditingIndex(editIndex ?? null);
    setModalOpen(true);
  };

  const handleSaveCoInvestor = (investor: CoInvestor) => {
    if (editingIndex !== null) {
      const updated = [...coInvestors];
      updated[editingIndex] = { ...investor, id: updated[editingIndex].id || getRandomId() };
      setCoInvestors(updated);
    } else {
      setCoInvestors([...coInvestors, { ...investor, id: getRandomId() }]);
    }
    setModalOpen(false);
    setEditingIndex(null);
  };

  const handleDeleteCoInvestor = (index: number) => {
    setCoInvestors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditCoInvestor = (index: number) => {
    setEditingIndex(index);
    setModalOpen(true);
  };

  const completedSections = () => {
    const completed: string[] = [];
    if (form.investmentName && form.totalAmount > 0 && form.startDate) completed.push('core');
    if (form.somityContribution > 0) completed.push('moneySource');
    if (form.somityProfitShare > 0) completed.push('profitDist');
    if (form.managementType) completed.push('management');
    return completed;
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.investmentName) {
      toast.error('বিনিয়োগের নাম দিন');
      return;
    }
    if (!form.investmentPlace) {
      toast.error('বিনিয়োগের স্থান/প্রতিষ্ঠানের নাম দিন');
      return;
    }
    if (!form.totalAmount || form.totalAmount <= 0) {
      toast.error('মোট পরিমাণ দিন');
      return;
    }
    if (!form.startDate) {
      toast.error('শুরুর তারিখ দিন');
      return;
    }
    if (!form.somityContribution || form.somityContribution <= 0) {
      toast.error('সমিতির অবদান দিন');
      return;
    }
    if (form.somityContribution > form.totalAmount) {
      toast.error('সমিতির অবদান মোট পরিমাণের বেশি হতে পারে না');
      return;
    }
    if (form.profitRate <= 0) {
      toast.error('লাভের হার দিন');
      return;
    }
    
    const totalCoProfit = coInvestors.reduce((s, c) => s + (c.profitSharePercentage || 0), 0);
    const maxCoProfit = 100 - form.somityProfitShare;
    if (coInvestors.length > 0 && totalCoProfit > maxCoProfit) {
      toast.error(`সহ-বিনিয়োগকারীদের মুনাফার অংশ (${totalCoProfit}%) বরাদ্দকৃত ${maxCoProfit}% এর বেশি`);
      return;
    }

    setSaving(true);
    try {
      // ✅ সব undefined/null ভ্যালুকে ফাঁকা string বা 0 এ রূপান্তর
      const request: CreateInvestmentRequest = {
        investmentName: form.investmentName,
        referenceNo: form.referenceNo || `INV-${Date.now()}`,
        category: form.category,
        investmentPlace: form.investmentPlace || '',
        purpose: form.purpose || '',
        totalAmount: form.totalAmount,
        startDate: form.startDate,
        durationMonths: form.durationMonths || 0,
        maturityDate: form.maturityDate || '',
        description: form.description || '',
        somityContribution: form.somityContribution,
        somityProfitShare: form.somityProfitShare,
        profitType: form.profitType,
        profitRate: form.profitRate,
        profitPaymentFrequency: form.profitPaymentFrequency,
        moneySource: form.moneySource,
        bankAccountId: form.bankAccountId || '',
        bankName: form.bankName || '',
        bankBranch: form.bankBranch || '',
        accountNumber: form.accountNumber || '',
        accountType: form.accountType || 'savings',
        accountHolderName: form.accountHolderName || '',
        chequeNo: form.chequeNo || '',
        cashAmount: form.cashAmount || 0,
        bankAmount: form.bankAmount || 0,
        cashVault: form.cashVault || '',
        cashReceivedBy: form.cashReceivedBy || '',
        cashReceiptNo: '',
        managementType: form.managementType,
        committeeHead: form.committeeHead || '',
        committeeMembers: form.committeeMembers || '',
        riskLevel: form.riskLevel,
        riskAssessmentNotes: form.riskAssessmentNotes || '',
        remarks: form.remarks || '',
        hasCoInvestors: coInvestors.length > 0,
        coInvestors: coInvestors.map(ci => ({
          ...ci,
          paymentMethod: ci.paymentMethod || 'cash',
          paymentReference: ci.paymentReference || '',
          paymentDocUrl: ci.paymentDocUrl || '',
          paymentBankAccountId: ci.paymentBankAccountId || '',
          paymentSenderBank: ci.paymentSenderBank || '',
          paidAmount: ci.paidAmount || ci.contributedAmount,
          remainingAmount: ci.remainingAmount || 0,
          paymentStatus: ci.paymentStatus || 'submitted',
          notes: ci.notes || '',
        })),
        coInvestorsCount: coInvestors.length,
        coInvestorsTotalContribution: totalCoContribution,
        coInvestorsTotalProfitShare: totalCoProfitShare,
        expectedProfit: expectedProfit,
        expectedTotalReturn: form.totalAmount + expectedProfit,
      };

      await createInvestment(request);
      toast.success('বিনিয়োগ আবেদন জমা হয়েছে!');
      navigate('/investments');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error?.message || 'বিনিয়োগ জমা দিতে ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5 pb-16">
      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden bg-gradient-to-r from-emerald-700 to-green-500">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_20%,white,transparent_60%)]" />
        <div className="relative">
          <h1 className="text-xl font-bold">নতুন বিনিয়োগ তৈরি করুন</h1>
          <p className="text-emerald-100 text-sm mt-0.5">সব তথ্য সঠিকভাবে পূরণ করুন</p>
        </div>
        
        <div className="flex gap-1 mt-4">
          {SECTIONS.map((section) => (
            <div key={section.id} className="flex-1 group relative">
              <div className={`h-1.5 rounded-full transition-all ${completedSections().includes(section.id) ? 'bg-white' : 'bg-white/30'}`} />
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] bg-black/50 px-1.5 py-0.5 rounded">
                {section.name}
              </div>
            </div>
          ))}
        </div>
        <div className="text-right text-xs text-emerald-100 mt-2">
          {completedSections().length}/{SECTIONS.length} ধাপ সম্পন্ন
        </div>
      </div>

      <InvestmentCoreSection form={form} updateForm={updateForm} errors={errors} />

      <MoneySourceSection 
        form={form} 
        updateForm={updateForm} 
        errors={errors} 
        somityContribution={form.somityContribution}
        totalAmount={form.totalAmount}
      />
      
      <CoInvestorSection
        coInvestors={coInvestors}
        setCoInvestors={setCoInvestors}
        openModal={openModal}
        onEdit={handleEditCoInvestor}
        onDelete={handleDeleteCoInvestor}
        somityProfitShare={form.somityProfitShare}
      />

      <ProfitDistributionSection
        somityProfitShare={form.somityProfitShare}
        updateForm={updateForm}
        totalProfit={expectedProfit}
        coInvestors={coInvestors}
        somityContribution={form.somityContribution}
        totalCoContribution={totalCoContribution}
      />

      <ManagementSection form={form} updateForm={updateForm} errors={errors} />

      <div className="rounded-2xl p-4 bg-amber-50 border border-amber-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700">
          <p className="font-semibold mb-0.5">জমা দেওয়ার আগে নিশ্চিত করুন</p>
          <p className="text-xs">জমা দেওয়ার পরে বিনিয়োগটি <strong>পেন্ডিং</strong> অবস্থায় থাকবে। অ্যাডমিন অনুমোদনের পরে সক্রিয় হবে।</p>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-500"
      >
        {saving ? (
          <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> জমা হচ্ছে...</>
        ) : (
          <><ChevronRight className="w-5 h-5" /> বিনিয়োগ আবেদন জমা দিন</>
        )}
      </button>

      {modalOpen && (
        <CoInvestorModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setEditingIndex(null); }}
          onSave={handleSaveCoInvestor}
          initialData={editingIndex !== null ? coInvestors[editingIndex] : undefined}
          somityProfitShare={form.somityProfitShare}
          existingTotalProfitShare={coInvestors.reduce((sum, c, idx) => sum + (c.profitSharePercentage || 0), 0) - (editingIndex !== null ? (coInvestors[editingIndex]?.profitSharePercentage || 0) : 0)}
          maxContribution={maxCoContribution}
          existingTotalContribution={totalCoContribution - (editingIndex !== null ? (coInvestors[editingIndex]?.contributedAmount || 0) : 0)}
        />
      )}
    </div>
  );
};

export default InvestmentCreatePage;