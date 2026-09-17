// src/modules/Investments/components/InvestmentForm/MoneySourceSection.tsx

import React, { useEffect, useState, useRef } from 'react';
import { Banknote, Landmark, Calculator, Building2, Users, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useBankAccountsForSettings } from '../../../settings/hooks/useBankAccountsForSettings';
import { formatCurrencyAmount } from '../../utils/investmentHelpers';

interface MoneySourceSectionProps {
  form: any;
  updateForm: (key: string, value: any) => void;
  errors: Record<string, string>;
  somityContribution: number;
  totalAmount: number;
}

const MoneySourceSection: React.FC<MoneySourceSectionProps> = ({ 
  form, 
  updateForm, 
  errors, 
  somityContribution,
  totalAmount 
}) => {
  const { accounts: bankAccounts, loading: bankLoading } = useBankAccountsForSettings('somity');
  const activeBankAccounts = bankAccounts.filter(acc => acc.isActive);
  
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [bankAmount, setBankAmount] = useState<number>(0);
  const [amountError, setAmountError] = useState<string>('');
  
  // ✅ Ref to track if initial mount has happened
  const isInitialized = useRef(false);

  const sourceType = form.moneySource || 'bank';
  const remainingForCoInvestors = totalAmount - somityContribution;

  // ✅ Effect 1: Initialize amounts only once on mount
  useEffect(() => {
    if (!isInitialized.current) {
      if (sourceType === 'cash') {
        setCashAmount(somityContribution);
        setBankAmount(0);
        if (somityContribution > 0) {
          updateForm('cashAmount', somityContribution);
          updateForm('bankAmount', 0);
        }
      } else if (sourceType === 'bank') {
        setCashAmount(0);
        setBankAmount(somityContribution);
        if (somityContribution > 0) {
          updateForm('cashAmount', 0);
          updateForm('bankAmount', somityContribution);
        }
      }
      isInitialized.current = true;
    }
  }, []); // ✅ Empty dependency array - runs only once

  // ✅ Effect 2: Handle source type changes (when user changes dropdown)
  useEffect(() => {
    if (isInitialized.current) {
      if (sourceType === 'cash') {
        setCashAmount(somityContribution);
        setBankAmount(0);
        updateForm('cashAmount', somityContribution);
        updateForm('bankAmount', 0);
      } else if (sourceType === 'bank') {
        setCashAmount(0);
        setBankAmount(somityContribution);
        updateForm('cashAmount', 0);
        updateForm('bankAmount', somityContribution);
      }
    }
  }, [sourceType]); // ✅ Only depends on sourceType

  // ✅ Effect 3: Update amounts when somityContribution changes (but not during initialization)
  useEffect(() => {
    if (isInitialized.current) {
      if (sourceType === 'cash') {
        if (cashAmount !== somityContribution) setCashAmount(somityContribution);
        if (form.cashAmount !== somityContribution) updateForm('cashAmount', somityContribution);
      } else if (sourceType === 'bank') {
        if (bankAmount !== somityContribution) setBankAmount(somityContribution);
        if (form.bankAmount !== somityContribution) updateForm('bankAmount', somityContribution);
      }
    }
  }, [somityContribution, sourceType, cashAmount, bankAmount, form.cashAmount, form.bankAmount]);

  // ✅ Effect 4: Handle bank account selection
  useEffect(() => {
    if (form.bankAccountId && form.bankAccountId !== '') {
      const selected = activeBankAccounts.find(acc => acc.id === form.bankAccountId);
      if (selected) {
        if (!selectedAccount || selectedAccount.id !== selected.id) {
          setSelectedAccount(selected);
        }
        if (form.bankName !== (selected.bankName || '')) updateForm('bankName', selected.bankName || '');
        if (form.accountNumber !== (selected.accountNumber || '')) updateForm('accountNumber', selected.accountNumber || '');
        if (form.accountType !== (selected.accountType || 'savings')) updateForm('accountType', selected.accountType || 'savings');
        if (form.accountHolderName !== (selected.accountName || '')) updateForm('accountHolderName', selected.accountName || '');
        if (form.bankBranch !== (selected.branchName || '')) updateForm('bankBranch', selected.branchName || '');
      }
    } else {
      if (selectedAccount !== null) setSelectedAccount(null);
    }
  }, [form.bankAccountId, activeBankAccounts, selectedAccount, form.bankName, form.accountNumber, form.accountType, form.accountHolderName, form.bankBranch]);

  // ✅ Effect 5: Validate both mode amounts
  useEffect(() => {
    if (sourceType === 'both') {
      const total = cashAmount + bankAmount;
      if (total !== somityContribution && somityContribution > 0) {
        setAmountError(`মোট ${formatCurrencyAmount(total)} সমিতির অবদান ${formatCurrencyAmount(somityContribution)} এর সমান হতে হবে`);
      } else {
        setAmountError('');
      }
    } else {
      setAmountError('');
    }
  }, [cashAmount, bankAmount, somityContribution, sourceType]);

  const handleCashAmountChange = (value: number) => {
    const newValue = value || 0;
    setCashAmount(newValue);
    updateForm('cashAmount', newValue);
  };

  const handleBankAmountChange = (value: number) => {
    const newValue = value || 0;
    setBankAmount(newValue);
    updateForm('bankAmount', newValue);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5 bg-gradient-to-r from-emerald-600 to-green-500">
          ২
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-700">অর্থের উৎস</h2>
          <p className="text-xs text-slate-400">সমিতি ও সহ-বিনিয়োগকারীদের অর্থের উৎস নির্ধারণ করুন</p>
        </div>
      </div>

      {/* SECTION A: SOMITY CONTRIBUTION */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-700">সমিতির অবদান</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              সমিতির অবদানের পরিমাণ (৳) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={somityContribution || ''}
              onChange={(e) => updateForm('somityContribution', parseFloat(e.target.value) || 0)}
              className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.somityContribution ? 'border-red-400 bg-red-50' : 'border-slate-200'} text-sm outline-none focus:border-emerald-400`}
            />
            {errors.somityContribution && <p className="text-xs text-red-500 mt-1">{errors.somityContribution}</p>}
            {totalAmount > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                মোটের {Math.round((somityContribution / totalAmount) * 100) || 0}% — 
                বাকি {formatCurrencyAmount(remainingForCoInvestors)} সহ-বিনিয়োগকারীদের জন্য
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              অর্থের উৎসের ধরন <span className="text-red-500">*</span>
            </label>
            <select
              value={sourceType}
              onChange={(e) => updateForm('moneySource', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white cursor-pointer"
            >
              <option value="cash">নগদ - ক্যাশ ভল্ট থেকে সরাসরি নগদ প্রদান</option>
              <option value="bank">ব্যাংক - ব্যাংক অ্যাকাউন্ট থেকে ট্রান্সফার</option>
              <option value="both">নগদ + ব্যাংক - উভয় উৎস থেকে মিলিয়ে প্রদান</option>
            </select>
          </div>
        </div>

        {/* Bank Details Section */}
        {(sourceType === 'bank' || sourceType === 'both') && (
          <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Landmark className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-bold text-blue-700">ব্যাংক হিসাবের তথ্য</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ব্যাংক অ্যাকাউন্ট নির্বাচন করুন <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.bankAccountId || ''}
                  onChange={(e) => updateForm('bankAccountId', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 bg-white cursor-pointer"
                >
                  <option value="">-- অ্যাকাউন্ট নির্বাচন করুন --</option>
                  {activeBankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bankName} - {acc.accountName} ({acc.accountNumber?.slice(-4) || '****'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedAccount && (
                <div className="mt-2 p-3 rounded-lg bg-white border border-blue-200 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-semibold text-green-700">নির্বাচিত অ্যাকাউন্ট</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <p className="text-slate-500">অ্যাকাউন্টের নাম:</p>
                        <p className="text-slate-700 font-medium">{selectedAccount.accountName || '-'}</p>
                        <p className="text-slate-500">ব্যাংকের নাম:</p>
                        <p className="text-slate-700">{selectedAccount.bankName || '-'}</p>
                        <p className="text-slate-500">অ্যাকাউন্ট নম্বর:</p>
                        <p className="text-slate-700 font-mono">{selectedAccount.accountNumber || '-'}</p>
                        {selectedAccount.branchName && (
                          <>
                            <p className="text-slate-500">শাখার নাম:</p>
                            <p className="text-slate-700">{selectedAccount.branchName}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => updateForm('bankAccountId', '')}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      পরিবর্তন করুন
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  চেক / রেফারেন্স নম্বর <span className="text-slate-400 text-xs">(ঐচ্ছিক)</span>
                </label>
                <input
                  type="text"
                  value={form.chequeNo || ''}
                  onChange={(e) => updateForm('chequeNo', e.target.value)}
                  placeholder="যেমন: CHK-001 বা TRX-123456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Cash Details Section */}
        {(sourceType === 'cash' || sourceType === 'both') && (
          <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <Banknote className="w-4 h-4 text-green-600" />
              <p className="text-sm font-bold text-green-700">নগদ অর্থের তথ্য</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ক্যাশ ভল্ট / সংরক্ষণ স্থান
                </label>
                <input
                  type="text"
                  value={form.cashVault || ''}
                  onChange={(e) => updateForm('cashVault', e.target.value)}
                  placeholder="যেমন: সমিতির প্রধান ভল্ট"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  নগদ গ্রহণকারীর নাম
                </label>
                <input
                  type="text"
                  value={form.cashReceivedBy || ''}
                  onChange={(e) => updateForm('cashReceivedBy', e.target.value)}
                  placeholder="যিনি নগদ গ্রহণ করেছেন"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Amount Split Section for both mode */}
        {sourceType === 'both' && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-bold text-amber-700">অর্থের উৎস ভাগ করে নির্ধারণ করুন</p>
              <p className="text-xs text-amber-600 ml-auto">
                মোট: {formatCurrencyAmount(somityContribution)}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                  <Banknote className="inline w-4 h-4 mr-1" /> নগদ পরিমাণ (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  max={somityContribution}
                  step="1000"
                  value={cashAmount}
                  onChange={(e) => handleCashAmountChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                  <Landmark className="inline w-4 h-4 mr-1" /> ব্যাংক পরিমাণ (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  max={somityContribution}
                  step="1000"
                  value={bankAmount}
                  onChange={(e) => handleBankAmountChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {amountError ? (
              <div className="mt-3 p-2 rounded-lg bg-red-100 border border-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-xs text-red-600">{amountError}</p>
              </div>
            ) : cashAmount + bankAmount === somityContribution && somityContribution > 0 ? (
              <div className="mt-3 p-2 rounded-lg bg-green-100 border border-green-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-xs text-green-700">
                  ✓ নগদ {formatCurrencyAmount(cashAmount)} + ব্যাংক {formatCurrencyAmount(bankAmount)} = {formatCurrencyAmount(somityContribution)}
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Summary for single source */}
        {sourceType === 'cash' && somityContribution > 0 && (
          <div className="mt-3 p-2 rounded-lg bg-green-100 border border-green-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-xs text-green-700">✓ নগদ {formatCurrencyAmount(somityContribution)} প্রদান করা হবে</p>
          </div>
        )}

        {sourceType === 'bank' && somityContribution > 0 && selectedAccount && (
          <div className="mt-3 p-2 rounded-lg bg-green-100 border border-green-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-xs text-green-700">
              ✓ ব্যাংক ট্রান্সফার: {formatCurrencyAmount(somityContribution)}
            </p>
          </div>
        )}
      </div>

      {/* SECTION B: CO-INVESTORS SECTION (Info only) */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-700">সহ-বিনিয়োগকারী</h3>
          <span className="text-xs text-slate-400">(পরবর্তী ধাপে যুক্ত করুন)</span>
        </div>
        
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">
                সহ-বিনিয়োগকারীদের জন্য জায়গা: 
                <strong className="text-emerald-700 ml-1">{formatCurrencyAmount(remainingForCoInvestors)}</strong>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                সহ-বিনিয়োগকারী যুক্ত করতে পরবর্তী সেকশন ব্যবহার করুন
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoneySourceSection;