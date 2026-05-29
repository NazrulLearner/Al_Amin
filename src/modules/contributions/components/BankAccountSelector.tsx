// src/modules/contributions/components/BankAccountSelector.tsx

import React from 'react';
import { Building, User, Loader2, AlertCircle } from 'lucide-react';
import type { BankAccount } from '../../../types/settings';

interface BankAccountSelectorProps {
  accounts: BankAccount[];
  selectedAccountId: string;
  onSelect: (accountId: string) => void;
  label: string;
  required?: boolean;
  loading?: boolean;
  accountType: 'somity' | 'collector';
}

const BankAccountSelector: React.FC<BankAccountSelectorProps> = ({
  accounts,
  selectedAccountId,
  onSelect,
  label,
  required = true,
  loading = false,
  accountType,
}) => {
  const activeAccounts = accounts.filter(acc => acc.isActive);

  if (loading) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-sm text-gray-500">অ্যাকাউন্ট লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  if (activeAccounts.length === 0) {
    return (
      <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-700">কোনো সক্রিয় ব্যাংক অ্যাকাউন্ট নেই!</p>
            <p className="text-xs text-yellow-600 mt-1">
              অনুগ্রহ করে সেটিংস থেকে {accountType === 'somity' ? 'সোমিটি' : 'কালেক্টর'} ব্যাংক অ্যাকাউন্ট যোগ করুন।
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={selectedAccountId}
        onChange={(e) => onSelect(e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
          !selectedAccountId && required ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
      >
        <option value="">-- সিলেক্ট করুন --</option>
        {activeAccounts.map(account => (
          <option key={account.accountId} value={account.accountId}>
            {accountType === 'somity' ? '🏦' : '👤'} {account.bankName} - {account.accountName}
            {' ('}
            {account.accountNumber.slice(-4)}
            {account.collectorName ? ` - ${account.collectorName}` : ''}
            {')'}
          </option>
        ))}
      </select>
      {selectedAccountId && (
        <p className="text-xs text-green-600 mt-1">
          ✓ নির্বাচিত অ্যাকাউন্ট আইডি: {accounts.find(a => a.accountId === selectedAccountId)?.accountId}
        </p>
      )}
    </div>
  );
};

export default BankAccountSelector;