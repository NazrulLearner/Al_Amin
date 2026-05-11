// src/components/common/BankInfoFields.tsx
import React from 'react';
import { Building, Hash } from 'lucide-react';

interface BankInfoFieldsProps {
  bankName: string;
  bankReference: string;
  onChange: (field: 'bankName' | 'bankReference', value: string) => void;
  required?: boolean;
  showLabel?: boolean;
  className?: string;
  placeholder?: {
    bankName?: string;
    bankReference?: string;
  };
}

const BankInfoFields: React.FC<BankInfoFieldsProps> = ({
  bankName,
  bankReference,
  onChange,
  required = false,
  showLabel = true,
  className = '',
  placeholder = {
    bankName: 'যেমন: Islami Bank, DBBL, Sonali Bank',
    bankReference: 'স্লিপ নং / চেক নং / ট্রানজেকশন আইডি'
  }
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <div>
        {showLabel && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Building className="h-3 w-3 inline mr-1" />
            ব্যাংকের নাম {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={bankName}
            onChange={(e) => onChange('bankName', e.target.value)}
            className={`w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              required && !bankName ? 'border-red-300 bg-red-50' : ''
            }`}
            placeholder={placeholder.bankName}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">যেমন: Islami Bank Bangladesh Limited, Dutch-Bangla Bank, Sonali Bank</p>
      </div>
      
      <div>
        {showLabel && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Hash className="h-3 w-3 inline mr-1" />
            ব্যাংক রেফারেন্স {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={bankReference}
            onChange={(e) => onChange('bankReference', e.target.value)}
            className={`w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              required && !bankReference ? 'border-red-300 bg-red-50' : ''
            }`}
            placeholder={placeholder.bankReference}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">ডিপোজিট স্লিপ নং / চেক নং / অনলাইন ট্রানজেকশন আইডি</p>
      </div>
    </div>
  );
};

export default BankInfoFields;