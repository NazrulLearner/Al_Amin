// src/modules/Investments/pages/InvestmentRepaymentPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronRight, Info, TrendingUp, DollarSign, Calendar, 
  Users, Building2, Clock, CheckCircle, AlertCircle,
  Banknote, Landmark, CreditCard, Wallet, ArrowLeft,
  RefreshCw, Lock, Unlock, Repeat,
  Target
} from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useInvestments } from '../hooks/useInvestments';
import { formatCurrencyAmount, formatDateString } from '../utils/investmentHelpers';
import { toast } from 'sonner';
import type { Investment, CoInvestor } from '../types/investment.types';

type AfterMaturityAction = 'close' | 'renew' | 'rollover';
type ProfitFrequency = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'on_maturity';

const InvestmentRepaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getInvestment, refresh } = useInvestments();
  
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Repayment type based on profit frequency
  const [selectedAction, setSelectedAction] = useState<'profit' | 'maturity'>('profit');
  const [afterMaturityAction, setAfterMaturityAction] = useState<AfterMaturityAction>('close');
  
  // Form state
  const [profitAmount, setProfitAmount] = useState<number>(0);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [bankAmount, setBankAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'both'>('bank');
  const [bankAccountId, setBankAccountId] = useState('');
  const [transactionReference, setTransactionReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [profitPeriod, setProfitPeriod] = useState('');
  const [renewMonths, setRenewMonths] = useState(12);
  
  // Get profit frequency from investment
  const profitFrequency = investment?.profitPaymentFrequency || 'on_maturity';
  
  // Calculate values
  const totalExpectedProfit = investment?.expectedProfit || 0;
  const totalReceivedProfit = investment?.actualProfitReceived || 0;
  const remainingProfit = totalExpectedProfit - totalReceivedProfit;
  const totalInvestment = investment?.totalAmount || 0;
  const somityContribution = investment?.somityContribution || 0;
  const coContribution = totalInvestment - somityContribution;
  
  // Calculate expected profit for current period based on frequency
  const getExpectedProfitForPeriod = () => {
    if (!investment) return 0;
    const monthsPerPeriod: Record<ProfitFrequency, number> = {
      monthly: 1,
      quarterly: 3,
      half_yearly: 6,
      yearly: 12,
      on_maturity: investment.durationMonths || 12
    };
    const months = monthsPerPeriod[profitFrequency as ProfitFrequency] || 12;
    return (totalExpectedProfit * months) / (investment.durationMonths || 12);
  };
  
  const expectedPeriodProfit = getExpectedProfitForPeriod();
  const maturityReturn = totalInvestment + remainingProfit;
  
  // Get source money distribution
  const getReturnDistribution = () => {
    if (!investment) return { cash: 0, bank: 0 };
    
    const totalReturn = maturityReturn;
    const ratio = somityContribution / totalInvestment;
    
    if (investment.moneySource === 'cash') {
      return { cash: totalReturn, bank: 0 };
    } else if (investment.moneySource === 'bank') {
      return { cash: 0, bank: totalReturn };
    } else {
      // both mode - maintain proportion
      const cashReturn = (investment.cashAmount || 0) / somityContribution * totalReturn;
      const bankReturn = totalReturn - cashReturn;
      return { cash: cashReturn, bank: bankReturn };
    }
  };
  
  const returnDistribution = getReturnDistribution();

  useEffect(() => {
    if (id) {
      loadInvestment();
    }
  }, [id]);

  const loadInvestment = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const inv = await getInvestment(id);
      setInvestment(inv);
      if (inv) {
        const expectedPeriod = getExpectedProfitForPeriod();
        setProfitAmount(Math.min(expectedPeriod, remainingProfit));
        
        // Set profit period based on frequency
        const now = new Date();
        if (profitFrequency === 'monthly') {
          setProfitPeriod(`${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`);
        } else if (profitFrequency === 'quarterly') {
          const quarter = Math.floor(now.getMonth() / 3) + 1;
          setProfitPeriod(`Q${quarter} ${now.getFullYear()}`);
        } else if (profitFrequency === 'half_yearly') {
          const half = now.getMonth() < 6 ? 'প্রথমার্ধ' : 'দ্বিতীয়ার্ধ';
          setProfitPeriod(`${half} ${now.getFullYear()}`);
        } else {
          setProfitPeriod(`${now.getFullYear()}`);
        }
        
        // Set default bank account from investment
        if (inv.bankAccountId) {
          setBankAccountId(inv.bankAccountId);
        }
      }
    } catch (error) {
      console.error('Error loading investment:', error);
      toast.error('বিনিয়োগ তথ্য লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'monthly': return 'মাসিক';
      case 'quarterly': return 'ত্রৈমাসিক';
      case 'half_yearly': return 'অর্ধ-বার্ষিক';
      case 'yearly': return 'বার্ষিক';
      default: return 'মেয়াদান্তে';
    }
  };

  // Handle profit payment
  const handleProfitPayment = async () => {
    if (profitAmount <= 0) {
      toast.error('লাভের পরিমাণ দিন');
      return;
    }
    if (profitAmount > remainingProfit) {
      toast.error(`লাভের পরিমাণ বাকি লাভ (${formatCurrencyAmount(remainingProfit)}) এর বেশি হতে পারে না`);
      return;
    }
    if (paymentMethod === 'bank' && !bankAccountId) {
      toast.error('ব্যাংক অ্যাকাউন্ট নির্বাচন করুন');
      return;
    }

    setSaving(true);
    try {
      // TODO: Call API
      toast.success(`${profitPeriod} মেয়াদের লাভ প্রদান সফল: ${formatCurrencyAmount(profitAmount)}`);
      await loadInvestment();
      refresh();
      
      // Reset for next period
      const nextExpected = getExpectedProfitForPeriod();
      setProfitAmount(Math.min(nextExpected, remainingProfit - profitAmount));
      
      // Update period
      const now = new Date();
      if (profitFrequency === 'monthly') {
        now.setMonth(now.getMonth() + 1);
        setProfitPeriod(`${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`);
      }
      
      setTransactionReference('');
      setRemarks('');
      
    } catch (error) {
      console.error('Error recording profit:', error);
      toast.error('লাভ প্রদান করতে ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  // Handle maturity (close/renew/rollover)
  const handleMaturity = async () => {
    if (paymentMethod === 'bank' && !bankAccountId) {
      toast.error('ব্যাংক অ্যাকাউন্ট নির্বাচন করুন');
      return;
    }

    setSaving(true);
    try {
      // TODO: Call API based on afterMaturityAction
      if (afterMaturityAction === 'close') {
        // Close investment - status becomes 'matured'
        toast.success(`বিনিয়োগ মেয়াদ শেষ! মোট রিটার্ন: ${formatCurrencyAmount(maturityReturn)}`);
      } else if (afterMaturityAction === 'renew') {
        // Renew - only withdraw profit, keep principal
        toast.success(`লাভ উত্তোলন: ${formatCurrencyAmount(remainingProfit)} · আসল পুনর্বিনিয়োগ করা হয়েছে`);
      } else if (afterMaturityAction === 'rollover') {
        // Rollover - reinvest both principal and profit
        toast.success(`আসল + লাভ পুনর্বিনিয়োগ করা হয়েছে: ${formatCurrencyAmount(maturityReturn)}`);
      }
      
      await loadInvestment();
      refresh();
      
      setTimeout(() => {
        navigate(`/investments/${id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error processing maturity:', error);
      toast.error('প্রক্রিয়াকরণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!investment) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">বিনিয়োগ পাওয়া যায়নি</p>
          <button onClick={() => navigate('/investments/list')} className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">
            বিনিয়োগ তালিকায় ফিরুন
          </button>
        </div>
      </div>
    );
  }

  if (investment.status === 'matured') {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">এই বিনিয়োগ ইতিমধ্যে মেয়াদ শেষ হয়েছে</p>
          <button onClick={() => navigate(`/investments/${id}`)} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">
            বিস্তারিত দেখুন
          </button>
        </div>
      </div>
    );
  }

  const isMaturityDateReached = investment.maturityDate && new Date(investment.maturityDate) <= new Date();
  const showMaturityOption = isMaturityDateReached || remainingProfit === 0;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate(`/investments/${id}`)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">লাভ/রিটার্ন প্রদান</h1>
          <p className="text-sm text-slate-500">{investment.investmentName}</p>
        </div>
      </div>

      {/* Investment Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold bg-gradient-to-r from-emerald-600 to-green-500">📊</div>
          <div>
            <h2 className="text-base font-bold text-slate-700">বিনিয়োগের সারাংশ</h2>
            <p className="text-xs text-slate-400">{investment.investmentId}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div><p className="text-xs text-slate-400">মোট বিনিয়োগ</p><p className="text-sm font-bold text-slate-700">{formatCurrencyAmount(totalInvestment)}</p></div>
          <div><p className="text-xs text-slate-400">প্রত্যাশিত লাভ</p><p className="text-sm font-bold text-emerald-600">{formatCurrencyAmount(totalExpectedProfit)}</p></div>
          <div><p className="text-xs text-slate-400">প্রাপ্ত লাভ</p><p className="text-sm font-bold text-green-600">{formatCurrencyAmount(totalReceivedProfit)}</p></div>
          <div><p className="text-xs text-slate-400">বাকি লাভ</p><p className={`text-sm font-bold ${remainingProfit > 0 ? 'text-amber-600' : 'text-green-600'}`}>{formatCurrencyAmount(remainingProfit)}</p></div>
          <div><p className="text-xs text-slate-400">লাভের সময়সূচি</p><p className="text-sm font-bold text-blue-600">{getFrequencyLabel(profitFrequency)}</p></div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>লাভ প্রাপ্তির অগ্রগতি</span>
            <span>{totalExpectedProfit > 0 ? ((totalReceivedProfit / totalExpectedProfit) * 100).toFixed(0) : 0}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${totalExpectedProfit > 0 ? (totalReceivedProfit / totalExpectedProfit) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Action Type Selection */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold bg-gradient-to-r from-emerald-600 to-green-500">১</div>
          <div>
            <h2 className="text-base font-bold text-slate-700">প্রদানের ধরন</h2>
            <p className="text-xs text-slate-400">{showMaturityOption ? 'লাভ প্রদান বা মেয়াদ শেষ করতে পারেন' : 'নিয়মিত লাভ প্রদান করুন'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Profit Payment Option */}
          <button
            onClick={() => setSelectedAction('profit')}
            disabled={remainingProfit <= 0}
            className={`p-4 rounded-xl border-2 text-center transition-all ${selectedAction === 'profit' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'} ${remainingProfit <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Calendar className={`w-6 h-6 mx-auto mb-2 ${selectedAction === 'profit' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <p className={`font-semibold ${selectedAction === 'profit' ? 'text-emerald-700' : 'text-slate-700'}`}>
              {getFrequencyLabel(profitFrequency)} লাভ প্রদান
            </p>
            <p className="text-xs text-slate-400 mt-1">প্রত্যাশিত: {formatCurrencyAmount(expectedPeriodProfit)}</p>
            {remainingProfit > 0 && <p className="text-xs text-amber-600 mt-2">বাকি: {formatCurrencyAmount(remainingProfit)}</p>}
          </button>

          {/* Maturity Option - only when maturity date reached */}
          <button
            onClick={() => setSelectedAction('maturity')}
            disabled={!showMaturityOption}
            className={`p-4 rounded-xl border-2 text-center transition-all ${selectedAction === 'maturity' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'} ${!showMaturityOption ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Target className={`w-6 h-6 mx-auto mb-2 ${selectedAction === 'maturity' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <p className={`font-semibold ${selectedAction === 'maturity' ? 'text-emerald-700' : 'text-slate-700'}`}>মেয়াদ শেষ</p>
            <p className="text-xs text-slate-400 mt-1">মোট রিটার্ন: {formatCurrencyAmount(maturityReturn)}</p>
            {!showMaturityOption && <p className="text-xs text-slate-400 mt-2">মেয়াদ শেষের তারিখ: {formatDateString(investment.maturityDate)}</p>}
          </button>
        </div>
      </div>

      {/* Payment Details Form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold bg-gradient-to-r from-emerald-600 to-green-500">২</div>
          <div>
            <h2 className="text-base font-bold text-slate-700">প্রদানের তথ্য</h2>
            <p className="text-xs text-slate-400">উৎস অনুযায়ী টাকা ফেরতের মাধ্যম নির্ধারণ করুন</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Profit Payment Form */}
          {selectedAction === 'profit' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">লাভের পরিমাণ (৳) *</label>
                  <input type="number" min="0" max={remainingProfit} step="100" value={profitAmount} onChange={(e) => setProfitAmount(parseFloat(e.target.value) || 0)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400" />
                  <p className="text-xs text-slate-400 mt-1">সর্বোচ্চ: {formatCurrencyAmount(remainingProfit)} · এই মেয়াদে: {formatCurrencyAmount(expectedPeriodProfit)}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">লাভের মেয়াদ *</label>
                  <input type="text" value={profitPeriod} onChange={(e) => setProfitPeriod(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400" />
                </div>
              </div>
            </>
          )}

          {/* Maturity Form */}
          {selectedAction === 'maturity' && (
            <>
              {/* After Maturity Action */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">মেয়াদ শেষের পর</label>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setAfterMaturityAction('close')} className={`py-2.5 rounded-xl text-sm font-semibold border-2 flex items-center justify-center gap-2 ${afterMaturityAction === 'close' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`}>
                    <Lock className="w-4 h-4" /> বন্ধ করুন
                  </button>
                  <button onClick={() => setAfterMaturityAction('renew')} className={`py-2.5 rounded-xl text-sm font-semibold border-2 flex items-center justify-center gap-2 ${afterMaturityAction === 'renew' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`}>
                    <RefreshCw className="w-4 h-4" /> পুনর্বিনিয়োগ
                  </button>
                  <button onClick={() => setAfterMaturityAction('rollover')} className={`py-2.5 rounded-xl text-sm font-semibold border-2 flex items-center justify-center gap-2 ${afterMaturityAction === 'rollover' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`}>
                    <Repeat className="w-4 h-4" /> রোলওভার
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {afterMaturityAction === 'close' && 'বিনিয়োগ বন্ধ করে সব টাকা ফেরত নিন'}
                  {afterMaturityAction === 'renew' && 'শুধু লাভ তুলুন, আসল পুনর্বিনিয়োগ করুন'}
                  {afterMaturityAction === 'rollover' && 'আসল + লাভ পুনর্বিনিয়োগ করুন'}
                </p>
              </div>

              {/* Renew Months (if renew selected) */}
              {afterMaturityAction === 'renew' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">পুনর্বিনিয়োগের মেয়াদ (মাস)</label>
                  <input type="number" min="1" max="60" value={renewMonths} onChange={(e) => setRenewMonths(parseInt(e.target.value) || 12)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400" />
                </div>
              )}

              {/* Return Distribution Card */}
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-xs font-semibold text-emerald-700 mb-2">টাকা ফেরতের উৎস অনুযায়ী বণ্টন</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">নগদ অংশ:</span>
                    <span className="font-semibold">{formatCurrencyAmount(returnDistribution.cash)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">ব্যাংক অংশ:</span>
                    <span className="font-semibold">{formatCurrencyAmount(returnDistribution.bank)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-emerald-200">
                    <span className="text-sm font-semibold text-slate-700">মোট রিটার্ন:</span>
                    <span className="text-lg font-bold text-emerald-700">{formatCurrencyAmount(maturityReturn)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Payment Method - based on original investment source */}
          {selectedAction === 'profit' && (
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">প্রদানের মাধ্যম *</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setPaymentMethod('cash')} className={`py-2.5 rounded-xl text-sm font-semibold border-2 flex items-center justify-center gap-2 ${paymentMethod === 'cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`}>
                  <Banknote className="w-4 h-4" /> নগদ
                </button>
                <button onClick={() => setPaymentMethod('bank')} className={`py-2.5 rounded-xl text-sm font-semibold border-2 flex items-center justify-center gap-2 ${paymentMethod === 'bank' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`}>
                  <Landmark className="w-4 h-4" /> ব্যাংক
                </button>
                {investment.moneySource === 'both' && (
                  <button onClick={() => setPaymentMethod('both')} className={`py-2.5 rounded-xl text-sm font-semibold border-2 flex items-center justify-center gap-2 ${paymentMethod === 'both' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`}>
                    <Wallet className="w-4 h-4" /> উভয়
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Bank Account Selection */}
          {(paymentMethod === 'bank' || paymentMethod === 'both') && (
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">ব্যাংক অ্যাকাউন্ট *</label>
              <select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 bg-white cursor-pointer">
                <option value="">-- অ্যাকাউন্ট নির্বাচন করুন --</option>
                <option value={investment.bankAccountId || "SOMITY_BANK_001"}>
                  {investment.bankName || 'ডাচ বাংলা ব্যাংক'} - {investment.accountNumber ? `(${investment.accountNumber.slice(-4)})` : '(****5678)'}
                </option>
              </select>
              <p className="text-xs text-slate-400 mt-1">💡 বিনিয়োগের সময় ব্যবহৃত অ্যাকাউন্ট প্রি-সিলেক্ট করা হয়েছে</p>
            </div>
          )}

          {/* Cash & Bank Split for both mode */}
          {paymentMethod === 'both' && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">নগদ পরিমাণ (৳)</label>
                <input type="number" value={cashAmount} onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">ব্যাংক পরিমাণ (৳)</label>
                <input type="number" value={bankAmount} onChange={(e) => setBankAmount(parseFloat(e.target.value) || 0)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400" />
              </div>
              <div className="col-span-2 text-xs text-center">
                মোট: {formatCurrencyAmount(cashAmount + bankAmount)} / {formatCurrencyAmount(selectedAction === 'profit' ? profitAmount : maturityReturn)}
              </div>
            </div>
          )}

          {/* Transaction Reference */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">ট্র্যানজেকশন রেফারেন্স <span className="text-slate-400 text-xs">(ঐচ্ছিক)</span></label>
            <input type="text" value={transactionReference} onChange={(e) => setTransactionReference(e.target.value)} placeholder="ট্রানজেকশন আইডি বা রেফারেন্স নম্বর" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400" />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">মন্তব্য <span className="text-slate-400 text-xs">(ঐচ্ছিক)</span></label>
            <textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="বিশেষ নির্দেশনা..." className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400" />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={selectedAction === 'profit' ? handleProfitPayment : handleMaturity}
        disabled={saving || (selectedAction === 'profit' && profitAmount <= 0)}
        className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-500"
      >
        {saving ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> প্রক্রিয়াকরণ হচ্ছে...</> : <><ChevronRight className="w-5 h-5" /> {selectedAction === 'profit' ? 'লাভ প্রদান করুন' : afterMaturityAction === 'close' ? 'মেয়াদ শেষ করুন' : afterMaturityAction === 'renew' ? 'পুনর্বিনিয়োগ করুন' : 'রোলওভার করুন'}</>}
      </button>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-2">
        <button onClick={() => navigate('/investments/list')} className="text-sm text-slate-500 hover:text-emerald-600 flex items-center gap-1">← সকল বিনিয়োগ দেখুন</button>
        <button onClick={() => navigate(`/investments/${id}`)} className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">বিস্তারিত দেখুন →</button>
      </div>
    </div>
  );
};

export default InvestmentRepaymentPage;