// src/modules/finance/components/common/AccountSelector.tsx

import React, { useState, useEffect } from 'react';
import { Building2, Banknote, Loader2 } from 'lucide-react';
import { bankService } from '../../services/bank.service';
import type { BankAccount } from '../../types';

interface AccountSelectorProps {
  type: 'bank' | 'cash';
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  type,
  value,
  onChange,
  label,
  placeholder,
  required,
  disabled
}) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type === 'bank') {
      loadBankAccounts();
    }
  }, [type]);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      const data = await bankService.getAllAccounts();
      setAccounts(data.filter(acc => acc.isActive));
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (type === 'cash') {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'ক্যাশিয়ারের নাম'}
            disabled={disabled}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">ক্যাশিয়ারের নাম বা আইডি</p>
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 appearance-none"
        >
          <option value="">{placeholder || 'অ্যাকাউন্ট নির্বাচন করুন'}</option>
          {accounts.map(account => (
            <option key={account.id} value={account.id}>
              {account.accountName} - {formatBalance(account.currentBalance)}
            </option>
          ))}
        </select>
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
        )}
      </div>
    </div>
  );
};

const formatBalance = (balance: number): string => {
  return `(${balance.toLocaleString()} ৳)`;
};

export default AccountSelector;