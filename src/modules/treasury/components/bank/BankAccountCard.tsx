// src/modules/finance/components/bank/BankAccountCard.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSomitySettings } from '../../../../app/context/SomitySettingsProvider';
import { Landmark, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import type { BankAccount } from '../../types';

interface BankAccountCardProps {
  account: BankAccount;
  onToggleStatus?: (id: string, isActive: boolean) => void;
}

const BankAccountCard: React.FC<BankAccountCardProps> = ({ account, onToggleStatus }) => {
  const navigate = useNavigate();
  const { formatAmount } = useSomitySettings();
  const [showBalance, setShowBalance] = useState(false);

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'savings': return 'সেভিংস';
      case 'current': return 'কারেন্ট';
      case 'fixed': return 'ফিক্সড';
      default: return type;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${
      !account.isActive ? 'opacity-70 bg-gray-50' : ''
    }`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b ${account.isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-500'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-white" />
            <h3 className="font-semibold text-white truncate">{account.accountName}</h3>
          </div>
          <button
            onClick={toggleBalanceVisibility}
            className="text-white/80 hover:text-white p-1 rounded"
            title={showBalance ? 'লুকান' : 'দেখুন'}
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
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
          <span className="font-mono text-sm">
            {showBalance ? account.accountNumber : '••••' + account.accountNumber.slice(-4)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">অ্যাকাউন্ট টাইপ</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
            {getAccountTypeLabel(account.accountType)}
          </span>
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
        <div className="flex justify-between text-xs text-gray-400">
          <span>প্রাথমিক ব্যালেন্স</span>
          <span>{formatAmount(account.openingBalance)}</span>
        </div>
        {account.notes && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-500">
            📝 {account.notes}
          </div>
        )}
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
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(account.id, !account.isActive)}
              className={`text-xs ${account.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
            >
              {account.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankAccountCard;