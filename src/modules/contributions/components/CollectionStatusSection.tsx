// src/modules/contributions/components/CollectionStatusSection.tsx
import React from 'react';
import { 
  CheckCircle, Building, RefreshCw, 
  Clock, Info 
} from 'lucide-react';
import { getCollectionStatusInfo } from '../../../utils/calculations/contributionCalculator';
import BankInfoFields from '../../../shared/components/Common/BankInfoFields';
import type { BankAccount } from '../../../types/settings';

interface CollectionStatusSectionProps {
  collectionStatus: 'collected' | 'deposited' | 'transferred';
  payType: string;
  bankName: string;
  bankReference: string;
  bankAccounts?: BankAccount[];
  selectedBankAccountId?: string;
  bankAccountContextLabel?: string;
  onStatusChange: (status: 'collected' | 'deposited' | 'transferred') => void;
  onBankInfoChange: (field: 'bankName' | 'bankReference', value: string) => void;
  onBankAccountSelect?: (accountId: string) => void;
}

const STATUS_ICONS = {
  collected: <CheckCircle className="h-5 w-5" />,
  deposited: <Building className="h-5 w-5" />,
  transferred: <RefreshCw className="h-5 w-5" />,
};

const CollectionStatusSection: React.FC<CollectionStatusSectionProps> = ({
  collectionStatus,
  payType,
  bankName,
  bankReference,
  bankAccounts = [],
  selectedBankAccountId = '',
  bankAccountContextLabel = 'Bank account',
  onStatusChange,
  onBankInfoChange,
  onBankAccountSelect,
}) => {
  const statusInfo = getCollectionStatusInfo(collectionStatus, payType);
  const statuses: ('collected' | 'deposited' | 'transferred')[] = ['collected', 'deposited', 'transferred'];

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-yellow-800 mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5" />
        টাকার অবস্থান (Collection Status)
      </h3>

      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <p className="text-xs text-blue-700 flex items-center gap-2">
          <Info className="h-4 w-4" />
          {payType === 'bank' ? (
            <span>
              💡 <strong>ব্যাংক পেমেন্ট:</strong> সদস্য কি ক্যাশিয়ারের ব্যক্তিগত ব্যাংক অ্যাকাউন্টে টাকা দিয়েছেন? 
              নাকি সরাসরি সোমিটি অ্যাকাউন্টে জমা করেছেন?
            </span>
          ) : (
            <span>
              💡 টাকাটি বর্তমানে কার কাছে আছে? ক্যাশিয়ারের কাছে নাকি ব্যাংকে জমা হয়েছে?
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {statuses.map((status) => {
          const info = getCollectionStatusInfo(status, payType);
          const isSelected = collectionStatus === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(status)}
              className={`p-4 rounded-xl text-left transition-all ${
                isSelected
                  ? `${info.bgClass} border-2 border-current shadow-md`
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
              }`}
              style={isSelected ? { borderColor: 'currentColor' } : undefined}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-current' : 'bg-gray-100'}`}>
                  <span className={isSelected ? 'text-white' : 'text-gray-500'}>
                    {STATUS_ICONS[status]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{info.label}</p>
                  <p className="text-xs text-gray-500">
                    {status === 'collected'
                      ? payType === 'bank'
                        ? 'ক্যাশিয়ারের ব্যক্তিগত অ্যাকাউন্টে'
                        : 'ক্যাশিয়ারের কাছে নগদ'
                      : status === 'deposited'
                      ? 'সোমিটি ব্যাংক অ্যাকাউন্টে'
                      : 'অন্য অ্যাকাউন্টে'}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bank Info Fields */}
      {(collectionStatus === 'deposited' || (payType === 'bank' && collectionStatus === 'collected')) && (
        <div className="mt-4 pt-4 border-t border-yellow-200">
          {payType === 'bank' && collectionStatus === 'collected' && (
            <div className="bg-blue-100 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <Info className="h-4 w-4" />
                সদস্য ক্যাশিয়ারের ব্যক্তিগত ব্যাংক অ্যাকাউন্টে টাকা দিয়েছেন। নিচের তথ্য পূরণ করুন।
              </p>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {bankAccountContextLabel} <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedBankAccountId}
              onChange={(e) => onBankAccountSelect?.(e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                !selectedBankAccountId ? 'border-red-300 bg-red-50' : ''
              }`}
            >
              <option value="">Select account</option>
              {bankAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.bankName} - {account.accountName} ({account.accountNumber.slice(-4)})
                  {account.collectorName ? ` - ${account.collectorName}` : ''}
                </option>
              ))}
            </select>
            {bankAccounts.length === 0 && (
              <p className="text-xs text-red-600 mt-1">
                No active account found for this selection. Add it from Settings first.
              </p>
            )}
          </div>
          <BankInfoFields
            bankName={bankName}
            bankReference={bankReference}
            onChange={onBankInfoChange}
            required={collectionStatus === 'deposited'}
            readOnlyBankName
            placeholder={{
              bankName:
                payType === 'bank' && collectionStatus === 'collected'
                  ? 'ক্যাশিয়ারের ব্যাংকের নাম'
                  : 'যেমন: Islami Bank, DBBL, Sonali Bank',
              bankReference:
                payType === 'bank' && collectionStatus === 'collected'
                  ? 'ট্রানজেকশন রেফারেন্স'
                  : 'স্লিপ নং / চেক নং / ট্রানজেকশন আইডি',
            }}
          />
        </div>
      )}

      <div className={`mt-4 p-3 rounded-lg ${statusInfo.bgClass}`}>
        <p className="text-xs flex items-center gap-2">
          {STATUS_ICONS[collectionStatus]}
          <span className={statusInfo.color}>
            <strong>বর্তমান অবস্থা:</strong> {statusInfo.description}
          </span>
        </p>
      </div>
    </div>
  );
};

export default CollectionStatusSection;
